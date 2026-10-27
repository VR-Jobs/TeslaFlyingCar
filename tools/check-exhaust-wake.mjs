import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { B as Group } from "../src/vendor/rendering.js";
import { createExhaustWake } from "../src/star-ring/exhaust-wake.js";
const scene = new Group(),
  car = new Group(),
  noise = { name: "shared-noise" };
scene.add(car);
const fx = createExhaustWake(scene, noise),
  checks = [],
  run = { phase: "running", input: { boost: true }, pressure: 100 },
  near = { exists: true, p: [0, 0, 0], up: [0, 1, 0] };
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
};
fx.update(run, car, 0, false, false, 1, near);
car.position.z = -1;
fx.update(run, car, 0.03, false, false, 1, near);
const pos = fx.mesh.geometry.attributes.position.array;
check(
  "four-streams-start-at-real-rear-nozzle-positions",
  Math.abs(pos[0] - (-0.465 + 0.043)) < 1e-5 &&
    Math.abs(pos[1] - 0.461) < 1e-5 &&
    Math.abs(pos[2] - 1.29) < 1e-5,
);
const geometries = [fx.mesh.geometry, fx.points.geometry],
  buffers = geometries.flatMap((g) => Object.values(g.attributes).map((a) => a.array.buffer));
for (let i = 2; i < 2000; i++) {
  car.position.z = -i * 0.3;
  car.rotation.z = Math.sin(i * 0.1) * 0.6;
  fx.update(run, car, i / 60, true, false, 1, near);
}
check(
  "long-flight-reuses-buffers-and-two-batches",
  fx.status().meshes === 2 &&
    geometries
      .flatMap((g) => Object.values(g.attributes).map((a) => a.array.buffer))
      .every((b, i) => b === buffers[i]),
);
check(
  "history-and-mist-stay-bounded",
  fx.status().history <= 32 && fx.status().particles <= 192 && fx.status().maximumAge <= 0.52,
  fx.status(),
);
check(
  "rotated-and-curving-nozzle-streams-stay-finite",
  geometries.every((g) => Object.values(g.attributes).every((a) => a.array.every(Number.isFinite))),
);
check(
  "turbulent-edges-use-original-noise-and-registered-bloom",
  fx.mesh.material.uniforms.uNoise.value === noise &&
    fx.points.material.uniforms.uNoise.value === noise &&
    fx.mesh.material.userData.ringBloom &&
    fx.mesh.material.fragmentShader.includes("erosion"),
);
fx.update(run, car, 2000 / 60, true, true, 1, near);
check("reduced-motion-lowers-mist-count", fx.status().particles <= 48);
run.input.boost = false;
fx.update(run, car, 34.2, false, false, 1, near);
check(
  "released-boost-dissipates-instead-of-leaving-a-ribbon",
  fx.status().activeVertices === 0 && fx.status().particles === 0 && !fx.mesh.visible,
);
car.rotation.z = Math.PI;
car.position.set(0, 0, 0);
run.input.boost = true;
fx.update(run, car, 35, false, false, 1, near);
fx.update(run, car, 35.03, false, false, 1, near);
check(
  "historical-road-plane-tags-under-track-vapor-for-clipping",
  fx.mesh.geometry.attributes.aClearance.array
    .slice(0, fx.status().activeVertices)
    .some((v) => v < 0) && fx.mesh.material.fragmentShader.includes("vClearance"),
);
run.phase = "dead";
fx.update(run, car, 35.04, true, false, 1, near);
check(
  "death-removes-all-emission-without-new-resources",
  fx.status().history === 0 && fx.status().activeVertices === 0 && fx.status().particles === 0,
);
run.phase = "running";
run.worldOrigin = [500, 0, 0];
car.rotation.z = 0;
fx.update(run, car, 36, true, false, 1, near);
check(
  "world-origin-change-does-not-bridge-old-and-new-sections",
  fx.status().history === 1 && fx.status().activeVertices === 0,
);
fx.reset();
check(
  "reset-clears-both-draw-ranges",
  geometries.every((g) => g.drawRange.count === 0),
);
await fs.writeFile(
  new URL("../evidence/exhaust-wake-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length }));
