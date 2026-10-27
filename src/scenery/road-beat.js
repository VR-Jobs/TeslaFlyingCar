import {
  Lc as InstancedMesh,
  Ii as PlaneGeometry,
  Fr as MeshBasicMaterial,
  pr as Object3D,
} from "../vendor/rendering.js";
export function createRoadBeat(group) {
  const material = new MeshBasicMaterial({
    color: "#d5dce5",
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    fog: true,
  });
  const geometry = new PlaneGeometry(0.045, 2.3);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new InstancedMesh(geometry, material, 64),
    dummy = new Object3D();
  mesh.frustumCulled = false;
  mesh.name = "Subtle road edge beat accents / no collision";
  group.add(mesh);
  return {
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
      material.opacity = 0.14 + Math.min(1, pulse) * 0.075;
    },
  };
}
