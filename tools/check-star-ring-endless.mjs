import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse, add, mul, dot } from "../src/star-ring/course.js";
import {
  createRun,
  command,
  stepRun,
  rescue,
  restartCheckpoint,
} from "../src/star-ring/simulation.js";
import { advanceEndless, challengeSpeed, settleChallenge } from "../src/star-ring/endless.js";
import { getTrackSurface } from "../src/star-ring/track-surface.js";
import { createPickupView } from "../src/star-ring/pickups.js";
import { Js as Scene } from "../src/vendor/rendering.js";
const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
}
const c = createCourse({ endless: true }),
  solid = getTrackSurface(c),
  scene = new Scene(),
  visual = createPickupView(scene, c);
const resourceCount = () => {
  const g = new Set(),
    m = new Set();
  let objects = 0;
  scene.traverse((o) => {
    objects++;
    if (o.geometry) g.add(o.geometry);
    for (const a of Array.isArray(o.material) ? o.material : [o.material]) if (a) m.add(a);
  });
  return { objects, geometries: g.size, materials: m.size };
};
const initialResources = resourceCount();
for (const s of [0, c.length, c.length * 2]) {
  const a = c.frame(s - 0.001),
    b = c.frame(s + 0.001);
  check(
    "periodic-seam-" + Math.round(s),
    Math.hypot(...a.p.map((v, i) => v - b.p[i])) < 0.003 &&
      dot(a.t, b.t) > 0.99999 &&
      dot(a.up, b.up) > 0.99999,
  );
}
for (const s of [c.length - 0.4, c.length, c.length + 0.4]) {
  const f = c.pose(s),
    hit = solid.sweep(add(f.p, mul(f.up, 0.6)), add(f.p, mul(f.up, -0.7)));
  check(
    "seam-solid-top-" + s.toFixed(1),
    hit?.kind === "top" && dot(hit.normal, f.up) > 0.99,
    hit?.kind,
  );
}
const r = createRun(c);
let jumpGap = null,
  lastLap = 0,
  steps = 0,
  maxSets = 0,
  maxStep = 0;
let previous = [...r.pos],
  previousLap = 0;
for (; steps < 60 * 1800 && r.laps < 12; steps++) {
  if (r.laps !== lastLap) {
    jumpGap = null;
    lastLap = r.laps;
  }
  const gap = c.gaps.find((g) => !g.auto && g.start - r.s > -3 && g.start - r.s < 65);
  if (r.attached) {
    r.input.suction = true;
    r.input.jump = false;
    r.input.boost = !!gap;
    // Follow actual air pickups; later cycles rotate supply lanes.
    const air = c.pickups.find(
      (p, i) => p.type === "air" && !r.taken.has(i) && p.s - r.s > -3 && p.s - r.s < 100,
    );
    const target = gap ? 0 : (air?.lane ?? 0);
    while (r.targetLane < target - 0.1) command(r, c, "right");
    while (r.targetLane > target + 0.1) command(r, c, "left");
    if (gap && gap.start - r.s < 11 && jumpGap !== gap.start) {
      command(r, c, "jumpPress");
      command(r, c, "suctionRelease");
      jumpGap = gap.start;
    }
  } else {
    r.input.jump = r.airTime < 0.24;
    r.input.suction = r.airTime > 0.45;
    r.input.boost = false;
  }
  stepRun(r, c, 1 / 60);
  if (r.phase === "rescue") jumpGap = null;
  // A gray death now requires the player's R checkpoint retry.
  if (r.phase === "dead") {
    restartCheckpoint(r, c);
    jumpGap = null;
  }
  const currentWorld = add(r.pos, mul(c.displacement, r.laps));
  const previousWorld = add(previous, mul(c.displacement, previousLap));
  if (r.laps !== previousLap)
    maxStep = Math.max(maxStep, Math.hypot(...currentWorld.map((v, i) => v - previousWorld[i])));
  previous = [...r.pos];
  previousLap = r.laps;
  maxSets = Math.max(maxSets, r.taken.size + r.hit.size + r.autoPads.size);
  if (steps % 30 === 0) visual.update(r, 0.5, r.time);
  assert(r.pos.every(Number.isFinite) && Number.isFinite(r.score));
}
check(
  "twelve-real-continuous-sectors-complete-without-finish",
  r.laps === 12 && r.phase === "running",
  {
    laps: r.laps,
    seconds: r.time,
    steps,
    distance: r.bestDistance,
    falls: r.falls,
    lands: r.lands,
    score: r.score,
  },
);
check("rebase-preserves-world-position-at-running-speed", maxStep < 1.1, {
  maximumSeamStep: maxStep,
});
check("runtime-sets-stay-bounded", maxSets <= c.pickups.length + c.hazards.length + c.gaps.length, {
  maxSets,
});
check(
  "pickup-geometries-materials-and-scene-objects-do-not-grow",
  JSON.stringify(initialResources) === JSON.stringify(resourceCount()),
  { before: initialResources, after: resourceCount() },
);
check(
  "speed-increases-with-a-fair-upper-limit",
  challengeSpeed(r).cruise === 36 && challengeSpeed(r).boost === 48,
  challengeSpeed(r),
);
check(
  "cycle-lane-variation-preserves-track-clearance",
  c.pickups.every((p) => Math.abs(p.lane) <= 3.2) &&
    c.hazards.every((p) => Math.abs(p.lane) <= 3.2),
);
const p = {},
  reward = settleChallenge(p, r, c);
check(
  "endless-records-use-distance-and-score",
  p.endlessRuns === 1 &&
    p.bestEndlessDistance === r.bestDistance &&
    p.bestEndlessScore === Math.floor(r.score) &&
    reward <= 500,
  { profile: p, reward },
);
const beforeLap = r.laps;
r.s = c.length + 0.25;
r.pos = c.pose(r.s).p;
r.phase = "running";
r.taken.add(0);
r.hit.add(0);
advanceEndless(r, c);
check(
  "next-sector-replenishes-items-and-checkpoints",
  r.laps === beforeLap + 1 &&
    r.taken.size === 0 &&
    r.hit.size === 0 &&
    r.checkpoint === 0 &&
    r.s < 1,
);
const recover = createRun(c);
recover.laps = 3;
recover.completedDistance = 3 * c.length;
recover.worldOrigin = c.displacement.map((v) => v * 3);
recover.s = 900;
recover.checkpoint = 820;
recover.bestDistance = 3 * c.length + 900;
recover.pos = c.pose(recover.s).p;
rescue(recover, c);
for (let i = 0; i < 45; i++) stepRun(recover, c, 1 / 60);
check(
  "checkpoint-recovery-preserves-infinite-challenge-progress",
  recover.laps === 3 &&
    recover.bestDistance >= 3 * c.length + 900 &&
    recover.attached &&
    recover.s > 820 &&
    recover.s < 830,
);
check(
  "extended-track-window-is-fixed-size",
  solid.triangles.length < 40000 && c.surfaceEnd - c.surfaceStart < 3200,
  { triangles: solid.triangles.length, window: [c.surfaceStart, c.surfaceEnd] },
);
await fs.writeFile(
  new URL("../evidence/star-ring-endless-checks.json", import.meta.url),
  JSON.stringify(
    {
      checks,
      scope:
        "12 complete authored sectors using actual collision, suction, launches, pickups and rescue at 60 Hz; roughly 15 minutes of simulated play. Static geometry counts checked separately from WebGL.",
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    passed: checks.length,
    seconds: r.time,
    distance: r.bestDistance,
    resources: resourceCount(),
  }),
);
