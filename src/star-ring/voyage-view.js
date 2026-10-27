import {
  B as Group,
  R as Mesh,
  H as Standard,
  ci as Box,
  V as Cylinder,
  _u as Torus,
} from "../vendor/rendering.js";
import { colored, crystal, orientFX, ribbon, writeRibbon } from "./voyage-fx.js";
import { fragmentPosition } from "./escort-rules.js";
import { add, mul } from "./course.js";
export function createVoyageView(root, course, glow) {
  const metal = new Standard({ color: "#8c9caa", metalness: 0.72, roughness: 0.3 }),
    panel = new Standard({ color: "#142a40", metalness: 0.55, roughness: 0.4 });
  const core = crystal(0.18),
    halo = colored(new Torus(0.24, 0.018, 4, 16), "#f5dba3");
  const fragments = (course.voyage?.fragments || []).map((item) => {
    const o = new Group(),
      p = fragmentPosition(course, item);
    if (p) o.position.fromArray(p);
    const s = new Mesh(core, glow);
    s.rotation.z = 0.2;
    o.add(s);
    const h = new Mesh(halo, glow);
    h.rotation.x = 0.7;
    o.add(h);
    root.add(o);
    return { item, o, base: p };
  });
  const plan = course.voyage?.event,
    ship = new Group();
  root.add(ship);
  ship.name = "Supply ship / outside driving corridor";
  const box = new Box(1, 1, 1),
    pipe = new Cylinder(0.6, 0.8, 1, 12),
    engine = colored(new Torus(0.58, 0.05, 6, 24), "#a4ecff");
  function part(g, m, x, y, z, sx, sy, sz) {
    const o = new Mesh(g, m);
    o.position.set(x, y, z);
    o.scale.set(sx, sy, sz);
    ship.add(o);
    return o;
  }
  part(box, metal, 0, 0, 0, 5, 2.5, 14);
  part(box, panel, 0, 1.35, -4, 3, 0.15, 4);
  for (const sign of [-1, 1]) {
    part(box, panel, sign * 7, 0, 0, 8, 0.18, 9);
    part(box, metal, sign * 3.8, -1.2, 1, 2, 2, 8);
    const p = part(pipe, metal, sign * 2, -0.4, 7, 1, 3, 1);
    p.rotation.x = Math.PI / 2;
    part(engine, glow, sign * 2, -0.4, 8.55, 1, 1, 1);
  }
  const meteorHead = crystal(0.45, "#ffd4aa"),
    meteors = Array.from({ length: 7 }, (_, i) => {
      const o = new Group(),
        tail = new Mesh(ribbon(12), glow),
        head = new Mesh(meteorHead, glow);
      o.add(head, tail);
      root.add(o);
      return { o, head, tail, i };
    });
  const field = new Group();
  root.add(field);
  const fieldGeo = colored(new Torus(1, 0.014, 4, 64), "#b4a6e7", 0.2);
  for (const sign of [-1, 1])
    for (let j = 0; j < 3; j++) {
      const o = new Mesh(fieldGeo, glow);
      o.position.set(sign * (19 + j * 3), 10 + j * 3, -j * 14);
      o.scale.setScalar(4 + j);
      o.rotation.y = sign * 0.6;
      field.add(o);
    }
  let visible = 0,
    active = "",
    supplyVisible = false,
    meteorVisible = 0;
  return {
    update(run, dt, time, reduced = false) {
      visible = 0;
      for (const { item, o, base } of fragments) {
        o.visible =
          !!base && !run.escort?.taken.has(item.id) && item.s - run.s > -24 && item.s - run.s < 165;
        if (!o.visible) continue;
        visible++;
        o.position.fromArray(base);
        o.rotation.y = reduced ? 0 : time * 0.5;
        if (!reduced) o.position.y += Math.sin(time * 2 + item.s) * 0.07;
      }
      const e = run.voyageState,
        key = course.id ?? "baseline",
        isActive = !!plan && e?.key === key && e.phase === "active";
      active = isActive ? plan.type : "";
      supplyVisible = ship.visible = active === "supply";
      meteorVisible = 0;
      field.visible = active === "gravity";
      const f = course.pose(run.s);
      const at = (side, up, forward) =>
        add(f.p, add(mul(f.right, side), add(mul(f.up, up), mul(f.t, forward))));
      if (ship.visible) {
        ship.position.fromArray(at(27, 21, 75 - e.age * 13));
        orientFX(ship, f);
        ship.rotation.z += reduced ? 0 : Math.sin(e.age * 0.4) * 0.035;
      }
      for (const m of meteors) {
        m.o.visible = active === "meteor";
        if (!m.o.visible) continue;
        meteorVisible++;
        const t = (e.age * 0.28 + m.i * 0.157) % 1,
          side = (m.i % 2 ? -1 : 1) * (31 + m.i * 4 + (1 - t) * 8),
          up = 24 + m.i * 1.8 - t * 10;
        m.o.position.fromArray(at(side, up, 210 - t * 115));
        orientFX(m.o, f);
        const pts = Array.from({ length: 13 }, (_, j) => [j * 0.42, j * 0.32, j * 4]);
        writeRibbon(m.tail.geometry, pts, 0.13, reduced ? 0.25 : 0.7);
        m.head.rotation.y = time * 0.3;
      }
      if (field.visible) {
        field.position.fromArray(f.p);
        orientFX(field, f);
        if (!reduced) field.rotation.z += Math.sin(e.age * 0.5) * 0.06;
      }
    },
    status: () => ({
      visibleFragments: visible,
      totalFragments: fragments.length,
      event: active,
      supplyVisible,
      meteors: meteorVisible,
      eventOutsideRoad: true,
      meteorPool: 7,
    }),
  };
}
