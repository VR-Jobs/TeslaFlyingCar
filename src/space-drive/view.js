import {
  B as Group,
  Lc as Instanced,
  pr as Object3D,
  _u as Torus,
  gu as Sphere,
  Ii as Plane,
  Fr as Basic,
  gi as Shader,
  I as Color,
  Js as Scene,
  cn as Target,
} from "../vendor/rendering.js";
import { createOrbitTransients } from "./transients.js";

const vertex = `varying vec2 vUv;varying vec3 vTint,vNormal;
  void main(){vUv=uv;vTint=instanceColor;
    vNormal=normalize(normalMatrix*mat3(instanceMatrix)*normal);
    gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`;
const metalFragment = `varying vec2 vUv;varying vec3 vTint,vNormal;
  void main(){vec3 n=normalize(vNormal);float bevel=pow(abs(n.z),8.);
    float key=pow(max(0.,dot(n,normalize(vec3(-.5,.8,.6)))),14.);
    float brushing=.96+.04*sin(vUv.x*1100.);
    vec3 c=(vTint*(.32+.5*abs(n.y)) + vec3(.72,.8,.86)*key +
      vec3(.35,.26,.12)*bevel*.26)*brushing;gl_FragColor=vec4(c,1.);}`;
const haloFragment = `varying vec2 vUv;varying vec3 vTint;uniform float uTime;
  void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float a=atan(p.y,p.x);
    float ring=exp(-pow((r-.655)*34.,2.))*.28;
    float bloom=exp(-pow((r-.655)*13.,2.))*.075;
    float dots=pow(max(0.,cos(a*18.)),24.)*exp(-pow((r-.73)*100.,2.))*.25;
    float flow=pow(max(0.,cos(a*3.-uTime*.7)),12.);
    float alpha=(ring+bloom+dots)*(.75+.25*flow);
    if(alpha<.002)discard;gl_FragColor=vec4(vTint,alpha);}`;

