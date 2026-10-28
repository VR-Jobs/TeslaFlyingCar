import { curveCameraUp } from "./steering.js";
import { createAdaptiveQuality } from "./adaptive-quality.js";
import { createGhostView } from "./experience-view.js";
import { createRainbowView } from "./rainbow-view.js";
import { rainbowActive } from "./rainbow-rules.js";
import { yieldBuild } from "./build-scheduler.js";
import {
  Js as Scene,
  B as Group,
  R as Mesh,
  Jr as BufferGeometry,
  L as Attribute,
  H as Material,
  Fr as Basic,
  yu as Physical,
  gi as Shader,
  V as Cylinder,
  Ii as Plane,
  _u as Torus,
  P as Vector3,
  F as Matrix4,
  dn as Quaternion,
  I as Color,
  xi as Camera,
  Iu as Hemi,
  Yu as Sun,
  Uc as Points,
  Rc as PointsMaterial,
} from "../vendor/rendering.js";
import { createEscortView } from "./escort-view.js";
import { createFlightEffects, createSoftVaporMaterial } from "./flight-effects.js";
import { deathFrame } from "./failure.js";
import { routeCourse } from "./adventure-course.js";
import { createRoadsterExterior } from "../scenery/roadster-exterior.js";
import MEDIUM from "../assets/roadster-driving-data.js";
import { createCosmicStars } from "../scenery/space-stars.js";
import { createLandingBeacon } from "../scenery/landing-beacon.js";
import { createGapLights } from "./gap-lights.js";
import { getTrackSurface } from "./track-surface.js";
import { createGlassTrack } from "./glass-track.js";
import { createSolarSystem } from "./solar-system.js";
import { createTrackDetail } from "./track-detail.js";
import { createRingPostprocessing } from "./postprocessing.js";
import { createPickupView } from "./pickups.js";
import { warmRouteGPU } from "./loading-warm.js";
import { createRouteWindow, createRouteWindowAsync, createRouteGlow } from "./route-window.js";
import { add, mul, sub, dot, nearestSurface } from "./course.js";

