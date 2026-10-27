import MEDIUM from "../assets/roadster-driving-data.js";
import LOW from "../assets/roadster-distant-data.js";
import { createRoadsterExterior, installRoadsterExterior } from "./roadster-exterior.js";

export function installDrivingExterior(game) {
  const car = game.player.car;
  const medium = installRoadsterExterior({ car }, MEDIUM);
  const low = createRoadsterExterior(car.materials, LOW);
  car.body.add(low.slots.body, low.slots.wing, low.supports);
  for (const wheel of car.wheels) {
    const slot =
      low.slots[`wheel_${wheel.front ? "F" : "R"}${wheel.wheel.position.x < 0 ? "L" : "R"}`];
    slot.position.set(0, 0, 0);
    wheel.spin.add(slot);
  }
  const wing = car.setWing;
  car.setWing = function (v) {
    wing.call(this, v);
    low.setWing(v);
  };
  car.setWing(car.wingT || 0);
  let level = null;
  const visible = (asset, value) => {
    Object.values(asset.slots).forEach((slot) => {
      slot.visible = value;
    });
    asset.supports.visible = value;
  };
  const apply = game.player.applyVisual;
  game.player.applyVisual = function (...args) {
    const out = apply.apply(this, args);
    // Compress the sprung body while wheels retain their road contact height.
    const compression = this.grounded ? Math.max(-0.063, Math.min(0.036, this.susp * 0.6)) : 0;
    car.group.position.y = -0.55;
    car.body.position.y = compression;
    const next =
      (game.detail ?? 2) === 0 || game.camera.position.distanceTo(this.root.position) > 22
        ? "low"
        : "medium";
    if (next !== level) {
      level = next;
      visible(medium, next === "medium");
      visible(low, next === "low");
      car.presentationMeshes = (next === "medium" ? medium : low).meshes;
    }
    return out;
  };
  visible(medium, true);
  visible(low, false);
  level = "medium";
  return { status: () => ({ level, medium: medium.status(), low: low.status() }) };
}
