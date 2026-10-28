import {
  Js as Scene,
  B as Group,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  H as Standard,
  Fr as Basic,
  gi as Shader,
  gu as Sphere,
  _u as Torus,
  P as Vector3,
  F as Matrix4,
  dn as Quaternion,
  I as Color,
  xi as Camera,
  Iu as Hemi,
  Yu as Sun,
  Uc as Points,
} from "../vendor/rendering.js";
import { createRoadsterExterior } from "../scenery/roadster-exterior.js";
import MEDIUM from "../assets/roadster-driving-data.js";
import { createCosmicStars } from "../scenery/space-stars.js";
import { createSolarSystem } from "../star-ring/solar-system.js";
import { createFlightEffects, createSoftVaporMaterial } from "../star-ring/flight-effects.js";
import { createRingPostprocessing } from "../star-ring/postprocessing.js";
import { HALF, FACE_UP, FACE_COLORS, facePoint, faceDistance } from "./course.js";
import { gravityCue } from "./rules.js";
import { add, mul, clamp } from "../star-ring/course.js";

const smooth = (t) => ((t = clamp(t, 0, 1)), t * t * (3 - 2 * t));
export function createGravityView(context, course, preferences) {
  const scene = new Scene(),
    camera = new Camera(64, 1, 0.1, 18000);
  scene.background = new Color("#010209");
  scene.environment = context.showroom.scene.environment;
  scene.environmentIntensity = 0.72;
  const stars = createCosmicStars();
  scene.add(stars.group);
  stars.group.scale.setScalar(9);
  const key = new Sun("#f3f8ff", 3.1),
    rim = new Sun("#97b9eb", 1.65);
  rim.position.set(40, 35, 10);
  scene.add(rim, key, key.target, new Hemi("#b6d8fa", "#101728", 1.5));
  const solarCourse = { seed: course.seed, section: 0, length: 1800 };
  const solar = createSolarSystem(scene, solarCourse, context.renderer);
  const materials = Object.fromEntries(
    ["body", "wing", "glass", "carbon", "cavity", "headlight", "taillight", "gold"].map((k) => [
      k,
      context.game.player.car.materials[k]?.clone() || new Standard(),
    ]),
  );
  const exterior = createRoadsterExterior(materials, MEDIUM);
  const car = new Group(),
    visual = new Group(),
    body = new Group();
  body.add(exterior.slots.body, exterior.slots.wing, exterior.supports);
  visual.add(body);
  const wheels = Object.entries(exterior.slots)
    .filter(([id]) => id.startsWith("wheel"))
    .map(([, slot]) => slot);
  visual.add(...wheels);
  car.add(visual);
  scene.add(car);
  const flight = createFlightEffects(visual, context.game.player.car.plumes);
  const track = new Group();
  scene.add(track);
  const glassVertex =
    "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
  const panels = [],
    rails = [];
  const glow = (color, gain = 1.5) => {
    const m = new Basic({
      color,
      transparent: true,
      opacity: 0.85,
      side: 2,
      depthWrite: false,
      toneMapped: false,
    });
    m.userData.ringBloom = { gain };
    return m;
  };
  for (let i = 0; i < 4; i++) {
    const panel = new Mesh(
      new Geometry(),
      new Shader({
        transparent: true,
        depthWrite: false,
        side: 2,
        uniforms: {
          uTint: { value: new Color(FACE_COLORS[i]) },
          uTime: { value: 0 },
          uActive: { value: 0 },
        },
        vertexShader: glassVertex,
        fragmentShader:
          "varying vec2 vUv;uniform vec3 uTint;uniform float uTime,uActive;void main(){float edge=pow(abs(vUv.x*2.-1.),10.);float line=pow(max(0.,cos(vUv.y*.22-uTime*.35)),30.);float grid=pow(max(0.,cos(vUv.x*36.)),48.);float a=.055+edge*.14+line*.012+grid*.012+uActive*.025;gl_FragColor=vec4(mix(vec3(.025,.045,.07),uTint,.12+edge*.25),a);}",
      }),
    );
    panel.frustumCulled = false;
    track.add(panel);
    panels.push(panel);
    const rail = new Mesh(new Geometry(), glow(FACE_COLORS[i], 1.7));
    rail.frustumCulled = false;
    track.add(rail);
    rails.push(rail);
  }
  const warnings = new Mesh(new Geometry(), glow("#e65564", 1.1));
  warnings.frustumCulled = false;
  track.add(warnings);
  const safe = new Mesh(new Geometry(), glow("#8affd4", 1.8));
  safe.frustumCulled = false;
  track.add(safe);
  const markers = new Group();
  scene.add(markers);
  const ringGeometry = new Torus(0.7, 0.055, 6, 36),
    coreGeometry = new Sphere(0.34, 12, 10);
  const ringMaterial = new Standard({ color: "#889bad", metalness: 0.8, roughness: 0.2 });
  const coreMaterial = glow("#abffe6", 1.6);
  const cells = Array.from({ length: 6 }, () => {
    const root = new Group(),
      core = new Mesh(coreGeometry, coreMaterial),
      a = new Mesh(ringGeometry, ringMaterial),
      b = new Mesh(ringGeometry, coreMaterial);
    b.scale.setScalar(0.85);
    b.rotation.y = Math.PI / 2;
    root.add(core, a, b);
    markers.add(root);
    return root;
  });
  const targetRoot = new Group(),
    targetRing = new Mesh(new Torus(1.5, 0.038, 6, 64), glow("#9dffdb", 1.7));
  targetRing.rotation.x = Math.PI / 2;
  targetRoot.add(targetRing);
  scene.add(targetRoot);
  const targetCore = new Mesh(new Torus(1.15, 0.018, 4, 48), glow("#dcfff2", 1));
  targetCore.rotation.x = Math.PI / 2;
  targetRoot.add(targetCore);
  const landing = new Group(),
    landingRing = new Mesh(new Torus(1, 0.035, 5, 48), glow("#d9f5ff", 1));
  landingRing.rotation.x = Math.PI / 2;
  landing.add(landingRing);
  scene.add(landing);
  const smokeGeometry = new Geometry(),
    smokePositions = new Float32Array(48 * 3);
  smokeGeometry.setAttribute("position", new Attribute(smokePositions, 3));
  const smokeMaterial = createSoftVaporMaterial(),
    smoke = new Points(smokeGeometry, smokeMaterial);
  landing.add(smoke);
  const post = createRingPostprocessing(context.renderer, scene, camera);
  let anchor = null,
    ready = false,
    landingAge = 9,
    buildingMs = 0;
  const aim = new Vector3(),
    desiredCamera = new Vector3(),
    up = new Vector3(0, 1, 0),
    orientation = new Quaternion();
  const onFace = (face, s, lateral = 0, height = 0) => {
    const n = FACE_UP[face],
      point = facePoint(face, height);
    return course.world(s, point[0] - n[1] * lateral, point[1] + n[0] * lateral, anchor);
  };
  const basis = (s, angle) => {
    const f = course.frame(s),
      c = Math.cos(angle),
      n = Math.sin(angle);
    const right = add(mul(f.right, c), mul(f.up, n)),
      normal = add(mul(f.right, -n), mul(f.up, c));
    return { p: null, t: f.t, right, up: normal };
  };
  const orient = (obj, f) =>
    obj.quaternion.setFromRotationMatrix(
      new Matrix4().makeBasis(
        new Vector3(...f.right),
        new Vector3(...f.up),
        new Vector3(...f.t).negate(),
      ),
    );
  function meshData(mesh, positions, uvs = null) {
    const geometry = new Geometry();
    geometry.setAttribute("position", new Attribute(positions, 3));
    if (uvs) geometry.setAttribute("uv", new Attribute(uvs, 2));
    mesh.geometry.dispose();
    mesh.geometry = geometry;
  }
  function quad(data, a, b, c, d) {
    data.push(...a, ...b, ...c, ...c, ...b, ...d);
  }
  function rebuild(s) {
    const tick = performance.now();
    anchor = Math.floor(s / 120) * 120;
    const warningData = [],
      safeData = [];
    for (let face = 0; face < 4; face++) {
      const positions = [],
        uv = [],
        lines = [];
      for (let at = anchor - 64; at < anchor + 696; at += 4) {
        const mid = at + 2;
        if (!course.exists(face, mid, 2.1)) continue;
        quad(
          positions,
          onFace(face, at, -HALF),
          onFace(face, at, HALF),
          onFace(face, at + 4, -HALF),
          onFace(face, at + 4, HALF),
        );
        uv.push(0, at, 1, at, 0, at + 4, 0, at + 4, 1, at, 1, at + 4);
        for (const x of [-7.5, 7.5, 0]) {
          const width = x ? 0.045 : 0.023;
          quad(
            lines,
            onFace(face, at, x - width, 0.035),
            onFace(face, at, x + width, 0.035),
            onFace(face, at + 4, x - width, 0.035),
            onFace(face, at + 4, x + width, 0.035),
          );
        }
      }
      meshData(panels[face], positions, uv);
      meshData(rails[face], lines);
    }
    for (const g of course.nearGates(s)) {
      for (let face = 0; face < 4; face++) {
        const data = face === g.face ? safeData : warningData;
        for (const at of [g.start - 4, g.end + 4])
          quad(
            data,
            onFace(face, at, -7.5, 0.08),
            onFace(face, at, 7.5, 0.08),
            onFace(face, at + 0.22, -7.5, 0.08),
            onFace(face, at + 0.22, 7.5, 0.08),
          );
        if (face === g.face) {
          for (let z = g.start - 64; z < g.start - 8; z += 8) {
            // Small directional chevrons run along the safe surface.
            for (const dir of [-1, 1])
              quad(
                data,
                onFace(face, z, dir * 1.6, 0.06),
                onFace(face, z, dir * 1.6 + 0.13, 0.06),
                onFace(face, z + 2, 0, 0.06),
                onFace(face, z + 2, 0.13, 0.06),
              );
          }
        }
      }
    }
    meshData(warnings, warningData);
    meshData(safe, safeData);
    buildingMs = performance.now() - tick;
  }
  function update(run, dt) {
    if (anchor === null || Math.floor(run.s / 120) * 120 !== anchor) {
      const previous = anchor;
      rebuild(run.s);
      if (previous !== null) {
        const offset = new Vector3(...course.frame(previous).p).sub(
          new Vector3(...course.frame(anchor).p),
        );
        camera.position.add(offset);
        aim.add(offset);
        landing.position.add(offset);
      }
    }
    const f = course.frame(run.s),
      delta = (run.target - run.sourceFace + 4) % 4 === 3 ? -1 : 1;
    const angle =
      ((run.attached ? run.face : run.sourceFace + delta * smooth(run.airTime / 0.48)) * Math.PI) /
      2;
    const pose = basis(run.s, angle);
    car.position.fromArray(course.world(run.s, run.x, run.y, anchor));
    const fake = { quaternion: orientation };
    orient(fake, pose);
    if (!ready || run.attached) car.quaternion.copy(orientation);
    else car.quaternion.slerp(orientation, 1 - Math.exp(-16 * dt));
    const death = smooth(run.death / 1.8);
    if (run.phase === "dying" || run.phase === "dead") {
      visual.rotation.set(run.death * 0.5, run.death * 0.12, run.death * 0.65);
      car.position.addScaledVector(
        new Vector3(...pose.up),
        Math.sin(Math.min(1.8, run.death)) * 1.4,
      );
    } else
      visual.rotation.set(
        run.attached ? 0 : -Math.sin(Math.min(1, run.airTime) * Math.PI) * 0.09,
        0,
        Math.sin(run.time * 22) * run.warning * 0.025,
      );
    const since = run.time - run.landedAt;
    body.position.y = -Math.sin(since * 22) * Math.exp(-since * 7) * 0.065 * run.landingImpact;
    for (const wheel of wheels) wheel.rotation.x = -run.s / 0.38;
    exterior.setWing(run.attached ? 0.08 : 0.45);
    key.position
      .copy(car.position)
      .addScaledVector(new Vector3(...pose.up), 7)
      .addScaledVector(new Vector3(...f.t), -4);
    key.target.position.copy(car.position);
    const cameraUp =
      preferences.shake === 0 || matchMedia("(prefers-reduced-motion: reduce)").matches
        ? f.up
        : pose.up;
    up.lerp(new Vector3(...cameraUp), ready ? 1 - Math.exp(-4.5 * dt) : 1).normalize();
    desiredCamera
      .copy(car.position)
      .addScaledVector(new Vector3(...f.t), -11.5 - death * 7)
      .addScaledVector(new Vector3(...pose.up), 4.2 + death * 2);
    if (!ready) camera.position.copy(desiredCamera);
    else camera.position.lerp(desiredCamera, 1 - Math.exp(-6 * dt));
    const target = car.position
      .clone()
      .addScaledVector(new Vector3(...f.t), 12)
      .addScaledVector(new Vector3(...pose.up), 0.8);
    if (!ready) aim.copy(target);
    else aim.lerp(target, 1 - Math.exp(-8 * dt));
    camera.up.copy(up);
    camera.lookAt(aim);
    const canvas = context.renderer.domElement;
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    if (camera.aspect !== aspect) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
    stars.group.position.copy(camera.position);
    stars.update(context.renderer.getPixelRatio(), context.game.detail ?? 2);
    solarCourse.seed = course.seed;
    solarCourse.section = Math.floor(run.s / 1800);
    solar.update(camera, run.s % 1800, run.time + run.death, 1, context.game.detail ?? 2);
    for (let i = 0; i < 4; i++) {
      panels[i].material.uniforms.uTime.value = run.time;
      panels[i].material.uniforms.uActive.value = run.face === i ? 1 : 0;
    }
    const gates = course
      .nearGates(run.s)
      .filter((g) => g.cell > run.s - 20 && g.cell < run.s + 650);
    cells.forEach((cell, i) => {
      const g = gates[i];
      cell.visible = !!g && g.index > run.lastCell;
      if (g) {
        cell.position.fromArray(onFace(g.face, g.cell, 0, 1.1));
        cell.rotation.set(run.time * 0.7, run.time * 0.9, run.time * 0.2);
      }
    });
    const predictionS =
      run.s + (run.attached ? 30 : run.speed * Math.max(0.15, 1.02 - run.airTime));
    targetRoot.visible = run.phase === "running" && course.exists(run.target, predictionS, 2.6);
    targetRoot.position.fromArray(onFace(run.target, predictionS, 0, 0.08));
    orient(targetRoot, basis(predictionS, (run.target * Math.PI) / 2));
    targetRoot.scale.setScalar(1 + Math.sin(run.time * 4) * 0.045);
    let nearest = 0;
    for (let i = 1; i < 4; i++)
      if (faceDistance(i, run.x, run.y) < faceDistance(nearest, run.x, run.y)) nearest = i;
    const near = basis(run.s, (nearest * Math.PI) / 2);
    near.p = onFace(nearest, run.s);
    near.exists = course.exists(nearest, run.s, 2.6);
    const fxRun = {
      ...run,
      pos: car.position.toArray(),
      input: {
        ...run.input,
        jump: !run.attached && (run.jetTime > 0 || run.input.jump),
        boost: run.input.boost,
      },
      rollProgress: !run.attached ? Math.min(0.99, run.airTime / 0.55) : 0,
      rollDir: delta,
    };
    flight.update(
      fxRun,
      near,
      dt,
      run.time,
      context.renderer.getPixelRatio(),
      false,
      (context.game.detail ?? 2) === 0 ? 0.6 : 1,
    );
    for (const event of run.events)
      if (event.type === "land") {
        landingAge = 0;
        landing.position.fromArray(onFace(run.face, run.s, 0, 0.1));
        orient(landing, basis(run.s, (run.face * Math.PI) / 2));
      }
    landingAge += dt;
    landing.visible = landingAge < 1.25;
    landingRing.scale.setScalar(0.4 + landingAge * 3.5);
    landingRing.material.opacity = Math.max(0, 0.6 * (1 - landingAge));
    smokeMaterial.uniforms.uOpacity.value = Math.max(
      0,
      (1 - landingAge / 1.25) * 0.28 * run.landingImpact,
    );
    smokeMaterial.uniforms.uTime.value = run.time;
    smokeMaterial.uniforms.uPixel.value = context.renderer.getPixelRatio();
    for (let i = 0; i < 48; i++) {
      const a = i * 2.399,
        radius = 0.4 + landingAge * (1.5 + (i % 7) * 0.25);
      smokePositions.set(
        [Math.cos(a) * radius, 0.06 + landingAge * 0.22, Math.sin(a) * radius * 1.2],
        i * 3,
      );
    }
    smokeGeometry.attributes.position.needsUpdate = true;
    post.setCrash(death, run.time + run.death);
    post.setVisualSettings(preferences.bloom, (context.game.detail ?? 2) === 0 ? 0.75 : 1);
    ready = true;
  }
  return {
    scene,
    camera,
    update,
    async warm() {
      rebuild(0);
      await solar.warm();
      const emitters = [...flight.plumes.map((p) => p.mesh), flight.ribbons, flight.particles];
      const visibility = emitters.map((mesh) => mesh.visible);
      try {
        // Compile dormant jets and intake shaders before handing input over.
        emitters.forEach((mesh) => {
          mesh.visible = true;
        });
        if (context.renderer.compileAsync) await context.renderer.compileAsync(scene, camera);
        await post.precompileBloom(scene, camera);
      } finally {
        emitters.forEach((mesh, index) => {
          mesh.visible = visibility[index];
        });
      }
    },
    render(dt) {
      context.renderer.setRenderTarget(null);
      post.render(dt, context.game.detail ?? 2);
    },
    reset() {
      ready = false;
      anchor = null;
      landingAge = 9;
      visual.rotation.set(0, 0, 0);
      flight.reset();
    },
    suspend() {
      post.suspend();
      flight.reset();
    },
    status: () => ({
      renderer: "four-surface-glass-tunnel",
      car: exterior.status(),
      effects: flight.status(),
      post: post.status(),
      planet: solar.status(),
      anchor,
      rebuildMs: buildingMs,
      panes: panels.length,
      cameraUp: up.toArray(),
    }),
  };
}
