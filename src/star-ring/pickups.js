import { RAINBOW_RGB } from "./rainbow-view.js";
import { starGeometry, rainbowColors } from "./rainbow-geometry.js";
import { finishBuild, finishBuildAsync } from "./build-scheduler.js";
import {
  B as Group,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  H as Material,
  yu as Physical,
  Fr as Basic,
  gi as Shader,
  V as Cylinder,
  Ii as Plane,
  gu as Sphere,
  _u as Torus,
  P as Vector3,
  F as Matrix4,
  Uc as Points,
} from "../vendor/rendering.js";
import { add, mul } from "./course.js";

export const PICKUP_STYLES = {
  star: {
    name: "rainbow-invincibility-star",
    color: "#ffffff",
    rgb: [1, 0.75, 0.18],
    duration: 0.85,
  },
  air: { name: "pressure-cylinder", color: "#54f4bd", rgb: [0.17, 1, 0.64], duration: 0.6 },
  ring: { name: "navigation-energy-core", color: "#65c8ff", rgb: [0.22, 0.64, 1], duration: 0.65 },
  sky: { name: "segmented-jump-gate", color: "#ffd978", rgb: [1, 0.68, 0.2], duration: 0.8 },
};
const POOL = 8,
  SPARKS = 20;
function orient(object, f) {
  object.quaternion.setFromRotationMatrix(
    new Matrix4().makeBasis(
      new Vector3(...f.right),
      new Vector3(...f.up),
      new Vector3(...f.t).negate(),
    ),
  );
}
function crystalGeometry() {
  const p = [
      [0, 1, 0],
      [1, 0, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, 0, -1],
      [0, -1, 0],
    ],
    a = [];
  for (const face of [
    [0, 2, 1],
    [0, 3, 2],
    [0, 4, 3],
    [0, 1, 4],
    [5, 1, 2],
    [5, 2, 3],
    [5, 3, 4],
    [5, 4, 1],
  ])
    for (const i of face) a.push(...p[i]);
  const g = new Geometry();
  g.setAttribute("position", new Attribute(a, 3));
  g.computeVertexNormals();
  return g;
}

