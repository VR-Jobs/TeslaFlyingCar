import { RAINBOW_RGB } from "./rainbow-view.js";
import {
  B as Group,
  R as Mesh,
  Jr as Geometry,
  L as Attribute,
  gi as Shader,
  P as Vector3,
  Uc as Points,
  V as Cylinder,
  H as Material,
} from "../vendor/rendering.js";
import { deathFrame } from "./failure.js";
import { clamp } from "./course.js";

const ports = {
  L1: [-0.58, 0.079, -1.82],
  L2: [0.58, 0.079, -1.82],
  L3: [-0.79, 0.079, 2.14],
  L4: [0.79, 0.079, 2.14],
  R1: [-0.465, 0.461, 2.27],
  R2: [-0.155, 0.461, 2.27],
  R3: [0.155, 0.461, 2.27],
  R4: [0.465, 0.461, 2.27],
  S1: [-1, 0.18, -0.25],
  S2: [1, 0.18, -0.25],
};
const PORT_NAMES = Object.keys(ports),
  PARTICLES = 512,
  RIBBONS = 12,
  STEPS = 25;
const vertex =
  "varying vec3 vWorld;varying float vAlong,vSide;attribute float aAlong,aSide;void main(){vAlong=aAlong;vSide=aSide;vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}";
const fragment =
  "precision highp float;varying vec3 vWorld;varying float vAlong,vSide;uniform float uTime,uSuction,uClip;uniform vec3 uFloorP,uFloorN;void main(){if(uClip>.5&&dot(vWorld-uFloorP,uFloorN)<.025)discard;float flow=pow(max(0.,cos(vAlong*28.-uTime*10.)),5.);float a=(.1+.42*flow)*uSuction*(1.-smoothstep(.15,1.,abs(vSide)))*smoothstep(0.,.08,vAlong)*(1.-smoothstep(.92,1.,vAlong));if(a<.003)discard;gl_FragColor=vec4(.65,.9,1.,a);}";
