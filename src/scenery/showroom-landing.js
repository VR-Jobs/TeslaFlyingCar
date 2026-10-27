import {
  Jr as BufferGeometry,
  L as Float32BufferAttribute,
  gi as ShaderMaterial,
  Uc as Points,
} from "../vendor/rendering.js";

export function installLandingSmoke(showroom, renderer) {
  const count = 72,
    positions = new Float32Array(count * 3),
    sizes = new Float32Array(count),
    fades = new Float32Array(count);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("aFade", new Float32BufferAttribute(fades, 1));
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { uViewport: { value: 720 }, uTime: { value: 0 } },
    vertexShader: `attribute float aSize;attribute float aFade;uniform float uViewport;varying float vFade;
      void main(){vFade=aFade;vec4 view=modelViewMatrix*vec4(position,1.0);
      gl_PointSize=clamp(uViewport*projectionMatrix[1][1]*aSize*.5/max(.1,-view.z),1.0,130.0);
      gl_Position=projectionMatrix*view;}`,
    fragmentShader: `uniform float uTime;varying float vFade;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);}
      void main(){vec2 p=gl_PointCoord*2.0-1.0;float r=length(p);
        float billow=noise(p*3.5+uTime*.3)*.65+noise(p*7.0-uTime*.2)*.35;
        float soft=1.0-smoothstep(.22,.97,r+(billow-.5)*.2);
        float alpha=soft*(.65+.35*billow)*vFade;if(alpha<.002)discard;
        gl_FragColor=vec4(vec3(.62+.16*billow),alpha);}`,
  });
  const points = new Points(geometry, material);
  points.name = "Landing smoke / outward ground puffs";
  points.frustumCulled = false;
  points.renderOrder = 6;
  points.visible = false;
  showroom.scene.add(points);
  let age = 3,
    yaw = 0,
    emitted = 0,
    maximumRadius = 0;
  const seeds = Array.from({ length: count }, (_, i) => {
    const seed = Math.sin(i * 127.1 + 31.7) * 43758.5453;
    return seed - Math.floor(seed);
  });
  const clear = () => {
    age = 3;
    points.visible = false;
  };
  new MutationObserver(() => {
    if (document.getElementById("menu").classList.contains("hidden")) clear();
  }).observe(document.getElementById("menu"), { attributes: true, attributeFilter: ["class"] });
  return {
    emit(angle) {
      age = 0;
      yaw = angle;
      emitted++;
      maximumRadius = 0;
      points.visible = true;
    },
    clear,
    update(dt) {
      age += dt;
      if (age > 2.2) {
        points.visible = false;
        return;
      }
      material.uniforms.uTime.value = age;
      material.uniforms.uViewport.value = renderer.domElement.height;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      for (let i = 0; i < count; i++) {
        const seed = seeds[i],
          t = Math.max(0, age - seed * 0.07),
          angle = (i / count) * Math.PI * 2 + (seed - 0.5) * 0.24;
        const travel = (1 - Math.exp(-t * 1.5)) * (1.1 + seed * 1.4);
        const x = Math.cos(angle) * (0.85 + travel),
          z = Math.sin(angle) * (1.5 + travel);
        const offset = i * 3;
        positions[offset] = x * c + z * s;
        positions[offset + 1] = 0.12 + t * (0.1 + seed * 0.08);
        positions[offset + 2] = -x * s + z * c;
        sizes[i] = 0.28 + t * (0.65 + seed * 0.25);
        fades[i] =
          (1 - Math.exp(-t * 22)) *
          Math.exp(-t * 1.8) *
          (0.15 + seed * 0.12) *
          (1 - Math.min(1, Math.max(0, (age - 1.65) / 0.55)));
        maximumRadius = Math.max(maximumRadius, Math.hypot(x, z));
      }
      geometry.attributes.position.array.set(positions);
      geometry.attributes.aSize.array.set(sizes);
      geometry.attributes.aFade.array.set(fades);
      for (const attribute of Object.values(geometry.attributes)) attribute.needsUpdate = true;
    },
    status: () => ({ active: points.visible, age, emitted, maximumRadius, particles: count }),
  };
}
