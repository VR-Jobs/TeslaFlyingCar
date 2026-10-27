import assert from "node:assert/strict";
import { createCoastDetails } from "../src/scenery/coast-details.js";
import { beachHeight, shoreline } from "../src/scenery/coast.js";

// Exercise actual instance placement, including recycling after road widening.
// A prop that remains in view must retain its world position across a tile boundary.
const families = ["shrubs", "ground cover", "shells", "driftwood", "tidal rocks"];
const perRow = [5, 3, 7, 1, 3];
const details = createCoastDetails(beachHeight, shoreline);
function snapshot(distance) {
  details.update(distance);
  return details.group.children.map((mesh) => {
    assert([...mesh.geometry.attributes.position.array].every(Number.isFinite));
    return Array.from({ length: mesh.count }, (_, i) => {
      const a = mesh.instanceMatrix.array,
        start = i * 16;
      const size = Math.hypot(a[start], a[start + 1], a[start + 2]);
      const p = [a[start + 12], a[start + 13], a[start + 14] + details.group.position.z - distance];
      if (size > 1e-5) {
        assert(p.every(Number.isFinite));
        assert(Math.abs(p[0]) >= 12, "Beach detail encroaches on the wide driving surface");
      }
      return { size, p };
    });
  });
}
for (const boundary of [25, 250, 5025]) {
  const before = snapshot(boundary - 0.001),
    after = snapshot(boundary + 0.001);
  families.forEach((name, f) => {
    for (let i = 0; i < after[f].length - perRow[f]; i++) {
      const a = before[f][i + perRow[f]],
        b = after[f][i];
      assert(Math.abs(a.size - b.size) < 1e-5, `${name} visibility changes at recycling`);
      if (a.size < 1e-5) continue;
      assert(
        a.p.every((v, j) => Math.abs(v - b.p[j]) < 1e-4),
        `${name} jumps at ${boundary} m`,
      );
    }
  });
}
console.log(
  "PASS: Five coastal detail families keep stable world positions across 25 m, 250 m and 5,025 m; no details occupy the driving surface.",
);
