import { I as Color } from "../vendor/rendering.js";
import { createExhaustWake } from "./exhaust-wake.js";
import { rainbowActive } from "./rainbow-rules.js";
export const RAINBOW_RGB = [
  [1, 0.13, 0.28],
  [1, 0.56, 0.08],
  [1, 0.94, 0.18],
  [0.12, 1, 0.5],
  [0.13, 0.66, 1],
  [0.65, 0.2, 1],
];
export function createRainbowView(scene, car, materials, glow, noise = null) {
  const wake = createExhaustWake(scene, noise),
    group = wake.group;
  const original = Object.fromEntries(
    ["body", "wing"].map((k) => [
      k,
      {
        color: materials[k].color.clone(),
        emissive: materials[k].emissive.clone(),
        intensity: materials[k].emissiveIntensity,
      },
    ]),
  );
  let wasActive = false;
  const tint = new Color();
  function capture() {
    for (const key of ["body", "wing"]) {
      original[key].color.copy(materials[key].color);
      original[key].emissive.copy(materials[key].emissive);
      original[key].intensity = materials[key].emissiveIntensity;
    }
  }
  function restore() {
    for (const key of ["body", "wing"]) {
      materials[key].color.copy(original[key].color);
      materials[key].emissive.copy(original[key].emissive);
      materials[key].emissiveIntensity = original[key].intensity;
    }
  }
  function reset() {
    wake.reset();
    if (wasActive) restore();
    wasActive = false;
  }
  return {
    group,
    reset,
    update(run, time, reduced = false, pixel = 1, near = null, detail = 1) {
      const active = rainbowActive(run);
      if (active) {
        if (!wasActive) {
          capture();
          wasActive = true;
        }
        tint.setHSL(reduced ? 0.12 : (time * 0.15) % 1, 0.85, 0.55);
        materials.body.emissive.copy(tint);
        materials.body.color.copy(original.body.color).lerp(tint, 0.35);
        materials.body.emissiveIntensity = 0.65;
        materials.wing.emissive.copy(tint);
        materials.wing.color.copy(original.wing.color).lerp(tint, 0.35);
        materials.wing.emissiveIntensity = 0.7;
      } else if (wasActive) {
        restore();
        wasActive = false;
      }
      wake.update(run, car, time, active, reduced, pixel, near, detail);
      if (run.phase !== "running" && wasActive) {
        restore();
        wasActive = false;
      }
    },
    status: () => ({ ...wake.status(), blackGlassPreserved: true }),
  };
}
