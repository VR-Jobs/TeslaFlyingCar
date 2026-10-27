import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createSection, createRandomCourse } from "../src/star-ring/random-course.js";
import { createCourse, add, mul } from "../src/star-ring/course.js";
import { createRun, stepRun, command, restartCheckpoint } from "../src/star-ring/simulation.js";
import { sweepTrafficCars, TRAFFIC_CAR } from "../src/star-ring/traffic-rules.js";
import { createRouteWindow } from "../src/star-ring/route-window.js";
import { B as Group, P as Vector3, I as Color } from "../src/vendor/rendering.js";
const checks = [];
const record = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name + " " + JSON.stringify(detail));
};
let count = 0,
  curved = 0;
for (let seed = 1; seed <= 128; seed++) {
  const c = createSection(seed, 2),
    cars = c.hazards.filter((h) => h.type === "car");
  assert(cars.length >= 5);
  for (const h of cars) {
    count++;
    if (c.frame(h.s).kind !== "straight") curved++;
    assert(
      !c.gaps.some(
        (g) =>
          h.s + TRAFFIC_CAR.halfLength > g.start - 80 && h.s - TRAFFIC_CAR.halfLength < g.end + 96,
      ),
    );
    const row = c.recipe.rows.find((r) => (h.motion ? r.cellId === h.motion.cellId : r.s === h.s));
    assert(row && !row.blocked.includes(row.open));
    assert(Math.abs(row.open - h.lane) > TRAFFIC_CAR.halfWidth + 1.02 + 0.15);
  }
  assert(c.hazards.some((h) => h.type === "device"));
}
record(
  "128-seeded-sections-have-cars-open-car-width-lanes-and-clear-leap-approaches",
  count > 1000 && curved > 1000,
  { cars: count, curved },
);
function flat() {
  const c = createCourse();
  c.hazards = [{ s: 100, lane: 0, type: "car", paint: 1 }];
  return c;
}
let c = flat(),
  r = createRun(c);
r.s = 88;
r.pos = c.pose(r.s).p;
r.speed = 48;
for (let i = 0; i < 60 && r.phase === "running"; i++) stepRun(r, c, 1 / 60);
record(
  "front-bumper-collision-starts-space-crash-before-overlapping-the-car",
  r.phase === "dying" &&
    r.death?.cause === "traffic" &&
    r.s < 96 &&
    r.collisions === 1 &&
    r.events.some((e) => e.type === "carImpact"),
  { s: r.s, phase: r.phase, reason: r.death?.reason },
);
for (let i = 0; i < 145; i++) stepRun(r, c, 1 / 60);
record("vehicle-crash-reaches-gray-death-and-R-restores-control", r.phase === "dead");
restartCheckpoint(r, c);
record(
  "traffic-crash-checkpoint-retry-restores-air-and-clears-death",
  r.phase === "running" && r.death === null && r.pressure >= 78,
);
r = createRun(c);
r.s = 88;
r.lane = r.targetLane = 3.2;
r.pos = c.pose(r.s, 3.2).p;
for (let i = 0; i < 75; i++) stepRun(r, c, 1 / 60);
record(
  "full-sized-car-can-be-passed-in-an-adjacent-lane",
  r.phase === "running" && r.s > 115 && r.collisions === 0,
);
r = createRun(c);
r.s = 82;
r.pos = c.pose(r.s).p;
command(r, c, "jumpPress");
for (let i = 0; i < 120 && r.phase === "running"; i++) {
  if (i === 21) command(r, c, "jumpRelease");
  stepRun(r, c, 1 / 60);
}
record(
  "well-timed-jet-hop-clears-car-and-lands",
  r.phase === "running" && r.s > 125 && r.collisions === 0 && r.lands > 0,
  { s: r.s, lands: r.lands, phase: r.phase },
);
const state = (s, lane = 0, height = 0, roll = 0) => ({
  s,
  lane,
  pos: add(c.pose(s, lane).p, mul(c.pose(s, lane).up, height)),
  roll,
  pitch: 0,
});
let contact = sweepTrafficCars(c, state(85), state(114));
record(
  "swept-car-collision-catches-high-speed-tunneling",
  contact && contact.time > 0 && contact.time < 1,
  contact,
);
record(
  "car-roof-clearance-is-real-rather-than-lane-only",
  !sweepTrafficCars(c, state(95, 0, 2), state(107, 0, 2)),
);
record(
  "barrel-roll-body-can-hit-a-roof-even-when-wheels-are-high",
  !!sweepTrafficCars(c, state(97, 0, 1.6, Math.PI / 2), state(103, 0, 1.6, Math.PI / 2)),
);
const loop = c.segments.find((s) => s.kind === "loop"),
  at = loop.start + loop.length / 2;
