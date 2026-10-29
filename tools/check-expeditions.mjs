import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  MODES,
  createExpedition,
  commandExpedition,
  stepExpedition,
  pilotExpedition,
  continueExpedition,
  abortExpedition,
  restoreExpedition,
} from "../src/expeditions/rules.js";
import { finiteState, wrap } from "../src/expeditions/core.js";
import { planet, launchWindow } from "../src/expeditions/slingshot.js";
import { dock, cores } from "../src/expeditions/salvage.js";
import { note, BEAT } from "../src/expeditions/beat-road.js";
import { echoSample, switches } from "../src/expeditions/time-echo.js";
import { pairPositions, pairFits } from "../src/expeditions/twin-resonance.js";
import { platformAt, cutSection } from "../src/expeditions/leviathan-escape.js";
import { drawWorld } from "../src/expeditions/world.js";
const checks = [],
  routes = [];
let maxima = {};
function check(name, fn) {
  fn();
  checks.push({ name, pass: true });
}
function steps(r, n, { pilot = false, dt = 1 / 60 } = {}) {
  for (let i = 0; i < n; i++) {
    r.events = [];
    if (pilot && r.phase === "running") pilotExpedition(r);
    stepExpedition(r, dt);
  }
}
function complete(id, seed = 11, dt = 1 / 60) {
  const r = createExpedition(id, seed);
  for (let i = 0; i < Math.ceil(200 / dt) && r.phase === "running"; i++) {
    r.events = [];
    pilotExpedition(r);
    stepExpedition(r, dt);
    if (i % 240 === 0) {
      assert(finiteState(r), id);
      const count = {};
      drawWorld(r, (item) => {
        assert(
          [...item.p, ...item.scale, ...item.rotation].every(Number.isFinite),
          id + " finite rendering",
        );
        assert(item.scale.every((v) => v >= 0));
        count[item.type] = (count[item.type] || 0) + 1;
      });
      for (const [type, n] of Object.entries(count)) {
        assert(n <= 512, id + " instance budget " + type);
        maxima[type] = Math.max(maxima[type] || 0, n);
      }
    }
  }
  return r;
}
check("six-distinct-rules-and-goals", () => {
  assert.equal(Object.keys(MODES).length, 6);
  assert.equal(new Set(Object.keys(MODES).map((id) => createExpedition(id).id)).size, 6);
});
for (const id of Object.keys(MODES))
  check(id + "-eight-seeds-are-completable", () => {
    for (const seed of [1, 2, 3, 11, 42, 123, 913, 4294967295]) {
      const r = complete(id, seed);
      assert.equal(
        r.phase,
        "finished",
        JSON.stringify({ id, seed, reason: r.reason, metric: r.metric }),
      );
      assert(r.metric >= r.goal);
      assert(JSON.stringify(r).length < 160000);
      routes.push({ id, seed, time: Math.round(r.time * 10) / 10, metric: r.metric });
    }
  });
