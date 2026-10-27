import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse, add, mul, dot, sub } from "../src/star-ring/course.js";
import { createSection } from "../src/star-ring/random-course.js";
import {
  createRun,
  command,
  stepRun,
  restartCheckpoint,
  detach,
} from "../src/star-ring/simulation.js";
import { stepEscort, releaseEscort, escortStatus } from "../src/star-ring/escort-rules.js";
import {
  stepTraffic,
  trafficPose,
  stepNearMiss,
  trafficStatus,
} from "../src/star-ring/traffic-motion.js";
import { stepVoyage, flightGravity, voyageStatus } from "../src/star-ring/voyage-rules.js";
import { voyageProtected } from "../src/star-ring/voyage-plan.js";
import { sweepTrafficCars } from "../src/star-ring/traffic-rules.js";
import { createRouteWindow } from "../src/star-ring/route-window.js";
const checks = [];
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name + " " + JSON.stringify(detail));
};
const c = createCourse();
c.id = "fixture";
c.adventures = { branches: [], chains: [] };
c.hazards = [
  { s: 105, lane: 0, type: "device" },
  { s: 110, lane: 0, type: "device" },
  { s: 108, lane: 3.2, type: "car", paint: 0 },
];
c.voyage = {
  cells: [],
  event: null,
  fragments: [0, 1, 2, 3].map((i) => ({
    id: "f" + i,
    s: 100 + i * 0.4,
    lane: 0,
    height: 1.05,
    routeId: null,
  })),
};
let r = createRun(c);
r.s = 100;
r.pos = c.pose(100).p;
stepEscort(r, c, 1 / 60);
check("fragments-require-E", r.escort.count === 0);
r.input.suction = true;
stepEscort(r, c, 1 / 60);
check(
  "E-collects-three-stars-and-leaves-the-fourth",
  r.escort.count === 3 && r.escort.taken.size === 3,
  escortStatus(r),
);
releaseEscort(r, c, "grip");
check("accidental-grip-loss-does-not-fire-escort", r.escort.count === 3);
command(r, c, "jumpPress");
check(
  "jump-releases-all-charges-without-an-extra-key",
  r.escort.count === 0 && r.escort.waves[0].stars === 3,
);
r.input.suction = false;
stepEscort(r, c, 0.4);
check(
  "expanding-pulse-clears-devices-but-never-cars",
  r.hit.has(0) && r.hit.has(1) && !r.hit.has(2) && r.escort.cleared === 2,
  { hit: [...r.hit] },
);
const score = r.score;
stepEscort(r, c, 0.1);
check("a-cleared-obstacle-pays-only-once", r.score === score);
stepEscort(r, c, 0.3);
check("shockwaves-expire", r.escort.waves.length === 0);
r.attached = true;
r.s = 100;
r.pos = c.pose(100).p;
r.input.suction = true;
stepEscort(r, c, 0.01);
check(
  "the-uncollected-fragment-is-still-available",
  r.escort.count === 1 && r.escort.taken.size === 4,
);
restartCheckpoint(r, c);
r.s = 100;
r.pos = c.pose(100).p;
r.input.suction = true;
stepEscort(r, c, 0.01);
check(
  "checkpoint-clears-charges-without-respawning-collected-fragments",
  r.escort.count === 0 && r.escort.taken.size === 4,
);
for (let i = 0; i < 10; i++) {
  r.escort.count = 3;
  releaseEscort(r, c, "jump");
}
check("wave-pool-is-bounded", r.escort.waves.length === 2);
r.tutorial = { active: true };
r.escort.count = 0;
stepEscort(r, c, 0.1);
check("core-tutorial-does-not-require-escort-mechanics", r.escort.count === 0);
let cells = 0,
  merges = 0;
const kinds = new Set();
for (let seed = 1; seed <= 64; seed++)
  for (const section of [0, 2, 4, 6, 8]) {
    const course = createSection(seed, section);
    if (course.voyage.event) kinds.add(course.voyage.event.type);
    const a = createRun(course);
    for (const cell of course.voyage.cells) {
      cells++;
      a.trafficState = null;
      a.s = cell.anchor - 95;
      a.pos = course.pose(a.s).p;
      a.speed = 25;
      const indices = course.hazards
        .map((h, i) => (h.motion?.cellId === cell.id ? i : -1))
        .filter((i) => i >= 0);
      assert(indices.length === 3);
      if (!cell.changing) {
        const pair = indices.slice(0, 2).map((i) => course.hazards[i]);
        assert(
          pair[0].s === pair[1].s && pair[0].lane !== pair[1].lane,
          "side-by-side slow convoy",
        );
      }
      assert(!voyageProtected(course, cell.anchor - 40, cell.anchor + 110));
      for (let tick = 0; tick < 270; tick++) {
        stepTraffic(a, course, 1 / 60);
        for (const i of indices) {
          const h = course.hazards[i],
            p = trafficPose(course, h, i, a);
          assert(Math.abs(p.lane - cell.open) > 2.15);
          assert(p.s >= h.s && p.s <= h.s + 64.001);
          if (tick < 105) assert(Math.abs(p.lane - h.lane) < 1e-8);
          if (p.signal) assert(h.motion.merge);
        }
      }
      const h = indices.find((i) => course.hazards[i].motion.merge);
      if (h !== undefined) {
        const p = trafficPose(course, course.hazards[h], h, a);
        if (Math.abs(p.lane - course.hazards[h].lane) > 3) merges++;
      }
    }
  }
