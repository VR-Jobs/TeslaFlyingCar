import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse, mul } from "../src/star-ring/course.js";
import { createRandomCourse, createSection } from "../src/star-ring/random-course.js";
import { createRun, stepRun, restartCheckpoint } from "../src/star-ring/simulation.js";
import {
  startRainbow,
  stepRainbow,
  rainbowActive,
  rainbowProtected,
  rainbowMultiplier,
  rainbowSpeed,
  rainbowStatus,
  smashRainbowCar,
} from "../src/star-ring/rainbow-rules.js";
import { createRainbowView } from "../src/star-ring/rainbow-view.js";
import { createRouteWindow } from "../src/star-ring/route-window.js";
import { advanceEndless } from "../src/star-ring/endless.js";
import { Js as Scene, B as Group, H as Material, Fr as Basic } from "../src/vendor/rendering.js";
const checks = [];
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name + " " + JSON.stringify(detail));
};
for (let seed = 1; seed <= 128; seed++)
  for (const index of [0, 3]) {
    const c = createSection(seed, index),
      stars = c.pickups.filter((p) => p.type === "star");
    assert(stars.length === 2);
    assert(stars[0].s >= 110 && stars[0].s <= 160);
    assert(
      stars.every(
        (s) =>
          s.lane === 0 &&
          c.frame(s.s).exists &&
          !c.gaps.some((g) => s.s > g.start - 90 && s.s < g.end + 106),
      ),
    );
    assert(c.pickups.length < 180);
  }
check("256-seeded-sections-have-an-early-and-a-later-star-on-solid-track", true);
const c = createRandomCourse(11),
  star = c.pickups.find((p) => p.type === "star");
let r = createRun(c);
r.s = star.s - 2;
r.pos = c.pose(r.s).p;
stepRun(r, c, 1 / 60);
check(
  "touching-a-star-automatically-starts-eight-second-power",
  r.rainbow.collected === 1 && r.rainbow.remaining === 8 && r.taken.has(c.pickups.indexOf(star)),
  rainbowStatus(r),
);
check("star-provides-double-score-and-full-air", rainbowMultiplier(r) === 2 && r.pressure === 100);
const collected = r.rainbow.collected;
for (let i = 0; i < 5; i++) stepRun(r, c, 1 / 60);
check(
  "the-same-star-cannot-refresh-itself",
  r.rainbow.collected === collected && r.rainbow.remaining < 8,
);
stepRainbow(r, c, 8);
check(
  "expiry-ends-x2-and-starts-a-short-collision-buffer",
  !rainbowActive(r) && rainbowMultiplier(r) === 1 && r.rainbow.grace === 0.7,
);
stepRainbow(r, c, 0.71);
check("expiry-buffer-ends", !rainbowProtected(r));
r = createRun(c);
r.tutorial = { active: true };
check("core-tutorial-does-not-trigger-power", !startRainbow(r, c));
function flat() {
  const f = createCourse();
  f.id = "flat-test";
  f.hazards = [];
  f.pickups = [{ s: 100, lane: 0, type: "ring", height: 0 }];
  return f;
}
const a = flat(),
  normal = createRun(a),
  powered = createRun(a);
