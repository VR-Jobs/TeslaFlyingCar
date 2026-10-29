import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PLANETS, planetForSection } from "../src/star-ring/planet-rules.js";
import { createSection, createRandomCourse } from "../src/star-ring/random-course.js";
import {
  createRun,
  command,
  stepRun,
  detach,
  restartCheckpoint,
} from "../src/star-ring/simulation.js";
import { steeringProfile, stepSteering, syncSteeringProfile } from "../src/star-ring/steering.js";
import { add, sub, mul, dot } from "../src/star-ring/course.js";
const checks = [];
function check(name, test) {
  test();
  checks.push({ name, pass: true });
}
const course = createSection(11, 0);
const straight = course.segments.find((s) => s.kind === "straight");
const bend = course.segments.find((s) => s.kind === "banked");
function runAt(planet, curved = false) {
  const r = createRun(course, { planet });
  r.s = curved ? bend.start + bend.length * 0.4 : straight.start + 10;
  r.pos = course.pose(r.s).p;
  r.velocity = mul(course.pose(r.s).t, 28);
  r.speed = 28;
  r.input.suction = true;
  return r;
}
for (const p of PLANETS)
  check(p.id + "-matches-difficulty", () => {
    const r = runAt(p.id),
      hard = ["uranus", "neptune"].includes(p.id);
    assert.equal(r.controlMode, hard ? "continuous" : "fixed");
    command(r, course, "leftPress");
    if (hard) {
      assert.equal(r.targetLane, 0);
      for (let i = 0; i < 12; i++) stepSteering(r, course, course.frame(r.s), 1 / 60, true);
      assert(r.targetLane < -0.6 && r.targetLane > -1);
      assert(r.lane !== r.targetLane);
    } else {
      assert.equal(r.lane, -3.2);
      assert.equal(r.targetLane, -3.2);
      assert(Math.hypot(...sub(r.pos, course.pose(r.s, -3.2).p)) < 1e-8);
      for (let i = 0; i < 180; i++) stepSteering(r, course, course.frame(r.s), 1 / 60, true);
      assert.equal(r.lane, -3.2);
      assert.equal(r.targetLane, -3.2);
    }
  });
