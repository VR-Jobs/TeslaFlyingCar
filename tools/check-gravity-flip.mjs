import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  createGravityCourse,
  facePoint,
  faceDistance,
  FACE_UP,
} from "../src/gravity-flip/course.js";
import {
  createGravityRun,
  commandGravity,
  stepGravity,
  selectGravityTarget,
  gravityPilot,
  restartGravityCheckpoint,
} from "../src/gravity-flip/rules.js";
const checks = [];
const check = (name, fn) => {
  fn();
  checks.push({ name, pass: true });
};
const step = (run, course, count, pilot = false, dt = 1 / 60) => {
  for (let i = 0; i < count; i++) {
    run.events = [];
    if (pilot) gravityPilot(run, course);
    stepGravity(run, course, dt);
  }
};
check("course-is-deterministic-and-seed-varies-route", () => {
  const a = createGravityCourse(11),
    b = createGravityCourse(11),
    c = createGravityCourse(12);
  assert.deepEqual(
    Array.from({ length: 30 }, (_, i) => a.gate(i)),
    Array.from({ length: 30 }, (_, i) => b.gate(i)),
  );
  assert.notDeepEqual(
    Array.from({ length: 30 }, (_, i) => a.gate(i).face),
    Array.from({ length: 30 }, (_, i) => c.gate(i).face),
  );
});
check("every-required-transfer-is-adjacent-and-has-reaction-time", () => {
  for (let seed = 1; seed <= 20; seed++) {
    let last = 0;
    const c = createGravityCourse(seed);
    for (let i = 0; i < 40; i++) {
      const g = c.gate(i);
      assert([1, 3].includes((g.face - last + 4) % 4));
      assert(c.exists(g.face, g.start + 20));
      for (let f = 0; f < 4; f++) if (f !== g.face) assert(!c.exists(f, g.start + 20));
      last = g.face;
    }
  }
});
check("four-face-contact-and-complete-circuit", () => {
  const c = createGravityCourse(11),
    r = createGravityRun({ tutorial: false });
  r.input.suction = true;
  for (let face = 1; face <= 4; face++) {
    selectGravityTarget(r, 1);
    commandGravity(r, c, "jump");
    step(r, c, 90);
    r.input.jump = false;
    assert.equal(r.attached, true);
    assert.equal(r.face, face % 4);
    assert(r.maxPenetration < 1e-5);
  }
  assert.equal(r.transfers, 4);
  assert.equal(r.circuits, 1);
  assert.equal(r.bestCombo, 4);
});
check("tutorial-requires-hold-launch-and-recontact", () => {
  const c = createGravityCourse(11),
    r = createGravityRun();
  commandGravity(r, c, "jump");
  assert(r.attached);
  assert.equal(r.tutorial.step, 0);
  r.input.jump = false;
  step(r, c, 120);
  assert.equal(r.s, 0);
  assert.equal(r.tutorial.step, 0);
  r.input.suction = true;
  step(r, c, 35);
  assert.equal(r.tutorial.step, 1);
  commandGravity(r, c, "jump");
  assert.equal(r.tutorial.step, 2);
  step(r, c, 90);
  assert.equal(r.tutorial, null);
  assert.equal(r.face, 1);
  assert(r.attached);
});
check("a-missed-tutorial-contact-can-be-retried", () => {
  const c = createGravityCourse(11),
    r = createGravityRun();
  r.input.suction = true;
  step(r, c, 35);
  selectGravityTarget(r, -1);
  assert.equal(r.target, 1);
  commandGravity(r, c, "jump");
  r.input.suction = false;
  r.input.jump = false;
  step(r, c, 240);
  assert.equal(r.phase, "running");
  assert(r.tutorial);
  assert.equal(r.tutorial.step, 1);
  assert.equal(r.target, 1);
  assert(r.attached);
});
check("continuous-routes-remain-completable-including-thirty-gates", () => {
  for (const seed of [1, 2, 11, 42, 813, 7111, 9231, 4294967295]) {
    const c = createGravityCourse(seed),
      r = createGravityRun();
    let count = 0;
    while (r.gates < 30 && count++ < 18000 && r.phase === "running") step(r, c, 1, true);
    assert.equal(r.phase, "running", `seed ${seed} at ${r.s}`);
    assert.equal(r.gates, 30);
    assert(r.maxPenetration < 1e-5);
    assert(c.status().cachedGates <= 14);
  }
});
check("low-and-high-frame-rates-use-continuous-collision", () => {
  for (const dt of [1 / 30, 1 / 60, 1 / 120]) {
    const c = createGravityCourse(55),
      r = createGravityRun({ tutorial: false });
    r.input.suction = true;
    for (let i = 0; i < 4; i++) {
      selectGravityTarget(r, 1);
      commandGravity(r, c, "jump");
      step(r, c, Math.ceil(1.4 / dt), false, dt);
      r.input.jump = false;
      assert(r.attached);
      assert.equal(r.face, (i + 1) % 4);
      assert(r.maxPenetration < 1e-5);
    }
  }
});
check("swept-wall-contact-blocks-high-speed-tunnelling", () => {
  const c = createGravityCourse(3),
    r = createGravityRun({ tutorial: false });
  Object.assign(r, {
    attached: false,
    x: 7.5,
    y: 0,
    vx: 110,
    vy: 0,
    airTime: 0.5,
    target: 1,
    sourceFace: 0,
  });
  step(r, c, 1, false, 1 / 30);
  assert(r.x <= 7.91001);
  assert(r.vx < 0);
  assert(r.events.some((e) => e.type === "impact"));
});
check("gravity-loss-warns-before-detachment-and-crash-turns-terminal", () => {
  const c = createGravityCourse(11),
    r = createGravityRun({ tutorial: false });
  Object.assign(r, { face: 2, sourceFace: 2, target: 3, x: 0, y: 7.91 });
  step(r, c, 25);
  assert(r.attached);
  assert(r.warning > 0.3);
  step(r, c, 30);
  assert(!r.attached);
  step(r, c, 280);
  assert.equal(r.phase, "dead");
  assert(["impact", "grip"].includes(r.reason));
});
check("missed-broken-face-fails-instead-of-crossing-panel-backs", () => {
  const c = createGravityCourse(11),
    r = createGravityRun({ tutorial: false });
  r.s = c.gate(0).start - 4;
  step(r, c, 420);
  assert.equal(r.phase, "dead");
  assert.equal(r.reason, "gap");
});
check("checkpoint-restores-an-existing-safe-face", () => {
  const c = createGravityCourse(14),
    r = createGravityRun({ tutorial: false });
  step(r, c, 2600, true);
  assert(r.checkpoint.s > 0);
  const at = { ...r.checkpoint };
  r.phase = "dead";
  restartGravityCheckpoint(r);
  assert.equal(r.phase, "running");
  assert.equal(r.s, at.s);
  assert.equal(r.face, at.face);
  assert(c.exists(r.face, r.s, 2.6));
  assert(r.pressure === 100);
  assert(r.attached);
});
check("frame-basis-and-floating-origin-remain-finite-at-long-distances", () => {
  const c = createGravityCourse(42);
  for (const s of [0, 1, 600, 1200, 12000, 1000000]) {
    const f = c.frame(s);
    for (const v of [f.up, f.right, f.t]) assert(Math.abs(Math.hypot(...v) - 1) < 1e-8);
    const p = c.world(s, 0, 0, Math.floor(s / 120) * 120);
    assert(p.every(Number.isFinite));
    assert(Math.abs(p[2]) < 121);
    c.nextGate(s);
  }
  assert(c.status().cachedGates <= 14);
});
check("energy-and-position-remain-bounded-under-erratic-input", () => {
  for (let seed = 1; seed < 12; seed++) {
    const c = createGravityCourse(seed),
      r = createGravityRun({ tutorial: false });
    for (let i = 0; i < 3000 && r.phase === "running"; i++) {
      if (i % 53 === 0) selectGravityTarget(r, i % 2 ? 1 : -1);
      if (i % 61 === 0) commandGravity(r, c, "jump");
      if (i % 61 === 6) commandGravity(r, c, "jump", false);
      r.input.suction = (i + seed) % 110 < 79;
      step(r, c, 1);
      assert(r.pressure >= 0 && r.pressure <= 100);
      assert([r.x, r.y, r.vx, r.vy, r.score].every(Number.isFinite));
    }
  }
});
await fs.writeFile(
  new URL("../evidence/gravity-flip-checks.json", import.meta.url),
  JSON.stringify({ passed: checks.length, checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, randomRoutes: 8, gatesPerRoute: 30 }));
