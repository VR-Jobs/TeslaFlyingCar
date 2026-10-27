import { resetRainbow } from "./rainbow-rules.js";
import { add, mul } from "./course.js";
export const DEATH_DURATION = 2.3;
export function beginDeath(run, course, reason = "未能接轨") {
  if (run.phase === "dying" || run.phase === "dead" || run.phase === "finished") return false;
  const f = course.pose(run.s, run.lane);
  const velocity = run.attached ? mul(f.t, run.speed) : [...run.velocity];
  run.death = {
    elapsed: 0,
    duration: DEATH_DURATION,
    reason,
    origin: [...run.pos],
    velocity,
    up: [...f.up],
    right: [...f.right],
    tangent: [...f.t],
    roll: run.roll || 0,
    pitch: run.pitch || 0,
    side: run.driftSign || 1,
  };
  run.bestDistance = Math.max(run.bestDistance, (run.completedDistance || 0) + run.s);
  run.distance = (run.completedDistance || 0) + run.s;
  if (run.escort) {
    run.escort.count = 0;
    run.escort.waves = [];
  }
  resetRainbow(run);
  run.phase = "dying";
  run.attached = false;
  run.falls++;
  run.penalty += 4;
  run.combo = 0;
  run.gripWarningLevel = 0;
  run.rollProgress = run.flipProgress = 0;
  run.feedback = "";
  run.feedbackTime = run.messageTime = 0;
  run.input.jump = run.input.boost = run.input.suction = false;
  run.events.push({ type: "death", reason });
  return true;
}
export function stepDeath(run, dt) {
  if (!run.death || run.phase !== "dying") return;
  const d = run.death;
  d.elapsed = Math.min(d.duration, d.elapsed + dt);
  const t = d.elapsed;
  run.pos = add(
    d.origin,
    add(
      mul(d.velocity, t * 0.82),
      add(mul(d.up, 5 * t + 3.2 * t * t), mul(d.right, d.side * (2 * t + 1.2 * t * t))),
    ),
  );
  if (d.elapsed >= d.duration) {
    run.phase = "dead";
    run.events.push({ type: "deathComplete" });
  }
}
export function deathFrame(run) {
  if (!run.death)
    return { active: false, progress: 0, gray: 0, pitch: run.pitch || 0, roll: run.roll || 0 };
  const d = run.death,
    p = Math.min(1, d.elapsed / d.duration),
    ease = p * p * (3 - 2 * p);
  return {
    active: true,
    progress: p,
    gray: Math.max(0, Math.min(1, (p - 0.15) / 0.65)),
    pitch: d.pitch + ease * 2.3,
    roll: d.roll + d.side * ease * 3.4,
    yaw: d.side * ease * 0.5,
  };
}
