export const PLATFORM_TOP = 0.045;

export function solidCarMeshes(car) {
  if (car.presentationMeshes) return car.presentationMeshes;
  const meshes = [];
  car.group.traverse((node) => {
    // The original renderer keeps canonical wheel/wing meshes on layer 1 and
    // draws batched copies. Measure the originals, not undeformed batch geometry.
    if (!node.isMesh || !node.geometry || node.isInstancedMesh || node.isSkinnedMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    if (materials.every((material) => material.transparent)) return;
    if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
    meshes.push(node);
  });
  return meshes;
}

export function installShowroomClearance(showroom) {
  const meshes = solidCarMeshes(showroom.car),
    vertices = new Map();
  // Rotated boxes contain empty corners around wheels and would make the idle
  // car float. Cache unique model vertices and evaluate their exact world height.
  for (const mesh of meshes) {
    if (vertices.has(mesh.geometry)) continue;
    const position = mesh.geometry.attributes.position,
      unique = new Map();
    for (let i = 0; i < position.count; i++) {
      const xyz = [position.getX(i), position.getY(i), position.getZ(i)];
      unique.set(xyz.join(","), xyz);
    }
    vertices.set(mesh.geometry, new Float32Array([...unique.values()].flat()));
  }
  let minimum = Infinity,
    correction = 0;
  const measure = () => {
    showroom.car.group.updateWorldMatrix(true, true);
    minimum = Infinity;
    for (const mesh of meshes) {
      if (!mesh.visible) continue;
      const p = vertices.get(mesh.geometry),
        m = mesh.matrixWorld.elements;
      for (let i = 0; i < p.length; i += 3)
        minimum = Math.min(minimum, m[1] * p[i] + m[5] * p[i + 1] + m[9] * p[i + 2] + m[13]);
    }
    return minimum;
  };
  return {
    apply(gap = showroom.demo ? 0.06 : 0.008) {
      correction = Math.max(0, PLATFORM_TOP + gap - measure());
      showroom.lift.position.y += correction;
      minimum += correction;
      showroom.car.group.updateWorldMatrix(true, true);
      return correction;
    },
    status: () => ({
      minimumY: minimum,
      gap: minimum - PLATFORM_TOP,
      correction,
      meshes: meshes.length,
    }),
  };
}
