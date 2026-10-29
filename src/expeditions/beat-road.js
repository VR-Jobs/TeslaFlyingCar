import { base, tick, emit, award, fail, finish, clamp, steer, hash } from "./core.js";
export const BPM = 128,
  BEAT = 60 / BPM;
export function note(r, index = r.note) {
  const pattern = [0, 0, 1, 1, 0, -1, -1, 0];
  return {
    index,
    time: 3 + index * BEAT,
    lane: pattern[index % 8] * (hash(r.seed, Math.floor(index / 8), 30) > 0.5 ? 1 : -1),
  };
}
export function beatError(r) {
  return r.time - note(r).time + (r.offset || 0);
}
function weave(r) {
  const n = note(r),
    error = Math.abs(beatError(r));
  if (error <= 0.175 && Math.abs(r.x - n.lane * 3.4) < 2.05) {
    r.hits++;
    r.metric = r.hits;
    r.weaveAt = r.time;
    r.errorSum += error;
    r.lastAccuracy = error < 0.065 ? "perfect" : "good";
    r.roadUntil = Math.max(r.roadUntil, r.s + 25);
    r.tiles.push({ start: r.s - 3, end: r.s + 26, x: n.lane * 3.4, expires: r.time + 1.8 });
    r.energy = Math.min(100, r.energy + 7);
    r.y = Math.max(0, r.y);
    r.vy = 0;
    r.misses = 0;
    award(r, error < 0.065 ? 120 : 80);
    emit(r, "weave", { perfect: error < 0.065 });
    r.note++;
    if (r.hits % 12 === 0) emit(r, "checkpoint");
  } else {
    if (r.time - r.badAt > 0.25) {
      r.badAt = r.time;
      r.energy = Math.max(0, r.energy - 3);
      emit(r, "offbeat");
    }
  }
}
export const beatRoad = {
  create(seed) {
    const r = base("beatRoad", seed);
    r.goal = 36;
    r.note = 0;
    r.hits = 0;
    r.misses = 0;
    r.totalMisses = 0;
    r.errorSum = 0;
    r.badAt = -5;
    r.offset = 0;
    r.roadUntil = 80;
    r.tiles = [{ start: -20, end: 80, x: 0, expires: 5 }];
    r.lastBeat = -1;
    r.lane = 0;
    r.lastAccuracy = "";
    return r;
  },
  press(r, action, down) {
    if (action === "left" && down) r.lane = clamp(r.lane - 1, -1, 1);
    if (action === "right" && down) r.lane = clamp(r.lane + 1, -1, 1);
    if (action === "jump" && down) weave(r);
  },
  step(r, dt) {
    if (!tick(r, dt, 120)) return;
    const old = r.s;
    steer(r, r.lane * 3.4, dt, 14, 12);
    r.speed = 24;
    r.s += r.speed * dt;
    const n = note(r);
    if (r.time > n.time + 0.19 - (r.offset || 0)) {
      r.misses++;
      r.totalMisses++;
      r.combo = 0;
      r.note++;
      emit(r, "miss");
      if (r.misses >= 4) fail(r, "rhythm");
    }
    const beat = Math.floor((r.time - 3) / BEAT);
    if (beat >= 0 && beat !== r.lastBeat) {
      r.lastBeat = beat;
      emit(r, "beat", { index: beat });
    }
    const support = r.s <= r.roadUntil;
    const hover = !support && r.input.suction && r.energy > 0;
    if (hover) {
      r.vy = Math.max(-0.8, r.vy + 18 * dt);
      r.energy = Math.max(0, r.energy - 26 * dt);
    } else if (!support) r.vy -= 13 * dt;
    if (!support) {
      r.attached = false;
      r.y += r.vy * dt;
      if (r.y < -3) fail(r, "rhythm");
    } else {
      if (r.y < 0) {
        r.y = 0;
        r.vy = 0;
        emit(r, "land", { impact: 0.4 });
      }
      r.attached = true;
    }
    r.tiles = r.tiles.filter((t) => t.end > r.s - 40 && t.expires > r.time - 0.9).slice(-12);
    if (!r.endless && r.note >= 48) {
      if (r.hits >= r.goal) finish(r);
      else fail(r, "rhythm");
    }
  },
  pilot(r) {
    const n = note(r);
    r.lane = n.lane;
    r.input.suction = true;
    if (Math.abs(beatError(r)) < 0.025 && Math.abs(r.x - n.lane * 3.4) < 2) weave(r);
  },
  hud(r) {
    const n = note(r),
      error = beatError(r);
    return {
      status: [
        `下一拍 ${n.lane < 0 ? "左" : n.lane > 0 ? "右" : "中"}道 · ${r.lastAccuracy === "perfect" ? "完美" : r.lastAccuracy === "good" ? "命中" : "等待光圈重合"}`,
        `Next: ${n.lane < 0 ? "left" : n.lane > 0 ? "right" : "center"} lane · ${r.lastAccuracy || "Align the rings"}`,
      ],
      detail: [
        `命中 ${r.hits} / ${r.endless ? r.note : Math.min(48, r.note)} · 漏拍 ${r.totalMisses}`,
        `Hits ${r.hits} / ${r.endless ? r.note : Math.min(48, r.note)} · Misses ${r.totalMisses}`,
      ],
      value: clamp(1 - Math.abs(error) / BEAT, 0, 1),
    };
  },
};