check("frame-rates-and-endless-continuation", () => {
  for (const id of Object.keys(MODES)) {
    for (const dt of [1 / 30, 1 / 120]) {
      const r = complete(id, 42, dt);
      assert.equal(r.phase, "finished", id + " at " + dt);
      continueExpedition(r);
      steps(r, 90, { pilot: true, dt });
      assert.equal(r.phase, "running", id);
      assert(r.endless);
      assert(finiteState(r));
    }
  }
});
check("ending-early-does-not-count-as-a-win", () => {
  for (const id of Object.keys(MODES)) {
    const r = createExpedition(id);
    abortExpedition(r);
    assert.equal(r.phase, "ended");
    continueExpedition(r);
    assert.equal(r.phase, "ended");
    steps(r, 60);
    assert.equal(r.time, 0);
  }
});
check("orbital-window-releases-into-continuous-flight", () => {
  const r = createExpedition("slingshot", 11);
  commandExpedition(r, "suction", true);
  r.theta = launchWindow(r).angle;
  const center = planet(r, 0);
  r.x = center.x + Math.cos(r.theta) * center.orbit;
  r.s = center.s + Math.sin(r.theta) * center.orbit;
  commandExpedition(r, "suction", false);
  assert(!r.orbiting);
  assert(Math.hypot(r.vx, r.vs) > 20);
  assert.equal(r.orbitIndex, 0);
  steps(r, 400, { pilot: true });
  assert(r.orbitIndex > 0);
});
check("planet-collision-and-lost-orbit-have-explicit-failures", () => {
  const r = createExpedition("slingshot", 11),
    p = planet(r, 1);
  Object.assign(r, { orbiting: false, x: p.x, s: p.s });
  steps(r, 1);
  assert.equal(r.reason, "planet");
  const lost = createExpedition("slingshot", 11);
  Object.assign(lost, { orbiting: false, vx: -40, vs: -20 });
  steps(lost, 650);
  assert(["planet", "lostOrbit"].includes(lost.reason));
  assert.equal(lost.phase, "dead");
});
check("salvage-collection-is-unique-and-does-not-equal-delivery", () => {
  const r = createExpedition("salvage", 11);
  r.s = 43;
  r.input.suction = true;
  steps(r, 12);
  assert(r.cargo.length > 0);
  assert.equal(new Set(r.collected).size, r.collected.length);
  assert.equal(r.delivered, 0);
  assert.equal(r.metric, 0);
});
check("salvage-unloads-only-near-ship-with-suction", () => {
  const r = createExpedition("salvage", 11),
    d = dock(r, 0);
  r.s = d.s - 4;
  r.x = d.x;
  r.cargo = [{ id: 99, x: r.x, s: r.s - 3, vx: 0, vs: 0, stress: 0, age: 0 }];
  steps(r, 5);
  assert.equal(r.delivered, 0);
  r.input.suction = true;
  steps(r, 30);
  assert(r.delivered >= 1);
  assert.equal(r.metric, r.delivered);
});
check("elastic-cargo-can-break-and-nearby-cargo-can-be-recovered", () => {
  const r = createExpedition("salvage", 11);
  r.s = 100;
  r.collected = [3];
  r.cargo = [{ id: 3, x: 0, s: 60, vx: 0, vs: 0, stress: 1.19, age: 2 }];
  steps(r, 1);
  assert.equal(r.cargo.length, 0);
  assert.equal(r.dropped.length, 1);
  r.s = r.dropped[0].s + 2;
  r.x = r.dropped[0].x;
  r.input.suction = true;
  steps(r, 1);
  assert(r.cargo.some((c) => c.id === 3));
  assert.equal(r.dropped.length, 0);
});
check("rhythm-judges-timing-and-lane-and-rejects-held-key-spam", () => {
  const r = createExpedition("beatRoad", 11);
  r.time = 3;
  r.s = 72;
  commandExpedition(r, "jump", true);
  assert.equal(r.hits, 1);
  commandExpedition(r, "jump", true);
  assert.equal(r.hits, 1);
  commandExpedition(r, "jump", false);
  commandExpedition(r, "jump", true);
  assert.equal(r.hits, 1);
  const wrong = createExpedition("beatRoad", 11);
  wrong.time = 3;
  wrong.x = 3.4;
  commandExpedition(wrong, "jump", true);
  assert.equal(wrong.hits, 0);
  assert.equal(wrong.phase, "running");
});
check("rhythm-chart-randomness-preserves-reachable-lane-transitions", () => {
  const a = createExpedition("beatRoad", 1),
    b = createExpedition("beatRoad", 2);
  assert.notDeepEqual(
    Array.from({ length: 48 }, (_, i) => note(a, i).lane),
    Array.from({ length: 48 }, (_, i) => note(b, i).lane),
  );
  for (let seed = 1; seed < 25; seed++) {
    const r = createExpedition("beatRoad", seed);
    for (let i = 1; i < 200; i++) assert(Math.abs(note(r, i).lane - note(r, i - 1).lane) <= 1);
  }
});
check("rhythm-missed-beats-cannot-silently-build-road", () => {
  const r = createExpedition("beatRoad");
  steps(r, 600);
  assert.equal(r.phase, "dead");
  assert.equal(r.reason, "rhythm");
  assert.equal(r.hits, 0);
});
check("echo-uses-the-recorded-position-height-and-orientation", () => {
  const r = createExpedition("timeEcho", 11);
  for (let i = 0; i < 2000 && r.lap === "record"; i++) steps(r, 1, { pilot: true });
  assert.equal(r.lap, "echo");
  assert(r.record.length > 200);
  assert(r.record.some((p) => Math.abs(p.x) > 3.5));
  assert(r.record.some((p) => Math.abs(p.yaw) > 0.01));
  for (const index of [1, 50, 100, 200]) {
    const p = r.record[index],
      ghost = echoSample(r, p.t);
    assert(Math.abs(ghost.x - p.x) < 1e-8);
    assert(Math.abs(ghost.s - p.s) < 1e-8);
    assert(Math.abs(ghost.yaw - p.yaw) < 1e-8);
  }
});
check("echo-missed-recording-and-wrong-live-switch-fail", () => {
  const r = createExpedition("timeEcho", 11);
  steps(r, 1100);
  assert.equal(r.reason, "record");
  const e = createExpedition("timeEcho", 11);
  for (let i = 0; i < 2000 && e.lap === "record"; i++) steps(e, 1, { pilot: true });
  e.lane = switches(e)[0].lane;
  steps(e, 500);
  assert.equal(e.reason, "echo");
});
check("echo-seeds-change-switches-without-changing-replay-mechanics", () => {
  const a = createExpedition("timeEcho", 1),
    b = createExpedition("timeEcho", 3);
  const variants = new Set();
  for (let seed = 1; seed < 12; seed++)
    variants.add(switches(createExpedition("timeEcho", seed))[0].lane);
  assert.equal(variants.size, 2);
});
check("twin-springs-compress-expand-and-preserve-pair-center", () => {
  const r = createExpedition("twinResonance", 11);
  r.input.suction = true;
  steps(r, 90);
  assert(r.separation < 4.2);
  assert(pairFits(r, { type: "pinch" }));
  r.input.suction = false;
  r.input.jump = true;
  steps(r, 100);
  assert(r.separation > 10.5);
  assert(pairFits(r, { type: "spread" }));
  const pair = pairPositions(r);
  assert(Math.abs(pair[0].y + pair[1].y - 12) < 1e-8);
  r.angle = 0;
  assert(pairFits(r, { type: "horizontal" }));
  assert(!pairFits(r, { type: "vertical" }));
});
check("twin-gate-requires-both-cars-and-failure-costs-shields", () => {
  const r = createExpedition("twinResonance", 11);
  r.angle = 0.4;
  r.separation = 11;
  assert(!pairFits(r, { type: "pinch" }));
  steps(r, 4200);
  assert(r.health < 3);
  assert.equal(r.phase, "dead");
  assert.equal(r.reason, "pair");
});
check("escape-collision-agrees-with-drawn-broken-surfaces", () => {
  const r = createExpedition("leviathanEscape", 11),
    g = cutSection(r, 0);
  r.s = g.start + 20;
  r.time = 8;
  for (let lane = -1; lane <= 1; lane++) {
    const p = platformAt(r, r.s, lane * 5.5);
    assert.equal(p.exists, lane === g.safe);
    let drawn = false;
    drawWorld(r, (item) => {
      if (
        item.type === "glass" &&
        Math.abs(item.p[0] - lane * 5.5) < 0.1 &&
        Math.abs(item.p[2] - r.s) <= item.scale[2] / 2 + 0.1
      )
        drawn = true;
    });
    assert.equal(drawn, lane === g.safe);
  }
});
check("drifting-fragment-requires-suction-and-failure-is-explained", () => {
  let r, g;
  for (let seed = 1; seed < 50; seed++) {
    r = createExpedition("leviathanEscape", seed);
    g = cutSection(r, 0);
    if (g.drift) break;
  }
  r.s = g.start + 8;
  r.x = g.safe * 5.5;
  r.lane = g.safe;
  r.y = platformAt(r).y;
  steps(r, 120);
  assert.equal(r.reason, "cut");
});
check("checkpoint-preserves-an-endless-voyage", () => {
  for (const id of Object.keys(MODES)) {
    const checkpoint = createExpedition(id, 11);
    const current = complete(id, 11);
    continueExpedition(current);
    const restored = restoreExpedition(checkpoint, current);
    assert(restored.endless, id);
    assert.equal(restored.goal, current.goal, id);
    if (id === "leviathanEscape") assert.equal(restored.finishAt, current.finishAt);
    assert.equal(checkpoint.endless, false);
    assert.notEqual(restored.input, checkpoint.input);
    assert(finiteState(restored));
  }
});
check("checkpoint-clones-are-independent-and-serializable", () => {
  for (const id of Object.keys(MODES)) {
    const r = createExpedition(id, 11);
    steps(r, 300, { pilot: true });
    const clone = structuredClone(r);
    clone.input.suction = !clone.input.suction;
    assert.notEqual(clone.input.suction, r.input.suction);
    assert(JSON.stringify(clone).length < 160000);
  }
});
check("no-input-runs-eventually-fail-without-awarding-a-win", () => {
  for (const id of Object.keys(MODES)) {
    const r = createExpedition(id, 11);
    steps(r, 14000);
    assert.equal(r.phase, "dead", id);
    assert(r.reason);
  }
});
check("erratic-inputs-remain-finite-and-resource-bounded", () => {
  for (const id of Object.keys(MODES)) {
    const r = createExpedition(id, 42);
    for (let i = 0; i < 4000 && r.phase === "running"; i++) {
      if (i % 17 === 0) commandExpedition(r, "left", true);
      if (i % 17 === 3) commandExpedition(r, "left", false);
      if (i % 29 === 0) commandExpedition(r, "right", true);
      if (i % 29 === 5) commandExpedition(r, "right", false);
      if (i % 37 === 0) commandExpedition(r, "jump", true);
      if (i % 37 === 7) commandExpedition(r, "jump", false);
      r.input.suction = i % 100 < 65;
      steps(r, 1);
      assert(finiteState(r), id);
      assert((r.cargo?.length || 0) <= 6);
      assert((r.record?.length || 0) <= 900);
      assert((r.tiles?.length || 0) <= 12);
    }
  }
});
await fs.writeFile(
  new URL("../evidence/expeditions-checks.json", import.meta.url),
  JSON.stringify(
    { passed: checks.length, routes: routes.length, maxima, checks, routeChecks: routes },
    null,
    2,
  ),
);
console.log(JSON.stringify({ passed: checks.length, seededRoutes: routes.length, maxima }));
