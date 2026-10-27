import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createSection, createRandomCourse } from "../src/star-ring/random-course.js";
import { createCourse } from "../src/star-ring/course.js";
import { createRun } from "../src/star-ring/simulation.js";
import { stepTraffic, trafficPose } from "../src/star-ring/traffic-motion.js";
import {
  layoutConflicts,
  separateTrackItems,
  intersectsTraffic,
  pickupFootprint,
} from "../src/star-ring/placement.js";
const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name + " " + JSON.stringify(detail));
}
let moved = 0,
  fragments = 0,
  adjusted = 0,
  maximumRemoved = 0,
  sections = 0;
for (let seed = 1; seed <= 256; seed++)
  for (const index of [0, 2, 7]) {
    const c = createSection(seed, index),
      issues = layoutConflicts(c);
    assert.equal(issues.length, 0, JSON.stringify({ seed, index, issues: issues.slice(0, 3) }));
    assert(c.pickups.filter((p) => p.type === "star").length === 2);
    assert(c.pickups.filter((p) => p.required && p.type === "air").length >= 8);
    assert(c.hazards.filter((h) => h.type === "car").length >= 5);
    assert(c.hazards.some((h) => h.type === "device"));
    assert(c.pickups.length < 180);
    moved += c.placement.movedPickups;
    fragments += c.placement.movedFragments;
    adjusted += c.placement.adjustedTraffic;
    maximumRemoved = Math.max(maximumRemoved, c.placement.removedHazards);
    sections++;
  }
check("768-random-sections-have-no-traffic-pickup-gate-or-fragment-overlap", true, {
  sections,
  moved,
  fragments,
  adjusted,
  maximumRemoved,
});
function flat() {
  const c = createCourse();
  c.adventures = { chains: [], branches: [] };
  c.recipe = { rows: [] };
  c.pickups = [];
  c.hazards = [];
  c.voyage = { cells: [], fragments: [] };
  return c;
}
let c = flat();
c.pickups = [{ s: 100, lane: 0, type: "ring" }];
c.hazards = [{ s: 100, lane: 0, type: "device" }];
separateTrackItems(c);
check(
  "red-obstacle-remains-and-optional-pickup-moves-to-a-free-lane",
  c.hazards.length === 1 &&
    c.pickups.length === 1 &&
    c.pickups[0].lane !== 0 &&
    !layoutConflicts(c).length,
);
c = flat();
c.pickups = [{ s: 150, lane: 0, type: "air", required: true }];
c.hazards = [
  {
    s: 100,
    lane: 0,
    type: "car",
    motion: {
      cellId: "c",
      speed: 7,
      maxTravel: 64,
      laneTo: 0,
      merge: false,
      signal: 1.8,
      changeSeconds: 2,
    },
  },
];
separateTrackItems(c);
check(
  "required-air-keeps-its-location-and-moving-car-stops-before-it",
  c.pickups[0].s === 150 && c.hazards[0].motion.maxTravel < 64 && !layoutConflicts(c).length,
);
c = flat();
c.pickups = [{ s: 150, lane: 0, type: "air", required: true }];
c.hazards = [
  {
    s: 100,
    lane: -3.2,
    type: "car",
    motion: {
      cellId: "c",
      speed: 7,
      maxTravel: 64,
      laneTo: 3.2,
      merge: true,
      signal: 1.8,
      changeSeconds: 2,
    },
  },
];
separateTrackItems(c);
check(
  "merge-crossing-a-required-pickup-is-cancelled-without-removing-the-car",
  c.hazards.length === 1 && !c.hazards[0].motion.merge && c.hazards[0].motion.maxTravel === 64,
);
c = flat();
c.pickups = [{ s: 100, lane: 0, type: "air", required: true }];
c.voyage.fragments = [{ id: "f", s: 100, lane: 0, height: 1.05 }];
separateTrackItems(c);
check(
  "escort-fragment-separates-from-gas-cylinder-within-suction-reach",
  Math.abs(c.voyage.fragments[0].lane) >= 1.6 &&
    Math.abs(c.voyage.fragments[0].lane) < 3 &&
    !layoutConflicts(c).length,
);
c = flat();
c.adventures.chains = [{ routeId: null, gates: [{ s: 100 }] }];
c.pickups = [{ s: 100, lane: 0, type: "air", required: true }];
separateTrackItems(c);
check(
  "required-air-is-retained-outside-authored-stunt-gate-frame",
  c.pickups.length === 1 && Math.abs(c.pickups[0].s - 100) >= 8 && !layoutConflicts(c).length,
);
let snapshots = 0;
for (let seed = 1; seed <= 16; seed++) {
  c = createSection(seed, 2);
  const r = createRun(c);
  r.s = c.length;
  r.attached = true;
  for (const age of [0, 0.5, 1.8, 2.6, 3.8, 5, 8, 12]) {
    r.trafficState = {
      key: c.id ?? "baseline",
      cells: new Map(c.voyage.cells.map((cell) => [cell.id, { age, merge: true }])),
      poses: new Map(),
      nearMiss: new Set(),
      passes: 0,
    };
    stepTraffic(r, c, 0);
    for (let i = 0; i < c.hazards.length; i++) {
      const h = c.hazards[i],
        pose = trafficPose(c, h, i, r),
        actual = { ...h, s: pose.s, lane: pose.lane, motion: undefined };
      for (const p of [...c.pickups, ...c.voyage.fragments.map((f) => ({ ...f, fragment: true }))])
        if (!p.routeId) assert(!intersectsTraffic(p, actual), JSON.stringify({ seed, age, h, p }));
    }
    snapshots++;
  }
}
check("actual-car-motion-and-lane-change-snapshots-remain-clear", true, { snapshots });
const a = createSection(11, 2),
  b = createSection(11, 2);
check(
  "placement-is-deterministic-for-personal-ghost-replay",
  JSON.stringify(a.pickups) === JSON.stringify(b.pickups) &&
    JSON.stringify(a.hazards) === JSON.stringify(b.hazards) &&
    JSON.stringify(a.voyage.fragments) === JSON.stringify(b.voyage.fragments),
);
const window = createRandomCourse(42);
check(
  "next-section-preview-uses-the-same-safe-placement",
  !layoutConflicts(window.snapshot()).some((i) => i.kind === "traffic") &&
    !layoutConflicts(window.previewNext()).some((i) => i.kind === "traffic"),
);
await fs.writeFile(
  new URL("../evidence/placement-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(
  JSON.stringify({ passed: checks.length, sections, moved, fragments, adjusted, maximumRemoved }),
);
