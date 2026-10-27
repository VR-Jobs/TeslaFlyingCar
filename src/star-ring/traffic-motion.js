import { clamp, add, mul, norm, cross } from "./course.js";
function state(run, course) {
  const key = course.id ?? "baseline";
  if (!run.trafficState || run.trafficState.key !== key)
    run.trafficState = {
      key,
      cells: new Map(),
      poses: new Map(),
      nearMiss: new Set(),
      passes: run.trafficState?.passes || 0,
    };
  return run.trafficState;
}
const ease = (u) => u * u * u * (10 + u * (-15 + 6 * u));
export function stepTraffic(run, course, dt) {
  if (!course.voyage || run.tutorial?.active) return;
  const data = state(run, course);
  for (const cell of course.voyage.cells) {
    let c = data.cells.get(cell.id);
    if (!c && run.s >= cell.anchor - 95) {
      const front = course.hazards.find((h) => h.motion?.cellId === cell.id && h.motion.merge);
      const gap = front ? front.s - run.s : 0,
        needed = front
          ? Math.max(0, run.speed - front.motion.speed) *
              (front.motion.signal + front.motion.changeSeconds) +
            14
          : Infinity;
      c = { age: 0, merge: !!front && run.attached && !run.routeId && gap > needed };
      data.cells.set(cell.id, c);
      if (c.merge) run.events.push({ type: "trafficSignal" });
    }
    if (c) c.age += dt;
  }
  for (let i = 0; i < course.hazards.length; i++) {
    const h = course.hazards[i];
    if (!h.motion) continue;
    const c = data.cells.get(h.motion.cellId),
      age = c?.age || 0,
      m = h.motion;
    const travel = Math.min(
      m.maxTravel,
      m.speed * Math.max(0, age - 0.35 * (1 - Math.exp(-age / 0.35))),
    );
    const u = c?.merge && m.merge ? clamp((age - m.signal) / m.changeSeconds, 0, 1) : 0;
    const lane = h.lane + (m.laneTo - h.lane) * ease(u),
      active = u > 0 && u < 1;
    const v = active ? ((m.laneTo - h.lane) * 30 * u * u * (1 - u) * (1 - u)) / m.changeSeconds : 0;
    const yaw = clamp(Math.atan2(v, m.speed), -0.28, 0.28);
    const old = data.poses.get(i);
    data.poses.set(i, {
      s: h.s + travel,
      lane,
      travel,
      yaw,
      prevS: old?.s ?? h.s,
      prevLane: old?.lane ?? h.lane,
      prevYaw: old?.yaw || 0,
      signal:
        c?.merge && m.merge && age < m.signal + m.changeSeconds ? Math.sign(m.laneTo - h.lane) : 0,
      moving: !!c && travel < m.maxTravel - 0.01,
    });
  }
}
export function trafficPose(course, h, index, run, previous = false) {
  const p =
    run?.trafficState?.key === (course.id ?? "baseline") ? run.trafficState.poses.get(index) : null;
  if (!p) return { s: h.s, lane: h.lane, travel: 0, yaw: 0, signal: 0, moving: false };
  return previous ? { ...p, s: p.prevS, lane: p.prevLane, yaw: p.prevYaw } : p;
}
export function trafficFrame(course, p) {
  const f = course.pose(p.s, p.lane),
    t = norm(add(mul(f.t, Math.cos(p.yaw || 0)), mul(f.right, Math.sin(p.yaw || 0)))),
    right = norm(cross(t, f.up)),
    up = norm(cross(right, t));
  return { ...f, t, right, up };
}
export function stepNearMiss(run, course, previous) {
  if (!course.voyage || run.routeId || run.phase !== "running" || run.tutorial?.active) return;
  const data = state(run, course);
  for (let i = 0; i < course.hazards.length; i++) {
    const h = course.hazards[i];
    if (h.type !== "car" || run.hit.has(i) || data.nearMiss.has(i)) continue;
    const p = trafficPose(course, h, i, run),
      old = trafficPose(course, h, i, run, true);
    if (previous.s - old.s >= 4.9 || run.s - p.s < 4.9 || run.s - p.s > 9) continue;
    const f = course.pose(p.s, p.lane),
      d = run.pos.map((x, j) => x - f.p[j]);
    const x = Math.abs(d.reduce((n, v, j) => n + v * f.right[j], 0)),
      y = d.reduce((n, v, j) => n + v * f.up[j], 0);
    if (x > 2.14 && x < 3.55 && y > -0.25 && y < 1.3) {
      data.nearMiss.add(i);
      data.passes++;
      const air = x < 2.7 ? 12 : 8;
      run.pressure = clamp(run.pressure + air, 0, 100);
      run.score += 25 * ((run.rainbow?.remaining || 0) > 0 ? 2 : 1);
      run.voyageNotice = { text: "贴车超越 +" + air + "% 气量", until: run.time + 1.2 };
      run.events.push({ type: "nearMiss", air });
    }
  }
}
export function trafficStatus(run) {
  const s = run?.trafficState;
  return {
    activeCells: s?.cells.size || 0,
    moving: s ? [...s.poses.values()].filter((p) => p.moving).length : 0,
    signaling: s ? [...s.poses.values()].filter((p) => p.signal).length : 0,
    nearMisses: s?.passes || 0,
  };
}
