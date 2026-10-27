import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  createRandomCourse,
  createSection,
  newCourseSeed,
  RANDOM_LIMITS,
} from "../src/star-ring/random-course.js";
import { createRun } from "../src/star-ring/simulation.js";
import { randomPilotStep } from "../src/star-ring/random-pilot.js";
import { add, sub, dot } from "../src/star-ring/course.js";
import { getTrackSurface } from "../src/star-ring/track-surface.js";
const checks = [],
  geometry = new Set(),
  fields = new Set(),
  orders = new Set();
const record = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
};
function fingerprint(c) {
  return JSON.stringify({
    segments: c.segments.map((s) => [s.kind, s.length, s.options]),
    gaps: c.gaps,
    pickups: c.pickups,
    hazards: c.hazards,
  });
}
for (let seed = 1; seed <= 128; seed++) {
  const c = createSection(seed, 3);
  geometry.add(JSON.stringify(c.segments.map((s) => [s.kind, s.length, s.options])));
  fields.add(JSON.stringify([c.gaps, c.hazards, c.pickups]));
  orders.add(c.recipe.kinds.join(","));
  assert(c.length < 4200 && c.pickups.length < 180);
  for (const g of c.gaps) {
    const a = c.frame(g.start - 80),
      b = c.frame(g.end + 100);
    assert(
      a.kind === "straight" && b.kind === "straight" && a.up[1] > 0.999 && b.up[1] > 0.999,
      "flat launch/landing approach",
    );
    assert(!c.frame((g.start + g.end) / 2).exists);
    assert(
      g.end - g.start >= (g.auto ? 17.99 : 19.99) && g.end - g.start <= (g.auto ? 20.01 : 27.01),
    );
  }
  for (let i = 0; i < c.recipe.rows.length; i++) {
    const row = c.recipe.rows[i];
    assert(row.blocked.length <= 2 && !row.blocked.includes(row.open), "open lane at every row");
    if (i) assert(row.s - c.recipe.rows[i - 1].s >= 83.99, "lane reaction time");
    assert(
      !c.gaps.some(
        (g) => row.s > g.start - RANDOM_LIMITS.gapBefore && row.s < g.end + RANDOM_LIMITS.gapAfter,
      ),
      "no obstacles inside leap/regrip buffer",
    );
  }
  for (const s of c.checkpoints)
    assert(c.frame(s).exists && c.frame(s).up[1] > 0.999, "safe checkpoint");
  for (const segment of c.segments.filter((s) => s.kind === "loop" || s.kind === "twist")) {
    const feeds = c.pickups
      .filter((p) => p.required && p.lane === 0 && p.s >= segment.start && p.s <= segment.end)
      .map((p) => p.s);
    const stops = [segment.start, ...feeds, segment.end];
    assert(feeds.length >= 2);
    assert(
      stops.slice(1).every((s, i) => s - stops[i] < 100),
      "bounded energy feed spacing",
    );
  }
}
record(
  "128-seeds-change-actual-track-geometries-and-field-layouts",
  geometry.size === 128 && fields.size === 128,
  { geometry: geometry.size, fields: fields.size, orders: orders.size },
);
record("many-module-orders-rather-than-three-lane-rotations", orders.size >= 25, {
  orders: orders.size,
});
record("all-128-layouts-have-open-lanes-safe-checkpoints-flat-leaps-and-air-supply", true);
record(
  "seed-and-section-reproduce-the-same-layout",
  fingerprint(createSection(42, 7)) === fingerprint(createSection(42, 7)),
);
record(
  "same-run-next-sections-are-geometrically-different",
  fingerprint(createSection(42, 0)) !== fingerprint(createSection(42, 3)),
);
record(
  "new-runs-receive-fresh-seeds",
  new Set(Array.from({ length: 64 }, newCourseSeed)).size >= 63,
);
const reports = [];
for (const seed of [1, 2, 3, 9, 27, 42, 101, 2026]) {
  const c = createRandomCourse(seed),
    r = createRun(c),
    state = {};
  let minimumPressure = 100;
  let seamStep = 0,
    last = [...r.pos],
    lastOrigin = [...r.worldOrigin],
    lastLap = 0;
  const target = seed === 42 ? 10 : 1;
  for (let i = 0; i < 60 * 220 * target && r.laps < target; i++) {
    randomPilotStep(r, c, state);
    minimumPressure = Math.min(minimumPressure, r.pressure);
    if (r.laps !== lastLap) {
      const a = add(r.pos, r.worldOrigin),
        b = add(last, lastOrigin);
      seamStep = Math.max(seamStep, Math.hypot(...sub(a, b)));
      lastLap = r.laps;
    }
    last = [...r.pos];
    lastOrigin = [...r.worldOrigin];
    assert(r.pos.every(Number.isFinite) && Number.isFinite(r.score));
  }
  reports.push({
    seed,
    laps: r.laps,
    time: r.time,
    distance: r.bestDistance,
    falls: r.falls,
    trackImpacts: r.trackImpacts,
    minimumPressure,
    seamStep,
  });
  assert(
    r.laps === target,
    "actual seeded course cannot progress: " + JSON.stringify(reports.at(-1)),
  );
  assert(seamStep < 1.2, "world-space jump across a variable-length section");
  assert(r.completedDistance > 0 && r.bestDistance >= r.completedDistance);
}
record("actual-collision-suction-launch-and-regrip-can-progress-on-eight-seeds", true, reports);
record(
  "ten-different-length-sections-preserve-world-space-continuity",
  reports.find((r) => r.seed === 42).laps === 10,
  reports.find((r) => r.seed === 42),
);
const c = createRandomCourse(301);
for (let i = 0; i < 4; i++) {
  const s = c.length,
    a = c.frame(s - 0.001),
    b = c.frame(s + 0.001);
  assert(
    Math.hypot(...sub(a.p, b.p)) < 0.003 && dot(a.t, b.t) > 0.99999 && dot(a.up, b.up) > 0.99999,
  );
  const f = c.pose(s),
    surface = getTrackSurface(c),
    h = surface.sweep(add(f.p, [0, 0.5, 0]), add(f.p, [0, -0.5, 0]));
  assert(h?.kind === "top");
  c.previewNext();
  c.setCycle(i + 1);
}
record("neighboring-generated-sections-join-with-matching-solid-collision", true);
await fs.writeFile(
  new URL("../evidence/star-ring-random-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(
  JSON.stringify({
    passed: checks.length,
    uniqueGeometry: geometry.size,
    moduleOrders: orders.size,
    fullRouteReports: reports,
  }),
);
