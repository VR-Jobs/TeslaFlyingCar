import { Js as Scene, cn as Target, O as HalfFloat, P as Vector3 } from "../vendor/rendering.js";
import { createRun } from "./simulation.js";
import { add, mul } from "./course.js";
// Upload only the next entrance's visible meshes, in small independent batches.
// Clones share buffers with the actual route; no live scene or gameplay state is edited.
export async function warmRouteGPU(
  renderer,
  scene,
  camera,
  route,
  postprocessing,
  yieldTask,
  extras = [],
) {
  const started = performance.now(),
    ghost = createRun(route.course),
    r = route;
  r.glass.update(0, 0, 0, 0);
  r.trackDetail.update(0, 0, true);
  r.pickups.update(ghost, 0, 0, 1, true);
  r.traffic.update(ghost, 0, 0, 1, true);
  r.adventures.update(ghost, 0, 0, true);
  r.voyage.update(ghost, 0, 0, true);
  r.hazards.forEach((g, i) => {
    const h = r.course.hazards[i];
    if (h.type !== "car") g.visible = h.s > -25 && h.s < 190;
  });
  const stage = new Scene();
  stage.environment = scene.environment;
  stage.environmentIntensity = scene.environmentIntensity;
  for (const o of scene.children)
    if (o.isLight) {
      const l = o.clone();
      stage.add(l);
      if (l.target) stage.add(l.target);
    }
  const f = route.course.pose(0),
    eye = add(f.p, add(mul(f.t, -12), mul(f.up, 5.2))),
    target = add(f.p, mul(f.t, 10));
  const cam = camera.clone();
  cam.position.fromArray(eye);
  cam.up.fromArray(f.up);
  cam.lookAt(new Vector3(...target));
  cam.updateProjectionMatrix();
  const meshes = [],
    seen = new Set();
  const gather = (parent, force = false) => {
    parent.updateWorldMatrix(true, true);
    parent[force ? "traverse" : "traverseVisible"]((o) => {
      if (!o.geometry || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material],
        key = o.geometry.uuid + ":" + mats.map((m) => m.uuid).join(",");
      if (seen.has(key)) return;
      seen.add(key);
      const clone = o.clone(false);
      clone.matrixAutoUpdate = false;
      clone.matrix.copy(o.matrixWorld);
      clone.frustumCulled = false;
      clone.visible = true;
      stage.add(clone);
      meshes.push(clone);
    });
  };
  gather(route.root);
  for (const extra of extras) gather(extra, true);
  const warmTarget = new Target(64, 36, { type: HalfFloat, depthBuffer: true });
  let batches = 0,
    maximumBatchMs = 0;
  try {
    if (renderer.compileAsync) await renderer.compileAsync(stage, cam);
    await yieldTask();
    await postprocessing.precompileBloom(stage, cam);
    await yieldTask();
    for (const m of meshes) m.visible = false;
    for (let i = 0; i < meshes.length; i += 6) {
      const active = meshes.slice(i, i + 6),
        tick = performance.now(),
        oldTarget = renderer.getRenderTarget(),
        oldTone = renderer.toneMapping,
        oldExposure = renderer.toneMappingExposure;
      for (const m of active) m.visible = true;
      try {
        renderer.setRenderTarget(warmTarget);
        renderer.toneMapping = 4;
        renderer.toneMappingExposure = 1;
        renderer.clear();
        renderer.render(stage, cam);
        postprocessing.warmBloom(stage, cam, warmTarget);
      } finally {
        for (const m of active) m.visible = false;
        renderer.setRenderTarget(oldTarget);
        renderer.toneMapping = oldTone;
        renderer.toneMappingExposure = oldExposure;
      }
      batches++;
      maximumBatchMs = Math.max(maximumBatchMs, performance.now() - tick);
      await yieldTask();
    }
  } finally {
    warmTarget.dispose();
    stage.clear();
  }
  return { meshes: meshes.length, batches, maximumBatchMs, totalMs: performance.now() - started };
}
