import assert from "node:assert/strict";
import { createCosmicStars } from "../src/scenery/space-stars.js";
import { createAsteroidField } from "../src/scenery/space-details.js";

const stars = createCosmicStars();
const duplicate = createCosmicStars();
assert.equal(stars.count(), 8690);
stars.layers.forEach(({ points }, index) => {
  const geometry = points.geometry;
  assert.deepEqual(
    geometry.attributes.position.array,
    duplicate.layers[index].points.geometry.attributes.position.array,
  );
  for (const attribute of Object.values(geometry.attributes))
    assert([...attribute.array].every(Number.isFinite));
  const a = geometry.attributes.position.array;
  for (let i = 0; i < a.length; i += 3) {
    const radius = Math.hypot(a[i], a[i + 1], a[i + 2]);
    assert(radius > 1299 && radius < 1336, "Stars must remain at astronomical backdrop distance");
  }
});
stars.update(3, 0);
for (const layer of stars.layers) assert(layer.points.geometry.drawRange.count < layer.count);
stars.update(1, 3);
for (const layer of stars.layers) assert.equal(layer.points.geometry.drawRange.count, layer.count);

const rocks = createAsteroidField();
function snapshot(distance) {
  rocks.update(distance, 17, 3);
  const result = new Map();
  for (let i = 0; i < rocks.mesh.count; i++) {
    const a = Array.from(rocks.mesh.instanceMatrix.array.slice(i * 16, i * 16 + 16));
    assert(a.every(Number.isFinite));
    const bound =
      Math.max(...[0, 4, 8].map((j) => Math.hypot(a[j], a[j + 1], a[j + 2]))) * rocks.radius;
    assert(
      Math.abs(a[12]) - bound > 45,
      "Asteroid bounding sphere approaches the widest driving surface",
    );
    a[14] -= distance;
    result.set(rocks.ids[i], a);
  }
  return result;
}
for (const boundary of [100, 5000, 5200, 50000]) {
  const before = snapshot(boundary - 0.01),
    after = snapshot(boundary + 0.01);
  let shared = 0;
  for (const [id, a] of after) {
    if (!before.has(id)) continue;
    const b = before.get(id);
    assert(
      a.every((v, i) => Math.abs(v - b[i]) < 0.0003),
      `Asteroid jumps when recycled at ${boundary}m`,
    );
    shared++;
  }
  assert.equal(shared, 44);
}
rocks.update(100, 17, 0);
assert.equal(rocks.mesh.count, 24);
console.log(
  "PASS: deterministic 8,690-star backdrop; quality scaling; actual asteroid bounds clear the road and shared instances remain continuous through recycling, including road widening.",
);