check("a-new-press-switches-one-lane-without-repeat-or-overshoot", () => {
  const r = runAt("earth");
  command(r, course, "leftPress");
  command(r, course, "leftPress");
  assert.equal(r.lane, -3.2);
  command(r, course, "leftRelease");
  command(r, course, "leftPress");
  assert.equal(r.lane, -3.2);
  command(r, course, "leftRelease");
  command(r, course, "rightPress");
  assert.equal(r.lane, 0);
  command(r, course, "rightRelease");
  command(r, course, "rightPress");
  assert.equal(r.lane, 3.2);
  command(r, course, "rightRelease");
  command(r, course, "rightPress");
  assert.equal(r.lane, 3.2);
});
check("fixed-lanes-do-not-slip-on-banked-curves", () => {
  for (const planet of ["mercury", "venus", "earth", "mars", "jupiter", "saturn"]) {
    const r = runAt(planet, true);
    command(r, course, "rightPress");
    for (let i = 0; i < 100; i++) stepSteering(r, course, course.frame(r.s), 1 / 60, false);
    assert.equal(r.lane, 3.2);
    assert.equal(r.steering.drift, 0);
    assert.equal(r.steering.active, false);
  }
});
check("hard-worlds-preserve-suction-dependent-curvature-slip", () => {
  const slip = (grip) => {
    const r = runAt("neptune", true);
    r.speed = 40;
    for (let i = 0; i < 120; i++) stepSteering(r, course, course.frame(r.s), 1 / 60, grip);
    return Math.abs(r.lane);
  };
  assert(slip(true) < slip(false) * 0.3);
});
check("airborne-fixed-switch-preserves-height-forward-speed-and-barrel-roll", () => {
  const r = runAt("earth");
  detach(r, course, 8);
  r.airTime = 0.2;
  const f = course.frame(r.s);
  r.pos = add(course.pose(r.s).p, mul(f.up, 4));
  const oldHeight = dot(sub(r.pos, f.p), f.up),
    forward = dot(r.velocity, f.t),
    normal = dot(r.velocity, f.up);
  command(r, course, "rightPress");
  assert.equal(r.lane, 3.2);
  assert(Math.abs(dot(sub(r.pos, f.p), f.right) - 3.2) < 1e-8);
  assert(Math.abs(dot(sub(r.pos, f.p), f.up) - oldHeight) < 1e-8);
  assert(Math.abs(dot(r.velocity, f.t) - forward) < 1e-8);
  assert(Math.abs(dot(r.velocity, f.up) - normal) < 1e-8);
  assert(r.rollProgress > 0);
});
check("easy-landing-snaps-to-a-lane-without-residual-horizontal-glide", () => {
  const r = runAt("earth");
  detach(r, course, 1);
  const f = course.frame(r.s);
  r.pos = add(course.pose(r.s, 2.4).p, mul(f.up, 0.3));
  r.velocity = add(mul(f.t, 28), mul(f.up, -3));
  r.detachCooldown = 0;
  r.airTime = 0.4;
  for (let i = 0; i < 80 && !r.attached && r.phase === "running"; i++) stepRun(r, course, 1 / 60);
  assert(r.attached);
  assert.equal(r.lane, 3.2);
  assert.equal(r.targetLane, 3.2);
});
check("all-starts-follow-the-current-planet-across-an-eight-world-cycle", () => {
  for (const start of ["random", ...PLANETS.map((p) => p.id)])
    for (const seed of [1, 11, 42])
      for (let section = 0; section < 16; section++) {
        const r = { startPlanet: start };
        const c = { seed, section };
        const expected = planetForSection(start, seed, section).id;
        const actual = steeringProfile(r, c);
        assert.equal(actual.planet, expected);
        assert.equal(
          actual.mode,
          ["uranus", "neptune"].includes(expected) ? "continuous" : "fixed",
        );
      }
});
check("hard-to-easy-section-change-snaps-and-releases-old-held-input", () => {
  const c = createRandomCourse(11),
    r = createRun(c, { planet: "neptune" });
  r.lane = 0.83;
  r.targetLane = 1.3;
  r.pos = c.pose(0, r.lane).p;
  r.input.right = true;
  c.setCycle(1);
  syncSteeringProfile(r, c);
  assert.equal(r.controlPlanet, "mercury");
  assert.equal(r.controlMode, "fixed");
  assert.equal(r.lane, 0);
  assert.equal(r.input.right, false);
});
check("easy-to-hard-change-activates-continuous-input-without-a-free-lane-jump", () => {
  const c = createRandomCourse(11),
    r = createRun(c, { planet: "saturn" });
  command(r, c, "leftPress");
  c.setCycle(1);
  syncSteeringProfile(r, c);
  assert.equal(r.controlPlanet, "uranus");
  assert.equal(r.controlMode, "continuous");
  assert.equal(r.lane, -3.2);
  assert.equal(r.input.left, false);
  command(r, c, "rightPress");
  stepSteering(r, c, c.frame(r.s), 1 / 60, true);
  assert(r.targetLane > -3.2 && r.targetLane < -3);
});
check("checkpoint-keeps-world-difficulty-and-clears-held-controls", () => {
  for (const p of PLANETS) {
    const r = runAt(p.id);
    r.input.left = true;
    restartCheckpoint(r, course);
    assert.equal(r.startPlanet, p.id);
    assert.equal(r.controlMode, ["uranus", "neptune"].includes(p.id) ? "continuous" : "fixed");
    assert(!r.input.left && !r.input.right);
  }
});
await fs.writeFile(
  new URL("../evidence/star-ring-lanes-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, planetSections: 432 }));
