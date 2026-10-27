import {
  B as Group,
  R as Mesh,
  H as Material,
  Fr as Basic,
  V as Cylinder,
  _u as Torus,
  P as Vector3,
  F as Matrix4,
} from "../vendor/rendering.js";
import { createGlassTrack, createGlassTrackAsync } from "./glass-track.js";
import { createTrackDetail, createTrackDetailAsync } from "./track-detail.js";
import { createGapLights } from "./gap-lights.js";
import { finishBuild, finishBuildAsync } from "./build-scheduler.js";
import { createPickupView, createPickupViewAsync } from "./pickups.js";
import { getTrackSurface, prepareTrackSurface } from "./track-surface.js";
import { createRhythmMarkers } from "./experience-view.js";
import { add, mul } from "./course.js";
import { createTrafficView, createTrafficViewAsync } from "./traffic.js";
import { createVoyageView } from "./voyage-view.js";
import { createAdventureView, createAdventureViewAsync } from "./adventure-view.js";
function orient(object, f) {
  object.quaternion.setFromRotationMatrix(
    new Matrix4().makeBasis(
      new Vector3(...f.right),
      new Vector3(...f.up),
      new Vector3(...f.t).negate(),
    ),
  );
}
export function createRouteGlow() {
  const m = new Basic({
    color: "#ffffff",
    vertexColors: true,
    toneMapped: false,
    transparent: true,
    depthWrite: false,
    side: 2,
  });
  m.userData.ringBloom = { gain: 1.8 };
  m.userData.ringExternalOwner = true;
  return m;
}
export function createRouteWindow(course, sharedGlow) {
  return course.withGeometryCache
    ? course.withGeometryCache(() => buildRouteWindow(course, { sharedGlow }))
    : buildRouteWindow(course, { sharedGlow });
}
function buildRouteWindow(course, prepared = {}) {
  return finishBuild(assembleRouteWindow(course, prepared));
}
function* trafficStage(root, course, hazards, sharedGlow, prepared) {
  if (prepared.yieldTask) {
    yield { traffic: { root, course, hazards, sharedGlow, prepared } };
    return prepared.traffic;
  }
  return createTrafficView(root, course, hazards, sharedGlow);
}
function* assembleRouteWindow(course, prepared = {}) {
  const root = prepared.root || new Group();
  root.name = "Randomized route window " + (course.id || "baseline");
  const solid = prepared.solid || getTrackSurface(course),
    glass = prepared.glass || createGlassTrack(root, course, solid),
    trackDetail = prepared.trackDetail || createTrackDetail(root, course, false),
    gapLights = prepared.gapLights || createGapLights(root, course),
    pickups = prepared.pickups || createPickupView(root, course);
  const hazardGeo = new Cylinder(1.05, 1.2, 0.55, 4),
    hazardRim = new Torus(1, 0.035, 5, 4);
  const hazardMetal = new Material({
      color: "#861e35",
      emissive: "#661525",
      emissiveIntensity: 0.8,
      metalness: 0.4,
    }),
    hazardGlow = new Basic({ color: "#ff6776" });
  hazardGlow.userData.ringBloom = { gain: 1.5 };
  const hazards = [];
  for (const h of course.hazards) {
    yield;
    const f = course.pose(h.s, h.lane),
      g = new Group();
    g.position.fromArray(add(f.p, mul(f.up, h.type === "car" ? 0.035 : 0)));
    orient(g, f);
    if (h.type === "car") {
      g.name = "Stranded vehicle";
      root.add(g);
      hazards.push(g);
      continue;
    }
    const base = new Mesh(hazardGeo, hazardMetal);
    base.rotation.y = Math.PI / 4;
    base.position.y = 0.3;
    g.add(base);
    const bar = new Mesh(hazardRim, hazardGlow);
    bar.position.y = 0.5;
    g.add(bar);
    root.add(g);
    hazards.push(g);
  }
  const adventures =
    prepared.adventures || createAdventureView(root, course, glass, prepared.sharedGlow);
  yield;
  const traffic =
    prepared.traffic || (yield* trafficStage(root, course, hazards, prepared.sharedGlow, prepared));
  const voyage = createVoyageView(
    root,
    course,
    prepared.sharedGlow ||
      (() => {
        const m = new Basic({
          color: "#ffffff",
          vertexColors: true,
          transparent: true,
          depthWrite: false,
          side: 2,
          toneMapped: false,
        });
        m.userData.ringBloom = { gain: 1.8 };
        return m;
      })(),
  );
  const rhythmMarkers = createRhythmMarkers(root, course, prepared.sharedGlow);
  const checkpointGeo = new Torus(6.3, 0.035, 8, 48),
    checkpointMat = new Basic({ color: "#3c718c", transparent: true, opacity: 0.34 });
  for (const s of [...course.checkpoints.slice(1), course.length - 5]) {
    const f = course.pose(s),
      g = new Mesh(checkpointGeo, checkpointMat);
    g.position.fromArray(add(f.p, mul(f.up, 3)));
    orient(g, f);
    root.add(g);
  }
  return {
    root,
    course,
    solid,
    glass,
    trackDetail,
    gapLights,
    pickups,
    hazards,
    traffic,
    adventures,
    voyage,
    rhythmMarkers,
    dispose() {
      disposeRouteRoot(root);
    },
  };
}

function disposeRouteRoot(root) {
  root.removeFromParent();
  const geometries = new Set(),
    materials = new Set();
  root.traverse((o) => {
    if (o.isInstancedMesh) o.dispose();
    if (o.geometry) geometries.add(o.geometry);
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m) materials.add(m);
  });
  for (const g of geometries) g.dispose();
  for (const m of materials) if (!m.userData.ringExternalOwner) m.dispose();
  root.clear();
}
export async function createRouteWindowAsync(course, yieldTask, sharedGlow) {
  const root = new Group(),
    build = async () => {
      const prepared = { root, sharedGlow };
      prepared.solid = await prepareTrackSurface(course, yieldTask);
      await yieldTask();
      prepared.glass = await createGlassTrackAsync(root, course, prepared.solid, yieldTask);
      await yieldTask();
      prepared.trackDetail = await createTrackDetailAsync(root, course, yieldTask);
      await yieldTask();
      prepared.gapLights = createGapLights(root, course);
      await yieldTask();
      prepared.pickups = await createPickupViewAsync(root, course, yieldTask);
      await yieldTask();
      prepared.adventures = await createAdventureViewAsync(
        root,
        course,
        prepared.glass,
        sharedGlow,
        yieldTask,
      );
      prepared.yieldTask = yieldTask;
      const assembly = assembleRouteWindow(course, prepared);
      let step,
        slice = performance.now();
      do {
        step = assembly.next();
        if (!step.done && step.value?.traffic) {
          const t = step.value.traffic;
          prepared.traffic = await createTrafficViewAsync(
            t.root,
            t.course,
            t.hazards,
            t.sharedGlow,
            yieldTask,
          );
        }
        if (!step.done && performance.now() - slice >= 3) {
          await yieldTask();
          slice = performance.now();
        }
      } while (!step.done);
      return step.value;
    };
  try {
    return await (course.withGeometryCacheAsync ? course.withGeometryCacheAsync(build) : build());
  } catch (error) {
    disposeRouteRoot(root);
    throw error;
  }
}
