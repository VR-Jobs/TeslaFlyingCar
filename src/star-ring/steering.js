import { clamp } from "./course.js";

// Keyboard and touch hold the same continuous steering state. The old discrete
// left/right commands remain available for the deterministic route pilot.
export function directionCommand(run, event) {
  const match = /^(left|right)(Press|Release)$/.exec(event);
  if (!match) return null;
  run.input[match[1]] = match[2] === "Press";
  if (match[2] === "Release" || run.attached) return true;
  return match[1]; // Airborne presses still trigger the original barrel roll.
}

export function stepSteering(run, course, frame, dt, suction) {
  const axis = +!!run.input.right - +!!run.input.left;
  const limit = course.laneLimit ?? 3.2;
  if (axis) run.targetLane = clamp(run.targetLane + axis * 3.8 * dt, -limit, limit);
  // Suction suppresses outward slip. The residual is bounded by the same lane
  // controller, so a visible safe lane remains a valid route through traffic.
  const active = !!frame.steering && !run.routeId && !run.tutorial?.active;
  const signed = active ? frame.signedCurvature || 0 : 0;
  const load = clamp(-signed * run.speed * run.speed * 0.12, -2.2, 2.2);
  const drift = load * (suction ? 0.26 : 1);
  const follow = active ? (suction ? 3 : 1.2) : 10;
  const previous = run.lane;
  run.lane += (run.targetLane - run.lane) * (1 - Math.exp(-follow * dt)) + drift * dt;
  run.lane = clamp(run.lane, -(course.width / 2 - 1.08), course.width / 2 - 1.08);
  run.steering = {
    active,
    axis,
    drift,
    velocity: (run.lane - previous) / Math.max(0.0001, dt),
    direction: Math.sign(signed),
    bank: frame.bank || 0,
  };
}

export function curveCameraUp(frame, motion = 1) {
  if (!frame.steering) return frame.up;
  const tangent = frame.t,
    y = tangent[1];
  const horizon = [-tangent[0] * y, 1 - y * y, -tangent[2] * y];
  const length = Math.hypot(...horizon);
  if (length < 0.01) return frame.up;
  const follow = clamp(motion, 0, 1) * 0.7;
  const up = horizon.map((v, i) => (v / length) * (1 - follow) + frame.up[i] * follow);
  const n = Math.hypot(...up);
  return up.map((v) => v / n);
}
