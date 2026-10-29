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
  vertical,
  crosses,
} from "./core.js";
export const ECHO_LENGTH = 360;
export function switches(r) {
  return [120, 248].map((s, i) => ({
    s,
    index: i,
    lane: (i % 2 ? 1 : -1) * (hash(r.seed, r.circuit, 31) > 0.5 ? 1 : -1),
    ghostLane: (i % 2 ? 1 : -1) * (hash(r.seed, r.circuit, 31) > 0.5 ? 1 : -1),
  }));
}
export function echoSample(r, time = r.lapTime) {
  const a = r.record;
  if (!a.length) return null;
  let low = 0,
    high = a.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (a[mid].t <= time) low = mid;
    else high = mid - 1;
  }
  const first = a[low],
    next = a[Math.min(a.length - 1, low + 1)],
    f = clamp((time - first.t) / Math.max(0.001, next.t - first.t), 0, 1);
  return {
    s: first.s + (next.s - first.s) * f,
    x: first.x + (next.x - first.x) * f,
    y: first.y + (next.y - first.y) * f,
    yaw: (first.yaw || 0) + ((next.yaw || 0) - (first.yaw || 0)) * f,
    roll: (first.roll || 0) + ((next.roll || 0) - (first.roll || 0)) * f,
  };
}
export const timeEcho = {
  create(seed) {
    const r = base("timeEcho", seed);
    r.goal = 3;
    r.circuit = 0;
    r.lap = "record";
    r.lapTime = 0;
    r.sampleAt = 0;
    r.record = [];
    r.switches = [false, false];
    r.opened = [false, false];
    r.lane = 0;
    r.distance = 0;
    return r;
  },
  press(r, action, down) {
    if (action === "left" && down) r.lane = clamp(r.lane - 1, -1, 1);
    if (action === "right" && down) r.lane = clamp(r.lane + 1, -1, 1);
    if (action === "jump" && down) jump(r, 7);
  },
  step(r, dt) {
    if (!tick(r, dt, 180)) return;
    const old = r.s;
    r.lapTime += dt;
    steer(r, r.lane * 4, dt, 12, 9);
    r.speed = r.input.suction ? 10 : r.input.boost && r.energy > 0 ? 30 : 22;
    r.energy = clamp(r.energy + (r.input.boost ? -8 : 4) * dt, 0, 100);
    r.s += r.speed * dt;
    r.distance += r.speed * dt;
    vertical(r, dt);
    if (r.lap === "record" && r.lapTime >= r.sampleAt) {
      r.sampleAt += 0.06;
      r.record.push({
        t: r.lapTime,
        s: r.s,
        x: r.x,
        y: r.y,
        yaw: Math.atan2(r.vx, r.speed),
        roll: -r.vx * 0.018,
      });
      if (r.record.length > 900) {
        fail(r, "timeout");
        return;
      }
    }
    const ghost = r.lap === "echo" ? echoSample(r) : null;
    for (const gate of switches(r)) {
      if (r.lap === "record" && crosses(old, r.s, gate.s))
        r.switches[gate.index] = Math.abs(r.x - gate.lane * 4) < 2.2 && r.y < 0.5;
      if (
        r.lap === "echo" &&
        !r.opened[gate.index] &&
        Math.abs(r.s - gate.s) < 15 &&
        ghost &&
        Math.abs(ghost.s - gate.s) < 15 &&
        Math.abs(ghost.x - gate.lane * 4) < 2.2 &&
        Math.abs(r.x + gate.lane * 4) < 2.2 &&
        r.y < 0.8 &&
        ghost.y < 0.8
      ) {
        r.opened[gate.index] = true;
        award(r, 300);
        emit(r, "gate");
      }
      if (r.lap === "echo" && crosses(old, r.s, gate.s + 15) && !r.opened[gate.index])
        fail(r, "echo");
    }
    if (r.s >= ECHO_LENGTH && r.phase === "running") {
      if (r.lap === "record") {
        if (!r.switches.every(Boolean)) {
          fail(r, "record");
          return;
        }
        r.lap = "echo";
        emit(r, "checkpoint");
        emit(r, "echoReady");
      } else {
        r.circuit++;
        r.metric = r.circuit;
        award(r, 500);
        if (r.metric >= r.goal) {
          finish(r);
          if (r.phase === "finished") return;
        }
        r.lap = "record";
        r.record = [];
        r.switches = [false, false];
        r.opened = [false, false];
        emit(r, "checkpoint");
      }
      r.s = 0;
      r.x = 0;
      r.vx = 0;
      r.y = 0;
      r.vy = 0;
      r.lane = 0;
      r.lapTime = 0;
      r.sampleAt = 0;
    }
  },
  pilot(r) {
    const next = switches(r).find((g) => r.s < g.s + 18) || switches(r)[1];
    r.lane = (r.lap === "record" ? 1 : -1) * next.lane;
    r.input.suction = false;
    r.input.boost = false;
  },
  hud(r) {
    const n = switches(r).find((g) => r.s < g.s + 15);
    return {
      status:
        r.lap === "record"
          ? ["录制圈 · 跟随蓝灯压过机关", "Recording lap · Follow blue switches"]
          : ["回声圈 · 金色路线属于现在的你", "Replay lap · Gold marks your current route"],
      detail: [
        `协作 ${r.circuit} / ${r.goal} · ${n ? Math.max(0, Math.ceil(n.s - r.s)) + " m 到机关" : "驶向下一圈"}`,
        `Circuits ${r.circuit} / ${r.goal} · ${n ? Math.max(0, Math.ceil(n.s - r.s)) + " m to switch" : "Next lap"}`,
      ],
      value: r.s / ECHO_LENGTH,
    };
  },
};
