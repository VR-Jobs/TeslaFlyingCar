import {
  B as Group,
  R as Mesh,
  Lc as Instanced,
  pr as Object3D,
  _u as Torus,
  gu as Sphere,
  Fr as Basic,
  I as Color,
  Js as Scene,
  cn as Target,
} from "../vendor/rendering.js";

export function createOrbitView(scene) {
  const root = new Group();
  root.name = "Optional aerial reward lanes / pooled";
  scene.add(root);
  const frame = new Instanced(
    new Torus(1.3, 0.085, 8, 40),
    new Basic({ color: "#555b61", fog: true }),
    32,
  );
  const light = new Instanced(
    new Torus(1.31, 0.025, 6, 40),
    new Basic({ color: "#ffdc8a", toneMapped: false, transparent: true, opacity: 0.92 }),
    32,
  );
  const beads = new Instanced(
    new Sphere(0.11, 8, 6),
    new Basic({ color: "#b1efff", toneMapped: false, transparent: true, opacity: 0.75 }),
    72,
  );
  const reward = new Mesh(
    new Torus(1.1, 0.018, 6, 32),
    new Basic({
      color: "#efffff",
      transparent: true,
      opacity: 0,
      toneMapped: false,
      depthWrite: false,
    }),
  );
  reward.rotation.x = -Math.PI / 2;
  root.add(frame, light, beads, reward);
  for (const mesh of [frame, light, beads]) {
    mesh.frustumCulled = false;
    mesh.count = 0;
  }
  const dummy = new Object3D(),
    color = new Color();
  light.setColorAt(0, color.setRGB(2.2, 1.6, 0.65));
  let count = 0,
    warm = false,
    flashAt = -99;
  function update(gates, distance, time, player, quality = 2, active = true) {
    root.visible = active;
    if (!active) return;
    count = 0;
    let dot = 0;
    for (const gate of gates) {
      const z = distance - gate.d;
      if (z < -Math.min(620, 330 + quality * 140) || z > 20 || count === 32) continue;
      const age = gate.takenAt == null ? 0 : time - gate.takenAt;
      if (gate.taken && age > 0.55) continue;
      dummy.position.set(gate.x, gate.y, z);
      dummy.rotation.set(0, 0, Math.sin(time * 0.35 + gate.d) * 0.025);
      dummy.scale.setScalar(gate.taken ? 1 + age * 2.5 : 1);
      dummy.updateMatrix();
      frame.setMatrixAt(count, dummy.matrix);
      light.setMatrixAt(count, dummy.matrix);
      const strength = gate.taken
        ? Math.max(0, 1 - age / 0.55)
        : 0.8 + 0.12 * Math.sin(time * 2 + gate.d);
      color.setRGB(2.2 * strength, 1.6 * strength, 0.65 * strength);
      light.setColorAt(count, color);
      count++;
      if (!gate.taken)
        for (let j = 0; j < (quality === 0 ? 2 : 4) && dot < 72; j++) {
          dummy.position.set(gate.x, gate.y - 0.3 + j * 0.08, z + 3.8 + j * 2.4);
          dummy.scale.setScalar(0.7 + j * 0.13);
          dummy.updateMatrix();
          beads.setMatrixAt(dot++, dummy.matrix);
        }
    }
    frame.count = light.count = count;
    beads.count = dot;
    for (const mesh of [frame, light, beads]) mesh.instanceMatrix.needsUpdate = true;
    if (light.instanceColor) light.instanceColor.needsUpdate = true;
    const age = time - flashAt;
    reward.visible = age >= 0 && age < 0.55;
    if (reward.visible) {
      reward.position.set(player.x, 0.055, 0);
      reward.scale.set(1 + age * 3, 1.7 + age * 3, 1);
      reward.material.opacity = (1 - age / 0.55) * 0.6;
    }
  }
  return {
    root,
    update,
    flash(time) {
      flashAt = time;
    },
    async warm(renderer, camera, extras = []) {
      if (warm) return;
      const stage = new Scene(),
        cam = camera.clone(),
        target = new Target(48, 32);
      const clones = [frame, light, beads, reward, ...extras].map((mesh) => {
        const clone = mesh.clone(false);
        clone.visible = true;
        clone.frustumCulled = false;
        if (clone.isInstancedMesh) {
          clone.count = 1;
          dummy.position.set(0, 1, -10);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          clone.setMatrixAt(0, dummy.matrix);
        }
        stage.add(clone);
        return clone;
      });
      cam.position.set(0, 2, 8);
      cam.lookAt(0, 1, -10);
      cam.updateMatrixWorld();
      const yieldFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      try {
        if (renderer.compileAsync) await renderer.compileAsync(stage, cam);
        await yieldFrame();
        for (let i = 0; i < clones.length; i += 2) {
          clones.forEach((m, j) => (m.visible = j >= i && j < i + 2));
          const previous = renderer.getRenderTarget();
          try {
            renderer.setRenderTarget(target);
            renderer.clear();
            renderer.render(stage, cam);
          } finally {
            renderer.setRenderTarget(previous);
          }
          await yieldFrame();
        }
        warm = true;
      } finally {
        target.dispose();
        for (const clone of clones) if (clone.isInstancedMesh) clone.dispose();
        stage.clear();
      }
    },
    status: () => ({ visibleGates: count, gateCapacity: 32, beadCapacity: 72, warm, drawCalls: 4 }),
  };
}
