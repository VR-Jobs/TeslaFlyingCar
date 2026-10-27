export const SHOWROOM_DURATIONS = { frontflip: 5.2, barrel: 4.8, hover: 4.6 };
const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => {
  const x = clamp(value);
  return clamp(x * x * x * (10 + x * (-15 + 6 * x)));
};
function curve(p, keys) {
  for (let i = 1; i < keys.length; i++) {
    const [end, value] = keys[i],
      [start, previous] = keys[i - 1];
    if (p <= end) return previous + (value - previous) * smooth((p - start) / (end - start));
  }
  return keys.at(-1)[1];
}

// Powered flight: build thrust, rise, rotate at altitude, brake upright, then
// settle on the wheels. Every flight segment has zero endpoint acceleration.
export function sampleShowroomMotion(kind, progress, duration = SHOWROOM_DURATIONS[kind], dir = 1) {
  const p = clamp(progress),
    peak = kind === "frontflip" ? 2.65 : kind === "barrel" ? 1.65 : 0.95;
  const height = curve(p, [
    [0, 0],
    [0.1, 0],
    [0.34, peak * 0.94],
    [0.5, peak],
    [0.64, peak * 0.94],
    [0.84, 0],
    [1, 0],
  ]);
  const spinT = clamp((p - 0.3) / 0.36),
    spin = smooth(spinT);
  const power = curve(p, [
    [0, 0],
    [0.055, 0.22],
    [0.13, 1],
    [0.29, 0.84],
    [0.39, 0.57],
    [0.59, 0.48],
    [0.7, 0.83],
    [0.78, 0.96],
    [0.84, 0.4],
    [0.91, 0],
    [1, 0],
  ]);
  const timeAfterContact = Math.max(0, (p - 0.84) * duration);
  const compression =
    p >= 0.84 && p < 1
      ? -0.065 * Math.exp(-9 * timeAfterContact) * Math.sin(18 * timeAfterContact)
      : 0;
  const preload = p < 0.1 ? -0.026 * Math.sin((Math.PI * p) / 0.1) ** 2 : 0;
  const phase =
    p >= 1
      ? "idle"
      : p < 0.1
        ? "preload"
        : p < 0.3
          ? "takeoff"
          : p < 0.64
            ? kind === "hover"
              ? "hover"
              : "flip"
            : p < 0.84
              ? "air-brake"
              : "settle";
  const liftEnvelope = smooth((p - 0.1) / 0.2) * (1 - smooth((p - 0.64) / 0.2));
  return {
    phase,
    progress: p,
    height,
    power,
    pitch: kind === "frontflip" && p < 1 ? -Math.PI * 2 * spin : 0,
    roll: kind === "barrel" && p < 1 ? Math.PI * 2 * spin * dir : 0,
    suspension: preload + compression,
    bodyPitch: compression * 0.14,
    wing: smooth((p - 0.07) / 0.16) * (1 - smooth((p - 0.76) / 0.19)),
    camera: liftEnvelope * (kind === "hover" ? 0.25 : kind === "barrel" ? 0.75 : 1),
    audio: {
      phase,
      hover:
        power *
        curve(p, [
          [0, 0.5],
          [0.13, 0.75],
          [0.3, 0.7],
          [0.39, 0.42],
          [0.59, 0.42],
          [0.7, 0.75],
          [1, 0.75],
        ]),
      thrust:
        power *
        curve(p, [
          [0, 0.37],
          [0.1, 0.62],
          [0.29, 0.62],
          [0.39, 0.37],
          [0.59, 0.37],
          [0.7, 0.62],
          [0.84, 0.4],
          [1, 0.37],
        ]),
      spin: kind === "hover" ? 0 : Math.sin(Math.PI * spinT) ** 2,
    },
  };
}

export function installShowroomMotion(showroom) {
  const bodyY = showroom.car.body.position.y,
    bodyPitch = showroom.car.body.rotation.x;
  let active = null,
    touched = false,
    frame = sampleShowroomMotion("hover", 1),
    landings = 0;
  const nativeStart = showroom.startDemo;
  showroom.startDemo = function () {
    nativeStart.call(this);
    this.demo.duration = SHOWROOM_DURATIONS[this.demo.kind];
  };
  return {
    apply(demo) {
      if (!demo) {
        active = null;
        touched = false;
        frame = sampleShowroomMotion("hover", 1);
      } else {
        if (active !== demo) {
          active = demo;
          touched = false;
        }
        frame = sampleShowroomMotion(demo.kind, demo.t / demo.duration, demo.duration, demo.dir);
      }
      const impact = !!demo && !touched && frame.progress >= 0.84;
      if (impact) {
        touched = true;
        landings++;
      }
      showroom.lift.position.y = frame.height;
      showroom.stunt.rotation.set(frame.pitch, 0, frame.roll);
      showroom.car.body.position.y = bodyY + frame.suspension;
      showroom.car.body.rotation.x = bodyPitch + frame.bodyPitch;
      showroom.car.setWing(frame.wing);
      showroom.demoView = frame.camera;
      showroom.demoFocus = frame.height * 0.62;
      for (const id of ["L1", "L2", "L3", "L4", "S1", "S2"]) showroom.car.setNozzleGlow(id, 0);
      const level = frame.power * (0.97 + 0.03 * Math.sin(showroom.t * 43));
      const attitude =
        demo?.kind === "hover"
          ? 0
          : smooth((frame.progress - 0.29) / 0.06) * (1 - smooth((frame.progress - 0.61) / 0.06));
      const controls =
        demo?.kind === "frontflip"
          ? ["L3", "L4"]
          : demo?.dir > 0
            ? ["L1", "L3", "S2"]
            : ["L2", "L4", "S1"];
      for (const id of ["L1", "L2", "L3", "L4"])
        showroom.car.setNozzleGlow(id, level * (controls.includes(id) ? 1 : 1 - attitude));
      for (const id of ["S1", "S2"])
        if (controls.includes(id)) showroom.car.setNozzleGlow(id, level * attitude);
      return { ...frame, impact };
    },
    reset() {
      this.apply(null);
    },
    status: () => ({
      phase: frame.phase,
      progress: frame.progress,
      suspension: frame.suspension,
      power: frame.power,
      landings,
    }),
  };
}
