import {
  base,
  tick,
  emit,
  award,
  fail,
  finish,
  hit,
  moveLateral,
  clamp,
  hash,
  crosses,
} from "./core.js";
export function dock(r, i) {
  return {
    index: i,
    s: 240 + i * 280,
    x: (i === 0 ? 0 : hash(r.seed, i, 2) > 0.5 ? 7 : -7) + Math.sin(r.time * 0.4 + i) * 1.25,
  };
}
export function cores(r, s = r.s) {
  const first = Math.max(0, Math.floor((s - 90) / 24) - 2);
  return Array.from({ length: 20 }, (_, j) => {
    const i = first + j;
    return { id: i, s: 45 + i * 24, x: i < 5 ? 0 : (hash(r.seed, i, 9) - 0.5) * 15 };
  });
}
export function rocks(r) {
  const i = Math.max(0, Math.floor(r.s / 140) - 1);
  return Array.from({ length: 5 }, (_, j) => ({
    id: i + j,
    s: 175 + (i + j) * 140,
    x: (hash(r.seed, i + j, 13) > 0.5 ? 1 : -1) * 6.5,
  }));
}
export const salvage = {
  create(seed) {
    const r = base("salvage", seed);
    r.goal = 12;
    r.cargo = [];
    r.collected = [];
    r.dropped = [];
    r.delivered = 0;
    r.dockIndex = 0;
    r.loadTimer = 0;
    r.damageCount = 0;
    return r;
  },
  step(r, dt) {
    if (!tick(r, dt, 180)) return;
    const old = r.s,
      d = dock(r, r.dockIndex),
      near = Math.abs(d.s - r.s) < 20 && Math.abs(d.x - r.x) < 3.5;
    const mass = 1 + r.cargo.length * 0.2;
    moveLateral(r, dt, 10, mass);
    const boost = (r.input.jump || r.input.boost) && r.energy > 0;
    r.speed +=
      ((near && r.input.suction && !boost ? 5 : 20 + (boost ? 11 : 0) / mass) - r.speed) *
      (1 - Math.exp(-3 * dt));
    r.s += r.speed * dt;
    r.jet = boost ? 0.2 : Math.max(0, r.jet - dt);
    r.energy = clamp(r.energy + (boost ? -10 : 5) * dt, 0, 100);
    if (r.input.suction) {
      for (const core of [...r.dropped.map((c) => ({ ...c, dropped: true })), ...cores(r)]) {
        if (r.cargo.length >= 6) break;
        if (!core.dropped && r.collected.includes(core.id)) continue;
        if (Math.hypot(core.x - r.x, core.s - r.s) < 10) {
          if (core.dropped) r.dropped = r.dropped.filter((c) => c.id !== core.id);
          else r.collected.push(core.id);
          r.cargo.push({ id: core.id, x: core.x, s: core.s, vx: 0, vs: 0, stress: 0, age: 0 });
          emit(r, "pickup");
        }
      }
    }
    let targetX = r.x,
      targetS = r.s - 2.4;
    const broken = [];
    for (let i = 0; i < r.cargo.length; i++) {
      const c = r.cargo[i],
        dx = targetX - c.x,
        ds = targetS - c.s;
      c.age += dt;
      c.vx += (dx * 40 - c.vx * 6) * dt;
      c.vs += (ds * 40 - (c.vs - r.speed) * 6) * dt;
      c.x += c.vx * dt;
      c.s += c.vs * dt;
      const length = Math.hypot(dx, ds);
      c.stress =
        c.age < 0.8 || near
          ? 0
          : clamp(c.stress + (length > 5.7 ? (length - 5.7) * dt : -dt * 2), 0, 2);
      if (c.stress > 1.2) broken.push(i);
      targetX = c.x;
      targetS = c.s - 1.55;
    }
    if (broken.length) {
      const at = broken[0];
      for (const c of r.cargo.splice(at))
        r.dropped.push({ id: c.id, x: c.x, s: c.s, until: r.time + 7 });
      r.combo = 0;
      emit(r, "cargoBreak");
    }
    if (near && r.input.suction && !boost && r.cargo.length) {
      r.loadTimer += dt;
      if (r.loadTimer > 0.2) {
        r.loadTimer = 0;
        r.cargo.shift();
        r.delivered++;
        r.metric = r.delivered;
        r.energy = Math.min(100, r.energy + 9);
        award(r, 120);
        emit(r, "deliver");
        if (r.delivered >= r.goal) finish(r);
      }
    } else r.loadTimer = 0;
    for (const rock of rocks(r))
      if (crosses(old, r.s, rock.s) && Math.abs(r.x - rock.x) < 2.6) {
        if (r.cargo.length) r.cargo.pop();
        hit(r, "cargo");
        r.damageCount++;
      }
    if (r.s > d.s + 23) {
      r.dockIndex++;
      emit(r, "checkpoint");
    }
    r.dropped = r.dropped.filter((c) => c.until > r.time).slice(-12);
    r.collected = r.collected.filter((id) => 45 + id * 24 > r.s - 400);
  },
  pilot(r) {
    const d = dock(r, r.dockIndex);
    const collecting = r.cargo.length < 4 && d.s - r.s > 65;
    const target = collecting
      ? (cores(r).find((c) => c.s > r.s + 6 && !r.collected.includes(c.id))?.x ?? 0)
      : d.x;
    r.input.left = r.x > target + 0.45;
    r.input.right = r.x < target - 0.45;
    r.input.suction = true;
    r.input.jump = false;
    r.input.boost = false;
  },
  hud(r) {
    const d = dock(r, r.dockIndex);
    return {
      status: r.cargo.length
        ? [
            `拖带 ${r.cargo.length} / 6 · 小心拉断`,
            `Cargo ${r.cargo.length} / 6 · Watch tether stress`,
          ]
        : ["靠近核心并按 E 回收", "Approach cores and hold E to recover"],
      detail: [
        `已交付 ${r.delivered} / ${r.goal} · 补给船 ${Math.max(0, Math.ceil(d.s - r.s))} m`,
        `Delivered ${r.delivered} / ${r.goal} · Ship ${Math.max(0, Math.ceil(d.s - r.s))} m`,
      ],
      value: r.cargo.length / 6,
    };
  },
};
