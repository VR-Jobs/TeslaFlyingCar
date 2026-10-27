import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse, add, sub, mul, dot, nearestSurface } from "../src/star-ring/course.js";
import { getTrackSurface, sweepCar } from "../src/star-ring/track-surface.js";
import { createRun, stepRun } from "../src/star-ring/simulation.js";

const course = createCourse(),
  surface = getTrackSurface(course),
  checks = [];
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
};
const separation = course.segments
  .filter((s) => s.kind === "loop")
  .map((s) => ({
    title: s.title,
    meters: Math.hypot(...sub(course.pose(s.start + 0.001).p, course.pose(s.end + 0.001).p)),
  }));
check(
  "loop-entry-exit-no-longer-share-same-space",
  separation.every((s) => s.meters > 19.9),
  separation,
);
let samples = 0,
  foreign = [];
for (const lane of [-3.2, 0, 3.2])
  for (let s = 4; s < course.length; s += 4) {
    if (!course.frame(s).exists || !course.frame(s - 4).exists) continue;
    const hit = sweepCar(
      course,
      { s: s - 4, lane, roll: 0, pos: course.pose(s - 4, lane).p },
      { s, lane, roll: 0, pos: course.pose(s, lane).p },
      true,
    );
    samples++;
    if (hit) foreign.push({ s, lane, kind: hit.kind, otherS: hit.s });
  }
check("all-three-lanes-clear-unrelated-track-faces", foreign.length === 0, {
  sweptPathSections: samples,
  foreign,
});
let minTop = 1,
  minBottom = 1;
