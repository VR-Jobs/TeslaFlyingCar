import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Js as Scene, xi as Camera, P as Vector3 } from "../src/vendor/rendering.js";
import { createCourse, dot, sub } from "../src/star-ring/course.js";
import { getTrackSurface } from "../src/star-ring/track-surface.js";
import { createGlassTrack } from "../src/star-ring/glass-track.js";
import { createSaturnScene } from "../src/star-ring/saturn-scene.js";
import { createTrackDetail, trackTheme } from "../src/star-ring/track-detail.js";
const scene = new Scene(),
  course = createCourse(),
  solid = getTrackSurface(course),
  checks = [];
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
};
const before = JSON.stringify(solid.groups),
  glass = createGlassTrack(scene, course, solid);
const key = (kind, points) => kind + ":" + points.flat().join(",");
const expected = new Map();
for (const t of solid.triangles) {
  const k = key(t.kind, [t.a, t.b, t.c]);
  expected.set(k, (expected.get(k) || 0) + 1);
}
let triangles = 0;
for (const mesh of glass.group.children) {
  const p = mesh.geometry.attributes.position,
    kind = mesh.name.slice(6);
  assert(mesh.material.transparent && !mesh.material.depthWrite && mesh.material.depthTest);
  for (const name of ["normal", "aRoute", "aAcross", "aDepth", "aHalfWidth"])
    assert(
      mesh.geometry.attributes[name].count === p.count &&
        [...mesh.geometry.attributes[name].array].every(Number.isFinite),
    );
  for (let i = 0; i < p.count; i += 3) {
    const points = [0, 1, 2].map((d) => [p.getX(i + d), p.getY(i + d), p.getZ(i + d)]),
      k = key(kind, points);
    assert(expected.get(k) > 0);
    expected.set(k, expected.get(k) - 1);
    triangles++;
  }
}
check(
  "transparent-glass-uses-exact-solid-collision-faces",
  triangles === solid.triangles.length && [...expected.values()].every((n) => n === 0),
  { triangles, batches: glass.group.children.length },
);
check(
  "all-glass-batches-preserve-background-depth",
  glass.group.children.every(
    (m) => m.material.transparent && !m.material.depthWrite && m.material.depthTest,
  ),
);
check("rendering-does-not-mutate-solid-collision-data", before === JSON.stringify(solid.groups));
const detail = createTrackDetail(scene, course);
check(
  "chassis-keeps-solid-hardware-outside-driving-corridor",
  detail.bounds.every(
    (p) => p.luminous || Math.abs(p.x) >= course.width / 2 - 0.0001 || p.y <= -0.46,
  ),
);
check(
  "no-visible-crossbars-or-under-glass-crossframes",
  detail.bounds.every(
    (p) => Math.abs(p.x) >= course.width / 2 - 0.0001 || (p.luminous && Math.abs(p.x) <= 0.056),
  ),
);
check(
  "hardware-never-bridges-a-missing-track-section",
  detail.root.children.every((mesh) => {
    const route = mesh.geometry.attributes.aRoute.array;
    for (let i = 0; i < route.length; i += 3) {
      const lo = Math.min(route[i], route[i + 1], route[i + 2]),
        hi = Math.max(route[i], route[i + 1], route[i + 2]);
      // Route attributes and the shared mesh are Float32, including end knots.
      if (
        course.gaps.some((g) => hi > Math.fround(g.start) + 1e-5 && lo < Math.fround(g.end) - 1e-5)
      )
        return false;
    }
    return true;
  }),
);
check(
  "modular-chassis-has-low-fixed-geometry-budget",
  detail.status().triangles < 42000 && detail.status().batches < 70,
  detail.status(),
);
detail.update(10, 1, true);
check(
  "distant-chassis-batches-are-culled",
  detail.root.children.some((m) => !m.visible) && detail.root.children.some((m) => m.visible),
);
check(
  "track-sections-have-distinct-lighting",
  new Set(course.segments.map((s) => trackTheme(course, (s.start + s.end) / 2).color.join()))
    .size >= 4,
);
check("detail-rendering-preserves-the-same-solid", before === JSON.stringify(solid.groups));
const saturn = createSaturnScene(scene, course),
  camera = new Camera();
camera.position.set(0, 5, 0);
saturn.update(camera, 100, 1, 1, 2);
saturn.root.updateMatrixWorld(true);
const n = new Vector3(0, 1, 0).applyQuaternion(saturn.root.quaternion);
check(
  "ice-ring-plane-stays-below-level-driving-surface",
  Math.abs(n.dot(new Vector3(0, -20, 0).sub(saturn.root.position))) < 0.01,
);
check("gas-giant-is-behind-playable-route", saturn.root.position.length() - 900 > course.length, {
  distance: saturn.root.position.length(),
});
const p = saturn.dust.geometry.attributes.position,
  s = saturn.dust.geometry.attributes.aRoute;
let clear = 0;
for (let i = 0; i < p.count; i++) {
  const f = course.pose(s.getX(i)),
    d = sub([p.getX(i), p.getY(i), p.getZ(i)], f.p),
    height = dot(d, f.up),
    across = Math.abs(dot(d, f.right));
  if (height < -2.9 && (across > 13.9 || height < -7.9)) clear++;
}
check("ice-particles-stay-below-or-beside-driving-corridor", clear === p.count, {
  points: p.count,
});
saturn.update(camera, 100, 1, 1, 0);
check("low-quality-reduces-particles", saturn.dust.geometry.drawRange.count < p.count);
await fs.writeFile(
  new URL("../evidence/star-ring-glass-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