for (const x of [normal, powered]) {
  x.s = 98;
  x.pos = a.pose(98).p;
  x.input.brake = true;
}
startRainbow(powered, a);
stepRun(normal, a, 1 / 60);
stepRun(powered, a, 1 / 60);
check("pickup-and-distance-awards-both-double", Math.abs(powered.score - normal.score * 2) < 1e-7, {
  normal: normal.score,
  powered: powered.score,
});
const f = flat();
f.pickups = [];
f.hazards = [{ s: 100, lane: 0, type: "car", paint: 0 }];
r = createRun(f);
r.s = 88;
r.pos = f.pose(88).p;
r.speed = 45;
startRainbow(r, f);
for (let i = 0; i < 75 && r.phase === "running"; i++) stepRun(r, f, 1 / 60);
check(
  "a-powered-car-strike-knocks-the-obstacle-aside-without-death",
  r.phase === "running" && r.collisions === 0 && r.hit.has(0) && r.rainbow.smashed === 1,
  rainbowStatus(r),
);
r.s = 92;
r.pos = f.pose(92).p;
for (let i = 0; i < 30; i++) stepRun(r, f, 1 / 60);
check("a-knocked-car-cannot-pay-again", r.rainbow.smashed === 1);
r = createRun(f);
r.s = 94.9;
r.pos = f.pose(r.s).p;
startRainbow(r, f);
r.rainbow.remaining = 0.001;
for (let i = 0; i < 15; i++) stepRun(r, f, 1 / 60);
check(
  "ending-inside-traffic-does-not-cause-an-instant-crash",
  r.phase === "running" && r.rainbow.smashed === 1 && r.rainbow.remaining === 0,
);
f.hazards = [{ s: 100, lane: 0, type: "device" }];
r = createRun(f);
r.s = 98;
r.pos = f.pose(98).p;
startRainbow(r, f);
stepRun(r, f, 1 / 60);
check("small-device-contact-is-protected", r.collisions === 0 && r.hit.has(0));
const curve = c.segments.find((s) => s.kind === "loop");
r = createRun(c);
r.s = curve.start + curve.length * 0.32;
r.pos = c.pose(r.s).p;
r.velocity = mul(c.pose(r.s).t, 28);
startRainbow(r, c);
for (let i = 0; i < 60 && r.phase === "running"; i++) stepRun(r, c, 1 / 60);
check(
  "powered-car-stays-attached-to-curved-track-without-a-new-key",
  r.phase === "running" && r.attached && r.gripStress === 0,
);
r.s = c.gaps[0].start - 40;
check("authored-gap-approaches-keep-the-original-speed", rainbowSpeed(r, c) === 1);
r.routeId = c.adventures.branches[0].id;
check("shortcut-speed-is-preserved", rainbowSpeed(r, c) === 1);
r = createRun(c);
startRainbow(r, c);
r.taken.add(c.pickups.indexOf(star));
restartCheckpoint(r, c);
check(
  "R-removes-power-but-preserves-consumed-star",
  !rainbowActive(r) && r.rainbow.remaining === 0 && r.taken.has(c.pickups.indexOf(star)),
);
r = createRun(c);
startRainbow(r, c);
r.s = c.length + 0.1;
r.pos = c.pose(r.s).p;
advanceEndless(r, c);
stepRainbow(r, c, 0.1);
check(
  "power-carries-over-an-endless-seam-without-stale-knock-positions",
  r.laps === 1 && r.rainbow.remaining > 7 && r.rainbow.key === c.id && r.rainbow.knocked.size === 0,
);
const scene = new Scene(),
  car = new Group(),
  materials = {
    body: new Material(),
    wing: new Material(),
    glass: new Material({ color: "#05070a" }),
  },
  glow = new Basic({ vertexColors: true }),
  fx = createRainbowView(scene, car, materials, glow);
scene.add(car);
r = createRun(f);
startRainbow(r, f);
const glass = materials.glass.color.clone(),
  base = materials.body.emissive.clone();
let geo;
const geometries = [];
scene.traverse((o) => {
  if (o.geometry) {
    geo = o.geometry;
    geometries.push(o.geometry);
  }
});
for (let i = 0; i < 2000; i++) {
  r.time = i / 60;
  car.position.z = -i * 0.3;
  fx.update(r, r.time);
}
check(
  "exhaust-wake-is-a-fixed-four-port-two-draw-pool",
  fx.status().history <= 64 &&
    fx.status().meshes === 2 &&
    fx.status().ports === 4 &&
    fx.status().bands === 0 &&
    fx.status().particles <= 192 &&
    geometries.every((g) =>
      Object.values(g.attributes).every((a) => a.array.every(Number.isFinite)),
    ),
  fx.status(),
);
check(
  "rainbow-look-leaves-glass-black",
  materials.glass.color.equals(glass) &&
    materials.body.emissive.r + materials.body.emissive.g + materials.body.emissive.b > 0,
);
fx.reset();
check(
  "reset-restores-original-material-and-clears-the-tail",
  materials.body.emissive.equals(base) &&
    geometries.every((g) => g.drawRange.count === 0) &&
    fx.status().history === 0,
);
materials.body.color.set("#398ac2");
const selectedPaint = materials.body.color.clone();
r.rainbow.remaining = 0;
fx.update(r, r.time + 1);
check(
  "inactive-rainbow-does-not-overwrite-selected-paint",
  materials.body.color.equals(selectedPaint),
);
startRainbow(r, f);
fx.update(r, r.time + 2);
fx.reset();
check(
  "expiry-restores-the-paint-present-when-power-started",
  materials.body.color.equals(selectedPaint),
);
const course = createRandomCourse(11).snapshot(),
  route = createRouteWindow(course);
r = createRun(course);
const index = course.hazards.findIndex((h) => h.type === "car");
r.s = course.hazards[index].s - 5;
r.pos = course.pose(r.s).p;
startRainbow(r, course);
smashRainbowCar(r, course, index);
r.time = 0.2;
route.traffic.update(r, 0.2, 0.2);
check(
  "knock-animation-moves-the-whole-existing-vehicle",
  route.hazards[index].visible && Math.abs(route.hazards[index].rotation.z) > 0.1,
);
check(
  "physical-star-model-is-present-in-route-window",
  route.pickups.items.filter((i) => i.item.type === "star" && !i.item.preview).length === 2,
);
route.dispose();
await fs.writeFile(
  new URL("../evidence/star-ring-rainbow-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length }));