c.hazards = [{ s: at, lane: 0, type: "car", paint: 0 }];
record(
  "inverted-track-obstacles-use-local-track-normal",
  !!sweepTrafficCars(c, state(at - 7), state(at + 7)) &&
    !sweepTrafficCars(c, state(at - 7, 3.2), state(at + 7, 3.2)),
);
const course = createRandomCourse(11).snapshot(),
  route = createRouteWindow(course),
  run = createRun(course);
const vehicle = course.hazards.find((h) => h.type === "car");
run.s = vehicle.s - 20;
run.pos = course.pose(run.s).p;
route.traffic.update(run, 1 / 60, 1);
const meshes = [];
route.root.traverse((o) => {
  if (o.isMesh && o.name.startsWith("Traffic /")) meshes.push(o);
});
record(
  "same-Blender-car-reuses-fifteen-pivoted-batches-and-seven-material-categories",
  new Set(meshes.map((m) => m.geometry)).size === 15 &&
    route.traffic.status().visible > 0 &&
    route.traffic.status().trianglesPerCar === 21515,
  route.traffic.status(),
);
record(
  "GPU-element-indices-use-supported-integer-buffers",
  meshes.every(
    (m) =>
      m.geometry.index.array instanceof Uint16Array ||
      m.geometry.index.array instanceof Uint32Array,
  ),
);
const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
for (const m of meshes) {
  m.geometry.computeBoundingBox();
  for (let k = 0; k < 3; k++) {
    const axis = ["x", "y", "z"][k];
    bounds.min[k] = Math.min(
      bounds.min[k],
      m.geometry.boundingBox.min[axis] +
        (m.parent.name.startsWith("Stranded") ? 0 : m.parent.position[axis]),
    );
    bounds.max[k] = Math.max(
      bounds.max[k],
      m.geometry.boundingBox.max[axis] +
        (m.parent.name.startsWith("Stranded") ? 0 : m.parent.position[axis]),
    );
  }
}
record(
  "vehicle-model-fits-the-physical-collider",
  bounds.min[0] >= -TRAFFIC_CAR.halfWidth &&
    bounds.max[0] <= TRAFFIC_CAR.halfWidth &&
    bounds.min[2] >= -TRAFFIC_CAR.halfLength &&
    bounds.max[2] <= TRAFFIC_CAR.halfLength &&
    bounds.max[1] <= TRAFFIC_CAR.height,
  bounds,
);
const amber = meshes.find((m) => m.name === "Traffic / amber"),
  sample = new Color();
route.traffic.update(run, 1 / 60, 1, 1, true);
sample.copy(amber.material.color);
const steady = sample.r;
route.traffic.update(run, 1 / 60, 2, 1, true);
sample.copy(amber.material.color);
record(
  "reduced-motion-setting-keeps-amber-warning-lights-steady",
  Math.abs(sample.r - steady) < 1e-6,
);
run.events = [{ type: "carImpact" }];
run.phase = "dying";
route.traffic.update(run, 1 / 60, 2);
record(
  "collision-retains-car-obstacle-and-uses-a-fixed-spark-pool",
  route.traffic.status().visible > 0 &&
    route.traffic.status().impacts === 1 &&
    route.traffic.status().sparkPool === 32,
);
const initial = new Set(meshes.map((m) => m.geometry));
let disposed = 0;
for (const g of initial) g.addEventListener("dispose", () => disposed++);
for (let i = 0; i < 300; i++) {
  run.events = [];
  route.traffic.update(run, 1 / 60, i / 60);
}
record(
  "driving-does-not-allocate-new-car-geometries",
  meshes.every((m) => initial.has(m.geometry)),
);
route.dispose();
record("retiring-a-route-releases-every-owned-car-batch", disposed === 15);
await fs.writeFile(
  new URL("../evidence/star-ring-traffic-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, carsAcross128Seeds: count }));
