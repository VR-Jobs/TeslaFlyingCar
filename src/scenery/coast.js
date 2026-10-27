import {
  B as Group,
  R as Mesh,
  H as MeshStandardMaterial,
  gi as ShaderMaterial,
  Ii as PlaneGeometry,
  gu as SphereGeometry,
  Jr as BufferGeometry,
  L as Float32BufferAttribute,
  I as Color,
  P as Vector3,
  pr as Object3D,
  Lc as InstancedMesh,
} from "../vendor/rendering.js";
import { COAST } from "../config/coast.js";
import { createPalms } from "./palms.js";
import { createCoastViewer } from "./coast-viewer.js";
import { createCoastDetails } from "./coast-details.js";
import { noiseGLSL, oceanVertex, oceanFragment, skyVertex, skyFragment } from "./coast-shaders.js";

export function shoreline(z) {
  return COAST.shoreX + Math.sin(z * 0.012) * 1.35 + Math.sin(z * 0.037 + 0.7) * 0.55;
}
export function beachHeight(x, z) {
  const shore = shoreline(z),
    inland = x - shore;
  if (inland < 0) return COAST.seaLevel + inland * 0.19;
  if (x < -8)
    return (
      COAST.seaLevel +
      Math.min(1, inland / (-8 - shore)) * 0.64 +
      0.035 * Math.sin(z * 0.031) * Math.sin(inland * 0.22)
    );
  if (x < 10) return -0.045;
  const rise = Math.min(1, (x - 10) / 48);
  const dunes = 1.6 + 3.7 * (0.5 + 0.5 * Math.sin(x * 0.031 + Math.sin(z * 0.008))) ** 2;
  return -0.045 + rise * rise * dunes + Math.max(0, x - 90) * 0.008;
}

