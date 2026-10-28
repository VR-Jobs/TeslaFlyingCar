import { createGhostRecorder } from "../src/star-ring/ghost.js";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createSpatialCurve } from "../src/star-ring/spatial-curve.js";
import { createCourse, dot, sub, add, mul } from "../src/star-ring/course.js";
import { createSection, createRandomCourse } from "../src/star-ring/random-course.js";
import { createRun, command, stepRun, restartCheckpoint } from "../src/star-ring/simulation.js";
import { stepSteering, curveCameraUp } from "../src/star-ring/steering.js";
import { getTrackSurface, sweepCar } from "../src/star-ring/track-surface.js";
const checks = [],
  sampled = new Set();
function check(name, pass, detail) {
  assert(pass, name);
  checks.push({ name, pass: true, detail });
}
for (const yaw of [-Math.PI * 2, -2, 2, Math.PI * 2])
  for (const rise of [-32, 0, 32]) {
    const sample = createSpatialCurve(380, { yaw, bank: Math.sign(yaw), rise });
    const start = sample(0),
      end = sample(380);
    assert(Math.abs(start.curvature) < 1e-9 && Math.abs(end.curvature) < 1e-9);
    assert(start.bank === 0 && end.bank === 0 && Math.abs(end.p[1] - rise) < 1e-9);
    for (let d = 0; d <= 380; d += 2) {
      const f = sample(d),
        next = sample(d + 0.001);
      assert([...f.p, ...f.t, ...f.up, f.curvature].every(Number.isFinite));
      assert(Math.abs(Math.hypot(...f.t) - 1) < 1e-9 && Math.abs(dot(f.t, f.up)) < 1e-9);
      if (d < 380) assert(Math.abs(Math.hypot(...sub(next.p, f.p)) - 0.001) < 0.000003);
    }
  }
check("spatial-curves-have-unit-speed-orthonormal-frames-and-smooth-flat-ends", true);
let joins = 0,
  maximumLength = 0;
for (let seed = 1; seed <= 192; seed++) {
  const c = createSection(seed, seed % 7);
  maximumLength = Math.max(maximumLength, c.length);
  assert(c.length < 4200 && c.pickups.length < 180);
  assert(c.segments.some((s) => s.kind === "banked") && c.segments.some((s) => s.kind === "helix"));
  for (const seg of c.segments.filter((s) => s.kind === "banked" || s.kind === "helix")) {
    sampled.add(seg.title);
    const a = c.frame(seg.start + 0.001),
      b = c.frame(seg.end - 0.001);
    assert(a.up[1] > 0.999 && b.up[1] > 0.999);
    assert(a.curvature < 0.00001 && b.curvature < 0.00001);
    const feeds = c.pickups
      .filter((p) => p.type === "air" && p.required && p.s >= seg.start && p.s <= seg.end)
      .map((p) => p.s);
    assert(
      feeds.length >= (seg.length > 140 ? 2 : 1),
      JSON.stringify({ seed, title: seg.title, length: seg.length, feeds }),
    );
    assert(
      [seg.start, ...feeds, seg.end]
        .slice(1)
        .every((v, i) => v - [seg.start, ...feeds, seg.end][i] < 100),
    );
  }
  for (const seg of c.segments.slice(0, -1)) {
    const a = c.frame(seg.end - 0.001),
      b = c.frame(seg.end + 0.001);
    assert(Math.hypot(...sub(a.p, b.p)) < 0.0021);
    assert(dot(a.t, b.t) > 0.99999 && dot(a.up, b.up) > 0.99999);
    joins++;
  }
  const end = c.frame(c.length);
  assert(dot(end.t, [0, 0, -1]) > 0.999999 && end.up[1] > 0.999999);
}
check("192-seeds-keep-all-segment-and-section-joins-continuous", true, { joins, maximumLength });
check(
  "both-bend-directions-and-both-helical-grades-appear",
  ["长左弯", "长右弯", "左倾波浪弯", "右倾波浪弯", "螺旋升空", "螺旋下降"].every((t) =>
    [...sampled].some((v) => v.includes(t)),
  ),
  [...sampled],
);
const c = createSection(11, 0),
  bend = c.segments.find((s) => s.kind === "banked");
