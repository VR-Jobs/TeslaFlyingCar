import { hashSeed } from "../features/rules.js";

export const ORBIT_VERSION = "orbital-highway-1";
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const kinds = ["weave", "convoy", "heavy", "aerial"];
export const TITLES = {
  supply: "补给航道",
  weave: "交错车流",
  convoy: "慢速车队",
  heavy: "重型掩护",
  aerial: "高空奖励线",
};
export function planSegment(seed, index, start, speed = 30, lanes = [-3.4, 0, 3.4]) {
  const h = hashSeed(`${ORBIT_VERSION}:${seed}:${index}`);
  // A shuffled four-card bag plus a recovery prevents identical consecutive sections.
  const bag = [...kinds].sort(
    (a, b) =>
      hashSeed(`${seed}:${Math.floor(index / 5)}:${a}`) -
      hashSeed(`${seed}:${Math.floor(index / 5)}:${b}`),
  );
  const kind = index % 5 === 4 ? "supply" : bag[index % 5];
  const cruise = clamp(speed, 25, 100),
    length = Math.max(650, cruise * 20);
  const safeLane = 1 + (h % Math.max(1, lanes.length - 2)),
    safeX = lanes[safeLane];
  const recovery = { start: start + length - Math.max(150, cruise * 5), end: start + length };
  const routeStart = start + Math.max(130, cruise * 4);
  const routeGap = cruise * 0.8;
  const route =
    kind === "aerial" || (kind !== "supply" && index % 2 === 0)
      ? {
          id: `${index}:air`,
          x: safeX,
          start: routeStart - cruise * 1.5,
          end: routeStart + routeGap * 2 + cruise * 3.5,
          gates: [6.2, 6.45, 6.2].map((height, i) => ({
            id: `${index}:${i}`,
            x: safeX,
            y: height,
            d: routeStart + routeGap * i,
          })),
        }
      : null;
  const rows = [];
  if (kind !== "supply") {
    for (let i = 0; i < 4; i++) {
      const d = start + Math.max(115, cruise * 3.5) + i * cruise * 2.5;
      if (d > recovery.start - 45) break;
      const open =
        kind === "weave" ? clamp(safeLane + (i % 2 ? 1 : -1), 0, lanes.length - 1) : safeLane;
      const blocked = lanes.map((x, lane) => ({ x, lane })).filter((p) => p.lane !== open);
      // Leave two lanes where possible; the highest-pressure row still has a ground route.
      const chosen = blocked.filter((p, j) =>
        kind === "heavy" ? j === 0 : (j + i) % 2 === 0 || lanes.length === 3,
      );
      rows.push({
        d,
        cars: chosen.map((p, j) => ({
          x: p.x,
          type: kind === "heavy" && j === 0 ? "semi" : "sedan",
          ownSpeed: kind === "convoy" ? Math.min(14, cruise * 0.35) : 0,
        })),
      });
    }
  }
  return {
    id: index,
    kind,
    title: TITLES[kind],
    start,
    end: start + length,
    safeX,
    recovery,
    route,
    rows,
  };
}

export function inAirCorridor(plan, x, distance, hl = 2.5) {
  const r = plan?.route;
  return (
    !!r && Math.abs(x - r.x) < 2.45 && distance + hl >= r.start - 25 && distance - hl <= r.end + 35
  );
}

export function gateCrossing(gate, before, after) {
  if (gate.taken || before.d > gate.d || after.d < gate.d || after.d <= before.d) return false;
  const t = clamp((gate.d - before.d) / (after.d - before.d), 0, 1);
  const x = before.x + (after.x - before.x) * t;
  const y = before.y + (after.y - before.y) * t + 0.6;
  return y > 1.3 && Math.hypot((x - gate.x) / 1.05, (y - gate.y) / 1.05) < 1;
}

export function createActionState() {
  return {
    chain: 0,
    pending: 0,
    last: -99,
    lastD: -99,
    lastKind: "",
    banked: 0,
    best: 0,
    beatStep: 0,
    beatUntil: 0,
    beatHits: 0,
    phrases: 0,
    lastBeat: -99,
    lastBeatD: -99,
    layerUntil: 0,
    layerNote: 0,
    lastLayer: -99,
    routes: 0,
    gates: 0,
    bonus: 0,
    airEarned: 0,
  };
}
export function chainAction(state, kind, time, distance) {
  if (time - state.last < 0.22 || distance - state.lastD < 5) return false;
  if (time - state.last > 6) {
    state.chain = 0;
    state.pending = 0;
  }
  state.chain = Math.min(12, state.chain + 1);
  state.best = Math.max(state.best, state.chain);
  state.pending = Math.min(500, state.pending + 15 + state.chain * 5);
  state.last = time;
  state.lastD = distance;
  state.lastKind = kind;
  return true;
}
export function bankChain(state, time, safe) {
  if (time - state.last > 6) state.chain = state.pending = 0;
  if (!safe || !state.chain) return null;
  const result = { points: state.pending, air: Math.min(70, state.chain * 10), count: state.chain };
  state.banked++;
  state.chain = state.pending = 0;
  state.last = time;
  return result;
}
export function beatAction(state, action, beat, time, distance, offset = 0) {
  if (state.beatStep && time > state.beatUntil) state.beatStep = 0;
  if (!beat || !Number.isFinite(beat.since) || !Number.isFinite(beat.period) || beat.period <= 0)
    return null;
  const phase = (((beat.since - offset) % beat.period) + beat.period) % beat.period;
  const close = Math.min(phase, beat.period - phase) <= Math.min(0.115, beat.period * 0.23);
  if (!close || time - state.lastBeat < 0.18 || distance - state.lastBeatD < 4) {
    if (action === "land") state.beatStep = 0;
    return null;
  }
  state.lastBeat = time;
  state.lastBeatD = distance;
  state.beatHits++;
  if (action === "jump") state.beatStep = 1;
  else if (action === "trick" && state.beatStep === 1) state.beatStep = 2;
  else if (action === "land" && state.beatStep === 2) {
    state.beatStep = 0;
    state.phrases++;
    state.layerUntil = time + beat.period * 16;
    return { points: 120, air: 35, phrase: true };
  } else if (action === "land") state.beatStep = 0;
  state.beatUntil = time + beat.period * 16;
  state.layerUntil = Math.max(state.layerUntil, time + beat.period * 4);
  return { points: 20, air: 6, phrase: false };
}

export function landingRisk(player, cars, remaining) {
  const time = clamp(remaining, 0, 2.5);
  const laneT = Math.min(1, (player.laneT ?? 1) + time / Math.max(0.01, player.laneDur || 0.2));
  const ease = 1 - (1 - laneT) ** 4 * (1 + 2 * laneT);
  const x =
    (player.laneFrom ?? player.x) +
    (player.lanes[player.lane] - (player.laneFrom ?? player.x)) * ease;
  const car = cars.find(
    (c) =>
      !c.dead &&
      !c.passed &&
      (c.yMin || 0) < 1.4 &&
      Math.abs(c.z + Math.max(0, player.speed - (c.ownSpeed || 0)) * time) < (c.hl || 2.4) + 2.7 &&
      x > Math.min(c.x, c.laneChange?.to ?? c.x) - (c.hw || 1) - 1.05 &&
      x < Math.max(c.x, c.laneChange?.to ?? c.x) + (c.hw || 1) + 1.05,
  );
  return { blocked: !!car, x, time };
}
