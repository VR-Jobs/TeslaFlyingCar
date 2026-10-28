const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (u) => {
  u = clamp(u, 0, 1);
  return u * u * u * (10 + u * (-15 + 6 * u));
};
const derivative = (u) => 30 * u * u * (1 - u) * (1 - u);

// Integrate a unit-speed, eased heading rather than moving a flat arc onto a
// slope. Entry/exit tangent, curvature and bank all agree with adjoining decks.
export function createSpatialCurve(length, { yaw = 0, bank = 0, rise = 0 } = {}) {
  if (!(length > 0) || ![length, yaw, bank, rise].every(Number.isFinite))
    throw new Error("Invalid spatial curve");
  if (Math.abs(rise) * 1.875 >= length * 0.7) throw new Error("Spatial grade is too steep");
  const steps = Math.ceil(length / 1.5),
    h = length / steps;
  const positions = new Float64Array((steps + 1) * 3);
  function direction(s) {
    const u = clamp(s / length, 0, 1),
      angle = yaw * ease(u);
    const vertical = (rise / length) * derivative(u);
    const horizontal = Math.sqrt(1 - vertical * vertical);
    return [Math.sin(angle) * horizontal, vertical, Math.cos(angle) * horizontal];
  }
  for (let i = 0; i < steps; i++) {
    const a = direction(i * h),
      m = direction((i + 0.5) * h),
      b = direction((i + 1) * h);
    for (let k = 0; k < 3; k++)
      positions[(i + 1) * 3 + k] = positions[i * 3 + k] + (h / 6) * (a[k] + 4 * m[k] + b[k]);
  }
  positions[steps * 3 + 1] = rise;
  return function sample(distance) {
    const s = clamp(distance, 0, length),
      u = s / length;
    const i = Math.min(steps - 1, Math.floor(s / h)),
      q = (s - i * h) / h;
    const q2 = q * q,
      q3 = q2 * q,
      a = direction(i * h),
      b = direction((i + 1) * h);
    const p = [0, 0, 0];
    for (let k = 0; k < 3; k++)
      p[k] =
        (2 * q3 - 3 * q2 + 1) * positions[i * 3 + k] +
        (q3 - 2 * q2 + q) * h * a[k] +
        (-2 * q3 + 3 * q2) * positions[(i + 1) * 3 + k] +
        (q3 - q2) * h * b[k];
    const t = direction(s),
      angle = yaw * ease(u),
      vertical = t[1];
    const horizontal = Math.sqrt(1 - vertical * vertical);
    const baseRight = [Math.cos(angle), 0, -Math.sin(angle)];
    const baseUp = [-Math.sin(angle) * vertical, horizontal, -Math.cos(angle) * vertical];
    const tilt = bank * ease(Math.min(u, 1 - u) / 0.22);
    const up = baseUp.map((v, k) => v * Math.cos(tilt) + baseRight[k] * Math.sin(tilt));
    const signedCurvature = (yaw / length) * derivative(u) * horizontal;
    const gradeChange = (rise / (length * length)) * 60 * u * (1 - u) * (1 - 2 * u);
    return {
      p,
      t,
      up,
      bank: tilt,
      signedCurvature,
      curvature: Math.hypot(signedCurvature, gradeChange / horizontal),
      steering: true,
    };
  };
}
