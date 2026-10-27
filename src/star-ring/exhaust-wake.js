import {
  B as Group,
  R as Mesh,
  Uc as Points,
  Jr as Geometry,
  L as Attribute,
  gi as Shader,
} from "../vendor/rendering.js";

const PORTS = [-0.465, -0.155, 0.155, 0.465],
  HISTORY = 32,
  SIDES = 8,
  MIST = 192,
  LIFE = 0.32;
const PALETTE = [
  [1, 0.13, 0.28],
  [1, 0.56, 0.08],
  [1, 0.94, 0.18],
  [0.12, 1, 0.5],
  [0.13, 0.66, 1],
  [0.65, 0.2, 1],
];
const WHITE = [0.66, 0.84, 1];
const vertex = `
attribute vec4 aColor;attribute float aAge,aClearance;varying vec4 vColor;
varying vec3 vNormalW,vViewW;varying vec2 vFlow;varying float vClearance;
void main(){vec4 w=modelMatrix*vec4(position,1.);vColor=aColor;
vNormalW=normalize(mat3(modelMatrix)*normal);vViewW=cameraPosition-w.xyz;
vFlow=vec2(uv.x,aAge);vClearance=aClearance;gl_Position=projectionMatrix*viewMatrix*w;}`;
const fragment = `
uniform sampler2D uNoise;uniform float uTime;varying vec4 vColor;
varying vec3 vNormalW,vViewW;varying vec2 vFlow;varying float vClearance;
void main(){
float facing=abs(dot(normalize(vNormalW),normalize(vViewW)));
vec2 flow=vec2(vFlow.x*2.,vFlow.y*2.7-uTime*1.7);
vec3 slow=texture2D(uNoise,flow).rgb;
vec3 fine=texture2D(uNoise,flow*2.73+vec2(.19,-uTime*1.1)).rgb;
float clump=slow.r*.64+fine.g*.36;
float erosion=smoothstep(vFlow.y*.58-.12,vFlow.y*.58+.26,clump);
float soft=smoothstep(.02,.72,facing);
float a=vColor.a*soft*erosion*(.48+.52*clump)*smoothstep(.025,.12,vClearance);
if(a<.003)discard;
vec3 tint=mix(vec3(.82,.94,1.1),vColor.rgb,smoothstep(.02,.28,vFlow.y)*.42);
float cells=.85+.15*cos(vFlow.y*65.-uTime*4.);
gl_FragColor=vec4(tint*(.75+.35*fine.b)*cells,min(a,.42));}`;
const mistVertex = `
attribute vec4 aColor;attribute float aSize,aClearance,aSeed;uniform float uPixel;
varying vec4 vColor;varying float vSeed,vClearance;
void main(){vColor=aColor;vSeed=aSeed;vClearance=aClearance;
vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;
gl_PointSize=clamp(aSize*uPixel*125./max(2.,-p.z),1.,46.);}`;
const mistFragment = `
uniform sampler2D uNoise;uniform float uTime;varying vec4 vColor;
varying float vSeed,vClearance;
void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;
float n=texture2D(uNoise,gl_PointCoord*.55+vec2(vSeed,uTime*.09)).b;
float a=vColor.a*exp(-r*3.2)*(1.-smoothstep(.35,1.,r))*(.48+.52*n)*smoothstep(.025,.12,vClearance);
if(a<.002)discard;gl_FragColor=vec4(mix(vec3(.68,.81,.9),vColor.rgb,.55),a);}`;

