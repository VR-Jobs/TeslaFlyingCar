import assert from "node:assert/strict";
import { LocalBackend } from "../src/local/backend.js";
import { LESSONS, LESSON_COUNT, nextAcademyLesson } from "../src/features/lessons.js";
import { evaluateMode, selectBoard } from "../src/features/rules.js";
const memory = new Map(),
  storage = { getItem: (k) => memory.get(k) || null, setItem: (k, v) => memory.set(k, v) };
const catalog = {
  items: [
    { id: "revive", max: 99 },
    { id: "start_revive", start: true, max: 99 },
    { id: "head_start", start: true, max: 99 },
    { id: "coin_double", start: true, max: 99 },
  ],
  cosmetics: [],
  achievements: [],
  quests: [],
  defaults: {},
  defaultOwned: [],
};
const backend = new LocalBackend(catalog, storage);
assert.equal(nextAcademyLesson(2, true, 3), 3);
assert.equal(nextAcademyLesson(1, false, 3), 1);
assert.equal(nextAcademyLesson(13, true, 1), 1);
assert.equal(nextAcademyLesson(13, true, 14), 14);
for (const item of catalog.items) backend.state.items[item.id] = 5;
const demos = [
  {},
  {},
  {},
  { airCan: 1, airRestored: 100 },
  { overpressure: 1, fullRefill: true },
  { shield: 1, shieldSaved: true },
  { shockwaveUsed: true, shockwaveCleared: true },
  { ludicrousUsed: true, powerTime: 2.1 },
  { star: true, powerTime: 2.1 },
  { rocket: true, powerTime: 2.1 },
  { headStart: true, headStartFinished: true },
  { autoRevived: true },
  { manualRevived: true },
  { coinDouble: true },
];
const inventory = JSON.stringify(backend.state.items);
for (let lesson = 0; lesson < LESSON_COUNT; lesson++) {
  const definition = LESSONS[lesson];
  assert(
    !evaluateMode("academy", { distance: definition.target, demo: {} }, lesson).success,
    definition.id + " passes without learning its objective",
  );
  const metrics = {
    distance: definition.target,
    duration: 20,
    maxCombo: 1,
    laneChanges: 2,
    jumps: 1,
    landings: 1,
    hoverTime: 1.3,
    maxHeight: 3.2,
    barrels: 1,
    perfectLandings: 1,
    demo: demos[lesson],
  };
  assert(evaluateMode("academy", metrics, lesson).success, definition.id + " completion goal");
  backend.setRunOptions({ mode: "academy", lesson });
  const run = await backend.startRun();
  if (definition.id === "coin_double")
    backend.state.activeRuns[run.runId].startItems.push("coin_double");
  backend.recordDrivingMetrics(run.runId, metrics);
  const result = {
    runId: run.runId,
    score: 100,
    distance: definition.target,
    duration: 20,
    maxCombo: 1,
    achievements: [],
    stats: {},
  };
  const settlement = await backend.submit(result);
  assert.equal(settlement.driving.trainingReward, definition.reward);
  assert.equal(backend.drivingProfile().lesson, lesson + 1);
  assert.equal(JSON.stringify(backend.state.items), inventory, "Training consumes inventory");
  if (definition.id === "head_start")
    assert.equal(settlement.rewards.run, 0, "Head-start training generates farming coins");
  if (definition.id === "coin_double") assert.equal(settlement.rewards.run, 4);
  const coins = backend.state.coins;
  await backend.submit(result);
  assert.equal(backend.state.coins, coins);
}
const restored = new LocalBackend(catalog, storage);
assert.equal(restored.drivingProfile().lesson, LESSON_COUNT);
assert.equal(restored.drivingProfile().trainingClaims.length, LESSON_COUNT);
assert.equal(await restored.getMyBest(), null, "Practice scores replace driving personal bests");
assert.equal(selectBoard(restored.state.runs, { mode: "free", category: "pure" }).length, 0);
console.log(
  "PASS: All 14 lesson objectives, contiguous progression, persisted completion, one-time rewards, free inventory trials, head-start reward limits and double-coin settlement.",
);