for (const t of surface.triangles) {
  if (t.kind === "wall" || t.sa < 0) continue;
  const s = (t.sa + t.sb + t.sc) / 3,
    up = course.pose(s).up;
  if (t.kind === "top") minTop = Math.min(minTop, dot(t.normal, up));
  if (t.kind === "bottom") minBottom = Math.min(minBottom, -dot(t.normal, up));
}
check(
  "rendered-front-and-bottom-have-opposite-outward-normals",
  minTop > 0.96 && minBottom > 0.96,
  { minTop, minBottom },
);
check(
  "render-and-collision-share-float32-triangle-data",
  Object.entries(surface.groups).every(
    ([kind, g]) =>
      g.positions.length / 9 === surface.triangles.filter((t) => t.kind === kind).length,
  ) && surface.triangles.every((t) => [...t.a, ...t.b, ...t.c].every((v) => v === Math.fround(v))),
  { triangles: surface.triangles.length, thickness: surface.thickness },
);
check(
  "no-collision-tops-across-missing-track",
  surface.triangles
    .filter((t) => t.kind === "top" && t.sa >= 0)
    .every((t) => course.frame((t.sa + t.sb + t.sc) / 3).exists),
);
for (const gap of course.gaps) {
  for (const s of [gap.start, gap.end])
    assert(
      surface.triangles.some(
        (t) => t.kind === "top" && [t.sa, t.sb, t.sc].some((v) => Math.abs(v - s) < 1e-8),
      ),
    );
  const a = course.pose(gap.start),
    b = course.pose(gap.end);
  const start = surface.sweep(
    add(add(a.p, mul(a.up, -0.2)), mul(a.t, 1)),
    add(add(a.p, mul(a.up, -0.2)), mul(a.t, -1)),
  );
  const end = surface.sweep(
    add(add(b.p, mul(b.up, -0.2)), mul(b.t, -1)),
    add(add(b.p, mul(b.up, -0.2)), mul(b.t, 1)),
  );
  assert(start?.kind === "wall" && end?.kind === "wall");
}
check("visible-gap-ends-and-physical-caps-match-exactly", true);
for (const s of [100, 320, 600, 1740]) {
  const f = course.pose(s),
    a = add(f.p, mul(f.up, 3)),
    b = add(f.p, mul(f.up, -3));
  assert(surface.sweep(a, b)?.kind === "top");
  assert(surface.sweep(b, a)?.kind === "bottom");
  const side = add(f.p, mul(f.up, -0.2));
  assert(surface.sweep(add(side, mul(f.right, 7)), add(side, mul(f.right, 4)))?.kind === "wall");
}
check("top-bottom-and-side-block-sweeps-on-curved-track", true);
for (const s of [100.01, 100.74, 1481.83, 1520.42]) {
  const f = course.pose(s),
    near = nearestSurface(course, add(f.p, mul(f.up, 0.05)), s + 0.7);
  assert(Math.abs(near.s - s) < 0.001 && Math.abs(near.height - 0.05) < 0.001);
}
check("landing-search-refines-between-old-coarse-samples", true);
for (const speed of [35, 400]) {
  const r = createRun(course);
  r.s = 100;
  r.pos = [0, -(speed > 100 ? 4 : 2.5), -100];
  r.velocity = [0, speed, 0];
  r.attached = false;
  r.input.suction = true;
  r.airTime = 0.6;
  for (let i = 0; i < 6 && !r.trackImpacts; i++) stepRun(r, course, 1 / 60);
  assert(
    r.trackImpacts === 1 &&
      !r.attached &&
      r.lastTrackContact.kind === "bottom" &&
      r.velocity[1] < 0 &&
      r.pos[1] + 1.25 < -0.44,
    JSON.stringify(r),
  );
}
check("upward-suction-cannot-pass-or-attach-through-bottom", true, { upwardSpeeds: [35, 400] });
const falling = createRun(course);
falling.s = 100;
falling.pos = [0, 2.5, -100];
falling.velocity = [0, -300, 0];
falling.attached = false;
falling.airTime = 0.6;
stepRun(falling, course, 1 / 60);
check(
  "fast-descent-cannot-tunnel-through-thin-track",
  falling.attached && falling.lands === 1 && Math.abs(falling.pos[1]) < 1e-6,
  { pos: falling.pos, last: falling.lastTrackContact },
);
const sideRun = createRun(course);
sideRun.s = 100;
sideRun.pos = [7, -0.2, -100];
sideRun.velocity = [-80, 0, 0];
sideRun.attached = false;
sideRun.airTime = 0.6;
stepRun(sideRun, course, 1 / 60);
check(
  "car-body-is-blocked-by-track-side-wall",
  sideRun.trackImpacts === 1 && sideRun.lastTrackContact.kind === "wall" && sideRun.pos[0] > 5.7,
  { pos: sideRun.pos, contact: sideRun.lastTrackContact },
);
const lowRoll = createRun(course);
Object.assign(lowRoll, {
  s: 100,
  pos: [0, 0.25, -100],
  velocity: [0, 0, 0],
  attached: false,
  airTime: 0.6,
  detachCooldown: 1,
  rollProgress: 0.001,
  rollDir: 1,
});
for (let i = 0; i < 15 && !lowRoll.trackImpacts; i++) stepRun(lowRoll, course, 1 / 60);
check(
  "rotation-itself-cannot-cut-car-body-through-track",
  lowRoll.trackImpacts === 1 &&
    lowRoll.lastTrackContact.kind === "top" &&
    lowRoll.rollProgress === 0 &&
    lowRoll.tricks === 0,
  { contact: lowRoll.lastTrackContact, feedback: lowRoll.feedback },
);
const highRoll = createRun(course);
Object.assign(highRoll, {
  s: 100,
  pos: [0, 8, -100],
  velocity: [0, 0, 0],
  attached: false,
  airTime: 0.6,
  rollProgress: 0.001,
  rollDir: 1,
});
for (let i = 0; i < 40; i++) stepRun(highRoll, course, 1 / 60);
check(
  "safe-high-altitude-barrel-still-completes",
  highRoll.tricks === 1 && highRoll.trackImpacts === 0,
);
let cameraSamples = 0,
  cameraCorrections = 0;
for (let s = 0; s < course.length; s += 4) {
  const f = course.pose(s),
    eye = add(f.p, mul(f.up, 1.1)),
    camera = add(f.p, add(mul(f.t, -11.7), mul(f.up, 5.2)));
  const hit = surface.sweep(eye, camera);
  cameraSamples++;
  if (hit) {
    cameraCorrections++;
    const clipped = add(eye, mul(sub(camera, eye), Math.max(0, hit.time - 0.04)));
    assert(!surface.sweep(eye, clipped));
  }
}
check("camera-sightline-keeps-to-visible-side-of-solid-track", true, {
  cameraSamples,
  cameraCorrections,
});
await fs.writeFile(
  new URL("../evidence/star-ring-surface-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
