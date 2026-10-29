import { base, tick, emit, award, fail, finish, clamp, hash, wrap } from "./core.js";
export const planet = (r, i) => ({
  index: i,
  x: i === 0 ? 0 : (hash(r.seed, i, 7) - 0.5) * 34,
  s: i * 82,
  radius: 6 + hash(r.seed, i, 3) * 2,
  orbit: 15 + hash(r.seed, i, 5) * 2,
});
export function launchWindow(r) {
  const a = planet(r, r.orbitIndex),
    b = planet(r, r.orbitIndex + 1);
  const bearing = Math.atan2(b.s - a.s, b.x - a.x);
  return {
    angle: bearing - Math.PI / 2,
    error: wrap(r.theta - (bearing - Math.PI / 2)),
    ready: Math.abs(wrap(r.theta - (bearing - Math.PI / 2))) < 0.25,
  };
}
function launch(r) {
  if (!r.orbiting) return;
  const a = planet(r, r.orbitIndex),
    b = planet(r, r.orbitIndex + 1),
    cue = launchWindow(r);
  let dx = -Math.sin(r.theta),
    ds = Math.cos(r.theta);
  if (Math.abs(cue.error) < 0.3) {
    const bx = b.x - a.x,
      bz = b.s - a.s,
      len = Math.hypot(bx, bz),
      tx = b.x + (bz / len) * b.orbit,
      tz = b.s - (bx / len) * b.orbit;
    dx = tx - r.x;
    ds = tz - r.s;
    const l = Math.hypot(dx, ds);
    dx /= l;
    ds /= l;
  }
  r.vx = dx * 28;
  r.vs = ds * 28;
  r.orbiting = false;
  r.attached = false;
  r.flight = 0;
  r.jet = 0.5;
  r.energy = Math.max(0, r.energy - 9);
  emit(r, "jump");
}
export const slingshot = {
  create(seed) {
    const r = base("slingshot", seed);
    r.goal = 6;
    r.orbitIndex = 0;
    r.orbiting = true;
    r.theta = -1.2;
    r.omega = 0.83;
    r.flight = 0;
    r.vs = 0;
    r.grace = 2;
    r.visited = 0;
    const p = planet(r, 0),
      b = planet(r, 1);
    r.theta = Math.atan2(b.s - p.s, b.x - p.x) - Math.PI / 2 - 1.2;
    r.x = p.x + Math.cos(r.theta) * p.orbit;
    r.s = p.s + Math.sin(r.theta) * p.orbit;
    r.health = 1;
    r.windowReady = false;
    return r;
  },
  press(r, action, down) {
    if ((action === "jump" && down) || (action === "suction" && !down)) launch(r);
  },
  step(r, dt) {
    if (!tick(r, dt, 110)) return;
    const p = planet(r, r.orbitIndex),
      next = planet(r, r.orbitIndex + 1);
    r.grace = Math.max(0, r.grace - dt);
    if (r.orbiting) {
      r.attached = true;
      r.omega = clamp(0.83 + (Number(r.input.right) - Number(r.input.left)) * 0.22, 0.5, 1.1);
      r.theta += r.omega * dt;
      r.x = p.x + Math.cos(r.theta) * p.orbit;
      r.s = p.s + Math.sin(r.theta) * p.orbit;
      r.vx = -Math.sin(r.theta) * r.omega * p.orbit;
      r.vs = Math.cos(r.theta) * r.omega * p.orbit;
      r.energy = Math.min(100, r.energy + 8 * dt);
      if (!r.input.suction && r.grace <= 0) launch(r);
    } else {
      r.flight += dt;
      let ax = 0,
        az = 0;
      for (const q of [p, next]) {
        const x = q.x - r.x,
          z = q.s - r.s,
          d2 = x * x + z * z,
          d = Math.sqrt(d2);
        if (d < q.radius + 1.3) {
          fail(r, "planet");
          return;
        }
        const f = (q.radius * 330) / (d2 + 60);
        ax += (x / Math.max(1, d)) * f;
        az += (z / Math.max(1, d)) * f;
      }
      const speed = Math.max(1, Math.hypot(r.vx, r.vs)),
        turn = Number(r.input.right) - Number(r.input.left);
      ax += (r.vs / speed) * turn * 7;
      az -= (r.vx / speed) * turn * 7;
      if ((r.input.jump || r.input.boost) && r.energy > 0) {
        ax += (r.vx / speed) * 9;
        az += (r.vs / speed) * 9;
        r.energy = Math.max(0, r.energy - 9 * dt);
        r.jet = 0.2;
      }
      r.vx += ax * dt;
      r.vs += az * dt;
      const v = Math.hypot(r.vx, r.vs);
      if (v > 42) {
        r.vx *= 42 / v;
        r.vs *= 42 / v;
      }
      r.x += r.vx * dt;
      r.s += r.vs * dt;
      const dist = Math.hypot(r.x - next.x, r.s - next.s);
      if (r.input.suction && r.flight > 0.35 && dist < next.orbit + 5 && dist > next.radius + 1.3) {
        r.orbitIndex++;
        r.orbiting = true;
        r.theta = Math.atan2(r.s - next.s, r.x - next.x);
        r.grace = 0.8;
        r.energy = Math.min(100, r.energy + 25);
        r.metric = r.orbitIndex;
        award(r, 220);
        emit(r, "checkpoint");
        if (r.metric >= r.goal) finish(r);
      }
      if (r.flight > 8.5 || Math.hypot(r.x - next.x, r.s - next.s) > 170) fail(r, "lostOrbit");
    }
    const ready = r.orbiting && launchWindow(r).ready;
    if (ready && !r.windowReady) emit(r, "launchReady");
    r.windowReady = ready;
    r.heading = Math.atan2(r.vx, r.vs);
    r.roll = clamp((Number(r.input.left) - Number(r.input.right)) * 0.25, -0.3, 0.3);
    r.speed = Math.hypot(r.vx, r.vs);
  },
  pilot(r) {
    if (r.orbiting) {
      r.input.suction = true;
      if (launchWindow(r).ready) launch(r);
    } else {
      r.input.suction = true;
      const q = planet(r, r.orbitIndex + 1),
        dx = q.x - r.x,
        dz = q.s - r.s;
      const cross = r.vs * dx - r.vx * dz;
      r.input.right = cross > 30;
      r.input.left = cross < -30;
      r.input.jump = false;
    }
  },
  hud(r) {
    const c = launchWindow(r);
    return {
      status: r.orbiting
        ? [
            c.ready ? "绿色窗口 · 现在释放" : "引力捕获中 · 等待绿窗",
            c.ready ? "Green window · Launch now" : "In orbit · Wait for green",
          ]
        : ["飞向下一颗天体 · 按住 E 接轨", "Approaching next body · Hold E to capture"],
      detail: [
        `天体接力 ${r.orbitIndex} / ${r.goal}`,
        `Orbital transfers ${r.orbitIndex} / ${r.goal}`,
      ],
      value: r.orbiting
        ? clamp(1 - Math.abs(c.error) / Math.PI, 0, 1)
        : clamp(r.flight / 8.5, 0, 1),
    };
  },
};
