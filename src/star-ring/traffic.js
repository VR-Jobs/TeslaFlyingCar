import {
  B as Group,
  ci as Box,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  H as Standard,
  Fr as Basic,
  I as Color,
  Uc as Points,
  gi as Shader,
} from "../vendor/rendering.js";
import { trafficPose, trafficFrame } from "./traffic-motion.js";
import { orientFX, colored } from "./voyage-fx.js";
import { add, mul } from "./course.js";
import { finishBuild, finishBuildAsync } from "./build-scheduler.js";
import DATA from "../assets/roadster-distant-data.js";
import { TRAFFIC_CAR } from "./traffic-rules.js";
const paints = ["#e5e9ef", "#5b9dbd", "#bd5034", "#a7adb6"];
const colors = {
  paint: "#ffffff",
  glass: "#05070a",
  carbon: "#20262d",
  cavity: "#090c10",
  rubber: "#1c2026",
  spoke: "#333b46",
  brake: "#646a72",
  titanium: "#bfc9d4",
  gold: "#b79a57",
  caliper: "#923b32",
  light: "#eff7ff",
  red: "#ff253c",
  amber: "#ff9d28",
};
const category = (m) =>
  m === "paint"
    ? "paint"
    : m === "glass"
      ? "glass"
      : m === "light"
        ? "head"
        : m === "red"
          ? "tail"
          : m === "amber"
            ? "amber"
            : ["titanium", "spoke", "brake", "gold", "caliper"].includes(m)
              ? "trim"
              : "dark";
