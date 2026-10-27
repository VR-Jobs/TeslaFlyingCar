import { clamp } from "./course.js";
export const GRIP = {
  curveThreshold: 3.6,
  bankThreshold: 0.91,
  warningSeconds: 1.25,
  recoverySeconds: 0.9,
};
export function requiresSuction(frame, speed) {
  return frame.up[1] < GRIP.bankThreshold || frame.curvature * speed * speed > GRIP.curveThreshold;
}
export function updateGrip(run, frame, dt) {
  const needed = requiresSuction(frame, run.speed),
    active = (run.input.suction || (run.rainbow?.remaining || 0) > 0) && run.pressure > 0;
  run.gripRequired = needed;
  if (!needed || active) {
    run.gripStress = Math.max(0, (run.gripStress || 0) - dt * (active ? 4.5 : 2));
    run.gripWarningLevel = run.gripStress;
    run.gripWarningReason = null;
    return false;
  }
  const duration = run.assist ? GRIP.warningSeconds : 0.95;
  run.gripStress = clamp((run.gripStress || 0) + dt / duration, 0, 1);
  run.gripWarningLevel = run.gripStress;
  run.gripWarningReason = run.pressure <= 0 ? "air" : "hold";
  if (run.gripStress > 0.12 && run.time >= (run.gripNextTone || 0)) {
    run.events.push({ type: "gripWarning", level: run.gripStress, reason: run.gripWarningReason });
    run.gripNextTone = run.time + (run.gripStress > 0.65 ? 0.32 : 0.55);
  }
  return run.gripStress >= 1;
}
export const spinEase = (p) => {
  p = clamp(p, 0, 1);
  return p * p * p * (10 + p * (-15 + 6 * p));
};
