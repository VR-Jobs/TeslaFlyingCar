import fs from "node:fs/promises";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import HIGH from "../src/assets/roadster-exterior-data.js";
import MEDIUM from "../src/assets/roadster-driving-data.js";
import LOW from "../src/assets/roadster-distant-data.js";
import { createRoadsterExterior } from "../src/scenery/roadster-exterior.js";
import { yu as Material, B as Group, P as Vector3 } from "../src/vendor/rendering.js";
const report = [];
const candidateIndex = process.argv.indexOf("--candidate-root");
const candidate = candidateIndex >= 0 ? path.resolve(process.argv[candidateIndex + 1]) : null;
const levels = candidate
  ? await Promise.all(
      ["candidate", "lod/driving", "lod/distant"].map(async (p) =>
        JSON.parse(await fs.readFile(path.join(candidate, p, "roadster-exterior.json"), "utf8")),
      ),
    )
  : [HIGH, MEDIUM, LOW];
for (const [name, data, budget] of [
  ["showroom", levels[0], 160000],
  ["driving", levels[1], 40000],
  ["distant", levels[2], 22000],
]) {
  const materials = Object.fromEntries(
    ["body", "wing", "glass", "carbon", "cavity", "headlight", "taillight", "gold"].map((k) => [
      k,
      new Material(),
    ]),
  );
  const asset = createRoadsterExterior(materials, data),
    root = new Group();
  assert.equal(
    materials.glass.color.getHexString(),
    "05070a",
    "All consumer LODs must use user-requested neutral-black glass",
  );
  root.add(...Object.values(asset.slots), asset.supports);
  let triangles = 0,
    min = [Infinity, Infinity, Infinity],
    max = [-Infinity, -Infinity, -Infinity];
  const a = new Vector3(),
    b = new Vector3(),
    c = new Vector3();
  for (const mesh of asset.meshes) {
    const g = mesh.geometry,
      p = g.attributes.position,
      n = g.attributes.normal;
    assert([...p.array, ...n.array].every(Number.isFinite));
    assert.equal(p.count, n.count);
    assert([...g.index.array].every((i) => i < p.count));
    for (let i = 0; i < p.count; i++)
      assert(Math.abs(Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) - 1) < 0.001);
    for (let i = 0; i < g.index.count; i += 3) {
      a.fromBufferAttribute(p, g.index.getX(i));
      b.fromBufferAttribute(p, g.index.getX(i + 1));
      c.fromBufferAttribute(p, g.index.getX(i + 2));
      assert(b.sub(a).cross(c.sub(a)).lengthSq() > 1e-24, `${name}: degenerate triangle`);
    }
    triangles += g.index.count / 3;
  }
  assert(triangles < budget);
  let maxGap = 0;
  for (let i = 0; i <= 100; i++) {
    asset.setWing(i / 100);
    root.rotation.set(i * 0.0628, i * 0.01, i * 0.0314);
    root.updateMatrixWorld(true);
    for (const sign of [-1, 1]) {
      const rod = asset.supports.children.find((m) => m.name === `wing.pylon.${sign}.inner`);
      const endpoint = new Vector3(0, 0.5, 0).applyMatrix4(rod.matrixWorld);
      const mount = new Vector3(
        sign * data.wing.mount[0],
        data.wing.mount[1],
        data.wing.mount[2],
      ).applyMatrix4(asset.slots.wing.matrixWorld);
      maxGap = Math.max(maxGap, endpoint.distanceTo(mount));
    }
  }
  assert(maxGap < 0.00301);
  report.push({
    level: name,
    triangles,
    groups: data.groups.length,
    maxGap,
    geometryFinite: true,
    normalsUnit: true,
    degenerate: 0,
    poses: 101,
  });
}
const native = await fs.readFile(
  candidate
    ? path.join(candidate, "candidate/roadster-exterior.blend")
    : new URL("../models/roadster-2026/current/roadster-exterior.blend", import.meta.url),
);
const sourceSha256 = crypto.createHash("sha256").update(native).digest("hex");
const build = JSON.parse(
  await fs.readFile(
    candidate
      ? path.join(candidate, "lod-build.json")
      : new URL("../evidence/roadster-lod-build.json", import.meta.url),
  ),
);
assert.equal(
  build.sourceSha256,
  sourceSha256,
  "Original Blender source changed while deriving LODs",
);
await fs.writeFile(
  candidate
    ? path.join(candidate, "runtime-checks.json")
    : new URL("../evidence/roadster-lod-runtime-checks.json", import.meta.url),
  JSON.stringify({ sourceSha256, levels: report }, null, 2),
);
console.log(report);
