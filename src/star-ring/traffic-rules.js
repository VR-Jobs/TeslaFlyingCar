import { dot, sub } from "./course.js";
import { carProbePoints } from "./track-surface.js";
import { trafficPose, trafficFrame } from "./traffic-motion.js";

export const TRAFFIC_CAR = { halfWidth: 1.06, halfLength: 2.35, height: 1.25, rideHeight: 0.035 };
function bounds(points, frame) {
  const min = [Infinity, Infinity, Infinity],
    max = [-Infinity, -Infinity, -Infinity];
  for (const { p } of points) {
    const d = sub(p, frame.p),
      v = [dot(d, frame.right), dot(d, frame.up), dot(d, frame.t)];
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], v[k]);
      max[k] = Math.max(max[k], v[k]);
    }
  }
  return { center: min.map((v, k) => (v + max[k]) / 2), half: min.map((v, k) => (max[k] - v) / 2) };
}
// Sweep the rotated player envelope in the obstacle's actual track frame.
// Looking only at lane/distance would miss side contacts, roof hits and fast passes.
export function sweepTrafficCars(course, previous, run) {
  let a, b;
  let nearest = null;
  for (let index = 0; index < course.hazards.length; index++) {
    const h = course.hazards[index],
      p = trafficPose(course, h, index, run),
      old = trafficPose(course, h, index, run, true);
    if (
      h.type !== "car" ||
      run.hit?.has(index) ||
      Math.max(p.s, old.s) < Math.min(previous.s, run.s) - 14 ||
      Math.min(p.s, old.s) > Math.max(previous.s, run.s) + 14
    )
      continue;
    a ||= carProbePoints(course, previous);
    b ||= carProbePoints(course, run);
    const f = trafficFrame(course, p),
      from = bounds(a, trafficFrame(course, old)),
      to = bounds(b, f);
    const low = [-TRAFFIC_CAR.halfWidth, TRAFFIC_CAR.rideHeight, -TRAFFIC_CAR.halfLength];
    const high = [
      TRAFFIC_CAR.halfWidth,
      TRAFFIC_CAR.height + TRAFFIC_CAR.rideHeight,
      TRAFFIC_CAR.halfLength,
    ];
    let enter = 0,
      exit = 1,
      axis = 2,
      sign = -1,
      valid = true;
    for (let k = 0; k < 3; k++) {
      const radius = Math.max(from.half[k], to.half[k]) + 0.025;
      const lo = low[k] - radius,
        hi = high[k] + radius,
        v = to.center[k] - from.center[k],
        p = from.center[k];
      if (Math.abs(v) < 1e-9) {
        if (p < lo || p > hi) {
          valid = false;
          break;
        }
        continue;
      }
      let t0 = (lo - p) / v,
        t1 = (hi - p) / v,
        n = -Math.sign(v);
      if (t0 > t1) [t0, t1] = [t1, t0];
      if (t0 > enter) {
        enter = t0;
        axis = k;
        sign = n;
      }
      exit = Math.min(exit, t1);
      if (enter > exit) {
        valid = false;
        break;
      }
    }
    if (valid && exit >= 0 && enter <= 1 && (!nearest || enter < nearest.time))
      nearest = {
        index,
        time: Math.max(0, enter),
        normal: [f.right, f.up, f.t][axis].map((v) => v * sign),
      };
  }
  return nearest;
}
