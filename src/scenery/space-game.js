import { localizeText } from "../local/language.js";
import {
  B as Group,
  Js as Scene,
  R as Mesh,
  gu as SphereGeometry,
  Ii as PlaneGeometry,
  Fr as MeshBasicMaterial,
  gi as ShaderMaterial,
  sa as PMREMGenerator,
  I as Color,
  P as Vector3,
} from "../vendor/rendering.js";
import { SPACE } from "../config/space.js";
import { cosmicSkyVertex, cosmicSkyFragment, moonVertex, moonFragment } from "./space-shaders.js";
import { createCosmicStars } from "./space-stars.js";
import { createAsteroidField } from "./space-details.js";
import { createSpaceJourney } from "./space-journey.js";
import { createRoadBeat } from "./road-beat.js";

export function installSpaceGame(context, coast) {
  const { game, renderer } = context,
    env = game.env,
    black = new Color(0),
    sun = new Vector3(...SPACE.sunDirection).normalize();
  let enabled = false,
    selection = "space",
    time = 0,
    travel = 0,
    runtimeDetail = null;
  const background = game.scene.background,
    originalEnvironment = game.scene.environment;
  const roadReferences = [
    env.road,
    env.road.surface.geometry,
    env.roadMat.map,
    env.shoulderMat.map,
  ];
  const group = new Group(),
    celestial = new Group();
  group.name = "Black cosmic driving environment";
  celestial.name = "Camera-centered astronomical distance";
  group.add(celestial);
  game.scene.add(group);
  const skyMaterial = new ShaderMaterial({
    side: 1,
    depthWrite: false,
    fog: false,
    vertexShader: cosmicSkyVertex,
    fragmentShader: cosmicSkyFragment,
  });
  const sky = new Mesh(new SphereGeometry(1450, 32, 16), skyMaterial);
  sky.renderOrder = 40;
  sky.frustumCulled = false;
  celestial.add(sky);
  const stars = createCosmicStars();
  celestial.add(stars.group);
  const moon = new Mesh(
    new SphereGeometry(SPACE.moon.radius, 96, 64),
    new ShaderMaterial({
      uniforms: { uSunDirection: { value: sun }, uRadius: { value: SPACE.moon.radius } },
      vertexShader: moonVertex,
      fragmentShader: moonFragment,
      fog: false,
    }),
  );
  moon.name = "Distant airless cratered world";
  moon.position.set(...SPACE.moon.position);
  celestial.add(moon);
  const asteroids = createAsteroidField();
  group.add(asteroids.mesh);
  const journey = createSpaceJourney(celestial, moon, asteroids);
  const roadBeat = createRoadBeat(group);
  // A fixed neutral reflection capture keeps cars legible without a daylight sky.
  const studio = new Scene();
  studio.background = new Color("#080a10");
  const reflectionSky = new Mesh(new SphereGeometry(25, 24, 16), skyMaterial);
  studio.add(reflectionSky);
  for (const [x, y, z, w, h, strength] of [
    [-7, 7, 5, 7, 5, 1.5],
    [6, 4, -6, 5, 6, 1.0],
  ]) {
    const card = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({
        side: 2,
        toneMapped: false,
        color: new Color().setRGB(strength, strength, strength),
      }),
    );
    card.position.set(x, y, z);
    card.lookAt(0, 0, 0);
    studio.add(card);
  }
  const generator = new PMREMGenerator(renderer);
  let reflection;
  try {
    reflection = generator.fromScene(studio, 0);
  } finally {
    generator.dispose();
    studio.traverse((node) => {
      if (node.isMesh) {
        node.geometry.dispose();
        if (node.material !== skyMaterial) node.material.dispose();
      }
    });
  }
  // Native height fog has warm shared uniforms. Isolate this environment while
  // retaining the originals for the coast/original choices.
  const prepared = new Set(),
    fogHeight = new Vector3(100, 1, 0);
  game.scene.traverse((node) => {
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!material?.isMeshStandardMaterial || prepared.has(material)) continue;
      prepared.add(material);
      const before = material.onBeforeCompile,
        key = material.customProgramCacheKey();
      material.onBeforeCompile = function (shader, gl) {
        before.call(this, shader, gl);
        const originalColor = shader.uniforms.fogSunColor,
          originalHeight = shader.uniforms.fogHeight;
        if (originalColor)
          shader.uniforms.fogSunColor = {
            get value() {
              return enabled ? black : originalColor.value;
            },
          };
        if (originalHeight)
          shader.uniforms.fogHeight = {
            get value() {
              return enabled ? fogHeight : originalHeight.value;
            },
          };
      };
      material.customProgramCacheKey = () => key + "|cosmic-fog-switch-v1";
      material.needsUpdate = true;
    }
  });
  function lighting() {
    const t = env.time;
    for (const key of ["skyTop", "skyMid", "skyHorizon", "fog"]) t[key].set(0);
    t.sun.set("#eff3ff");
    t.hemiSky.set("#a4b3cb");
    t.hemiGround.set("#151922");
    t.cloud.set(0);
    t.sunDir.copy(sun);
    Object.assign(t, {
      night: 1,
      stars: 0,
      sunGlow: 0,
      sunI: SPACE.sunIntensity,
      hemi: SPACE.ambientIntensity,
      exposure: SPACE.exposure,
      envI: SPACE.reflectionIntensity,
      haze: 0,
      cloudI: 0,
      fogNear: SPACE.fogNear,
      fogFar: SPACE.fogFar,
      sat: 0.98,
      curve: 0.18,
      vignette: 0.1,
    });
    t.shadowTint.set(0, 0, 0.003);
    t.highTint.set(0, 0, 0);
    for (const key of ["top", "mid", "horizon", "flashColor"]) env.skyUniforms[key].value.set(0);
    env.skyUniforms.sunGlow.value = 0;
    env.skyUniforms.sunDir.value.copy(sun);
    env.scene.background = black;
    env.scene.fog.color.copy(black);
    env.scene.fog.near = SPACE.fogNear;
    env.scene.fog.far = SPACE.fogFar;
    env.sun.color.copy(t.sun);
    env.sun.intensity = SPACE.sunIntensity;
    env.sun.position.copy(sun).multiplyScalar(160).add(env.sun.target.position);
    env.sun.shadow.intensity = 0.65;
    env.hemi.color.copy(t.hemiSky);
    env.hemi.groundColor.copy(t.hemiGround);
    env.hemi.intensity = SPACE.ambientIntensity;
    env.night = 1;
    env.exposure = SPACE.exposure;
    env.envIntensity = SPACE.reflectionIntensity;
    env.facade.uNight.value = 1;
    // Preserve the existing coast's asphalt base colors and texture travel.
    for (const material of [env.roadMat, env.shoulderMat]) {
      material.color.set("#6b7377");
      material.emissive.set("#050707");
    }
  }
  const nativeUpdate = env.update;
  function hideTerrestrialEnvironment() {
    // Some scenery rows enable themselves during zone/quality changes. Keep
    // the complete native environment root isolated, preserving only its road.
    for (const child of env.group.children) child.visible = child === env.road.group;
    env.sky.visible = env.stars.visible = false;
  }
  env.update = function (distance, dt = 0) {
    nativeUpdate.call(this, distance, dt);
    if (!enabled) return;
    travel = distance;
    time += Math.min(0.1, Math.max(0, dt));
    hideTerrestrialEnvironment();
    lighting();
    celestial.position.copy(game.camera.position);
    moon.rotation.y = time * 0.0002;
    const detail =
      runtimeDetail == null ? (game.detail ?? 2) : Math.min(game.detail ?? 2, runtimeDetail);
    stars.update(renderer.getPixelRatio(), detail);
    asteroids.update(distance, time, detail);
    journey.update(distance, time, game.mood, detail);
    // Stable, low-intensity beat accents on existing edges, never full-sky flashes.
    roadBeat.update(distance, game.mood?.pulse || 0);
    this.road.update(distance, distance);
    this.roadTex.offset.y = (distance / this.roadTile) % 1;
    for (const texture of this.roadDetail) texture.offset.y = this.roadTex.offset.y;
  };
  const nativeSky = game.skyShow.update;
  game.skyShow.update = function (...args) {
    if (!enabled) return nativeSky.apply(this, args);
    this.clear();
    this.pad.group.visible = false;
  };
  const nativeReflection = game.updateSkyEnvironment;
  game.updateSkyEnvironment = function (...args) {
    if (!enabled) return nativeReflection.apply(this, args);
    this.scene.environment = reflection.texture;
  };
  const nativeVisual = game.updateVisual;
  game.updateVisual = function (...args) {
    const result = nativeVisual.apply(this, args);
    if (enabled) {
      hideTerrestrialEnvironment();
      celestial.position.copy(this.camera.position);
      this.post.sunVis = 0;
      this.post.sunColor.set(0);
      this.post.grain = 0.003;
      this.post.blur *= 0.7;
      this.post.roadBlur *= 0.75;
    }
    return result;
  };
  const select = document.createElement("select");
  select.id = "set-environment";
  for (const [value, label] of [
    ["space", "黑暗星空"],
    ["coast", "浅蓝海岸"],
    ["original", "原版风景"],
  ]) {
    const option = document.createElement("option");
    option.value = value;
    localizeText(
      option,
      label,
      { space: "Dark Space", coast: "Azure Coast", original: "Original scenery" }[value],
    );
    select.append(option);
  }
  const label = document.createElement("label");
  label.className = "toggle quality-setting";
  label.append(localizeText(document.createElement("span"), "游戏场景", "Game scene"), select);
  const hint = document.createElement("p");
  hint.className = "modal-desc";
  localizeText(
    hint,
    "太空普通模式有空中奖励航线与连续超车挑战；教学与原版风景保留原有规则。",
    "Dark Space includes aerial bonus routes and consecutive overtaking challenges. Tutorials and the original scenery keep their existing rules.",
  );
  const card = document.querySelector("#settings .modal-card");
  card.insertBefore(label, card.querySelector(".modal-buttons"));
  label.after(hint);
  function choose(name) {
    if (enabled && name !== "space") for (const child of env.group.children) child.visible = true;
    selection = ["space", "coast", "original"].includes(name) ? name : "space";
    enabled = selection === "space";
    group.visible = enabled;
    coast.select(selection === "coast" ? "coast" : "original");
    if (!enabled) {
      game.scene.background = background;
      game.scene.environment = originalEnvironment;
    }
    env.update(game.distance, 0);
    game.skyEnvSig = null;
    select.value = selection;
    try {
      localStorage.setItem("tesla-music.environment.v1", selection);
    } catch {}
  }
  select.onchange = () => choose(select.value);
  try {
    selection = localStorage.getItem("tesla-music.environment.v1") || "space";
  } catch {}
  choose(selection);
  return {
    select: choose,
    isSpace: () => enabled,
    warmObjects: () => [...journey.warmObjects(), roadBeat.mesh],
    setRuntimeDetail: (value) => {
      runtimeDetail = value;
    },
    status: () => ({
      selected: selection,
      stars: stars.count(),
      asteroids: asteroids.mesh.count,
      travel,
      journey: journey.status(),
      coast: coast.status(),
      moon: true,
      steadyStars: true,
      roadPreserved:
        env.road === roadReferences[0] &&
        env.road.surface.geometry === roadReferences[1] &&
        env.roadMat.map === roadReferences[2] &&
        env.shoulderMat.map === roadReferences[3],
      terrestrialVisible: enabled
        ? env.group.children.filter((child) => child !== env.road.group && child.visible).length
        : null,
    }),
  };
}
