import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  H as Material,
  yu as PhysicalMaterial,
  B as Group,
  P as Vector3,
} from "../src/vendor/rendering.js";
import { createRoadsterExterior } from "../src/scenery/roadster-exterior.js";
import DATA from "../src/assets/roadster-exterior-data.js";
const materials = Object.fromEntries(
  ["body", "wing", "glass", "carbon", "cavity", "headlight", "taillight", "gold"].map((n) => [
    n,
    new PhysicalMaterial(),
  ]),
);
const car = createRoadsterExterior(materials),
  root = new Group();
root.add(car.slots.body, car.slots.wing, car.supports);
const issues = [];
let triangles = 0;
for (const mesh of car.meshes) {
  const g = mesh.geometry,
    p = g.attributes.position,
    n = g.attributes.normal;
  assert.equal(p.count, n.count);
  assert([...p.array, ...n.array].every(Number.isFinite));
  assert([...g.index.array].every((i) => i >= 0 && i < p.count));
  const a = new Vector3(),
    b = new Vector3(),
    c = new Vector3();
  let zero = 0;
  for (let i = 0; i < g.index.count; i += 3) {
    a.fromBufferAttribute(p, g.index.getX(i));
    b.fromBufferAttribute(p, g.index.getX(i + 1));
    c.fromBufferAttribute(p, g.index.getX(i + 2));
    if (b.sub(a).cross(c.sub(a)).lengthSq() < 1e-24) zero++;
  }
  triangles += g.index.count / 3;
  if (zero) issues.push({ mesh: mesh.name, zeroAreaTriangles: zero });
}
let maxAttachmentGap = 0;
for (let i = 0; i <= 100; i++) {
  const deployment = i / 100;
  car.setWing(deployment);
  root.rotation.set(Math.PI * 2 * deployment, 0, Math.PI * 2 * (1 - deployment));
  root.updateMatrixWorld(true);
  for (const sign of [-1, 1]) {
    const rod = car.supports.children.find((m) => m.name === `wing.pylon.${sign}.inner`);
    const endpoint = new Vector3(0, 0.5, 0).applyMatrix4(rod.matrixWorld);
    const mount = new Vector3(sign * DATA.wing.mount[0],DATA.wing.mount[1],DATA.wing.mount[2]).applyMatrix4(car.slots.wing.matrixWorld);
    maxAttachmentGap = Math.max(maxAttachmentGap, endpoint.distanceTo(mount));
    assert(
      endpoint.distanceTo(mount) <= 0.00301,
      "Wing support detached during deployment / full-car rotation",
    );
  }
}
car.setWing(0);
root.rotation.set(0, 0, 0);
root.updateMatrixWorld(true);
assert.equal(car.slots.wing.position.y, DATA.wing.pivot[1]);
const report = {
  triangles,
  maxAttachmentGap,
  samples: 101,
  issues,
  scope:
    "Actual exported Blender geometry and production spoiler rig across deployment and full-car flips. Working scale, not verified OEM dimensions.",
};
await fs.writeFile(
  new URL("../evidence/roadster-geometry-rig-20261025.json", import.meta.url),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
assert.equal(issues.length, 0, "Degenerate runtime geometry requires cleanup");
