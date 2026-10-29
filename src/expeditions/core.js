export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export function hash(seed, index, salt = 0) {
  let x = (seed ^ Math.imul(index + 1, 0x9e3779b9) ^ Math.imul(salt + 7, 0x85ebca6b)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}
export function base(id, seed = 1) {
  return {
    id,
    seed,
    phase: "running",
    time: 0,
    s: 0,
    x: 0,
    y: 0,
    vy: 0,
    vx: 0,
    speed: 24,
    heading: 0,
    roll: 0,
    energy: 100,
    health: 3,
    score: 0,
    combo: 0,
    bestCombo: 0,
    metric: 0,
    goal: 1,
    events: [],
    input: { left: false, right: false, suction: false, jump: false, boost: false },
    death: 0,
    reason: "",
    invulnerable: 0,
    endless: false,
    jet: 0,
    attached: true,
    landAt: -10,
    impact: 0,
  };
}
export const emit = (r, type, data = {}) => r.events.push({ type, ...data });
export function fail(r, reason) {
  if (r.phase !== "running") return;
  r.phase = "dying";
  r.reason = reason;
  r.death = 0;
  r.combo = 0;
  emit(r, "death");
}
export function finish(r) {
  if (!r.endless && r.phase === "running") {
    r.phase = "finished";
    emit(r, "win");
  }
}
export function hit(r, reason, damage = 1) {
  if (r.invulnerable > 0 || r.phase !== "running") return;
  r.health -= damage;
  r.combo = 0;
  r.invulnerable = 1.1;
  emit(r, "hit");
  if (r.health <= 0) fail(r, reason);
}
export function award(r, points = 100) {
  r.combo++;
  r.bestCombo = Math.max(r.combo, r.bestCombo);
  r.score += points + Math.min(10, r.combo) * 10;
  emit(r, "success");
}
export function tick(r, dt, limit = 150) {
  if (r.phase === "dying") {
    r.death += dt;
    if (r.death >= 1.9) r.phase = "dead";
    return false;
  }
  if (r.phase !== "running") return false;
  r.time += dt;
  r.invulnerable = Math.max(0, r.invulnerable - dt);
  r.jet = Math.max(0, r.jet - dt);
  if (!r.endless && r.time > limit) {
    fail(r, "timeout");
    return false;
  }
  return true;
}
export function steer(r, target, dt, speed = 12, response = 8) {
  const wanted = clamp((target - r.x) * response, -speed, speed);
  r.vx += (wanted - r.vx) * (1 - Math.exp(-9 * dt));
  r.x += r.vx * dt;
}
export function moveLateral(r, dt, range = 9, mass = 1) {
  const input = Number(r.input.right) - Number(r.input.left);
  r.vx += ((input * 11) / mass - r.vx) * (1 - Math.exp((-7 * dt) / mass));
  r.x = clamp(r.x + r.vx * dt, -range, range);
  r.roll = -r.vx * 0.018;
}
export function jump(r, power = 8) {
  if (r.y < 0.15 && r.attached && r.energy >= 8) {
    r.vy = power;
    r.attached = false;
    r.energy -= 8;
    r.jet = 0.35;
    emit(r, "jump");
  }
}
export function vertical(r, dt, floor = 0) {
  if (r.y > floor + 0.02 || r.vy > 0) {
    r.attached = false;
    r.vy -= 15 * dt;
    if (r.input.jump && r.energy > 0) {
      r.vy += 9 * dt;
      r.energy = Math.max(0, r.energy - 10 * dt);
      r.jet = 0.15;
    }
    r.y += r.vy * dt;
    if (r.y <= floor && r.vy < 0) {
      r.impact = Math.min(1, Math.abs(r.vy) / 12);
      r.y = floor;
      r.vy = 0;
      r.attached = true;
      r.landAt = r.time;
      emit(r, "land", { impact: r.impact });
    }
  } else {
    r.y = floor;
    r.attached = true;
    r.energy = Math.min(100, r.energy + 5 * dt);
  }
}
export const crosses = (a, b, s) => a < s && b >= s;
export function finiteState(r) {
  return (
    [r.time, r.s, r.x, r.y, r.energy, r.score, r.speed].every(Number.isFinite) &&
    r.energy >= 0 &&
    r.energy <= 100
  );
}