check(
  "320-sections-keep-the-reserved-lane-clear-during-entire-convoy-movements",
  cells > 300 && merges > 100,
  { cells, merges },
);
check("voyage-generation-includes-all-four-short-event-types", kinds.size === 4, [...kinds]);
const d = createSection(11, 0);
r = createRun(d);
const cell = d.voyage.cells.find((v) => v.changing),
  idx = d.hazards.findIndex((h) => h.motion?.cellId === cell.id && h.motion.merge),
  h = d.hazards[idx];
r.s = cell.anchor - 95;
r.pos = d.pose(r.s).p;
stepTraffic(r, d, 1 / 60);
check(
  "merge-signals-start-before-lateral-motion",
  trafficPose(d, h, idx, r).signal !== 0 && trafficPose(d, h, idx, r).lane === h.lane,
);
const rr = createRun(d);
rr.s = cell.anchor - 95;
rr.speed = 60;
stepTraffic(rr, d, 0.1);
check("unreasonably-fast-approach-cancels-the-merge", !rr.trafficState.cells.get(cell.id).merge);
// Sweep against a moving obstacle, including a relative side crossing.
const f = createCourse();
f.id = "motion-fixture";
f.voyage = { cells: [], fragments: [], event: null };
f.hazards = [{ type: "car", s: 100, lane: 0, paint: 0 }];
r = createRun(f);
r.s = 100;
r.pos = f.pose(100).p;
r.trafficState = {
  key: f.id,
  poses: new Map([[0, { s: 100, lane: 0, yaw: 0, prevS: 100, prevLane: 3.2, prevYaw: 0.1 }]]),
  cells: new Map(),
  nearMiss: new Set(),
  passes: 0,
};
const previous = { s: 100, lane: 0, pos: f.pose(100).p, roll: 0, pitch: 0 };
check("relative-sweep-detects-a-car-moving-across-player", !!sweepTrafficCars(f, previous, r));
r.lane = 3.2;
r.pos = f.pose(105, 3.2).p;
r.s = 105;
r.pressure = 50;
r.trafficState.poses.clear();
stepNearMiss(r, f, { s: 104, pos: f.pose(104, 3.2).p });
const air = r.pressure,
  passScore = r.score;
stepNearMiss(r, f, { s: 104 });
check(
  "safe-close-pass-replenishes-air-and-pays-once",
  air === 58 && r.pressure === air && r.score === passScore && trafficStatus(r).nearMisses === 1,
);
r = createRun(d);
const plan = d.voyage.event;
r.s = plan.warning;
stepVoyage(r, d, 0.01);
check(
  "event-warns-before-arrival",
  r.voyageState.phase === "warning" && plan.start - plan.warning >= 85,
);
r.s = plan.start;
stepVoyage(r, d, 0.01);
check("event-activates-on-arrival", r.voyageState.phase === "active");
r.pressure = 50;
stepVoyage(r, d, plan.duration);
const endScore = r.score;
stepVoyage(r, d, 1);
check(
  "clean-event-completion-rewards-exactly-once",
  endScore === 80 && r.score === 80 && r.pressure === 58,
);
r = createRun(d);
r.s = plan.start;
stepVoyage(r, d, 0.01);
r.collisions++;
stepVoyage(r, d, plan.duration);
check("collision-cancels-clean-passage-bonus", r.score === 0);
r.voyageState = { key: d.id ?? "baseline", phase: "active", type: "gravity" };
const ordinary = Array.from({ length: Math.floor(d.length / 10) }, (_, i) => i * 10).find(
  (s) => s > 100 && !voyageProtected(d, s - 12, s + 130),
);
r.s = ordinary;
r.speed = 25;
check(
  "gravity-event-gently-changes-unprotected-hop-physics",
  ordinary && flightGravity(r, d, "jump") === 0.85,
);
r.s = d.adventures.chains.find((c) => !c.routeId).launchS;
check(
  "gravity-does-not-change-authored-chain-or-gap-trajectories",
  flightGravity(r, d, "jump") === 1,
);
r.routeId = d.adventures.branches[0].id;
check("gravity-does-not-change-shortcut-physics", flightGravity(r, d, "jump") === 1);
check("menu-status-is-valid-before-a-run-exists", voyageStatus(null).phase === "quiet");
const route = createRouteWindow(d);
r = createRun(d);
r.s = cell.anchor - 80;
r.pos = d.pose(r.s).p;
r.time = 1;
stepTraffic(r, d, 0.5);
route.traffic.update(r, 0.5, 1);
check(
  "moving-car-renderer-exposes-real-wheel-and-indicator-state",
  route.traffic.status().moving > 0 &&
    route.traffic.status().signaling > 0 &&
    route.traffic.status().rollingWheels,
);
const pivots = [];
route.root.traverse((o) => {
  if (o.children.some((c) => c.name.startsWith("Traffic / wheel"))) pivots.push(o.rotation.x);
});
check(
  "convoy-wheels-roll-with-actual-travel",
  pivots.some((x) => Math.abs(x) > 0.1),
);
let disposed = 0;
const geos = new Set();
route.root.traverse((o) => {
  if (o.geometry) geos.add(o.geometry);
});
for (const g of geos) g.addEventListener("dispose", () => disposed++);
route.dispose();
check("voyage-window-retirement-disposes-every-owned-geometry", disposed === geos.size, {
  disposed,
});
await fs.writeFile(
  new URL("../evidence/star-ring-voyage-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, cells, merges, eventTypes: [...kinds] }));
