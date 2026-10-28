import {
  B as Group,
  Uc as Points,
  Jr as Geometry,
  L as Attribute,
  Lc as Instanced,
  pr as Object3D,
  I as Color,
  Ii as Plane,
  gi as Shader,
} from "../vendor/rendering.js";

export const FX_BUDGET = Object.freeze({ sparks: 144, mist: 48, ripples: 8 });
const vertex = `attribute vec4 aTint;attribute float aSize,aSeed;
  uniform float uPixel;varying vec4 vTint;varying float vSeed;
  void main(){vTint=aTint;vSeed=aSeed;vec4 p=modelViewMatrix*vec4(position,1.);
    gl_Position=projectionMatrix*p;
    gl_PointSize=clamp(aSize*uPixel*155./max(2.,-p.z),1.,54.);}`;
const fragment = `uniform float uTime,uMist;varying vec4 vTint;varying float vSeed;
  void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;
    float grain=.74+.26*sin(p.x*8.+vSeed*31.+uTime*.6)*sin(p.y*7.-vSeed*17.);
    float soft=exp(-r*3.8)*(1.-smoothstep(.3,1.,r));
    float star=exp(-abs(p.x)*28.)*exp(-abs(p.y)*5.)+
      exp(-abs(p.y)*28.)*exp(-abs(p.x)*5.);
    float a=vTint.a*mix(soft+star*.12,soft*grain,uMist);
    if(a<.002)discard;gl_FragColor=vec4(vTint.rgb,a);}`;
const rippleVertex = `varying vec2 vUv;varying vec3 vTint;
  void main(){vUv=uv;vTint=instanceColor;
    gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`;
const rippleFragment = `varying vec2 vUv;varying vec3 vTint;
  void main(){float r=length((vUv-.5)*2.);
    float line=exp(-pow((r-.76)*65.,2.));
    float halo=exp(-pow((r-.76)*13.,2.))*.18;
    float a=line*.42+halo;if(a<.002)discard;
    gl_FragColor=vec4(vTint,a);}`;

