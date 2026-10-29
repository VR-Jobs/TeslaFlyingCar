import {
  base,
  tick,
  emit,
  award,
  fail,
  finish,
  steer,
  clamp,
  hash,
  jump,
  crosses,
} from "./core.js";
export function cutSection(r, index) {
  const start = 170 + index * 185,
    safe = Math.floor(hash(r.seed, index, 23) * 3) - 1;
  return { index, start, end: start + 46, safe, drift: hash(r.seed, index, 25) > 0.55 };
}
export function nextCut(r) {
  return cutSection(
    r,
    Math.max(
      0,
      Math.floor((r.s - 170) / 185) +
        (r.s > cutSection(r, Math.max(0, Math.floor((r.s - 170) / 185))).end ? 1 : 0),
    ),
  );
}
export function platformAt(r, s = r.s, x = r.x, time = r.time) {
  const index = Math.max(0, Math.floor((s - 170) / 185));
  const g = cutSection(r, index);
  const lane = Math.round(x / 5.5);
  const inCut = s >= g.start && s <= g.end;
  const exists = !inCut || lane === g.safe;
  return {
    exists,
    y:
      inCut && g.drift
        ? (1 + Math.sin(time * 1.5 + index) * 0.7) *
          Math.sin(Math.PI * clamp((s - g.start) / (g.end - g.start), 0, 1))
        : 0,
    section: g,
    lane,
  };
}
export const leviathanEscape = {
  create(seed) {
    const r = base("leviathanEscape", seed);
    r.goal = 2200;
    r.finishAt = 2200;
    r.lane = 0;
    r.chase = 85;
    r.cleared = -1;
    r.cell = -1;
    r.sinceCheckpoint = 0;
    r.wasSupported = true;
    return r;
  },
  press(r, action, down) {
    if (action === "left" && down) r.lane = clamp(r.lane - 1, -1, 1);
    if (action === "right" && down) r.lane = clamp(r.lane + 1, -1, 1);
    if (action === "jump" && down) jump(r, 8.5);
  },
  step(r, dt) {
    if (!tick(r, dt, 140)) return;
    const old = r.s;
    steer(r, r.lane * 5.5, dt, 13, 10);
    const boost = r.input.boost && r.energy > 0;
    r.speed = 25 + (boost ? 8 : 0);
    r.s += r.speed * dt;
    r.chase = clamp(r.chase + (r.speed - (27 + Math.sin(r.time * 0.17) * 1.5)) * dt, 0, 95);
    r.energy = clamp(r.energy + (boost ? -10 : 4) * dt, 0, 100);
    const p = platformAt(r),
      surface = p.y;
    const hold = r.input.suction && r.energy > 0;
    if (!p.exists) {
      r.attached = false;
      r.vy -= 13 * dt;
      if (r.input.jump && r.energy > 0) {
        r.vy += 18 * dt;
        r.energy = Math.max(0, r.energy - 12 * dt);
        r.jet = 0.2;
      }
      r.y += r.vy * dt;
      if (r.y < -4) fail(r, "cut");
    } else if (r.y > surface + 0.05 || r.vy > 0) {
      r.attached = false;
      r.vy -= 15 * dt;
      if (r.input.jump && r.energy > 0) {
        r.vy += 10 * dt;
        r.energy = Math.max(0, r.energy - 10 * dt);
        r.jet = 0.2;
      }
      if (hold && r.y - surface < 3) {
        r.vy -= 10 * dt;
        r.energy = Math.max(0, r.energy - 3 * dt);
      }
      r.y += r.vy * dt;
      if (r.y <= surface && r.vy < 0) {
        const impact = Math.abs(r.vy);
        if (impact > 15 && !hold) {
          r.chase -= 20;
          emit(r, "hit");
        }
        r.impact = clamp(impact / 15, 0.1, 1);
        r.landAt = r.time;
        r.y = surface;
        r.vy = 0;
        r.attached = true;
        emit(r, "land", { impact: r.impact });
      }
    } else {
      if (p.section.drift && r.s >= p.section.start && r.s <= p.section.end && !hold) {
        r.attached = false;
        r.vy -= 8 * dt;
        r.y += r.vy * dt;
        if (r.y < surface - 2.8) fail(r, "cut");
      } else {
        r.y = surface;
        r.vy = 0;
        r.attached = true;
      }
    }
    const g = nextCut(r);
    for (let index = Math.max(0, g.index - 1); index <= g.index; index++) {
      const cut = cutSection(r, index);
      if (index > r.cleared && crosses(old, r.s, cut.end + 8)) {
        r.cleared = index;
        award(r, 150);
        r.chase = Math.min(95, r.chase + 8);
        emit(r, "checkpoint");
      }
      if (index > r.cell && crosses(old, r.s, cut.end + 30)) {
        r.cell = index;
        if (Math.abs(r.x - cut.safe * 5.5) < 2.5) {
          r.energy = Math.min(100, r.energy + 25);
          emit(r, "pickup");
        }
      }
    }
    if (r.endless && r.s >= r.finishAt) {
      r.finishAt += 2200;
      r.goal = r.finishAt;
      award(r, 500);
    }
    r.metric = Math.floor(r.s);
    if (r.chase < 12) fail(r, "caught");
    if (r.s >= r.finishAt && !r.endless) finish(r);
  },
  pilot(r) {
    const g = nextCut(r);
    r.lane = g.safe;
    r.input.suction = true;
    r.input.boost = r.chase < 55 && r.energy > 30;
    r.input.jump = false;
  },
  hud(r) {
    const g = nextCut(r),
      lanes = ["左", "中", "右"],
      en = ["Left", "Center", "Right"];
    return {
      status: [
        `扫描预警 · ${lanes[g.safe + 1]}轨安全${g.drift ? " · 按 E 稳定残轨" : ""}`,
        `Scan warning · ${en[g.safe + 1]} lane safe${g.drift ? " · Hold E on fragments" : ""}`,
      ],
      detail: [
        `采矿船距离 ${Math.round(r.chase)} m · 救援门 ${Math.max(0, Math.ceil(r.finishAt - r.s))} m`,
        `Ship ${Math.round(r.chase)} m behind · Rescue ${Math.max(0, Math.ceil(r.finishAt - r.s))} m`,
      ],
      value: r.chase / 95,
    };
  },
};
