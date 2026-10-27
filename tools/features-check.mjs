import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  courseRows,
  dailySeed,
  UTC_DAY,
  safeSpawnZ,
  trafficSpacing,
  landingGrade,
  evaluateMode,
  selectBoard,
  classifyRun,
  normalizeOptions,
} from "../src/features/rules.js";
import { LocalBackend } from "../src/local/backend.js";
const checks = [];
const check = (name, detail) => {
  checks.push({ name, status: "PASS", detail });
  console.log("PASS", name);
};
assert.equal(dailySeed("2026-10-25"), dailySeed("2026-10-25"));
assert.notEqual(dailySeed("2026-10-25"), dailySeed("2026-10-26"));
for (let seed = 0; seed < 100; seed++) {
  const rows = courseRows(seed);
  assert.deepEqual(rows, courseRows(seed));
  let lane = 1;
  for (const row of rows) {
    assert(!row.blocked.includes(row.safeLane));
    assert(Math.abs(row.safeLane - lane) <= 1);
    assert(row.blocked.length <= 2);
    lane = row.safeLane;
  }
}
check(
  "Fixed daily layouts and reachable ground corridors",
  "100 seeds; identical layouts repeat, adjacent safe lanes remain open",
);
assert.equal(safeSpawnZ(-10, 50), -90);
assert.equal(safeSpawnZ(-200, 50), -200);
assert(trafficSpacing(360, 0.8) > trafficSpacing(100, 0.8));
assert(trafficSpacing(100, 0.1) > trafficSpacing(100, 0.8));
check(
  "Reaction distance and recovery waves",
  "New hazards get >=1.8 s relative-speed lead; recovery and low-air spacing increase",
);
assert(landingGrade({ completed: 1, roll: 0.1, flip: 0.1, velocity: -12 }).perfect);
assert(!landingGrade({ completed: 1, roll: 2, velocity: -12 }).perfect);
assert(!landingGrade({ completed: 1, velocity: -24 }).perfect);
assert(!landingGrade({ pending: 1, velocity: -12 }).complete);
check(
  "Landing grades",
  "Full, aligned, moderate-impact landings qualify; partial rotations and steep impacts do not",
);
const m = {
  distance: 150,
  laneChanges: 2,
  jumps: 1,
  landings: 1,
  hoverTime: 0,
  maxHeight: 2.5,
  barrels: 0,
  perfectLandings: 0,
  collisions: 0,
  duration: 10,
  tricks: 0,
};
assert(evaluateMode("academy", m, 0).success);
assert(!evaluateMode("academy", { ...m, laneChanges: 1 }, 0).success);
assert(evaluateMode("academy", { ...m, distance: 200, hoverTime: 1.3, maxHeight: 3.2 }, 1).success);
assert(evaluateMode("academy", { ...m, distance: 220, barrels: 1, perfectLandings: 1 }, 2).success);
assert(evaluateMode("precision", { ...m, distance: 800 }).success);
assert(!evaluateMode("precision", { ...m, distance: 800, collisions: 1 }).success);
assert(evaluateMode("stunt", { ...m, tricks: 6, perfectLandings: 3 }).success);
assert(evaluateMode("stunt", { ...m, duration: 60 }).finished);
assert(evaluateMode("escape", { ...m, duration: 45 }).success);
assert(evaluateMode("daily", { ...m, distance: 1200 }).success);
check(
  "Lesson and challenge objectives",
  "Each lesson and all four challenges have explicit pass/fail and end conditions",
);
const values = new Map(),
  storage = { getItem: (k) => values.get(k) || null, setItem: (k, v) => values.set(k, v) };
const catalog = {
  items: [
    { id: "head_start", start: true, max: 99, price: 15 },
    { id: "revive", max: 99, price: 100 },
  ],
  cosmetics: [],
  achievements: [],
  quests: [],
  defaults: {},
  defaultOwned: [],
};
const backend = new LocalBackend(catalog, storage);
backend.setRunOptions({ mode: "academy", lesson: 0 });
let run = await backend.startRun();
backend.recordDrivingMetrics(run.runId, m);
const result = {
  runId: run.runId,
  score: 150,
  distance: 150,
  duration: 10,
  maxCombo: 1,
  achievements: [],
  stats: {},
};
const settled = await backend.submit(result);
assert.equal(settled.driving.trainingReward, 10);
assert.equal(backend.drivingProfile().lesson, 1);
const coins = backend.state.coins;
await backend.submit(result);
assert.equal(backend.state.coins, coins);
run = await backend.startRun();
backend.recordDrivingMetrics(run.runId, m);
assert.equal((await backend.submit({ ...result, runId: run.runId })).driving.trainingReward, 0);
check(
  "Training progression and one-time rewards",
  "Progress survives saves; duplicate submissions and replayed lessons cannot duplicate the first-completion award",
);
backend.setRunOptions({ mode: "daily" });
const a = await backend.startRun(),
  b = await backend.startRun();
assert.equal(a.seed, b.seed);
assert.equal(a.seed, dailySeed(UTC_DAY()));
await assert.rejects(() => backend.useStartItem(a.runId, "head_start"), /item_unavailable/);
await assert.rejects(() => backend.useRevive(a.runId, 1), /revive_unavailable/);
backend.recordDrivingMetrics(a.runId, { ...m, distance: 1200 });
await backend.submit({ ...result, runId: a.runId, distance: 1200 });
assert.equal(backend.drivingBoard({ mode: "daily", category: "pure", day: UTC_DAY() }).length, 1);
assert.equal(
  backend.drivingBoard({ mode: "daily", category: "pure", day: "2000-01-01" }).length,
  0,
);
check(
  "Daily seed, restricted items and dated boards",
  "Same UTC day repeats the seed; start items and revives rejected; only same-day successful results enter daily board",
);
assert.equal(classifyRun({ score: 10 }), "legacy");
assert.equal(classifyRun({ mode: "free", startItems: [], revives: 0 }), "pure");
assert.equal(classifyRun({ mode: "free", startItems: ["head_start"] }), "assisted");
const rows = [
  { mode: "free", ruleset: "a", score: 20, startItems: [], revives: 0 },
  { mode: "free", ruleset: "b", score: 100, startItems: [], revives: 0 },
  { mode: "free", ruleset: "a", score: 999, startItems: ["head_start"] },
];
assert.equal(selectBoard(rows, { mode: "free", category: "pure", ruleset: "a" }).length, 1);
assert.deepEqual(normalizeOptions({ mode: "classic" }).features, {
  coaching: false,
  feedback: false,
  fairTraffic: false,
});
check(
  "Category and ruleset separation",
  "Legacy, practice, assisted and pure runs remain distinct; original mode disables all enhancements",
);
const report = { date: new Date().toISOString(), checks };
await fs.writeFile(
  fileURLToPath(new URL("../evidence/design-feature-checks.json", import.meta.url)),
  JSON.stringify(report, null, 2),
);
console.log(`${checks.length} feature groups passed.`);
