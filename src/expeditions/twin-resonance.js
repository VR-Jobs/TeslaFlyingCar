import { base, tick, emit, award, finish, hit, clamp, hash, crosses, wrap } from "./core.js";
export function pairGate(r, index = r.gate) {
  const types = ["pinch", "spread", "horizontal", "vertical"];
  return {
    index,
    s: 160 + index * 175,
    type: types[(index + Math.floor(hash(r.seed, index, 19) * 3)) % 4],
  };
}
export function pairPositions(r) {
  const x = (Math.cos(r.angle) * r.separation) / 2,
    y = (Math.sin(r.angle) * r.separation) / 2;
  return [
    { x: r.x + x, y: 6 + y, s: r.s },
    { x: r.x - x, y: 6 - y, s: r.s },
  ];
}
export function pairFits(r, g = pairGate(r)) {
  const a = pairPositions(r);
  if (g.type === "pinch") return r.separation < 5.1;
  if (g.type === "spread") return r.separation > 9.2;
  if (g.type === "horizontal") return a.every((p) => Math.abs(p.y - 6) < 2.25);
  return a.every((p) => Math.abs(p.x) < 2.25);
}
export const twinResonance = {
  create(seed) {
    const r = base("twinResonance", seed);
    r.goal = 12;
    r.gate = 0;
    r.passed = 0;
    r.separation = 7;
    r.separationV = 0;
    r.angle = Math.PI / 2;
    r.angularV = 0;
    r.y = 6;
    return r;
  },
  step(r, dt) {
    if (!tick(r, dt, 120)) return;
    const old = r.s;
    const desired = r.input.suction ? 3.8 : r.input.jump ? 11.5 : 7;
    r.separationV += ((desired - r.separation) * 16 - r.separationV * 7) * dt;
    r.separation = clamp(r.separation + r.separationV * dt, 3.1, 12.5);
    const turn = Number(r.input.right) - Number(r.input.left);
    r.angularV += (turn * 1.7 - r.angularV) * (1 - Math.exp(-7 * dt));
    r.angle = wrap(r.angle + r.angularV * dt);
    r.roll = r.angle - Math.PI / 2;
    r.speed = 24;
    r.s += r.speed * dt;
    r.energy = clamp(r.energy + (r.input.jump ? -4 : r.input.suction ? -2 : 6) * dt, 0, 100);
    if (r.energy < 1) {
      r.input.jump = false;
      r.input.suction = false;
    }
    const gate = pairGate(r);
    if (crosses(old, r.s, gate.s)) {
      if (pairFits(r, gate)) {
        r.passed++;
        r.metric = r.passed;
        award(r, 180);
        emit(r, "checkpoint");
        if (r.passed >= r.goal) finish(r);
      } else hit(r, "pair");
      r.gate++;
    }
  },
  pilot(r) {
    const gate = pairGate(r);
    r.input.suction = gate.type === "pinch";
    r.input.jump = gate.type === "spread";
    const target = gate.type === "horizontal" ? 0 : Math.PI / 2;
    const err = wrap(target - r.angle);
    r.input.right = err > 0.035;
    r.input.left = err < -0.035;
  },
  hud(r) {
    const gate = pairGate(r),
      names = {
        pinch: ["收拢双车", "Compress the pair"],
        spread: ["撑开双车", "Expand the pair"],
        horizontal: ["横向并排", "Rotate horizontally"],
        vertical: ["上下排列", "Rotate vertically"],
      };
    return {
      status: names[gate.type],
      detail: [
        `共振门 ${r.passed} / ${r.goal} · 距离 ${Math.max(0, Math.ceil(gate.s - r.s))} m`,
        `Gates ${r.passed} / ${r.goal} · ${Math.max(0, Math.ceil(gate.s - r.s))} m ahead`,
      ],
      value: clamp((r.separation - 3.1) / 9.4, 0, 1),
    };
  },
};