export function createSoftVaporMaterial() {
  return new Shader({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uOpacity: { value: 0 },
      uTime: { value: 0 },
      uPixel: { value: 1 },
      uSize: { value: 1 },
    },
    vertexShader:
      "uniform float uPixel,uSize;varying vec3 vSeed;void main(){vSeed=position;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(95.*uPixel*uSize/max(2.,-p.z),2.,40.);}",
    fragmentShader:
      "precision highp float;uniform float uOpacity,uTime;varying vec3 vSeed;void main(){vec2 uv=gl_PointCoord*2.-1.;float r=dot(uv,uv);if(r>1.)discard;float grain=.78+.22*sin(uv.x*15.+uv.y*12.+vSeed.x*3.+uTime*2.);float a=exp(-r*3.)*(1.-smoothstep(.5,1.,r))*uOpacity*grain;gl_FragColor=vec4(.78,.87,.93,a);}",
  });
}
export function createFlightEffects(visual, templates) {
  const root = new Group();
  root.name = "Native layered jets, RCS and converging intake";
  visual.add(root);
  const floorP = new Vector3(),
    floorN = new Vector3(0, 1, 0);
  const plumes = [];
  for (const id of PORT_NAMES) {
    const source = templates[id]?.mesh;
    if (!source) throw new Error("Missing original thruster plume " + id);
    const mesh = source.clone(),
      material = source.material.clone();
    mesh.material = material;
    material.uniforms.uNoise.value = source.material.uniforms.uNoise.value;
    material.uniforms.uRingFloorP = { value: floorP };
    material.uniforms.uRingFloorN = { value: floorN };
    material.uniforms.uRingClip = { value: 0 };
    material.vertexShader =
      "varying vec3 vRingWorld;\n" +
      material.vertexShader.replace(
        "vNormalW = normalize(mat3(modelMatrix) * normal);",
        "vRingWorld=world.xyz;vNormalW = normalize(mat3(modelMatrix) * normal);",
      );
    material.fragmentShader =
      "varying vec3 vRingWorld;uniform vec3 uRingFloorP,uRingFloorN;uniform float uRingClip;\n" +
      material.fragmentShader.replace(
        "if (alpha < 0.004) discard;",
        "float floorDistance=dot(vRingWorld-uRingFloorP,uRingFloorN);if(uRingClip>.5){if(floorDistance<.018)discard;alpha*=smoothstep(.018,.12,floorDistance);}if (alpha < 0.004) discard;",
      );
    material.userData.ringBloom = { gain: 0.75 };
    material.needsUpdate = true;
    mesh.position.fromArray(ports[id]);
    mesh.visible = false;
    mesh.onBeforeRender = () => {};
    for (const child of mesh.children)
      if (child.material) {
        child.material = child.material.clone();
        child.material.userData.ringBloom = { gain: 0.7 };
      }
    root.add(mesh);
    plumes.push({
      id,
      mesh,
      material,
      level: 0,
      width: id[0] === "L" ? 0.3 : id[0] === "R" ? 0.27 : 0.25,
      length: id[0] === "L" ? 1.85 : id[0] === "R" ? 3.5 : 1.4,
    });
  }
  for (const side of [-1, 1]) {
    const nozzle = new Mesh(
      new Cylinder(0.044, 0.044, 0.03, 12),
      new Material({ color: "#596575", metalness: 0.85, roughness: 0.25 }),
    );
    nozzle.position.set(side, 0.18, -0.25);
    nozzle.rotation.z = (side * Math.PI) / 2;
    root.add(nozzle);
  }
  const uniforms = {
    uTime: { value: 0 },
    uSuction: { value: 0 },
    uClip: { value: 0 },
    uFloorP: { value: floorP },
    uFloorN: { value: floorN },
  };
  const ribbonG = new Geometry(),
    ribbonP = new Float32Array(RIBBONS * STEPS * 2 * 3),
    along = [],
    sides = [],
    indices = [];
  for (let j = 0; j < RIBBONS; j++)
    for (let i = 0; i < STEPS; i++) {
      along.push(i / (STEPS - 1), i / (STEPS - 1));
      sides.push(-1, 1);
      if (i < STEPS - 1) {
        const b = (j * STEPS + i) * 2;
        indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
  ribbonG.setAttribute("position", new Attribute(ribbonP, 3));
  ribbonG.setAttribute("aAlong", new Attribute(along, 1));
  ribbonG.setAttribute("aSide", new Attribute(sides, 1));
  ribbonG.setIndex(indices);
  const ribbonMat = new Shader({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: 2,
  });
  ribbonMat.userData.ringBloom = { gain: 1.1 };
  const ribbons = new Mesh(ribbonG, ribbonMat);
  ribbons.frustumCulled = false;
  root.add(ribbons);
  const particleG = new Geometry();
  particleG.setAttribute("position", new Attribute(new Float32Array(PARTICLES * 3), 3));
  particleG.setAttribute("aAlpha", new Attribute(new Float32Array(PARTICLES), 1));
  particleG.setAttribute("aSize", new Attribute(new Float32Array(PARTICLES), 1));
  const pointUniforms = {
    uPixel: { value: 1 },
    uClip: uniforms.uClip,
    uFloorP: uniforms.uFloorP,
    uFloorN: uniforms.uFloorN,
  };
  const pointMat = new Shader({
    uniforms: pointUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader:
      "attribute float aAlpha,aSize;uniform float uPixel;varying float vAlpha;varying vec3 vWorld;void main(){vAlpha=aAlpha;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vec4 p=viewMatrix*w;gl_Position=projectionMatrix*p;gl_PointSize=clamp(aSize*uPixel*95./max(2.,-p.z),1.,22.);}",
    fragmentShader:
      "precision highp float;uniform float uClip;uniform vec3 uFloorP,uFloorN;varying vec3 vWorld;varying float vAlpha;void main(){if(vAlpha<.002||(uClip>.5&&dot(vWorld-uFloorP,uFloorN)<.025))discard;vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;gl_FragColor=vec4(.76,.91,1.,vAlpha*exp(-r*3.)*(1.-smoothstep(.5,1.,r)));}",
  });
  pointMat.userData.ringBloom = { gain: 0.9 };
  const particles = new Points(particleG, pointMat);
  particles.frustumCulled = false;
  root.add(particles);
  const pArray = particleG.attributes.position.array,
    aArray = particleG.attributes.aAlpha.array,
    sizeArray = particleG.attributes.aSize.array,
    rArray = ribbonG.attributes.position.array;
  let suction = 0,
    lift = 0,
    boost = 0,
    used = 0,
    gasLevel = 0;
  function point(x, y, z, a, size) {
    if (used >= PARTICLES) return;
    pArray.set([x, y, z], used * 3);
    aArray[used] = a;
    sizeArray[used] = size;
    used++;
  }
  return {
    root,
    plumes,
    ribbons,
    particles,
    update(run, near, dt, time, pixel = 1, reduced = false, detail = 1) {
      const alive = run.phase === "running",
        held = alive && run.input.suction && run.pressure > 0;
      const thrust = alive && !run.attached && run.input.jump && run.pressure > 0;
      const pressure = Math.min(1, Math.max(0, run.pressure / 20));
      const targetSuction = held ? (run.attached ? 1 : 0.75) * pressure : 0;
      suction += (targetSuction - suction) * (1 - Math.exp(-12 * dt));
      lift += ((thrust ? pressure : 0) - lift) * (1 - Math.exp(-15 * dt));
      boost +=
        ((alive && run.input.boost && run.pressure > 0 ? pressure : 0) - boost) *
        (1 - Math.exp(-12 * dt));
      if (!alive) {
        suction *= Math.exp(-10 * dt);
        lift *= Math.exp(-12 * dt);
        boost *= Math.exp(-12 * dt);
      }
      floorP.fromArray(near.p);
      floorN.fromArray(near.up);
      const clip = near.exists && run.phase === "running";
      uniforms.uClip.value = Number(clip);
      uniforms.uTime.value = time;
      uniforms.uSuction.value = suction;
      pointUniforms.uPixel.value = Math.min(2, pixel);
      gasLevel = 0;
      for (const v of plumes) {
        const spin = run.rollProgress || run.flipProgress || 0;
        let power = v.id[0] === "L" ? lift : v.id[0] === "R" ? boost : 0;
        if (alive && spin > 0) {
          if (v.id[0] === "S" && run.rollProgress) {
            const positive = (run.rollDir || 1) * (spin < 0.5 ? 1 : -1) > 0;
            power = v.id === (positive ? "S1" : "S2") ? 0.72 : 0.05;
          }
          if (v.id[0] === "L" && run.flipProgress)
            power = Math.max(power, Number(v.id.slice(1)) <= 2 === spin < 0.5 ? 0.45 : 0.08);
        }
        if (alive && v.id[0] === "R" && (run.rainbow?.remaining || 0) > 0)
          power = Math.max(power, 0.62);
        if (v.id[0] === "R" && !reduced)
          power *= 0.96 + 0.04 * Math.sin(time * 9.7 + Number(v.id.slice(1)) * 1.77);
        v.level = power;
        gasLevel = Math.max(gasLevel, power);
        const m = v.material;
        m.uniforms.uTime.value = time;
        m.uniforms.uLevel.value = power;
        // Narrow, pressurized throat; the original three noisy layers expand downstream.
        if (v.id[0] === "R") m.uniforms.uSpread.value = 0.4 + 0.22 * power;
        m.uniforms.uRingClip.value = Number(clip);
        if ((run.rainbow?.remaining || 0) > 0) {
          const rgb = RAINBOW_RGB[(Number(v.id.slice(1)) - 1 + (v.id[0] === "R" ? 0 : 2)) % 6];
          m.uniforms.uLight.value.setRGB(rgb[0] * 1.15, rgb[1] * 1.15, rgb[2] * 1.15);
        } else m.uniforms.uLight.value.setRGB(1.25, 1.32, 1.4);
        m.uniforms.uSun.value.set(0.35, 0.82, 0.25).normalize();
        m.uniforms.uWind.value.fromArray(near.t).multiplyScalar(-Math.min(0.5, run.speed * 0.009));
        const width = v.width * (0.85 + 0.15 * power);
        const pulse = reduced
          ? 1
          : 1 + Math.sin(time * 21 + Number(v.id.slice(1)) * 1.7) * 0.035 * power;
        v.mesh.scale.set(width, v.length * (0.4 + 0.6 * power) * pulse, width);
        v.mesh.visible = power > 0.025;
        for (const child of v.mesh.children)
          if (child.material) {
            child.scale.set((0.45 * power) / width, (0.45 * power) / v.mesh.scale.y, 1);
            child.material.opacity = 0.65 * power;
          }
      }
      ribbons.visible = suction > 0.015;
      for (let j = 0; j < RIBBONS; j++) {
        const port = ports["L" + ((j % 4) + 1)],
          angle = j * 2.399;
        for (let i = 0; i < STEPS; i++) {
          const t = i / (STEPS - 1),
            radius = (1 - t) * (1 - t) * 3.7;
          const theta = angle + (reduced ? 0 : time * 0.28) + (1 - t) * 1.8;
          const x = port[0] + Math.cos(theta) * radius,
            z = port[2] + Math.sin(theta) * radius * 0.85;
          const y = 0.12 + Math.sin(t * Math.PI) * (0.4 + 0.12 * (j % 3));
          const width = (0.018 + 0.026 * (1 - t)) * suction;
          const at = (j * STEPS + i) * 6;
          rArray.set(
            [
              x + Math.cos(theta + Math.PI / 2) * width,
              y,
              z + Math.sin(theta + Math.PI / 2) * width,
              x - Math.cos(theta + Math.PI / 2) * width,
              y,
              z - Math.sin(theta + Math.PI / 2) * width,
            ],
            at,
          );
        }
      }
      ribbonG.attributes.position.needsUpdate = true;
      used = 0;
      if (suction > 0.02)
        for (let i = 0; i < (reduced ? 24 : Math.floor(144 * detail)); i++) {
          const t = (time * 1.25 + i * 0.618) % 1,
            port = ports["L" + ((i % 4) + 1)],
            a = i * 2.399 + t * 2.4,
            r = (1 - t) * (1 - t) * 3.5;
          point(
            port[0] + Math.cos(a) * r,
            0.13 + Math.sin(t * Math.PI) * 0.48,
            port[2] + Math.sin(a) * r * 0.85,
            suction * (0.2 + 0.5 * t) * Math.sin(t * Math.PI),
            0.08 + 0.08 * t,
          );
        }
      if (gasLevel > 0.04)
        for (const v of plumes) {
          if (v.level < 0.1) continue;
          const count = reduced ? 12 : Math.max(8, Math.floor(32 * detail));
          for (let j = 0; j < count; j++) {
            const t = (time * (1.1 + v.level) + j * 0.618 + v.id.charCodeAt(0) * 0.01) % 1,
              a = j * 2.399;
            const r = (0.06 + t * t * 0.65) * v.level;
            const center = ports[v.id],
              distance = t * v.length * 1.3;
            if (v.id[0] === "L")
              point(
                center[0] + Math.cos(a) * r,
                center[1] - distance,
                center[2] + Math.sin(a) * r + t * t * 0.45,
                v.level * (1 - t) * 0.18,
                0.3 + t * 0.6,
              );
            else if (v.id[0] === "R")
              point(
                center[0] + Math.cos(a) * r,
                center[1] + Math.sin(a) * r,
                center[2] + distance,
                v.level * (1 - t) * 0.18,
                0.3 + t * 0.55,
              );
          }
        }
      particles.visible = used > 0;
      particleG.setDrawRange(0, used);
      for (const key of ["position", "aAlpha", "aSize"])
        particleG.attributes[key].needsUpdate = true;
    },
    reset() {
      suction = lift = boost = gasLevel = 0;
      used = 0;
      ribbons.visible = particles.visible = false;
      for (const v of plumes) {
        v.mesh.visible = false;
        v.level = 0;
      }
    },
    status: () => ({
      style: "original-three-layer-turbulent-cold-gas",
      nativePlumes: plumes.length,
      sharedNativeGeometry: plumes.every((v) => v.mesh.geometry === templates[v.id].mesh.geometry),
      sharedNativeNoise: plumes.every(
        (v) =>
          v.material.uniforms.uNoise.value === templates[v.id].mesh.material.uniforms.uNoise.value,
      ),
      curvedSurfaceClip: true,
      suction,
      jet: lift,
      boost,
      levels: Object.fromEntries(plumes.map((p) => [p.id, p.level])),
      intakeRibbons: RIBBONS,
      particles: used,
      particleCapacity: PARTICLES,
      pressureResponsive: true,
      convergingIntake: true,
    }),
  };
}