export function createOrbitView(scene) {
  const root = new Group();
  root.name = "Orbital reward gates / beveled metal and soft annular light";
  scene.add(root);
  const frame = new Instanced(
    new Torus(1.31, 0.085, 10, 64),
    new Shader({
      vertexShader: vertex,
      fragmentShader: metalFragment,
    }),
    64,
  );
  const light = new Instanced(
    new Torus(1.31, 0.019, 6, 64),
    new Basic({
      color: "#ffffff",
      toneMapped: false,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    }),
    32,
  );
  const halo = new Instanced(
    new Plane(4, 4),
    new Shader({
      uniforms: { uTime: { value: 0 } },
      vertexShader: vertex,
      fragmentShader: haloFragment,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: 2,
      blending: 2,
      toneMapped: false,
    }),
    32,
  );
  const arcs = new Instanced(
    new Torus(1.46, 0.014, 5, 20, Math.PI * 0.24),
    new Basic({
      color: "#ffffff",
      transparent: true,
      opacity: 0.8,
      toneMapped: false,
      depthWrite: false,
    }),
    96,
  );
  const beads = new Instanced(
    new Sphere(0.085, 8, 6),
    new Basic({
      color: "#ffffff",
      toneMapped: false,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    }),
    72,
  );
  const meshes = [frame, light, halo, arcs, beads];
  root.add(...meshes);
  const effects = createOrbitTransients(root);
  const dummy = new Object3D(),
    color = new Color();
  for (const mesh of meshes) {
    mesh.frustumCulled = false;
    mesh.count = 0;
    mesh.setColorAt(0, color.setRGB(1, 1, 1));
  }
  let count = 0,
    warm = false,
    reduced = false;
  function update(gates, distance, time, player, quality = 2, active = true, options = {}) {
    root.visible = active;
    if (!active) return;
    reduced = !!options.reduced;
    halo.material.uniforms.uTime.value = reduced ? 0 : time;
    count = 0;
    let dot = 0,
      metal = 0,
      arc = 0;
    for (const gate of gates) {
      const z = distance - gate.d;
      if (z < -Math.min(620, 330 + quality * 140) || z > 20 || count === 32) continue;
      const age = gate.takenAt == null ? 0 : time - gate.takenAt;
      if (gate.taken && age > 0.5) continue;
      const turn = reduced ? 0 : Math.sin(time * 0.3 + gate.d) * 0.018;
      dummy.rotation.set(0, 0, turn);
      dummy.scale.setScalar(1);
      if (!gate.taken)
        for (const side of [-1, 1]) {
          dummy.position.set(gate.x, gate.y, z + side * 0.07);
          dummy.updateMatrix();
          frame.setMatrixAt(metal, dummy.matrix);
          frame.setColorAt(metal++, color.setRGB(0.46, 0.43, 0.35));
        }
      dummy.position.set(gate.x, gate.y, z + 0.14);
      dummy.scale.setScalar(gate.taken ? 1 + age * (reduced ? 0.4 : 1.8) : 1);
      dummy.updateMatrix();
      light.setMatrixAt(count, dummy.matrix);
      halo.setMatrixAt(count, dummy.matrix);
      const strength = gate.taken
        ? Math.max(0, 1 - age / 0.5)
        : reduced
          ? 1
          : 0.92 + 0.06 * Math.sin(time * 1.7 + gate.d);
      color
        .setRGB(gate.taken ? 1.05 : 1.7, gate.taken ? 1.35 : 1.13, gate.taken ? 1.6 : 0.4)
        .multiplyScalar(strength);
      light.setColorAt(count, color);
      halo.setColorAt(count++, color);
      if (!gate.taken && quality > 0)
        for (let i = 0; i < 3; i++) {
          dummy.rotation.z = (i * Math.PI * 2) / 3 + (reduced ? 0 : time * 0.18) + gate.d;
          dummy.position.z = z + 0.08;
          dummy.updateMatrix();
          arcs.setMatrixAt(arc, dummy.matrix);
          arcs.setColorAt(arc++, color.setRGB(0.7, 0.9, 1.1));
        }
      if (!gate.taken)
        for (let j = 0; j < (quality === 0 ? 2 : 4) && dot < 72; j++) {
          dummy.position.set(gate.x, gate.y - 0.3 + j * 0.08, z + 3.8 + j * 2.4);
          dummy.scale.setScalar(0.7 + j * 0.13);
          dummy.updateMatrix();
          beads.setMatrixAt(dot, dummy.matrix);
          const flow = reduced
            ? 0.8
            : 0.55 + 0.35 * Math.pow(Math.max(0, Math.sin(time * 2.5 - j)), 2);
          beads.setColorAt(dot++, color.setRGB(0.6, 0.8, 1).multiplyScalar(flow));
        }
    }
    frame.count = metal;
    light.count = halo.count = count;
    arcs.count = arc;
    beads.count = dot;
    for (const mesh of meshes) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    }
    effects.update(distance, time, { quality, reduced, pixel: options.pixel });
  }
  return {
    root,
    update,
    reset: effects.reset,
    collect(gate, time) {
      effects.emit("collect", { time, distance: gate.d, x: gate.x, y: gate.y });
    },
    land(time, distance, player, impact) {
      effects.emit("land", { time, distance, x: player.x, impact });
    },
    bank(time, distance, player, count) {
      effects.emit("bank", { time, distance, x: player.x, count });
    },
    async warm(renderer, camera, extras = []) {
      if (warm) return;
      const stage = new Scene(),
        cam = camera.clone(),
        target = new Target(48, 32);
      const clones = [...meshes, ...effects.objects, ...extras].map((mesh) => {
        const clone = mesh.clone(false);
        clone.visible = true;
        clone.frustumCulled = false;
        if (clone.isInstancedMesh) {
          clone.count = 1;
          dummy.position.set(0, 1, -10);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          clone.setMatrixAt(0, dummy.matrix);
        } else if (clone.isPoints) {
          // Dedicated tiny warm-up buffers; never mutate shared live pool ranges.
          clone.geometry = mesh.geometry.clone();
          clone.geometry.setDrawRange(0, 1);
        }
        stage.add(clone);
        return clone;
      });
      cam.position.set(0, 2, 8);
      cam.lookAt(0, 1, -10);
      cam.updateMatrixWorld();
      const yieldFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      try {
        if (renderer.compileAsync) await renderer.compileAsync(stage, cam);
        await yieldFrame();
        for (let i = 0; i < clones.length; i += 2) {
          clones.forEach((m, j) => (m.visible = j >= i && j < i + 2));
          const previous = renderer.getRenderTarget();
          try {
            renderer.setRenderTarget(target);
            renderer.clear();
            renderer.render(stage, cam);
          } finally {
            renderer.setRenderTarget(previous);
          }
          await yieldFrame();
        }
        warm = true;
      } finally {
        target.dispose();
        for (const clone of clones) {
          if (clone.isInstancedMesh) clone.dispose();
          if (clone.isPoints) clone.geometry.dispose();
        }
        stage.clear();
      }
    },
    status: () => ({
      version: "orbital-fx-2",
      visibleGates: count,
      gateCapacity: 32,
      beadCapacity: 72,
      warm,
      reduced,
      drawCalls: 8,
      effects: effects.status(),
    }),
  };
}
