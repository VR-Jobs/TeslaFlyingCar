import {
  B as Group,
  R as Mesh,
  Fr as Basic,
  Jr as Geometry,
  L as Attribute,
  dn as Quaternion,
  P as Vector3,
} from "../vendor/rendering.js";
import { add, mul } from "./course.js";
export function createRhythmMarkers(root, course, glow) {
  const positions = [],
    colors = [];
  for (const n of course.director?.notes || [])
    for (const side of [-1, 1]) {
      const f = course.pose(n.s, side * 5.3);
      for (const [x, y, z] of [
        [-0.04, 0.04, 0],
        [0.04, 0.04, 0],
        [-0.04, 0.55, 0],
        [0.04, 0.04, 0],
        [0.04, 0.55, 0],
        [-0.04, 0.55, 0],
      ]) {
        positions.push(...add(f.p, add(mul(f.right, x), add(mul(f.up, y), mul(f.t, z)))));
        colors.push(0.3, 0.85, 1);
      }
    }
  const g = new Geometry();
  g.setAttribute("position", new Attribute(positions, 3));
  g.setAttribute("color", new Attribute(colors, 3));
  const material =
    glow ||
    new Basic({ vertexColors: true, transparent: true, depthWrite: false, toneMapped: false });
  material.userData.ringBloom = { gain: 1.8 };
  const mesh = new Mesh(g, material);
  mesh.frustumCulled = false;
  mesh.name = "Rhythm notes on outer road edges";
  root.add(mesh);
  return {
    update(run, time, beat, reduced = false) {
      mesh.visible =
        !!positions.length &&
        course.director.notes.some((n) => n.s - run.s > -12 && n.s - run.s < 150);
      const array = g.attributes.color.array,
        scale = reduced ? 0.65 : 0.5 + beat * 0.5;
      for (let i = 0; i < array.length; i += 3) {
        array[i] = 0.3 * scale;
        array[i + 1] = 0.85 * scale;
        array[i + 2] = scale;
      }
      g.attributes.color.needsUpdate = true;
    },
    status: () => ({ notes: course.director?.notes.length || 0, transverseLines: 0 }),
  };
}
export function createGhostView(scene, exterior) {
  const root = new Group(),
    material = new Basic({
      color: "#82dfff",
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      wireframe: false,
      toneMapped: false,
    });
  root.name = "Local personal-best ghost; no collider";
  root.visible = false;
  scene.add(root);
  for (const [key, slot] of Object.entries(exterior.slots))
    if (key === "body" || key === "wing" || key.startsWith("wheel")) {
      const clone = slot.clone(true);
      clone.traverse((o) => {
        if (o.material) o.material = material;
      });
      root.add(clone);
    }
  const q = new Quaternion(),
    pos = new Vector3();
  return {
    root,
    update(sample, origin, prefs, player) {
      root.visible = !!sample && prefs.ghost !== false;
      if (!root.visible) return;
      pos.fromArray(sample).sub(new Vector3(...origin));
      // Fade when overlapping the player so the road and player remain readable.
      const distance = pos.distanceTo(player);
      material.opacity =
        (prefs.ghostOpacity ?? 0.4) * 0.45 * Math.min(1, Math.max(0, (distance - 2) / 5));
      root.position.copy(pos);
      q.fromArray(sample, 3);
      root.quaternion.copy(q);
      root.visible = material.opacity > 0.005 && distance < 180;
    },
    status: () => ({
      visible: root.visible,
      opacity: material.opacity,
      collision: false,
      sharedGeometry: true,
    }),
  };
}
