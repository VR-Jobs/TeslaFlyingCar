import {
  Lc as InstancedMesh,
  Ii as PlaneGeometry,
  gi as ShaderMaterial,
  pr as Object3D,
} from "../vendor/rendering.js";
export function createRoadBeat(group) {
  const material = new ShaderMaterial({
    uniforms: { uPulse: { value: 0 } },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: 2,
    toneMapped: false,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;
      gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;uniform float uPulse;
      void main(){float x=abs(vUv.x-.5)*2.;
        float tip=smoothstep(0.,.18,vUv.y)*(1.-smoothstep(.82,1.,vUv.y));
        float core=exp(-x*x*80.),halo=exp(-x*x*6.)*.22;
        float a=(core+halo)*tip*(.2+uPulse*.09);
        if(a<.002)discard;gl_FragColor=vec4(.68,.79,.88,a);}`,
  });
  const geometry = new PlaneGeometry(0.16, 2.8);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new InstancedMesh(geometry, material, 64),
    dummy = new Object3D();
  mesh.frustumCulled = false;
  mesh.name = "Soft road edge light guides / no collision";
  group.add(mesh);
  return {
    mesh,
    update(distance, pulse) {
      const widen = Math.max(0, Math.min(1, (distance - 5000) / 200));
      const width = 6 + widen * 3.4;
      for (let i = 0; i < 64; i++) {
        dummy.position.set(
          (i % 2 ? -1 : 1) * (width - 0.12),
          0.042,
          12 - Math.floor(i / 2) * 8 + (distance % 8),
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      material.uniforms.uPulse.value = Math.max(0, Math.min(1, pulse));
    },
  };
}
