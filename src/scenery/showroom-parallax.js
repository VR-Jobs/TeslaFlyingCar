import { P as Vector3 } from "../vendor/rendering.js";

// A shallow camera orbit produces depth parallax without rotating the car.
export function installShowroomParallax(showroom, isHome) {
  const menu = document.getElementById("menu"),
    reducedMotion = matchMedia("(prefers-reduced-motion: reduce)"),
    direction = new Vector3(),
    focus = new Vector3();
  let x = 0,
    y = 0,
    targetX = 0,
    targetY = 0;
  const center = () => {
    targetX = targetY = 0;
  };
  menu.addEventListener(
    "pointermove",
    (event) => {
      if (!isHome() || showroom.inspecting || reducedMotion.matches) return;
      targetX = Math.max(-1, Math.min(1, (event.clientX / innerWidth) * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY / innerHeight) * 2 - 1));
    },
    { passive: true },
  );
  // Retain native button actions and garage controls; the home image follows
  // pointer motion rather than grabbing the car for an unrestricted orbit.
  menu.addEventListener(
    "pointerdown",
    (event) => {
      if (
        isHome() &&
        !showroom.inspecting &&
        !event.target.closest("button,a,input,select,textarea,label,summary")
      )
        event.stopImmediatePropagation();
    },
    true,
  );
  menu.addEventListener("pointerleave", center);
  menu.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse") center();
  });
  menu.addEventListener("pointercancel", center);
  addEventListener("blur", center);
  reducedMotion.addEventListener("change", center);
  return {
    update(dt) {
      if (
        !isHome() ||
        showroom.inspecting ||
        reducedMotion.matches ||
        showroom.presentation?.testing
      )
        center();
      const blend = 1 - Math.exp(-6 * Math.max(0, Math.min(0.1, dt)));
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
    },
    apply() {
      if (showroom.inspecting || reducedMotion.matches) return;
      const camera = showroom.camera;
      camera.getWorldDirection(direction);
      focus
        .copy(camera.position)
        .addScaledVector(direction, showroom.camBase.pos.distanceTo(showroom.camBase.target));
      const strength = showroom.motionPreferences?.parallax ?? 1;
      camera.translateX(x * 0.26 * strength);
      camera.translateY(-y * 0.11 * strength);
      camera.lookAt(focus);
      camera.rotateZ(-x * 0.005 * strength);
    },
    reset() {
      x = y = targetX = targetY = 0;
    },
    status: () => ({
      x,
      y,
      targetX,
      targetY,
      shiftX: x * 0.26 * (showroom.motionPreferences?.parallax ?? 1),
      shiftY: -y * 0.11 * (showroom.motionPreferences?.parallax ?? 1),
      roll: -x * 0.005 * (showroom.motionPreferences?.parallax ?? 1),
      reducedMotion: reducedMotion.matches,
    }),
  };
}