export function createPickupView(...args) {
  return finishBuild(buildPickupView(...args));
}
export function createPickupViewAsync(scene, course, yieldTask) {
  return finishBuildAsync(buildPickupView(scene, course), yieldTask);
}
function* buildPickupView(scene, course) {
  const root = new Group();
  root.name = "Distinct star-ring pickups and pooled collection effects";
  scene.add(root);
  const metal = new Material({ color: "#526272", metalness: 0.78, roughness: 0.28 });
  const glass = new Physical({
    color: "#b9f8f1",
    metalness: 0.05,
    roughness: 0.14,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const crystalShell = new Physical({
    color: "#60b7ef",
    metalness: 0.24,
    roughness: 0.16,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
  });
  const ceramic = new Material({ color: "#dce4e7", metalness: 0.34, roughness: 0.3 });
  const graphite = new Material({ color: "#101c26", metalness: 0.65, roughness: 0.33 });
  const dial = new Material({ color: "#c4d6dc", metalness: 0.15, roughness: 0.42 });
  const glow = Object.fromEntries(
    Object.entries(PICKUP_STYLES).map(([type, v]) => {
      const m = new Basic({ color: v.color, toneMapped: false });
      m.userData.ringBloom = { gain: 2.6 };
      if (type === "star") m.vertexColors = true;
      if (type === "air") m.color.multiplyScalar(0.48);
      return [type, m];
    }),
  );
  const geo = {
    crystal: crystalGeometry(),
    shell: new Cylinder(0.27, 0.27, 0.76, 16),
    liquid: new Cylinder(0.18, 0.18, 0.68, 12),
    cap: new Sphere(0.27, 12, 8),
    band: new Torus(0.278, 0.035, 6, 24),
    thinBand: new Torus(0.19, 0.014, 5, 20),
    valve: new Cylinder(0.08, 0.08, 0.13, 10),
    support: new Cylinder(0.018, 0.018, 0.78, 6),
    orbit: new Torus(0.56, 0.022, 6, 28, Math.PI * 0.48),
    gate: new Torus(2.12, 0.035, 8, 64),
    gateFrame: new Torus(2.27, 0.14, 10, 24, Math.PI * 0.44),
    gateInner: new Torus(2.1, 0.018, 6, 64),
    pulse: new Torus(1, 0.014, 5, 40),
    gauge: new Cylinder(0.105, 0.105, 0.028, 24),
    gaugeFace: new Cylinder(0.086, 0.086, 0.033, 24),
    needle: new Plane(0.014, 0.095),
    bolt: new Cylinder(0.035, 0.035, 0.055, 6),
    coreHousing: new Cylinder(0.52, 0.52, 0.27, 6),
    coreTrim: new Torus(0.4, 0.048, 8, 40),
    coreLens: new Sphere(0.34, 24, 16),
    coreRing: new Torus(0.27, 0.015, 6, 40),
    coreFin: new Cylinder(0.045, 0.045, 0.23, 6),
    gateBolt: new Sphere(0.045, 8, 6),
  };
  function mesh(parent, geometry, material, x = 0, y = 0, z = 0) {
    const m = new Mesh(geometry, material);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }
  const starGeo = rainbowColors(starGeometry()),
    starHalo = rainbowColors(new Torus(1.25, 0.055, 7, 48)),
    starMetal = new Material({
      color: "#ffe291",
      metalness: 0.85,
      roughness: 0.2,
      emissive: "#b46b13",
      emissiveIntensity: 0.3,
    });
  const items = [];
  for (const [index, item] of course.pickups.entries()) {
    yield;
    const anchor = new Group(),
      body = new Group(),
      rotor = new Group(),
      f = course.pose(item.s, item.lane);
    anchor.position.fromArray(add(f.p, mul(f.up, item.height || 1.35)));
    orient(anchor, f);
    anchor.add(body);
    body.add(rotor);
    root.add(anchor);
    anchor.name = PICKUP_STYLES[item.type].name;
    if (item.type === "star") {
      mesh(rotor, starGeo, starMetal);
      mesh(rotor, starHalo, glow.star);
      const inner = mesh(rotor, starGeo, glow.star);
      inner.scale.set(0.25, 0.25, 1.05);
    } else if (item.type === "air") {
      body.scale.setScalar(1.8);
      mesh(rotor, geo.shell, ceramic);
      for (const side of [-1, 1]) {
        const cap = mesh(rotor, geo.cap, ceramic, 0, side * 0.38);
        cap.scale.y = 0.42;
        for (const y of [side * 0.32, side * 0.2]) {
          const band = mesh(rotor, geo.band, metal, 0, y);
          band.rotation.x = Math.PI / 2;
        }
        const indicator = mesh(rotor, geo.thinBand, glow.air, 0, side * 0.28);
        indicator.rotation.x = Math.PI / 2;
        mesh(rotor, geo.support, graphite, side * 0.29);
      }
      const valve = mesh(rotor, geo.valve, metal, 0, 0.54);
      valve.scale.set(1.2, 1, 1.2);
      const collar = mesh(rotor, geo.thinBand, graphite, 0, 0.5);
      collar.rotation.x = Math.PI / 2;
      collar.scale.setScalar(0.48);
      const wheel = mesh(rotor, geo.thinBand, glow.air, 0, 0.62);
      wheel.rotation.x = Math.PI / 2;
      wheel.scale.setScalar(0.45);
      for (const sign of [-1, 1]) {
        const gauge = new Group();
        gauge.position.set(0, 0.01, sign * 0.286);
        if (sign < 0) gauge.rotation.y = Math.PI;
        rotor.add(gauge);
        const bezel = mesh(gauge, geo.gauge, metal);
        bezel.rotation.x = Math.PI / 2;
        const face = mesh(gauge, geo.gaugeFace, dial, 0, 0, 0.008);
        face.rotation.x = Math.PI / 2;
        const needle = mesh(gauge, geo.needle, graphite, -0.017, 0.023, 0.03);
        needle.rotation.z = -0.65;
        const window = mesh(gauge, geo.gaugeFace, glass, 0, 0, 0.025);
        window.rotation.x = Math.PI / 2;
      }
    } else if (item.type === "ring") {
      body.scale.setScalar(1.8);
      for (const z of [-0.06, 0.07]) {
        const housing = mesh(rotor, geo.coreHousing, z < 0 ? graphite : ceramic, 0, 0, z);
        housing.rotation.x = Math.PI / 2;
      }
      for (const sign of [-1, 1]) {
        const trim = mesh(rotor, geo.coreTrim, metal, 0, 0, sign * 0.23);
        const lens = mesh(rotor, geo.coreLens, crystalShell, 0, 0, sign * 0.18);
        lens.scale.z = 0.48;
        mesh(rotor, geo.coreRing, glow.ring, 0, 0, sign * 0.25);
        const core = mesh(rotor, geo.coreLens, glow.ring, 0, 0, sign * 0.25);
        core.scale.set(0.3, 0.3, 0.1);
        for (let j = 0; j < 6; j++) {
          const a = (j * Math.PI) / 3,
            x = Math.cos(a) * 0.46,
            y = Math.sin(a) * 0.46;
          const bolt = mesh(rotor, geo.bolt, graphite, x, y, sign * 0.23);
          bolt.rotation.x = Math.PI / 2;
        }
      }
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI) / 3;
        const fin = mesh(rotor, geo.coreFin, metal, Math.cos(a) * 0.56, Math.sin(a) * 0.56);
        fin.rotation.z = a - Math.PI / 2;
      }
    } else {
      // Real depth, separate chassis arcs and recessed light channels; center stays open.
      for (const z of [-0.14, 0.14]) {
        mesh(body, geo.gate, glow.sky, 0, 0, z);
        mesh(body, geo.gateInner, metal, 0, 0, z * 1.2);
      }
      for (let j = 0; j < 4; j++) {
        const a = (j * Math.PI) / 2;
        const outer = mesh(rotor, geo.gateFrame, j % 2 ? ceramic : metal);
        outer.rotation.z = a + 0.1;
        for (const end of [0.1, Math.PI * 0.44 + 0.1]) {
          const t = a + end;
          mesh(rotor, geo.gateBolt, graphite, Math.cos(t) * 2.27, Math.sin(t) * 2.27, 0.15);
        }
      }
    }
    items.push({ anchor, body, rotor, item, index, f });
  }
  const slots = Array.from({ length: POOL }, () => {
    const pulseMat = new Basic({
      color: "white",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    pulseMat.userData.ringBloom = { gain: 2 };
    const pulse = mesh(root, geo.pulse, pulseMat);
    pulse.visible = false;
    return { active: false, index: 0, start: 0, pulse };
  });
  const maxParticles = course.pickups.length * 5 + POOL * SPARKS;
  let positions = new Float32Array(maxParticles * 3),
    colors = new Float32Array(maxParticles * 3),
    alpha = new Float32Array(maxParticles),
    sizes = new Float32Array(maxParticles);
  const pointsG = new Geometry();
  pointsG.setAttribute("position", new Attribute(positions, 3));
  pointsG.setAttribute("aColor", new Attribute(colors, 3));
  pointsG.setAttribute("aAlpha", new Attribute(alpha, 1));
  pointsG.setAttribute("aSize", new Attribute(sizes, 1));
  // Float32BufferAttribute copies its constructor input. Animate the arrays
  // owned by the attributes, which are the ones WebGL actually uploads.
  positions = pointsG.attributes.position.array;
  colors = pointsG.attributes.aColor.array;
  alpha = pointsG.attributes.aAlpha.array;
  sizes = pointsG.attributes.aSize.array;
  const pointsU = { uPixel: { value: 1 } };
  const pointsMat = new Shader({
    uniforms: pointsU,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    vertexShader: `attribute vec3 aColor;attribute float aAlpha,aSize;uniform float uPixel;varying vec3 vColor;varying float vAlpha;void main(){vColor=aColor;vAlpha=aAlpha;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*uPixel*70./max(5.,-p.z),1.,8.);}`,
    fragmentShader: `varying vec3 vColor;varying float vAlpha;void main(){float d=dot(gl_PointCoord*2.-1.,gl_PointCoord*2.-1.);if(d>1.||vAlpha<.002)discard;vec3 c=mix(vColor,vec3(1.),exp(-d*12.)*.45);gl_FragColor=vec4(c,vAlpha*exp(-d*3.)*(1.-smoothstep(.5,1.,d)));}`,
  });
  pointsMat.userData.ringBloom = { gain: 2 };
  const points = new Points(pointsG, pointsMat);
  points.frustumCulled = false;
  points.renderOrder = 2;
  root.add(points);
  let displayedCycle = null;
  let seen = new Set(),
    synchronize = true,
    next = 0,
    collected = 0,
    used = 0,
    active = 0;
  function point(p, color, a, size) {
    if (used >= maxParticles) return;
    positions.set(p, used * 3);
    colors.set(color, used * 3);
    alpha[used] = a;
    sizes[used] = size;
    used++;
  }
  return {
    root,
    items,
    points,
    slots,
    reset() {
      synchronize = true;
      displayedCycle = null;
      seen.clear();
      collected = 0;
      active = used = 0;
      for (const slot of slots) {
        slot.active = false;
        slot.pulse.visible = false;
      }
    },
    update(run, dt, time, pixel = 1, reduced = false) {
      used = 0;
      active = 0;
      if (displayedCycle !== run.laps) {
        displayedCycle = run.laps;
        synchronize = true;
        seen.clear();
        for (const slot of slots) {
          slot.active = false;
          slot.pulse.visible = false;
        }
        for (const v of items) {
          v.f = course.pose(v.item.s, v.item.lane);
          v.anchor.position.fromArray(add(v.f.p, mul(v.f.up, v.item.height || 1.35)));
          orient(v.anchor, v.f);
        }
      }
      pointsU.uPixel.value = Math.min(2, pixel);
      if (synchronize) {
        seen = new Set(run.taken);
        synchronize = false;
      }
      for (const i of run.taken)
        if (!seen.has(i)) {
          seen.add(i);
          if (items[i] && Math.abs(items[i].item.s - run.s) < 25) {
            const slot = slots[next++ % POOL];
            slot.active = true;
            slot.index = i;
            slot.start = time;
            collected++;
            slot.pulse.position.copy(items[i].anchor.position);
            slot.pulse.quaternion.copy(items[i].anchor.quaternion);
            slot.pulse.material.color.copy(glow[items[i].item.type].color);
            if (items[i].item.type === "air") slot.pulse.material.color.multiplyScalar(1.6);
          }
        }
      for (const v of items) {
        const ahead = v.item.s - run.s;
        v.anchor.visible = !run.taken.has(v.index) && ahead > -18 && ahead < 200;
        if (!v.anchor.visible) continue;
        v.body.position.y = reduced ? 0 : Math.sin(time * 1.8 + v.index) * 0.065;
        v.rotor.rotation.y =
          v.item.type === "air"
            ? reduced
              ? 0.2
              : time * 0.6
            : v.item.type === "ring" || v.item.type === "star"
              ? reduced
                ? 0.35
                : time * 0.75
              : 0;
        if (v.item.type === "sky") v.rotor.rotation.z = reduced ? 0 : time * 0.18;
        const style = PICKUP_STYLES[v.item.type],
          center = v.anchor.position.toArray();
        for (let j = 0; j < (reduced ? 0 : 5); j++) {
          const a = time * 0.8 + (j * Math.PI * 2) / 5 + v.index,
            r = v.item.type === "sky" ? 2.2 : v.item.type === "ring" ? 0.94 : 0.72;
          point(
            add(center, add(mul(v.f.right, Math.cos(a) * r), mul(v.f.up, Math.sin(a) * r))),
            style.rgb,
            0.3,
            0.38,
          );
        }
      }
      const carFrame = course.pose(run.s, run.lane);
      const car = add(run.pos, add(mul(carFrame.up, 0.7), mul(carFrame.t, -1.6)));
      for (const slot of slots) {
        if (!slot.active) continue;
        const v = items[slot.index],
          style = PICKUP_STYLES[v.item.type];
        const age = (time - slot.start) / style.duration;
        if (age >= 1 || age < 0) {
          slot.active = false;
          slot.pulse.visible = false;
          continue;
        }
        active++;
        const fade = (1 - age) * (1 - age),
          base = v.anchor.position.toArray();
        slot.pulse.visible = true;
        slot.pulse.scale.setScalar(
          (v.item.type === "sky" ? 2.12 : 0.95) + (reduced ? 0 : age * 1.4),
        );
        slot.pulse.material.opacity = fade * (v.item.type === "sky" ? 0.24 : 0.45);
        for (let j = 0; j < (reduced ? 5 : SPARKS); j++) {
          const a = j * 2.39996 + slot.index,
            r = 0.18 + (j % 5) * 0.07;
          let p;
          if (v.item.type === "air") {
            const q = 1 - (1 - age) * (1 - age),
              radius = (1.25 + r) * Math.pow(1 - age, 0.65);
            p = base.map((n, k) => n + (car[k] - n) * q);
            p = add(
              p,
              add(
                mul(v.f.right, Math.cos(a + age * 5) * radius),
                mul(v.f.up, Math.sin(a + age * 5) * radius * 0.7 + 0.25 * (1 - age)),
              ),
            );
          } else {
            const radius = r + 0.2 + age * (v.item.type === "sky" ? 2 : 1.6);
            p = add(
              base,
              add(
                mul(v.f.right, Math.cos(a) * radius),
                add(mul(v.f.up, Math.sin(a) * radius), mul(v.f.t, ((j % 3) - 1) * age * 0.6)),
              ),
            );
          }
          point(
            p,
            v.item.type === "star" ? RAINBOW_RGB[j % 6] : style.rgb,
            fade * 0.95,
            0.65 + (j % 3) * 0.12,
          );
        }
      }
      points.visible = used > 0;
      pointsG.setDrawRange(0, used);
      for (const name of ["position", "aColor", "aAlpha", "aSize"])
        pointsG.attributes[name].needsUpdate = true;
    },
    status: () => ({
      types: Object.fromEntries(Object.entries(PICKUP_STYLES).map(([k, v]) => [k, v.name])),
      models: items.length,
      particles: used,
      activeBursts: active,
      collectedEffects: collected,
      burstPool: POOL,
      openSkyCenter: true,
      physicalScale: { air: 1.8, core: 1.8, gateInnerDiameter: 4.2 },
      materialStyle: "ceramic-metal-glass-with-machined-fittings",
      cycle: displayedCycle,
    }),
  };
}
