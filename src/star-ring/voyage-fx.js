import {
  Jr as Geometry,
  L as Attribute,
  I as Color,
  P as Vector3,
  F as Matrix4,
} from "../vendor/rendering.js";
export function colored(geometry, color, alpha = 1) {
  const rgb = new Color(color),
    n = geometry.attributes.position.count,
    values = [];
  for (let i = 0; i < n; i++) values.push(rgb.r, rgb.g, rgb.b, alpha);
  geometry.setAttribute("color", new Attribute(values, 4));
  return geometry;
}
export function opacity(geometry, alpha) {
  const a = geometry.attributes.color;
  for (let i = 3; i < a.array.length; i += 4) a.array[i] = alpha;
  a.needsUpdate = true;
}
export function crystal(size = 0.2, color = "#a7efff") {
  const top = [0, size * 1.5, 0],
    bottom = [0, -size * 1.5, 0],
    rim = [
      [size, 0, 0],
      [0, 0, size],
      [-size, 0, 0],
      [0, 0, -size],
    ],
    v = [];
  for (let i = 0; i < 4; i++)
    v.push(...top, ...rim[(i + 1) % 4], ...rim[i], ...bottom, ...rim[i], ...rim[(i + 1) % 4]);
  const g = new Geometry();
  g.setAttribute("position", new Attribute(v, 3));
  g.computeVertexNormals();
  return colored(g, color);
}
export function orientFX(o, f) {
  o.quaternion.setFromRotationMatrix(
    new Matrix4().makeBasis(
      new Vector3(...f.right),
      new Vector3(...f.up),
      new Vector3(...f.t).negate(),
    ),
  );
}
export function ribbon(segments) {
  const g = new Geometry();
  g.setAttribute("position", new Attribute(new Float32Array(segments * 18), 3));
  colored(g, "#b5f1ff", 0);
  return g;
}
export function writeRibbon(g, points, width, alpha) {
  const p = g.attributes.position.array,
    c = g.attributes.color.array;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i],
      b = points[i + 1],
      v = [
        [a[0] - width, a[1], a[2]],
        [a[0] + width, a[1], a[2]],
        [b[0] - width, b[1], b[2]],
        [a[0] + width, a[1], a[2]],
        [b[0] + width, b[1], b[2]],
        [b[0] - width, b[1], b[2]],
      ];
    for (let j = 0; j < 6; j++) {
      p.set(v[j], i * 18 + j * 3);
      c[(i * 6 + j) * 4 + 3] = alpha * (1 - i / (points.length - 1));
    }
  }
  g.attributes.position.needsUpdate = true;
  g.attributes.color.needsUpdate = true;
  g.computeBoundingSphere();
}