let packed = null;
const decode = (s, Type) => new Type(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer);
function buffers() {
  return packed || finishBuild(packBuffers());
}
function* packBuffers() {
  if (packed) return packed;
  const groups = {};
  for (const item of DATA.groups) {
    yield;
    const cat = category(item.material),
      slot = item.slot.startsWith("wheel") ? item.slot : null;
    const key = slot ? slot + ":" + cat : cat,
      g = (groups[key] ||= { position: [], normal: [], color: [], index: [] });
    const p = decode(item.position, Float32Array),
      raw = decode(item.normal, item.normalEncoding === "snorm16" ? Int16Array : Float32Array);
    const normal =
      item.normalEncoding === "snorm16" ? Float32Array.from(raw, (v) => v / 32767) : raw;
    const ids = decode(item.index, item.indexEncoding === "uint16" ? Uint16Array : Uint32Array);
    const offset = slot ? [0, 0, 0] : DATA.origins[item.slot],
      base = g.position.length / 3,
      c = new Color(colors[item.material]);
    for (let i = 0; i < p.length; i += 3) {
      if (i % 3072 === 0) yield;
      g.position.push(p[i] + offset[0], p[i + 1] + offset[1], p[i + 2] + offset[2]);
      g.normal.push(normal[i], normal[i + 1], normal[i + 2]);
      g.color.push(c.r, c.g, c.b);
    }
    for (const id of ids) g.index.push(base + id);
  }
  packed = Object.entries(groups).map(([key, g]) => ({
    key,
    category: key.split(":").at(-1),
    slot: key.includes(":") ? key.split(":")[0] : null,
    position: new Float32Array(g.position),
    normal: new Float32Array(g.normal),
    color: new Float32Array(g.color),
    index: new Uint32Array(g.index),
  }));
  return packed;
}
export function createTrafficView(...args) {
  return finishBuild(buildTrafficView(...args));
}
export async function createTrafficViewAsync(root, course, hazards, sharedGlow, yieldTask) {
  if (course.hazards.some((h) => h.type === "car") && !packed)
    await finishBuildAsync(packBuffers(), yieldTask);
  return finishBuildAsync(buildTrafficView(root, course, hazards, sharedGlow), yieldTask);
}
function* buildTrafficView(root, course, hazards, sharedGlow) {
  const cars = course.hazards.map((h, index) => ({ ...h, index })).filter((h) => h.type === "car");
  const batches = [],
    materialByCategory = new Map(),
    wheelRoots = new Map(),
    signals = new Map();
  for (const h of cars) {
    yield;
    const slots = {};
    for (const [name, origin] of Object.entries(DATA.origins))
      if (name.startsWith("wheel")) {
        const g = new Group();
        g.position.fromArray(origin);
        hazards[h.index].add(g);
        slots[name] = g;
      }
    wheelRoots.set(h.index, slots);
  }
  let draws = 0;
  const modelTriangles = cars.length ? buffers().reduce((n, g) => n + g.index.length / 3, 0) : 0;
  for (const data of cars.length ? buffers() : []) {
    yield;
    const geometry = new Geometry();
    for (const key of ["position", "normal", "color"])
      geometry.setAttribute(key, new Attribute(data[key], 3));
    // The local Attribute export coerces input to Float32; indices must remain integers.
    geometry.setIndex(Array.from(data.index));
    const cat = data.category;
    const luminous = ["tail", "head", "amber"].includes(cat);
    const material =
      materialByCategory.get(cat) ||
      (luminous
        ? new Basic({ color: "#ffffff", vertexColors: true, toneMapped: false })
        : new Standard({
            color: "#ffffff",
            vertexColors: true,
            roughness: cat === "paint" ? 0.27 : cat === "glass" ? 0.18 : 0.48,
            metalness: cat === "trim" ? 0.68 : 0.12,
          }));
    materialByCategory.set(cat, material);
    if (cat === "glass") {
      material.envMapIntensity = 0.25;
      material.metalness = 0.02;
    }
    if (cat === "paint") {
      material.emissive.set("#090d15");
      material.emissiveIntensity = 0.4;
    }
    if (luminous) material.userData.ringBloom = { gain: cat === "head" ? 0.85 : 1.5 };
    const paintMaterials =
      cat === "paint"
        ? paints.map((color) => {
            const m = material.clone();
            m.color.set(color);
            return m;
          })
        : null;
    for (const h of cars) {
      yield;
      const mesh = new Mesh(
        geometry,
        paintMaterials ? paintMaterials[h.paint % paints.length] : material,
      );
      mesh.name = "Traffic / " + data.key;
      mesh.onAfterRender = () => {
        draws++;
      };
      (data.slot ? wheelRoots.get(h.index)[data.slot] : hazards[h.index]).add(mesh);
    }
    if (paintMaterials) material.dispose();
    batches.push({ geometry, material: paintMaterials?.[0] || material, key: data.key });
  }
  const indicatorGeometry = colored(new Box(0.21, 0.055, 0.035), "#ffae39");
  const indicatorMaterial =
    sharedGlow || new Basic({ color: "#ffffff", vertexColors: true, toneMapped: false });
  if (!sharedGlow) indicatorMaterial.userData.ringBloom = { gain: 1.8 };
  for (const h of cars) {
    yield;
    const lamps = [];
    for (const side of [-1, 1])
      for (const z of [-2.32, 2.32]) {
        const o = new Mesh(indicatorGeometry, indicatorMaterial);
        o.position.set(side * 0.89, 0.65, z);
        o.visible = false;
        hazards[h.index].add(o);
        lamps.push({ o, side });
      }
    signals.set(h.index, lamps);
  }
  let moving = 0,
    signaling = 0;
  const positions = new Float32Array(32 * 3),
    sparkGeometry = new Geometry();
  sparkGeometry.setAttribute("position", new Attribute(positions, 3));
  const sparkMaterial = new Shader({
    transparent: true,
    depthWrite: false,
    uniforms: { uAge: { value: 10 }, uPixel: { value: 1 } },
    vertexShader:
      "uniform float uPixel;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(65.*uPixel/max(2.,-p.z),2.,8.);}",
    fragmentShader:
      "uniform float uAge;void main(){float r=length(gl_PointCoord-.5)*2.;float a=(1.-smoothstep(.1,1.,r))*(1.-smoothstep(.12,.7,uAge));gl_FragColor=vec4(1.8,.65,.16,a);}",
  });
  sparkMaterial.userData.ringBloom = { gain: 1.3 };
  const sparks = new Points(sparkGeometry, sparkMaterial);
  sparks.visible = false;
  sparks.frustumCulled = false;
  root.add(sparks);
  let visible = 0,
    age = 10,
    impacts = 0,
    impactFrame = null;
  return {
    update(run, dt, time, pixel = 1, reduced = false) {
      visible = 0;
      moving = 0;
      signaling = 0;
      for (const h of cars) {
        const knocked =
          run.rainbow?.key === (course.id ?? "baseline") ? run.rainbow.knocked.get(h.index) : null;
        if (run.hit.has(h.index)) {
          const node = hazards[h.index],
            age = knocked ? run.time - knocked.at : 2;
          node.visible = !!knocked && age < 1.2;
          if (node.visible) {
            orientFX(node, knocked);
            node.position.fromArray(
              add(
                knocked.p,
                add(
                  mul(knocked.right, knocked.side * (age * 7 + age * age * 3)),
                  add(mul(knocked.up, 0.035 + age * 4), mul(knocked.t, age * 7)),
                ),
              ),
            );
            node.rotateZ(knocked.side * age * 3);
            visible++;
          }
          continue;
        }
        const pose = trafficPose(course, h, h.index, run),
          ahead = pose.s - run.s;
        // Keep the obstacle visible through the crash; hitting it does not erase it.
        const node = hazards[h.index];
        node.visible = ahead >= -35 && ahead <= 190;
        if (!node.visible) continue;
        const f = trafficFrame(course, pose);
        node.position.fromArray(add(f.p, mul(f.up, 0.035)));
        orientFX(node, f);
        for (const wheel of Object.values(wheelRoots.get(h.index)))
          wheel.rotation.x = -pose.travel / 0.355;
        const blink = reduced || Math.sin(time * 9) > 0;
        for (const { o, side } of signals.get(h.index))
          o.visible = !!pose.signal && side === pose.signal && blink;
        if (pose.moving) moving++;
        if (pose.signal) signaling++;
        visible++;
      }
      const amber = batches.find((b) => b.key === "amber");
      if (amber) amber.material.color.setScalar(0.12);
      for (const e of run.events)
        if (e.type === "carImpact") {
          age = 0;
          impacts++;
          impactFrame = course.pose(run.s, run.lane);
          sparks.position.fromArray(run.pos);
        }
      age += dt;
      sparks.visible = age < 0.7 && !!impactFrame;
      if (sparks.visible) {
        sparkMaterial.uniforms.uAge.value = age;
        sparkMaterial.uniforms.uPixel.value = pixel;
        for (let i = 0; i < 32; i++) {
          const a = i * 2.399,
            r = age * (2.5 + (i % 7) * 0.6);
          const local = [
            Math.cos(a) * r,
            0.45 + age * (2 + (i % 5) * 0.5) - age * age * 4,
            Math.sin(a) * r,
          ];
          for (let k = 0; k < 3; k++)
            sparkGeometry.attributes.position.array[i * 3 + k] =
              impactFrame.right[k] * local[0] +
              impactFrame.up[k] * local[1] +
              impactFrame.t[k] * local[2];
        }
        sparkGeometry.attributes.position.needsUpdate = true;
      }
    },
    reset() {
      age = 10;
      sparks.visible = false;
    },
    status: () => ({
      style: "blender-roadster-dynamic-convoys",
      total: cars.length,
      visible,
      draws,
      rendering: "shared-geometry-meshes",
      batches: batches.length,
      materialCategories: 7,
      moving,
      signaling,
      rollingWheels: true,
      turnSignalLead: 1.8,
      blackGlass: true,
      tailLights: true,
      hazardBlinkers: true,
      sharedModel: DATA.revision,
      trianglesPerCar: modelTriangles,
      collider: TRAFFIC_CAR,
      impacts,
      sparkPool: 32,
    }),
  };
}
