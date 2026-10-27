import { B as Group, R as Mesh, _u as Torus, P as Vector3 } from "../vendor/rendering.js";
import { crystal, colored, opacity, orientFX, ribbon, writeRibbon } from "./voyage-fx.js";
import { add, mul } from "./course.js";
export function createEscortView(scene, car, glow) {
  const orbit = new Group();
  car.add(orbit);
  const starGeo = crystal(0.22, "#c6f5ff"),
    haloGeo = colored(new Torus(0.3, 0.021, 5, 24), "#ffd38d");
  const stars = Array.from({ length: 3 }, () => {
    const o = new Group();
    o.add(new Mesh(starGeo, glow));
    const ring = new Mesh(haloGeo, glow);
    ring.rotation.x = 0.8;
    o.add(ring);
    orbit.add(o);
    return o;
  });
  const waves = Array.from({ length: 2 }, () => {
    const g = colored(new Torus(1, 0.018, 5, 96), "#b2ecff", 0),
      o = new Mesh(g, glow);
    o.visible = false;
    o.frustumCulled = false;
    scene.add(o);
    return o;
  });
  const trails = Array.from({ length: 3 }, () => {
    const g = ribbon(16),
      o = new Mesh(g, glow);
    o.frustumCulled = false;
    orbit.add(o);
    return o;
  });
  const streams = Array.from({ length: 6 }, () => {
    const g = ribbon(12),
      o = new Mesh(g, glow);
    o.visible = false;
    o.frustumCulled = false;
    scene.add(o);
    return { o, age: 1, p: [0, 0, 0], slot: 0 };
  });
  const bursts = Array.from({ length: 8 }, () => {
    const o = new Group(),
      g = ribbon(12),
      m = new Mesh(g, glow);
    m.frustumCulled = false;
    o.add(m);
    scene.add(o);
    o.visible = false;
    return { o, g, age: 1 };
  });
  let key = null,
    collections = 0,
    burstsSeen = 0,
    waveCount = 0,
    starCount = 0;
  const point = (i, t) => {
    const a = t * 0.85 + (i * Math.PI * 2) / 3;
    return [Math.cos(a) * 1.8, 1.35 + Math.sin(a * 2) * 0.16, Math.sin(a) * 3.05];
  };
  function reset() {
    for (const s of streams) {
      s.age = 1;
      s.o.visible = false;
    }
    for (const b of bursts) {
      b.age = 1;
      b.o.visible = false;
    }
    for (const w of waves) w.visible = false;
  }
  return {
    update(run, dt, time, reduced = false) {
      if (key !== run.escort?.key) {
        key = run.escort?.key;
        reset();
      }
      starCount = run.phase === "running" ? run.escort?.count || 0 : 0;
      for (let i = 0; i < 3; i++) {
        const o = stars[i],
          p = point(i, reduced ? 0 : time);
        o.visible = trails[i].visible = i < starCount;
        o.position.fromArray(p);
        o.rotation.set(reduced ? 0 : time * 0.5, 0, reduced ? 0 : time);
        if (o.visible) {
          const pts = Array.from({ length: 17 }, (_, j) =>
            point(i, (reduced ? 0 : time) - j * 0.045),
          );
          writeRibbon(trails[i].geometry, pts, 0.018, reduced ? 0.2 : 0.55);
        }
      }
      car.updateWorldMatrix(true, false);
      for (const e of run.events) {
        if (e.type === "escortCollect") {
          const s = streams.find((v) => v.age >= 0.38) || streams[collections % 6];
          s.age = 0;
          s.p = [...e.p];
          s.slot = e.slot;
          collections++;
        }
        if (e.type === "escortClear") {
          const b = bursts.find((v) => v.age >= 0.55) || bursts[burstsSeen % 8];
          b.age = 0;
          b.o.position.fromArray(e.p);
          burstsSeen++;
        }
      }
      for (const s of streams) {
        s.age += dt;
        s.o.visible = s.age < 0.38;
        if (!s.o.visible) continue;
        const target = new Vector3(...point(s.slot, reduced ? 0 : time))
            .applyMatrix4(car.matrixWorld)
            .toArray(),
          u = Math.min(1, s.age / 0.38);
        const pts = Array.from({ length: 13 }, (_, j) => {
          const v = Math.max(0, u - j * 0.035),
            p = add(mul(s.p, 1 - v), mul(target, v));
          p[1] += Math.sin(v * Math.PI) * 0.7;
          return p;
        });
        writeRibbon(s.o.geometry, pts, 0.035, (1 - u) * 0.8);
      }
      waveCount = 0;
      for (let i = 0; i < 2; i++) {
        const w = waves[i],
          v = run.escort?.waves[i];
        w.visible = !!v;
        if (!v) continue;
        waveCount++;
        w.position.fromArray(v.p);
        orientFX(w, { right: v.right, up: v.up, t: v.t });
        w.rotateX(Math.PI / 2);
        w.scale.setScalar(Math.max(0.01, v.range * Math.min(1, v.age / 0.65)));
        opacity(w.geometry, Math.max(0, 1 - v.age / 0.7) * 0.85);
      }
      for (const b of bursts) {
        b.age += dt;
        b.o.visible = b.age < 0.55;
        if (!b.o.visible) continue;
        const pts = Array.from({ length: 13 }, (_, j) => {
          const a = (j * Math.PI * 2) / 12,
            r = 0.35 + b.age * 4;
          return [Math.cos(a) * r, 0.2 + b.age * 0.4, Math.sin(a) * r];
        });
        writeRibbon(b.g, pts, 0.065, (1 - b.age / 0.55) * 0.8);
      }
    },
    reset,
    status: () => ({
      stars: starCount,
      waves: waveCount,
      collections,
      clearBursts: burstsSeen,
      streamPool: 6,
      burstPool: 8,
      sharedGlow: true,
    }),
  };
}
