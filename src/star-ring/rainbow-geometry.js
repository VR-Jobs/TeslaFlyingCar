import { Jr as Geometry, L as Attribute, I as Color } from "../vendor/rendering.js";
export function starGeometry() {
  const ring = Array.from({ length: 10 }, (_, i) => {
      const a = Math.PI / 2 + (i * Math.PI) / 5,
        r = i % 2 ? 0.43 : 1;
      return [Math.cos(a) * r, Math.sin(a) * r];
    }),
    p = [];
  for (let i = 0; i < 10; i++) {
    const a = ring[i],
      b = ring[(i + 1) % 10];
    p.push(0, 0, 0.19, ...a, 0.11, ...b, 0.11, 0, 0, -0.19, ...b, -0.11, ...a, -0.11);
    for (const q of [
      [a[0], a[1], 0.11],
      [a[0], a[1], -0.11],
      [b[0], b[1], 0.11],
      [a[0], a[1], -0.11],
      [b[0], b[1], -0.11],
      [b[0], b[1], 0.11],
    ])
      p.push(...q);
  }
  const g = new Geometry();
  g.setAttribute("position", new Attribute(p, 3));
  g.computeVertexNormals();
  return g;
}
export function rainbowColors(g) {
  const p = g.attributes.position,
    c = [];
  for (let i = 0; i < p.count; i++) {
    const a = Math.atan2(p.getY(i), p.getX(i)),
      rgb = new Color().setHSL((a / (Math.PI * 2) + 1) % 1, 0.9, 0.62);
    c.push(rgb.r, rgb.g, rgb.b);
  }
  g.setAttribute("color", new Attribute(c, 3));
  return g;
}