function createBeach(uniforms) {
  const geometry = new PlaneGeometry(800, 1800, 128, 240);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(310, 0, -620);
  const material = new MeshStandardMaterial({
    color: COAST.sand.dry,
    roughness: 0.94,
    vertexColors: true,
  });
  geometry.setAttribute(
    "color",
    new Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 3).fill(1), 3),
  );
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `varying vec3 vBeachWorld;\n${shader.vertexShader}`.replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
      vBeachWorld=(modelMatrix*vec4(transformed,1.0)).xyz;`,
    );
    shader.fragmentShader =
      `uniform float uCoastTravel; uniform vec3 uWetSand; varying vec3 vBeachWorld;\n${noiseGLSL}\n${shader.fragmentShader}`
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
      vec2 sandP=vec2(vBeachWorld.x,vBeachWorld.z-uCoastTravel);
      float wet=1.0-smoothstep(0.0,4.5,sandP.x-shoreAt(sandP.y));
      float grainFade=1.0-smoothstep(.02,.25,max(fwidth(sandP.x),fwidth(sandP.y)));
      float grains=(noise2(sandP*42.0)-.5)*.10*grainFade;
      float ridges=sin(sandP.x*35.0+sin(sandP.y*1.3)*.7)*.025*grainFade;
      float drift=fbm(sandP*.21)*.06;
      float mineral=noise2(sandP*.61)*.07;
      diffuseColor.rgb *= (1.0+grains+ridges+drift+mineral)*(1.0-wet*.22);
      diffuseColor.rgb=mix(diffuseColor.rgb,uWetSand*(1.0+grains+ridges+drift),wet*.35);`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
      roughnessFactor=mix(roughnessFactor,.39,wet);`,
        )
        .replace(
          "#include <normal_fragment_maps>",
          `#include <normal_fragment_maps>
      vec2 bumpP=vec2(vBeachWorld.x,vBeachWorld.z-uCoastTravel);
      float bumpFade=1.0-smoothstep(.03,.18,max(fwidth(bumpP.x),fwidth(bumpP.y)));
      float bumpH=(sin(bumpP.x*35.0+sin(bumpP.y*1.3)*.7)*.0025+noise2(bumpP*65.0)*.0008)*bumpFade;
      vec3 sandDx=dFdx(-vViewPosition),sandDy=dFdy(-vViewPosition);
      vec3 sandR1=cross(sandDy,normal),sandR2=cross(normal,sandDx);
      float sandDet=dot(sandDx,sandR1);
      vec3 sandGrad=sign(sandDet)*(dFdx(bumpH)*sandR1+dFdy(bumpH)*sandR2);
      normal=normalize(max(abs(sandDet),.000001)*normal-sandGrad);`,
        );
  };
  material.customProgramCacheKey = () => "coast-golden-sand-v2";
  const mesh = new Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.name = "Graded sand and submerged lagoon bed";
  const positions = geometry.attributes.position;
  const colors = geometry.attributes.color,
    sand = new Color("#ffffff"),
    vegetation = new Color("#81915a"),
    tint = new Color();
  let base = null;
  function update(distance) {
    // Move a 7.5 m terrain grid, regenerate only when crossing one row.
    const next = Math.floor(distance / 7.5) * 7.5;
    mesh.position.z = distance - next;
    if (base === next) return;
    base = next;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        z = positions.getZ(i) - next;
      positions.setY(i, beachHeight(x, z));
      const green =
        Math.max(0, Math.min(0.8, (x - 32) / 65)) * (0.75 + 0.25 * Math.sin(z * 0.015 + x * 0.07));
      tint.copy(sand).lerp(vegetation, green);
      colors.setXYZ(i, tint.r, tint.g, tint.b);
    }
    positions.needsUpdate = colors.needsUpdate = true;
    geometry.computeVertexNormals();
  }
  update(0);
  return { mesh, update };
}

function createGrass(uniforms) {
  const positions = [],
    colors = [],
    indices = [],
    color = new Color();
  const rand = (n) => {
    let f = Math.sin(n * 135.7) * 43758.5453;
    return f - Math.floor(f);
  };
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996,
      x = Math.cos(a) * rand(i + 9) * 0.38,
      z = Math.sin(a) * rand(i + 11) * 0.38;
    const height = 0.23 + rand(i + 1) * 0.6,
      lean = 0.18 + rand(i + 5) * 0.26;
    const base = positions.length / 3,
      width = 0.013 + rand(i + 7) * 0.014;
    positions.push(
      x - width,
      0,
      z,
      x + width,
      0,
      z,
      x + Math.cos(a) * lean,
      height,
      z + Math.sin(a) * lean,
    );
    color.set(i % 4 ? "#8b9960" : "#c7b17b");
    for (let j = 0; j < 3; j++) colors.push(color.r, color.g, color.b);
    indices.push(base, base + 1, base + 2);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: 2 });
  const mesh = new InstancedMesh(geometry, mat, 160);
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;
  const dummy = new Object3D();
  let lastBase = null;
  function update(distance) {
    const base = Math.floor(distance / 12);
    mesh.position.z = distance - base * 12;
    if (base === lastBase) return;
    lastBase = base;
    for (let i = 0; i < 160; i++) {
      const id = base + Math.floor(i / 4),
        side = i % 4,
        x = side === 0 ? -12.8 - rand(id * 8.3) * 3 : 13 + rand(id * 4.7 + side * 8.1) * 22;
      const z = -Math.floor(i / 4) * 12 + rand(id * 7.2 + side) * 10;
      dummy.position.set(x, beachHeight(x, z - base * 12), z);
      dummy.rotation.y = rand(id * 3.1 + side) * 6.28;
      dummy.scale.setScalar(0.8 + rand(id * 3.9 + side * 6) * 1.4);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { mesh, update };
}

function createRocks() {
  const geometry = new SphereGeometry(1, 12, 8),
    positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    const scale = 1 + Math.sin(x * 9.1 + z * 7.3) * 0.08 + Math.sin(y * 11 + x * 4) * 0.06;
    positions.setXYZ(i, x * scale, y * scale * 0.68, z * scale);
  }
  geometry.computeVertexNormals();
  const material = new MeshStandardMaterial({ color: "#969b91", roughness: 0.89 });
  const mesh = new InstancedMesh(geometry, material, 32),
    dummy = new Object3D();
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  let lastBase = null;
  function update(distance) {
    const base = Math.floor(distance / 37);
    mesh.position.z = distance - base * 37;
    if (base === lastBase) return;
    lastBase = base;
    for (let i = 0; i < 32; i++) {
      const id = base + i,
        h = 0.5 + Math.sin(id * 71.3) * 0.5;
      const x = ((id % 3) + 3) % 3 === 0 ? -24.5 - h * 3 : 12 + h * 26,
        z = -i * 37;
      dummy.position.set(x, beachHeight(x, z - base * 37) + 0.04, z);
      dummy.rotation.set(h * 0.3, h * 6.2, h * 0.2);
      dummy.scale.set(0.35 + h * 0.8, 0.35 + h * 0.75, 0.45 + h * 1.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { mesh, update };
}

export function installCoastScene(context) {
  const { game, getScreen } = context,
    env = game.env;
  const group = new Group();
  group.name = "Blue Lagoon Coast";
  game.scene.add(group);
  const roadColors = [env.roadMat, env.shoulderMat].map((m) => ({
    color: m.color.clone(),
    emissive: m.emissive.clone(),
  }));
  const color = (hex) => new Color(hex);
  const sun = new Vector3(...COAST.sunDirection).normalize();
  const uniforms = {
    uCoastTime: { value: 0 },
    uCoastTravel: { value: 0 },
    uShallow: { value: color(COAST.water.shallow) },
    uDeep: { value: color(COAST.water.deep) },
    uScatter: { value: color(COAST.water.scatter) },
    uWetSand: { value: color(COAST.sand.wet) },
    uSkyTop: { value: color(COAST.sky.top) },
    uSkyMid: { value: color(COAST.sky.mid) },
    uHorizon: { value: color(COAST.sky.horizon) },
    uSunDirection: { value: sun },
    uFogColor: { value: color(COAST.sky.horizon) },
    uFogNear: { value: COAST.fogNear },
    uFogFar: { value: COAST.fogFar },
  };
  const waterGeometry = new PlaneGeometry(COAST.waterWidth, COAST.viewLength, 160, 192);
  waterGeometry.rotateX(-Math.PI / 2);
  const waterPositions = waterGeometry.attributes.position;
  // Concentrate vertices in the shallow water instead of spending them at the horizon.
  for (let i = 0; i < waterPositions.count; i++) {
    const u = (0.5 * COAST.waterWidth - waterPositions.getX(i)) / COAST.waterWidth;
    waterPositions.setX(i, 0.5 * COAST.waterWidth - COAST.waterWidth * u * u);
  }
  waterPositions.needsUpdate = true;
  const water = new Mesh(
    waterGeometry,
    new ShaderMaterial({
      uniforms,
      vertexShader: oceanVertex,
      fragmentShader: oceanFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  water.position.set(-COAST.waterWidth / 2 - 18, COAST.seaLevel, -620);
  water.frustumCulled = false;
  water.name = "Pale blue optical-depth ocean";
  const sky = new Mesh(
    new SphereGeometry(1400, 32, 16),
    new ShaderMaterial({
      uniforms,
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      side: 1,
      depthWrite: false,
    }),
  );
  sky.renderOrder = 50;
  sky.frustumCulled = false;
  const beach = createBeach(uniforms),
    palms = createPalms(uniforms, beachHeight),
    grass = createGrass(uniforms),
    rocks = createRocks(),
    details = createCoastDetails(beachHeight, shoreline);
  group.add(water, sky, beach.mesh, palms.group, grass.mesh, rocks.mesh, details.group);
  // Soft, distant headlands give the open sea a sense of scale.
  const islandGeometry = new SphereGeometry(1, 32, 16),
    islandP = islandGeometry.attributes.position;
  for (let i = 0; i < islandP.count; i++) {
    const x = islandP.getX(i),
      y = islandP.getY(i),
      z = islandP.getZ(i);
    islandP.setY(
      i,
      y < 0 ? y : y * (0.72 + Math.sin(x * 4 + z * 3) * 0.15 + Math.cos(z * 6) * 0.13),
    );
  }
  islandGeometry.computeVertexNormals();
  const islandMaterial = new MeshStandardMaterial({ color: "#6a846d", roughness: 1 });
  for (const [x, z, sx, sy, sz] of [
    [-360, -980, 100, 24, 70],
    [-610, -1150, 170, 36, 105],
  ]) {
    const island = new Mesh(islandGeometry, islandMaterial);
    island.position.set(x, COAST.seaLevel - 0.2, z);
    island.scale.set(sx, sy, sz);
    group.add(island);
  }
  // The recovered game globally extends Three's fog with warm sky-event uniforms.
  // Give the new PBR scenery its own blue daylight haze instead of inheriting those.
  const fogSunColor = { value: new Color().setRGB(0.035, 0.043, 0.05) };
  const fogHeight = { value: new Vector3(70, 0.7, 0) };
  const preparedMaterials = new Set();
  group.traverse((node) => {
    const material = node.material;
    if (!material?.isMeshStandardMaterial || preparedMaterials.has(material)) return;
    preparedMaterials.add(material);
    const prepare = material.onBeforeCompile;
    material.onBeforeCompile = function (shader, renderer) {
      prepare.call(this, shader, renderer);
      shader.uniforms.fogSunDir = uniforms.uSunDirection;
      shader.uniforms.fogSunColor = fogSunColor;
      shader.uniforms.fogHeight = fogHeight;
    };
  });
  let enabled = true;
  try {
    enabled = localStorage.getItem("roadsterdash.scene") !== "original";
  } catch {}
  const originalUpdate = env.update;
  const setVisible = () => {
    group.visible = enabled;
    for (const row of env.rows) row.group.visible = !enabled && row.enabled && row.occupied;
    env.ground.visible = !enabled;
    env.backdrop.group.visible = !enabled;
    env.sky.visible = !enabled;
    env.stars.visible = !enabled;
    if (env.testsite?.group) env.testsite.group.visible = !enabled;
  };
  function lighting() {
    const time = env.time;
    for (const [key, hex] of Object.entries({
      skyTop: COAST.sky.top,
      skyMid: COAST.sky.mid,
      skyHorizon: COAST.sky.horizon,
      fog: COAST.sky.horizon,
      hemiSky: "#c3e1f2",
      hemiGround: "#b0a487",
      sun: "#fff1d9",
      cloud: "#ffffff",
    }))
      time[key]?.set(hex);
    time.sunDir.copy(sun);
    time.night = 0;
    time.stars = 0;
    time.sunGlow = 0.65;
    time.sunI = COAST.sunIntensity;
    time.hemi = 0.8;
    time.exposure = COAST.exposure;
    time.envI = 0.8;
    time.sat = 1.04;
    time.curve = 0.23;
    time.vignette = 0.13;
    time.shadowTint.set(-0.003, 0.002, 0.006);
    time.highTint.set(0.002, 0.001, 0);
    env.skyUniforms.top.value.copy(uniforms.uSkyTop.value);
    env.skyUniforms.mid.value.copy(uniforms.uSkyMid.value);
    env.skyUniforms.horizon.value.copy(uniforms.uHorizon.value);
    env.skyUniforms.sunDir.value.copy(sun);
    env.skyUniforms.sunColor.value.set("#fff1d9");
    env.skyUniforms.sunGlow.value = 0.65;
    env.scene.fog.color.copy(uniforms.uFogColor.value);
    env.scene.fog.near = COAST.fogNear;
    env.scene.fog.far = COAST.fogFar;
    env.sun.color.set("#fff1d9");
    env.sun.intensity = COAST.sunIntensity;
    env.sun.position.copy(sun).multiplyScalar(160).add(env.sun.target.position);
    env.sun.shadow.intensity = 0.72;
    env.sun.shadow.radius = 2;
    env.hemi.color.set("#c3e1f2");
    env.hemi.groundColor.set("#8d846c");
    env.hemi.intensity = 0.8;
    env.exposure = COAST.exposure;
    env.envIntensity = 0.8;
    env.night = 0;
    env.facade.uNight.value = 0;
    env.groundMat.color.set("#ded4b6");
    for (const mat of [env.roadMat, env.shoulderMat]) {
      mat.color.set("#6b7377");
      mat.emissive.set("#050707");
    }
  }
  env.update = function (distance, dt = 0) {
    originalUpdate.call(this, distance, dt);
    if (!enabled) return;
    uniforms.uCoastTime.value += Math.min(0.1, Math.max(0, dt));
    uniforms.uCoastTravel.value = distance;
    setVisible();
    lighting();
    beach.update(distance);
    palms.update(distance);
    grass.update(distance);
    rocks.update(distance);
    details.update(distance);
    // Keep texture travel aligned with the trees and the coastal sand.
    env.road.update(distance, distance);
    env.roadTex.offset.y = (distance / env.roadTile) % 1;
    for (const texture of env.roadDetail) texture.offset.y = env.roadTex.offset.y;
  };
  const originalVisual = game.updateVisual;
  const skyShowUpdate = game.skyShow.update;
  game.skyShow.update = function (...args) {
    if (!enabled) {
      this.pad.group.visible = true;
      return skyShowUpdate.apply(this, args);
    }
    this.clear();
    this.pad.group.visible = false;
    return;
  };
  game.updateVisual = function (...args) {
    const result = originalVisual.apply(this, args);
    if (enabled) {
      this.post.grain = 0.005;
      this.post.blur *= 0.7;
      this.post.roadBlur *= 0.75;
    }
    return result;
  };
  function select(coast) {
    enabled = coast;
    try {
      localStorage.setItem("roadsterdash.scene", coast ? "coast" : "original");
    } catch {}
    env.rows.forEach((r) => {
      r.base = null;
    });
    if (!coast)
      [env.roadMat, env.shoulderMat].forEach((m, i) => {
        m.color.copy(roadColors[i].color);
        m.emissive.copy(roadColors[i].emissive);
      });
    env.update(game.distance, 0);
    setVisible();
    game.skyEnvSig = null;
    renderLabel();
  }
  const button = document.createElement("button");
  button.id = "coast-scene-button";
  button.type = "button";
  button.style.cssText =
    "display:block;margin:8px auto 0;padding:7px 13px;border:1px solid #ffffff26;border-radius:20px;background:#73d2e312;color:inherit;font:inherit;font-size:12px;cursor:pointer";
  const dialog = document.createElement("dialog");
  dialog.id = "coast-scene-dialog";
  dialog.className = "drive-hub";
  dialog.style.maxWidth = "550px";
  const title = document.createElement("h2"),
    description = document.createElement("p");
  description.className = "drive-muted";
  const chooseCoast = document.createElement("button"),
    chooseOriginal = document.createElement("button"),
    close = document.createElement("button"),
    preview = document.createElement("button");
  for (const b of [chooseCoast, chooseOriginal]) {
    b.className = "drive-mode";
    b.type = "button";
  }
  close.className = "drive-close";
  close.type = "button";
  const header = document.createElement("div");
  header.className = "drive-dialog-top";
  header.append(title, close);
  const choices = document.createElement("div");
  choices.className = "drive-mode-grid";
  choices.append(chooseCoast, chooseOriginal);
  preview.type = "button";
  preview.className = "drive-launcher";
  preview.id = "coast-preview-button";
  dialog.append(header, description, choices, preview);
  document.body.append(dialog);
  document.getElementById("driving-hub-button").nextElementSibling.after(button);
  button.onclick = () => dialog.showModal();
  button.addEventListener("keydown", (event) => event.stopPropagation());
  button.addEventListener("keyup", (event) => event.stopPropagation());
  close.onclick = () => dialog.close();
  chooseCoast.onclick = () => {
    select(true);
    dialog.close();
  };
  chooseOriginal.onclick = () => {
    select(false);
    dialog.close();
  };
  const viewer = createCoastViewer(group, context.renderer, () => select(true), uniforms);
  preview.onclick = () => {
    dialog.close();
    viewer.open();
  };
  // Menu hotkeys should not start a run while choosing a visual environment.
  dialog.addEventListener("keydown", (e) => e.stopPropagation());
  function renderLabel() {
    const zh = document.documentElement.lang === "zh";
    button.textContent = zh
      ? `场景 · ${enabled ? "浅蓝海岸" : "原版风景"}`
      : `Scene · ${enabled ? "Blue Lagoon Coast" : "Original scenery"}`;
    title.textContent = zh ? "选择风景" : "Choose your scenery";
    description.textContent = zh
      ? "清透海水与自然涌浪、金色沙滩、椰林、海岸灌木、贝壳与潮间礁石。场景不改变驾驶规则。"
      : "Clear water and natural swells, golden sand, coconut groves, coastal shrubs, shells and tidal rocks. Driving rules stay the same.";
    chooseCoast.textContent = zh ? "浅蓝海岸" : "Blue Lagoon Coast";
    chooseOriginal.textContent = zh ? "原版风景" : "Original scenery";
    chooseCoast.setAttribute("aria-pressed", String(enabled));
    chooseOriginal.setAttribute("aria-pressed", String(!enabled));
    close.textContent = zh ? "关闭" : "Close";
    preview.textContent = zh ? "进入海岸观景" : "Explore the coast";
  }
  new MutationObserver(renderLabel).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  select(enabled);
  return {
    select: (name) => select(name !== "original"),
    status: () => ({
      selected: enabled ? "coast" : "original",
      palms: palms.count(),
      waveTime: uniforms.uCoastTime.value,
      travel: uniforms.uCoastTravel.value,
    }),
  };
}