function orient(object, f) {
  const m = new Matrix4().makeBasis(
    new Vector3(...f.right),
    new Vector3(...f.up),
    new Vector3(...f.t).negate(),
  );
  object.quaternion.setFromRotationMatrix(m);
}
export function createRingView(context, course, comfort, initialRoute = null) {
  const scene = new Scene();
  scene.background = new Color("#010207");
  scene.environment = context.showroom.scene.environment;
  scene.environmentIntensity = 0.8;
  const camera = new Camera(64, 1, 0.1, 18000);
  const stars = createCosmicStars();
  scene.add(stars.group);
  stars.group.scale.setScalar(9);
  const sun = new Sun("#f3f6ff", 2.5);
  sun.position.set(-60, 100, 40);
  scene.add(sun, new Hemi("#bccfe6", "#131d31", 1.2));
  const rim = new Sun("#9ebee8", 1.3);
  rim.position.set(80, 10, -50);
  scene.add(rim);
  // Keep a soft white key above the local track, including its inverted sections.
  const vehicleKey = new Sun("#f5f8ff", 2.7);
  scene.add(vehicleKey, vehicleKey.target);
  const snapshot = () => course.snapshot?.() || course;
  const sharedGlow = initialRoute?.sharedGlow || createRouteGlow();
  const startupRouteTime = performance.now();
  let route = initialRoute || createRouteWindow(snapshot(), sharedGlow),
    preparedRoute = null,
    preparation = null,
    createdWindows = 1,
    retiredWindows = 0;
  const loadTiming = {
    initialRouteMs: performance.now() - startupRouteTime,
    lastSwapMs: 0,
    lastDisposeMs: 0,
    usedPrepared: false,
    swapRenderPeakMs: 0,
  };
  let swapFrames = 0;
  scene.add(route.root);
  let { solid, glass, trackDetail, gapLights, pickups, hazards, traffic, adventures, voyage } =
    route;
  const saturn = createSolarSystem(scene, course, context.renderer);
  const materials = Object.fromEntries(
    ["body", "wing", "glass", "carbon", "cavity", "headlight", "taillight", "gold"].map((key) => [
      key,
      context.game.player.car.materials[key]?.clone() || new Physical(),
    ]),
  );
  const exterior = createRoadsterExterior(materials, MEDIUM);
  const car = new Group(),
    stunt = new Group(),
    visual = new Group(),
    sprung = new Group();
  stunt.position.y = 0.55;
  visual.position.y = -0.55;
  stunt.add(visual);
  car.add(stunt);
  scene.add(car);
  const escortView = createEscortView(scene, car, sharedGlow);
  const rainbowView = createRainbowView(
    scene,
    visual,
    materials,
    sharedGlow,
    context.game.player.car.plumes.R1.mesh.material.uniforms.uNoise.value,
  );
  sprung.add(exterior.slots.body, exterior.slots.wing, exterior.supports);
  visual.add(sprung);
  for (const [name, slot] of Object.entries(exterior.slots))
    if (name.startsWith("wheel")) visual.add(slot);
  const flightEffects = createFlightEffects(visual, context.game.player.car.plumes);
  const ghostView = createGhostView(scene, exterior),
    ghostQuaternion = new Quaternion();
  const speedRoot = new Group();
  car.add(speedRoot);
  const speedLines = new context.game.lines.constructor(speedRoot, 32);
  const adaptive = createAdaptiveQuality();
  adaptive.reset(context.game.detail ?? 2);
  let deathVisualStatus = { active: false, gray: 0, progress: 0 };
  const marker = new Mesh(
    new Plane(3, 5.5),
    new Shader({
      uniforms: { uOpacity: { value: 0.3 }, uBlocked: { value: 0 } },
      transparent: true,
      depthWrite: false,
      side: 2,
      fog: false,
      vertexShader:
        "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec2 vUv;uniform float uOpacity;void main(){float r=length((vUv-.5)*2.);float a=(1.-smoothstep(.02,.065,abs(r-.78)))*uOpacity;gl_FragColor=vec4(.72,.9,1.,a);}",
    }),
  );
  scene.add(marker);
  const beacon = createLandingBeacon(marker);
  scene.add(beacon.group);
  let initialized = false,
    practiceVisualTime = 0,
    displayedLap = null,
    displayedOrigin = null,
    suspension = 0,
    lastLand = 0,
    smokeAge = 10,
    predictWait = 0;
  let cameraBlocked = false;
  const smokePos = new Float32Array(48 * 3),
    smokeGeom = new BufferGeometry();
  smokeGeom.setAttribute("position", new Attribute(smokePos, 3));
  const smoke = new Points(smokeGeom, createSoftVaporMaterial());
  scene.add(smoke);
  const desired = new Vector3(),
    target = new Vector3(),
    orientation = new Quaternion();
  const postprocessing = createRingPostprocessing(context.renderer, scene, camera);
  const preloadStats = { completed: 0, aborted: 0, maximumSliceMs: 0, gpuWarm: null };
  function syncRoute() {
    const next = snapshot();
    if (route.course === next) return;
    const swapStarted = performance.now();
    loadTiming.usedPrepared = preparedRoute?.course === next;
    cancelPreparation();
    const old = route;
    if (preparedRoute?.course === next) {
      route = preparedRoute;
      preparedRoute = null;
    } else {
      if (preparedRoute) {
        preparedRoute.dispose();
        preparedRoute = null;
        retiredWindows++;
      }
      route = createRouteWindow(next, sharedGlow);
      createdWindows++;
    }
    ({ solid, glass, trackDetail, gapLights, pickups, hazards, traffic, adventures, voyage } =
      route);
    scene.add(route.root);
    const disposeStarted = performance.now();
    old.dispose();
    loadTiming.lastDisposeMs = performance.now() - disposeStarted;
    retiredWindows++;
    postprocessing.prune();
    loadTiming.lastSwapMs = performance.now() - swapStarted;
    loadTiming.swapRenderPeakMs = 0;
    loadTiming.swapSamples = [];
    swapFrames = 5;
  }
  function cancelPreparation() {
    if (preparation) {
      preparation.cancelled = true;
      clearTimeout(preparation.timer);
      preparation = null;
    }
  }
  function prepare() {
    if (!course.previewNext || preparation !== null || preparedRoute) return;
    const from = snapshot(),
      next = course.previewNext(),
      job = { cancelled: false, timer: null };
    preparation = job;
    job.timer = setTimeout(async () => {
      let lastYield = performance.now();
      const yieldTask = async () => {
        preloadStats.maximumSliceMs = Math.max(
          preloadStats.maximumSliceMs,
          performance.now() - lastYield,
        );
        if (job.cancelled || snapshot() !== from) {
          const error = new Error("Route preload superseded");
          error.name = "AbortError";
          throw error;
        }
        await yieldBuild();
        lastYield = performance.now();
        if (job.cancelled || snapshot() !== from) {
          const error = new Error("Route preload superseded");
          error.name = "AbortError";
          throw error;
        }
      };
      try {
        const candidate = await createRouteWindowAsync(next, yieldTask, sharedGlow);
        try {
          preloadStats.gpuWarm = await warmRouteGPU(
            context.renderer,
            scene,
            camera,
            candidate,
            postprocessing,
            yieldTask,
          );
        } catch (error) {
          candidate.dispose();
          postprocessing.prune();
          throw error;
        }
        if (job.cancelled || snapshot() !== from) {
          candidate.dispose();
          preloadStats.aborted++;
        } else {
          preparedRoute = candidate;
          createdWindows++;
          preloadStats.completed++;
        }
      } catch (error) {
        if (error.name === "AbortError") preloadStats.aborted++;
        else console.error("Random route preload failed", error);
      } finally {
        if (preparation === job) preparation = null;
      }
    }, 0);
  }
  function update(run, dt) {
    syncRoute();
    const origin = run.worldOrigin || [0, 0, 0];
    if (displayedOrigin) {
      const shift = new Vector3(...sub(origin, displayedOrigin));
      for (const object of [camera, smoke, marker, beacon.group]) object.position.sub(shift);
    }
    displayedOrigin = [...origin];
    displayedLap = run.laps;
    const drivingCourse = routeCourse(course, run),
      drivingSolid = adventures.solidFor(run) || solid;
    const f = drivingCourse.pose(run.s, run.lane);
    if (run.tutorial?.active) practiceVisualTime += dt;
    const effectTime = run.tutorial?.active
      ? practiceVisualTime
      : run.time + (run.death?.elapsed || 0);
    trackDetail.update(run.s, effectTime, matchMedia("(prefers-reduced-motion: reduce)").matches);
    gapLights.update(
      run.gapCue,
      effectTime,
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    vehicleKey.position.fromArray(
      add(run.pos, add(mul(f.up, 8), add(mul(f.t, -5), mul(f.right, -4)))),
    );
    vehicleKey.target.position.fromArray(run.pos);
    const quality = adaptive.status();
    const beat = {};
    const pulse = context.sound.beatClock(beat) ? Math.exp(-beat.since * 9) : 0;
    glass.update(
      pulse,
      run.gripWarningLevel || 0,
      run.s,
      effectTime,
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    route.rhythmMarkers.update(
      run,
      effectTime,
      pulse,
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    adventures.update(
      run,
      effectTime,
      pulse,
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const near =
      run.routeId && run.s < drivingCourse.start
        ? course.pose(run.s)
        : run.attached
          ? f
          : run.near || f;
    for (const event of run.events) {
      if (event.type === "land" || event.type === "carImpact") {
        suspension = -0.045;
        lastLand = event.impact ?? 1;
        smokeAge = 0;
        smoke.position.fromArray(near.p);
        orient(smoke, near);
      }
    }
    suspension *= Math.exp(-10 * dt);
    sprung.position.y = suspension;
    car.position.fromArray(add(run.pos, run.attached ? mul(f.up, 0.04) : [0, 0, 0]));
    orient({ quaternion: orientation }, f);
    if (!initialized || run.attached) car.quaternion.copy(orientation);
    else car.quaternion.slerp(orientation, 1 - Math.exp(-8 * dt));
    const death = deathFrame(run),
      warning = run.phase === "running" ? run.gripWarningLevel || 0 : 0;
    const sway = run.attached ? Math.sin(effectTime * 17) * 0.045 * warning : 0;
    stunt.rotation.set(death.pitch, death.yaw || 0, death.roll + sway);
    if (warning > 0 && run.attached)
      car.position.addScaledVector(
        new Vector3(...f.right),
        Math.sin(effectTime * 9) * 0.16 * warning,
      );
    postprocessing.setCrash(death.gray, effectTime);
    // Conservative lower bound of the rotated exterior box against the local road.
    if (near.exists && !death.active) {
      const height = dot(sub(run.pos, near.p), near.up);
      if (height >= 0 && height < 4) {
        car.updateWorldMatrix(true, false);
        stunt.updateWorldMatrix(true, false);
        let minimum = Infinity;
        const sample = new Vector3(),
          floor = new Vector3(...near.p),
          normal = new Vector3(...near.up);
        for (const x of [-1.06, 1.06])
          for (const y of [0, 1.25])
            for (const z of [-2.35, 2.35]) {
              sample.set(x, y - 0.55, z).applyMatrix4(stunt.matrixWorld);
              minimum = Math.min(minimum, sample.sub(floor).dot(normal));
            }
        if (minimum < 0.025) car.position.addScaledVector(normal, 0.025 - minimum);
      }
    }
    for (const [name, slot] of Object.entries(exterior.slots))
      if (name.startsWith("wheel")) slot.rotation.x -= (run.speed * dt) / 0.355;
    exterior.setWing(!run.attached || run.input.brake ? 0.7 : run.input.boost ? 0.45 : 0.03);
    flightEffects.update(
      rainbowActive(run)
        ? {
            ...run,
            input: {
              ...run.input,
              suction: run.attached || run.input.suction,
              boost: run.input.boost || (!run.routeId && f.kind === "straight"),
            },
          }
        : run,
      near,
      dt,
      effectTime,
      context.renderer.getPixelRatio(),
      matchMedia("(prefers-reduced-motion: reduce)").matches,
      quality.particles,
    );
    rainbowView.update(
      run,
      effectTime,
      matchMedia("(prefers-reduced-motion: reduce)").matches,
      context.renderer.getPixelRatio(),
      near,
      quality.particles,
    );
    escortView.update(run, dt, effectTime, matchMedia("(prefers-reduced-motion: reduce)").matches);
    voyage.update(run, dt, effectTime, matchMedia("(prefers-reduced-motion: reduce)").matches);
    deathVisualStatus = death;
    pickups.update(
      run,
      dt,
      effectTime,
      context.renderer.getPixelRatio(),
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    traffic.update(
      run,
      dt,
      effectTime,
      context.renderer.getPixelRatio(),
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    hazards.forEach((g, i) => {
      if (course.hazards[i].type === "car") return;
      const ahead = course.hazards[i].s - run.s;
      g.visible = !run.hit.has(i) && ahead > -25 && ahead < 190;
    });
    predictWait -= dt;
    if (run.attached || run.phase !== "running") marker.visible = false;
    if (!run.attached && run.phase === "running" && predictWait <= 0) {
      marker.visible = false;
      predictWait = 0.1;
      let position = [...run.pos],
        velocity = [...run.velocity],
        s = run.s;
      for (let t = 0.05; t < 1.8; t += 0.05) {
        const previousPosition = [...position];
        velocity[1] -= 0.8 * (run.gravityFactor || 1);
        position = add(position, mul(velocity, 0.05));
        s += (run.speed * 0.05) / (drivingCourse.metric?.(s) || 1);
        const p = nearestSurface(drivingCourse, position, s, 10);
        if (
          p &&
          p.height < 0.35 &&
          p.height > -0.5 &&
          p.distance < 1.5 &&
          dot(sub(previousPosition, p.p), p.up) >= 0 &&
          dot(velocity, p.up) <= 0.5
        ) {
          marker.visible = true;
          marker.position.fromArray(add(p.p, mul(p.up, 0.045)));
          orient(marker, p);
          marker.rotateX(-Math.PI / 2);
          break;
        }
      }
    }
    beacon.update(camera);
    // Orient the hollow curtain with the target surface as well as its footprint.
    if (marker.visible) {
      beacon.group.quaternion.copy(marker.quaternion);
      beacon.group.rotateX(Math.PI / 2);
    }
    smokeAge += dt;
    smoke.material.uniforms.uOpacity.value =
      Math.max(0, 1 - smokeAge / 0.85) * (0.35 + lastLand * 0.3);
    smoke.material.uniforms.uTime.value = effectTime;
    smoke.material.uniforms.uPixel.value = Math.min(2, context.renderer.getPixelRatio());
    smoke.material.uniforms.uSize.value = 0.65 + lastLand * 0.5;
    for (let i = 0; i < 48; i++) {
      const a = i * 2.399,
        r = 0.7 + smokeAge * 4;
      smokePos[i * 3] = Math.cos(a) * r;
      smokePos[i * 3 + 1] = 0.08 + smokeAge * 0.35;
      smokePos[i * 3 + 2] = Math.sin(a) * r;
    }
    smokeGeom.attributes.position.array.set(smokePos);
    smokeGeom.attributes.position.needsUpdate = true;
    if (death.active) {
      const d = run.death,
        motion = matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : comfort.preferences.shake;
      const up = new Vector3(...d.up),
        right = new Vector3(...d.right),
        tangent = new Vector3(...d.tangent);
      desired
        .fromArray(run.pos)
        .addScaledVector(tangent, -(12 + death.progress * 9))
        .addScaledVector(up, 5 + death.progress * 4)
        .addScaledVector(right, Math.sin(death.progress * Math.PI * 0.75) * d.side * 7 * motion);
      target.fromArray(run.pos).addScaledVector(up, 0.65);
      camera.position.lerp(desired, 1 - Math.exp(-3.5 * dt));
      camera.up
        .lerp(
          up.lerp(new Vector3(0, 1, 0), death.progress * 0.65).normalize(),
          1 - Math.exp(-2.5 * dt),
        )
        .normalize();
      camera.fov += (64 - death.progress * 7 * motion - camera.fov) * (1 - Math.exp(-4 * dt));
      cameraBlocked = false;
    } else {
      const cameraMotion = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : comfort.preferences.shake;
      const horizon = curveCameraUp(f, cameraMotion);
      const follow = drivingCourse.pose(Math.min(course.length, run.s + 9), run.lane * 0.3);
      const cameraHeight = !run.attached && near.height < -0.3 ? -2.8 : 5.2;
      desired.fromArray(add(run.pos, add(mul(f.t, -11.7), mul(f.up, cameraHeight))));
      target.fromArray(
        run.attached
          ? add(follow.p, mul(follow.up, 0.8))
          : add(run.pos, add(mul(f.t, 9), mul(f.up, 0.6))),
      );
      if (!initialized) {
        camera.position.copy(desired);
        camera.up.fromArray(horizon);
        initialized = true;
      }
      camera.position.lerp(desired, 1 - Math.exp(-6 * dt));
      const eye = add(run.pos, mul(f.up, 1.1));
      const cameraHit = drivingSolid.sweep(eye, camera.position.toArray());
      cameraBlocked = !!cameraHit;
      if (cameraHit) {
        const alternative = add(run.pos, add(mul(f.t, -8), mul(cameraHit.normal, 3)));
        const otherHit = drivingSolid.sweep(eye, alternative);
        camera.position.fromArray(
          otherHit
            ? add(eye, mul(sub(alternative, eye), Math.max(0, otherHit.time - 0.04)))
            : alternative,
        );
      }
      camera.up.lerp(new Vector3(...horizon), 1 - Math.exp(-5 * dt)).normalize();
      const motion = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : comfort.preferences.shake;
      camera.fov +=
        (64 + (run.input.boost ? 5 * motion : 0) - camera.fov) * (1 - Math.exp(-4 * dt));
    }
    camera.lookAt(target);
    camera.aspect =
      context.renderer.domElement.clientWidth /
      Math.max(1, context.renderer.domElement.clientHeight);
    camera.updateProjectionMatrix();
    stars.group.position.copy(camera.position);
    const lines = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : (comfort.preferences.speedLines ?? 0.65) *
        (run.phase === "running" && run.input.boost ? 0.65 : 0);
    speedLines.update(dt, run.speed, lines, 0);
    stars.update(context.renderer.getPixelRatio(), quality.level);
    saturn.update(camera, run.s, effectTime, context.renderer.getPixelRatio(), quality.level);
    run.planetName = saturn.status().name;
  }
  return {
    scene,
    camera,
    sharedGlow,
    previewPlanet: (id) => saturn.preview(id),
    observePerformance(ms) {
      adaptive.sample(ms, comfort.preferences.autoQuality !== false, context.game.detail ?? 2);
    },
    ghostFrame(run) {
      visual.updateWorldMatrix(true, false);
      visual.getWorldQuaternion(ghostQuaternion);
      const m = visual.matrixWorld.elements;
      return [
        m[12] + run.worldOrigin[0],
        m[13] + run.worldOrigin[1],
        m[14] + run.worldOrigin[2],
        ...ghostQuaternion.toArray(),
      ];
    },
    applyGhost(sample, run) {
      ghostView.update(sample, run.worldOrigin, comfort.preferences, car.position);
    },
    stageRoute(candidate) {
      cancelPreparation();
      if (preparedRoute) {
        preparedRoute.dispose();
        retiredWindows++;
      }
      preparedRoute = candidate;
      createdWindows++;
    },
    warmEntrance: async (yieldTask) => {
      await saturn.warm();
      const result = await warmRouteGPU(
        context.renderer,
        scene,
        camera,
        route,
        postprocessing,
        yieldTask,
        [car, smoke, marker, beacon.group, rainbowView.group, ghostView.root, ...saturn.objects],
      );
      preloadStats.gpuWarm = result;
      return result;
    },
    resources() {
      const geometries = new Set(),
        materials = new Set();
      let objects = 0;
      scene.traverse((object) => {
        objects++;
        if (object.geometry) geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material])
          if (material) materials.add(material);
      });
      return { objects, geometries: geometries.size, materials: materials.size };
    },
    update,
    prepare,
    render(dt) {
      const started = performance.now(),
        before = {
          geometries: context.renderer.info.memory.geometries,
          programs: context.renderer.info.programs.length,
        };
      const q = adaptive.status();
      postprocessing.setVisualSettings(comfort.preferences.bloom ?? 1, q.scale);
      postprocessing.render(dt, q.level);
      if (swapFrames > 0) {
        swapFrames--;
        loadTiming.swapSamples.push({
          ms: performance.now() - started,
          before,
          after: {
            geometries: context.renderer.info.memory.geometries,
            programs: context.renderer.info.programs.length,
          },
          passes: postprocessing.status().timings,
        });
        loadTiming.swapRenderPeakMs = Math.max(
          loadTiming.swapRenderPeakMs,
          performance.now() - started,
        );
      }
    },
    setBloom(value) {
      postprocessing.setEnabled(value);
    },
    suspend() {
      cancelPreparation();
      if (preparedRoute) {
        preparedRoute.dispose();
        preparedRoute = null;
        retiredWindows++;
      }
      postprocessing.suspend();
    },
    overview(segment) {
      if (segment && typeof segment === "object") {
        const points = Array.from(
          { length: 25 },
          (_, i) => course.pose(segment.start + (segment.length * i) / 24).p,
        );
        const center = points[0].map(
          (_, k) => points.reduce((sum, p) => sum + p[k], 0) / points.length,
        );
        const radius = Math.max(35, ...points.map((p) => Math.hypot(...sub(p, center))));
        const basis = course.pose(segment.start);
        camera.position.fromArray(
          add(
            center,
            add(
              mul(basis.right, radius * 1.4),
              add(mul(basis.up, radius * 1.25), mul(basis.t, -radius * 0.9)),
            ),
          ),
        );
        camera.up.set(0, 1, 0);
        camera.lookAt(...center);
        return;
      }
      camera.position.set(88, 58, -370);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 40, -520);
    },
    reset() {
      saturn.reset();
      syncRoute();
      pickups.reset();
      traffic.reset();
      flightEffects.reset();
      escortView.reset();
      rainbowView.reset();
      ghostView.root.visible = false;
      adaptive.reset(context.game.detail ?? 2);
      postprocessing.setCrash(0, 0);
      initialized = false;
      displayedLap = null;
      displayedOrigin = null;
      practiceVisualTime = 0;
      suspension = 0;
      smokeAge = 10;
      materials.body.color.copy(context.showroom.car.materials.body.color);
      materials.wing.color.copy(materials.body.color);
    },
    status: () => ({
      loading: { ...loadTiming },
      quality: adaptive.status(),
      ghost: ghostView.status(),
      rhythmMarkers: route.rhythmMarkers.status(),
      trackTriangles: solid.groups.top.positions.length / 9,
      glass: glass.status(),
      pickups: pickups.status(),
      traffic: traffic.status(),
      escort: escortView.status(),
      rainbow: rainbowView.status(),
      voyage: voyage.status(),
      adventures: adventures.status(),
      postprocessing: postprocessing.status(),
      trackDetail: trackDetail.status(),
      saturn: saturn.status(),
      solar: saturn.status(),
      solidTriangles: solid.triangles.length,
      trackThickness: solid.thickness,
      trackFaces: "separate-front-bottom-walls",
      cameraBlocked,
      carTriangles: exterior.status().triangles,
      localCycle: displayedLap,
      boundedWindow: [course.surfaceStart, course.surfaceEnd],
      streaming: {
        layout: route.course.id,
        liveWindows: 1 + Number(!!preparedRoute || preparation !== null),
        preload: preloadStats,
        created: createdWindows,
        retired: retiredWindows,
        prepared: preparedRoute?.course.id || null,
      },
      markerVisible: marker.visible,
      gapLights: gapLights.status(),
      wingGap: exterior.status().maximumAttachmentGap,
      flightEffects: flightEffects.status(),
      death: deathVisualStatus,
    }),
  };
}