export function createExhaustWake(scene, noise) {
  const group = new Group();
  group.name = "Four nozzle turbulent exhaust wake";
  scene.add(group);
  const vertices = 4 * (HISTORY - 1) * SIDES * 6,
    g = new Geometry(),
    pg = new Geometry();
  for (const [name, size] of [
    ["position", 3],
    ["normal", 3],
    ["uv", 2],
    ["aColor", 4],
    ["aAge", 1],
    ["aClearance", 1],
  ])
    g.setAttribute(name, new Attribute(new Float32Array(vertices * size), size));
  for (const [name, size] of [
    ["position", 3],
    ["aColor", 4],
    ["aSize", 1],
    ["aClearance", 1],
    ["aSeed", 1],
  ])
    pg.setAttribute(name, new Attribute(new Float32Array(MIST * size), size));
  const uniforms = { uNoise: { value: noise }, uTime: { value: 0 }, uPixel: { value: 1 } };
  const mat = new Shader({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: 2,
  });
  const pm = new Shader({
    uniforms,
    vertexShader: mistVertex,
    fragmentShader: mistFragment,
    transparent: true,
    depthWrite: false,
  });
  mat.userData.ringBloom = { gain: 0.8 };
  pm.userData.ringBloom = { gain: 0.45 };
  const mesh = new Mesh(g, mat),
    points = new Points(pg, pm);
  mesh.frustumCulled = points.frustumCulled = false;
  group.add(mesh, points);
  const a = Object.fromEntries(Object.entries(g.attributes).map(([k, v]) => [k, v.array])),
    b = Object.fromEntries(Object.entries(pg.attributes).map(([k, v]) => [k, v.array])),
    history = [];
  let last = -1,
    origin = "",
    used = 0,
    particleCount = 0,
    maximumAge = 0,
    effort = 0,
    lastTime = null;
  // Preallocated working vectors; no per-vertex arrays or runtime textures.
  const point = new Float64Array(3),
    radial = new Float64Array(3);
  function sample(h, port, angle, age, time) {
    const radius = 0.043 + Math.pow(age, 1.12) * (0.35 + 0.27 * (h.power ?? 1)),
      swirl = age * age * (h.reduced ? 0 : 0.1),
      ca = Math.cos(angle),
      sa = Math.sin(angle);
    for (let k = 0; k < 3; k++) {
      radial[k] = h.right[k] * ca + h.up[k] * sa;
      point[k] =
        h.p[k] +
        h.right[k] * (PORTS[port] + Math.sin(age * 13 + port * 1.9 - time * 4) * swirl) +
        h.up[k] * (0.461 + Math.cos(age * 11 + port * 1.4 - time * 3) * swirl * 0.6) -
        h.t[k] * 2.29 +
        radial[k] * radius;
    }
  }
  function clearance(h) {
    return h.floor
      ? (point[0] - h.floor[0]) * h.normal[0] +
          (point[1] - h.floor[1]) * h.normal[1] +
          (point[2] - h.floor[2]) * h.normal[2]
      : 10;
  }
  function rgb(h, port) {
    return h.rainbow ? PALETTE[port] : WHITE;
  }
  function reset() {
    history.length = 0;
    last = -1;
    used = particleCount = maximumAge = effort = 0;
    lastTime = null;
    mesh.visible = points.visible = false;
    g.setDrawRange(0, 0);
    pg.setDrawRange(0, 0);
  }
  reset();
  return {
    group,
    reset,
    mesh,
    points,
    update(run, car, time, rainbow, reduced, pixel = 1, near = null, detail = 1) {
      const key = (run.worldOrigin || [0, 0, 0]).join(":");
      if (key !== origin) {
        origin = key;
        reset();
      }
      if (run.phase !== "running") {
        reset();
        return;
      }
      uniforms.uTime.value = time;
      uniforms.uPixel.value = Math.min(2, pixel);
      const desired = rainbow
        ? 0.75
        : run.input.boost
          ? Math.min(1, Math.max(0, run.pressure / 20))
          : 0;
      const delta = lastTime === null ? 1 / 60 : Math.min(2, Math.max(0, time - lastTime));
      lastTime = time;
      effort += (desired - effort) * (1 - Math.exp(-14 * delta));
      const on = desired > 0.02;
      if (on && time - last >= 1 / 45) {
        car.updateWorldMatrix(true, false);
        const m = car.matrixWorld.elements;
        history.unshift({
          p: [m[12], m[13], m[14]],
          right: [m[0], m[1], m[2]],
          up: [m[4], m[5], m[6]],
          t: [-m[8], -m[9], -m[10]],
          time,
          rainbow,
          power: effort,
          reduced,
          floor: near?.exists ? [...near.p] : null,
          normal: near?.exists ? [...near.up] : null,
        });
        last = time;
        if (history.length > HISTORY) history.pop();
      }
      while (history.length && time - history.at(-1).time > LIFE) history.pop();
      used = particleCount = maximumAge = 0;
      for (let port = 0; port < 4; port++)
        for (let i = 0; i < history.length - 1; i++)
          for (let side = 0; side < SIDES; side++)
            for (let j = 0; j < 6; j++) {
              const h = history[i + (j === 0 || j === 1 || j === 3 ? 0 : 1)],
                edge = j === 1 || j === 3 || j === 4 ? 1 : 0,
                angle = ((side + edge) / SIDES) * Math.PI * 2,
                age = Math.min(1, (time - h.time) / LIFE),
                color = rgb(h, port);
              sample(h, port, angle, age, time);
              const fade =
                Math.pow(Math.max(0, 1 - age), 1.8) * 0.32 * (0.35 + 0.65 * (h.power ?? 1));
              for (let k = 0; k < 3; k++) {
                a.position[used * 3 + k] = point[k];
                a.normal[used * 3 + k] = radial[k];
                a.aColor[used * 4 + k] = color[k];
              }
              a.aColor[used * 4 + 3] = fade * (reduced ? 0.65 : 1);
              a.uv[used * 2] = (side + edge) / SIDES + port * 0.17;
              a.uv[used * 2 + 1] = age;
              a.aAge[used] = age;
              a.aClearance[used] = clearance(h);
              maximumAge = Math.max(maximumAge, age * LIFE);
              used++;
            }
      const perPort = reduced ? 12 : Math.max(12, Math.floor(48 * detail));
      if (history.length > 1)
        for (let port = 0; port < 4; port++)
          for (let i = 0; i < perPort; i++) {
            const h =
                history[
                  Math.min(history.length - 1, Math.floor(((i + 0.5) / perPort) * history.length))
                ],
              age = Math.min(1, (time - h.time) / LIFE),
              angle = i * 2.399 + time * 0.6,
              color = rgb(h, port);
            sample(h, port, angle, age, time);
            for (let k = 0; k < 3; k++) {
              b.position[particleCount * 3 + k] = point[k];
              b.aColor[particleCount * 4 + k] = color[k];
            }
            b.aColor[particleCount * 4 + 3] =
              Math.sin(age * Math.PI) * Math.pow(1 - age, 1.5) * 0.28;
            b.aSize[particleCount] = 0.1 + age * 0.8;
            b.aClearance[particleCount] = clearance(h);
            b.aSeed[particleCount] = i * 0.618 + port * 0.31;
            particleCount++;
          }
      mesh.visible = used > 0;
      points.visible = particleCount > 0;
      g.setDrawRange(0, used);
      pg.setDrawRange(0, particleCount);
      for (const attribute of Object.values(g.attributes)) attribute.needsUpdate = true;
      for (const attribute of Object.values(pg.attributes)) attribute.needsUpdate = true;
    },
    status: () => ({
      style: "four-nozzle-volumetric-cold-gas",
      activeVertices: used,
      history: history.length,
      capacity: HISTORY,
      ports: 4,
      bands: 0,
      meshes: 2,
      particles: particleCount,
      particleCapacity: MIST,
      maximumAge,
      lifetime: LIFE,
      throttle: effort,
      pressureResponsive: true,
      softErodedEdges: true,
      sharedNativeNoise: uniforms.uNoise.value === noise,
      historicalFloorClip: true,
    }),
  };
}
