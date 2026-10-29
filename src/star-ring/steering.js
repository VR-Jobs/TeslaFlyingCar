import { add, sub, mul, dot, clamp } from "./course.js";
import { planetForSection } from "./planet-rules.js";

// The displayed destination controls difficulty, including endless section changes.
export function steeringProfile(run, course) {
  const planet = planetForSection(
    run.startPlanet || "earth",
    course.seed || 0,
    course.section ?? run.controlSection ?? 0,
  );
  return {
    planet: planet.id,
    mode: ["uranus", "neptune"].includes(planet.id) ? "continuous" : "fixed",
  };
}
export function snapToLane(run, course, target = run.targetLane) {
  const step = course.laneStep || 3.2,
    limit = course.laneLimit ?? 3.2;
  const lane = clamp(Math.round(target / step) * step, -limit, limit);
  if (run.attached) {
    const pose = course.pose(run.s, lane);
    run.pos = [...pose.p];
    run.velocity = mul(pose.t, run.speed);
  } else {
    const frame = course.frame(run.s);
    const lateral = dot(sub(run.pos, frame.p), frame.right);
    run.pos = add(run.pos, mul(frame.right, lane - lateral));
    run.velocity = sub(run.velocity, mul(frame.right, dot(run.velocity, frame.right)));
  }
  run.lane = run.targetLane = lane;
  run.near = null;
}
export function syncSteeringProfile(run, course) {
  const profile = steeringProfile(run, course),
    previous = run.controlMode;
  run.controlPlanet = profile.planet;
  run.controlSection = course.section ?? run.controlSection ?? 0;
  run.controlMode = profile.mode;
  if (previous && previous !== profile.mode) {
    run.input.left = run.input.right = false;
    if (profile.mode === "fixed" && !(run.adventure?.transfer && !run.attached))
      snapToLane(run, course);
  }
  return profile;
}
// A new press is one complete lane in easy worlds; holding only steers in hard worlds.
export function directionCommand(run, course, event) {
  const match = /^(left|right)(Press|Release)$/.exec(event);
  if (!match) return null;
  const profile = syncSteeringProfile(run, course);
  const down = match[2] === "Press",
    wasDown = run.input[match[1]];
  run.input[match[1]] = down;
  if (!down || wasDown) return true;
  if (profile.mode === "fixed") return match[1];
  if (run.attached) return true;
  return match[1]; // Airborne presses retain the original barrel roll.
}

export function stepSteering(run, course, frame, dt, suction) {
  const profile = syncSteeringProfile(run, course);
  const axis = +!!run.input.right - +!!run.input.left;
  if (profile.mode === "fixed") {
    const step = course.laneStep || 3.2,
      limit = course.laneLimit ?? 3.2;
    run.lane = run.targetLane = clamp(Math.round(run.targetLane / step) * step, -limit, limit);
    run.steering = {
      mode: "fixed",
      active: false,
      axis,
      drift: 0,
      velocity: 0,
      direction: 0,
      bank: frame.bank || 0,
    };
    return;
  }
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
    mode: "continuous",
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