const frame = c.pose(bend.start + bend.length / 2);
const r = createRun(c);
r.s = bend.start + bend.length / 2;
r.pos = frame.p;
command(r, c, "leftPress");
for (let i = 0; i < 12; i++) stepSteering(r, c, frame, 1 / 60, true);
check(
  "held-left-is-continuous-and-not-a-three-meter-step",
  r.targetLane < -0.6 && r.targetLane > -1,
);
command(r, c, "leftRelease");
const released = r.targetLane;
for (let i = 0; i < 40; i++) stepSteering(r, c, frame, 1 / 60, true);
check("releasing-direction-stops-target-motion", r.targetLane === released && !r.input.left);
command(r, c, "rightPress");
for (let i = 0; i < 30; i++) stepSteering(r, c, frame, 1 / 60, true);
check("right-hold-reverses-the-steering-direction", r.targetLane > released);
command(r, c, "leftPress");
const simultaneous = r.targetLane;
stepSteering(r, c, frame, 1 / 60, true);
check("opposite-held-directions-cancel", r.targetLane === simultaneous);
restartCheckpoint(r, c);
check("checkpoint-clears-held-directions", !r.input.left && !r.input.right && r.steering === null);
const drift = (suction) => {
  const run = createRun(c);
  run.speed = 40;
  for (let i = 0; i < 120; i++) stepSteering(run, c, frame, 1 / 60, suction);
  return Math.abs(run.lane);
};
check("suction-strongly-reduces-outward-slip", drift(true) < drift(false) * 0.3);
const horizon = curveCameraUp(frame, 0),
  follow = curveCameraUp(frame, 0.55);
check(
  "camera-motion-setting-reduces-banking-independently",
  horizon[1] > follow[1] && follow[1] > frame.up[1],
);
const warning = createRun(c);
warning.s = bend.start + bend.length / 2;
warning.pos = frame.p;
warning.speed = 28;
warning.pressure = 100;
for (let i = 0; i < 82; i++) stepRun(warning, c, 1 / 60);
check(
  "missing-suction-warns-before-losing-contact-on-new-curves",
  warning.detachCause === "grip" && warning.events.every((e) => e.type !== "sector"),
);
let swept = 0;
for (const seed of [1, 11, 42]) {
  const course = createSection(seed, 0),
    solid = getTrackSurface(course);
  for (const seg of course.segments.filter((s) => s.kind === "banked" || s.kind === "helix"))
    for (const lane of [-3.2, 0, 3.2])
      for (let s = seg.start + 4; s < seg.end - 4; s += 5) {
        const a = course.pose(s - 0.6, lane),
          b = course.pose(s, lane);
        assert(
          !sweepCar(
            course,
            { s: s - 0.6, lane, roll: 0, pos: a.p },
            { s, lane, roll: 0, pos: b.p },
            true,
          ),
        );
        const hit = solid.sweep(add(b.p, mul(b.up, 0.3)), add(b.p, mul(b.up, -0.3)));
        assert(hit?.kind === "top" && dot(hit.normal, b.up) > 0.99);
        swept++;
      }
}
check("all-three-lanes-have-matching-visible-top-collisions-without-foreign-faces", true, {
  swept,
});
const window = createRandomCourse(42);
const seam = window.length;
check(
  "translated-next-section-keeps-position-and-road-side",
  Math.hypot(...sub(window.frame(seam - 0.001).p, window.frame(seam + 0.001).p)) < 0.0021 &&
    dot(window.frame(seam - 0.001).up, window.frame(seam + 0.001).up) > 0.99999,
);
const oldGhost = {
  version: "experience-2-clearance",
  seed: 42,
  distance: 100,
  samples: [
    [0, 0, 0, 0, 0, 0, 0, 1],
    [1, 28, 0, 0, 0, 0, 0, 1],
  ],
};
const migratedGhost = createGhostRecorder({ getItem: () => JSON.stringify(oldGhost) });
migratedGhost.start(42);
check(
  "old-route-ghosts-never-play-through-the-new-geometry",
  !migratedGhost.status().available && migratedGhost.playback(0.5) === null,
);
await fs.writeFile(
  new URL("../evidence/star-ring-structures-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, joins, swept, maximumLength }));