// World-distance anchored pools: effects stay at the actual contact point as
// the highway scrolls. No meshes, materials or textures are created on events.
export function createOrbitTransients(parent) {
  const root = new Group();
  root.name = "Orbital contact light / fixed particle pools";
  parent.add(root);
  const uniforms = { uTime: { value: 0 }, uPixel: { value: 1 } };
  function pool(capacity, mist) {
    const geometry = new Geometry();
    for (const [name, size] of [
      ["position", 3],
      ["aTint", 4],
      ["aSize", 1],
      ["aSeed", 1],
    ])
      geometry.setAttribute(name, new Attribute(new Float32Array(capacity * size), size));
    const mesh = new Points(
      geometry,
      new Shader({
        uniforms: { ...uniforms, uMist: { value: +mist } },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: mist ? 1 : 2,
        toneMapped: false,
      }),
    );
    mesh.frustumCulled = false;
    geometry.setDrawRange(0, 0);
    root.add(mesh);
    return {
      mesh,
      items: Array.from({ length: capacity }, () => ({ born: -99, life: 0 })),
      cursor: 0,
      active: 0,
      mist,
    };
  }
  const sparks = pool(FX_BUDGET.sparks, false),
    mist = pool(FX_BUDGET.mist, true);
  const ripple = new Instanced(
    new Plane(2, 2),
    new Shader({
      vertexShader: rippleVertex,
      fragmentShader: rippleFragment,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: 2,
      blending: 2,
      toneMapped: false,
    }),
    FX_BUDGET.ripples,
  );
  ripple.frustumCulled = false;
  ripple.count = 0;
  root.add(ripple);
  const waves = Array.from({ length: FX_BUDGET.ripples }, () => ({ born: -99, life: 0 }));
  const dummy = new Object3D(),
    tint = new Color();
  // Allocate the instance-color shader variant before the loading warm-up.
  ripple.setColorAt(0, tint.setRGB(1, 1, 1));
  let waveCursor = 0,
    quality = 2,
    reduced = false,
    last = null;
  function reset() {
    for (const pool of [sparks, mist]) {
      for (const item of pool.items) item.life = 0;
      pool.active = pool.cursor = 0;
      pool.mesh.geometry.setDrawRange(0, 0);
    }
    for (const wave of waves) wave.life = 0;
    ripple.count = waveCursor = 0;
    last = null;
  }
  function emit(kind, { time, distance, x, y = 0.12, impact = 0.5, count = 1 }) {
    if (![time, distance, x, y, impact].every(Number.isFinite)) return;
    const landing = kind === "land",
      bank = kind === "bank";
    const force = Math.max(0.15, Math.min(1, impact));
    const budget = reduced ? 0.35 : quality === 0 ? 0.4 : quality === 1 ? 0.7 : 1;
    const n = Math.round((landing ? 12 + force * 10 : bank ? 18 : 40) * budget);
    for (let i = 0; i < n; i++) {
      const item = sparks.items[sparks.cursor++ % sparks.items.length];
      const a = i * 2.399963 + time,
        seed = (((i * 0.618034 + time * 0.13) % 1) + 1) % 1;
      const r = landing || bank ? 0.7 : 1.28;
      Object.assign(item, {
        born: time,
        life: 0.38 + seed * 0.38,
        seed,
        x: x + Math.cos(a) * r,
        y: landing || bank ? y : y + Math.sin(a) * r,
        d: distance - (landing || bank ? Math.sin(a) * r : 0),
        vx: Math.cos(a) * (landing ? 1.2 + force : 2.2),
        vy: landing || bank ? 0.3 + seed * 0.6 : Math.sin(a) * 2,
        vz: landing || bank ? Math.sin(a) * 2 : (seed - 0.5) * 3,
        size: landing ? 0.07 : 0.11 + seed * 0.09,
        warm: !landing && !bank,
        gravity: landing || bank ? 1.5 : 0.45,
      });
    }
    if (landing) {
      const n = Math.round((8 + force * 9) * budget);
      for (let i = 0; i < n; i++) {
        const item = mist.items[mist.cursor++ % mist.items.length];
        const a = i * 2.399963 + time,
          seed = (i * 0.618034) % 1;
        Object.assign(item, {
          born: time,
          life: 0.65 + seed * 0.35,
          seed,
          x: x + Math.cos(a) * 1.15,
          y: 0.13,
          d: distance - Math.sin(a) * 1.75,
          vx: Math.cos(a) * (1.4 + force * 2.5),
          vy: 0.1 + seed * 0.15,
          vz: Math.sin(a) * (1.4 + force * 2.5),
          size: 0.55 + force * 0.6,
          warm: false,
          gravity: 0,
        });
      }
    }
    if (landing || bank) {
      const wave = waves[waveCursor++ % waves.length];
      Object.assign(wave, {
        born: time,
        life: bank ? 0.8 : 0.65,
        x,
        d: distance,
        force: bank ? Math.min(1, 0.4 + count * 0.05) : force,
        bank,
      });
    }
  }
  function update(distance, time, options = {}) {
    quality = options.quality ?? 2;
    reduced = !!options.reduced;
    if (last !== null && time < last) reset();
    last = time;
    uniforms.uTime.value = time;
    uniforms.uPixel.value = Math.min(2, Math.max(0.5, options.pixel ?? 1));
    for (const pool of [sparks, mist]) {
      const a = pool.mesh.geometry.attributes;
      let used = 0;
      const limit = quality === 0 ? Math.ceil(pool.items.length * 0.5) : pool.items.length;
      for (const p of pool.items) {
        const age = time - p.born,
          t = age / p.life;
        if (!(age >= 0 && t < 1) || used === limit) continue;
        const fade = Math.pow(1 - t, 1.5);
        a.position.setXYZ(
          used,
          p.x + p.vx * age,
          Math.max(0.055, p.y + p.vy * age - p.gravity * age * age * 0.5),
          distance - p.d + p.vz * age,
        );
        a.aTint.setXYZW(
          used,
          p.warm ? 1.7 : 0.66,
          p.warm ? 1.14 : 0.82,
          p.warm ? 0.45 : 0.94,
          fade * (pool.mist ? 0.24 : 0.65),
        );
        a.aSize.setX(used, p.size * (pool.mist ? 1 + t * 2.7 : 1 - t * 0.6));
        a.aSeed.setX(used++, p.seed);
      }
      pool.active = used;
      for (const attr of Object.values(a)) attr.needsUpdate = true;
      pool.mesh.geometry.setDrawRange(0, used);
    }
    let used = 0;
    for (const wave of waves) {
      const age = time - wave.born,
        t = age / wave.life;
      if (!(age >= 0 && t < 1)) continue;
      const r = 1.4 + t * (reduced ? 1.2 : 2.2 + wave.force * 1.6);
      dummy.position.set(wave.x, 0.045, distance - wave.d);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(r, r * 1.4, 1);
      dummy.updateMatrix();
      ripple.setMatrixAt(used, dummy.matrix);
      tint.setRGB(0.48, 0.64, 0.72).multiplyScalar((1 - t) * (0.3 + wave.force * 0.35));
      ripple.setColorAt(used++, tint);
    }
    ripple.count = used;
    ripple.instanceMatrix.needsUpdate = true;
    ripple.instanceColor.needsUpdate = true;
  }
  return {
    root,
    emit,
    update,
    reset,
    objects: [sparks.mesh, mist.mesh, ripple],
    status: () => ({
      sparks: sparks.active,
      mist: mist.active,
      ripples: ripple.count,
      capacities: FX_BUDGET,
      drawCalls: 3,
    }),
  };
}
