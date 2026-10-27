import { P as Vector3 } from "../vendor/rendering.js";
import { SHOWROOM_DURATIONS } from "./showroom-motion.js";

// Development regression: inspect every visible model vertex with the rendering
// library's transforms, independently of the runtime's deduplicated support data.
export function runShowroomChecks(showroom) {
  const keys = [
    "t",
    "demo",
    "demoIndex",
    "nextDemoT",
    "yaw",
    "yawVel",
    "idle",
    "pitch",
    "dragging",
    "inspecting",
  ];
  const saved = Object.fromEntries(keys.map((key) => [key, showroom[key]]));
  const setTime = showroom.set.t,
    point = new Vector3();
  const meshes = [];
  showroom.car.group.traverse((node) => {
    if (
      !node.isMesh ||
      !node.geometry?.attributes.position ||
      node.isInstancedMesh ||
      node.isSkinnedMesh
    )
      return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    if (!materials.every((material) => material.transparent)) meshes.push(node);
  });
  const cases = [],
    plane = 0.045,
    dt = 1 / 60;
  showroom.presentation.testing = true;
  try {
    showroom.dragging = showroom.inspecting = false;
    for (const [kind, dir] of [
      ["frontflip", 1],
      ["barrel", 1],
      ["barrel", -1],
      ["hover", 1],
    ]) {
      const duration = SHOWROOM_DURATIONS[kind];
      const dustBefore = showroom.presentation.landing.status().emitted;
      const phases = new Set();
      showroom.demo = { kind, dir, duration, t: 0 };
      showroom.nextDemoT = Infinity;
      // Start each sampled action at its own t=0 pose. The dashboard can invoke
      // this test during an airborne demo; that previous pose is not a frame
      // in this action and must not become its initial height delta.
      showroom.presentation.motion.reset();
      showroom.update(0);
      let minimumY = Infinity,
        maximumHeight = 0,
        peakRotation = 0,
        verticesChecked = 0,
        previousHeight = showroom.lift.position.y,
        maximumHeightStep = 0,
        suspensionMin = 0,
        suspensionMax = 0;
      for (let frame = 0; frame <= Math.ceil(duration / dt) + 2; frame++) {
        showroom.update(dt);
        maximumHeightStep = Math.max(
          maximumHeightStep,
          Math.abs(showroom.lift.position.y - previousHeight),
        );
        previousHeight = showroom.lift.position.y;
        const motion = showroom.presentation.motion.status();
        phases.add(motion.phase);
        suspensionMin = Math.min(suspensionMin, motion.suspension);
        suspensionMax = Math.max(suspensionMax, motion.suspension);
        showroom.car.group.updateWorldMatrix(true, true);
        for (const mesh of meshes) {
          if (!mesh.visible) continue;
          const position = mesh.geometry.attributes.position;
          for (let i = 0; i < position.count; i++) {
            point.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
            minimumY = Math.min(minimumY, point.y);
          }
          verticesChecked += position.count;
        }
        maximumHeight = Math.max(maximumHeight, showroom.lift.position.y);
        peakRotation = Math.max(
          peakRotation,
          Math.abs(showroom.stunt.rotation.x),
          Math.abs(showroom.stunt.rotation.z),
        );
      }
      const landed =
        !showroom.demo &&
        Math.abs(showroom.stunt.rotation.x) + Math.abs(showroom.stunt.rotation.z) < 1e-6;
      const dust = showroom.presentation.landing.status();
      const dustBursts = dust.emitted - dustBefore;
      for (let frame = 0; frame < 150; frame++) showroom.update(dt);
      const dustExpired = !showroom.presentation.landing.status().active;
      const cushioned = suspensionMin < -0.02 && suspensionMax > 0.001;
      cases.push({
        kind,
        dir,
        minimumY,
        plane,
        maximumHeight,
        peakRotation,
        landed,
        verticesChecked,
        phases: [...phases],
        suspensionMin,
        suspensionMax,
        cushioned,
        dustBursts,
        dustRadius: dust.maximumRadius,
        dustExpired,
        maximumHeightStep,
        status:
          minimumY >= plane - 1e-5 &&
          landed &&
          cushioned &&
          dustBursts === 1 &&
          dust.maximumRadius > 2 &&
          dustExpired &&
          maximumHeightStep < 0.2 &&
          (kind === "hover" || peakRotation > 6.2)
            ? "PASS"
            : "FAIL",
      });
    }
    return { status: cases.every((entry) => entry.status === "PASS") ? "PASS" : "FAIL", cases };
  } finally {
    Object.assign(showroom, saved);
    showroom.set.t = setTime;
    showroom.presentation.testing = false;
    showroom.presentation.motion.reset();
    showroom.presentation.landing.clear();
    // A neutral frame rebuilds matrices without leaving a test pose on screen.
    const demo = showroom.demo;
    showroom.demo = null;
    showroom.nextDemoT = Infinity;
    showroom.update(0);
    showroom.demo = demo;
    showroom.nextDemoT = saved.nextDemoT;
  }
}
