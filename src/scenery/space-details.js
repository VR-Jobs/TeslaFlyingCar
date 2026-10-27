import {
  gu as SphereGeometry,
  H as MeshStandardMaterial,
  Lc as InstancedMesh,
  pr as Object3D,
  I as Color,
} from "../vendor/rendering.js";
import { SPACE } from "../config/space.js";
import { cosmicNoise } from "./space-shaders.js";
const random = (id, salt) => {
  let n = Math.sin(id * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function createAsteroidField() {
  const geometry = new SphereGeometry(1, 14, 10),
    p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i),
      r =
        1 +
        0.12 * Math.sin(x * 7.1 + y * 3.3) * Math.cos(z * 5.7) +
        0.09 * Math.sin(y * 11.3 + z * 4.9);
    p.setXYZ(i, x * r, y * r * 0.78, z * r * 1.13);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const material = new MeshStandardMaterial({
    color: "#74777c",
    roughness: 0.94,
    metalness: 0.025,
  });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader =
      "varying vec3 vRockLocal;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvRockLocal=position;",
      );
    shader.fragmentShader =
      `varying vec3 vRockLocal;\n${cosmicNoise}\n` +
      shader.fragmentShader
        .replace(
          "#include <color_fragment>",
          "#include <color_fragment>\nfloat stone=cosmicFbm(vRockLocal*12.0);diffuseColor.rgb*=.58+stone*.75;",
        )
        .replace(
          "#include <normal_fragment_maps>",
          `#include <normal_fragment_maps>
     float bump=(noise3(vRockLocal*57.0)-.5)*.016;vec3 dx=dFdx(-vViewPosition),dy=dFdy(-vViewPosition),r1=cross(dy,normal),r2=cross(normal,dx);float det=dot(dx,r1);
     normal=normalize(abs(det)*normal-sign(det)*(dFdx(bump)*r1+dFdy(bump)*r2));`,
        );
  };
  material.customProgramCacheKey = () => "peripheral-space-rock-v1";
  const count = SPACE.asteroids.slots * 4,
    mesh = new InstancedMesh(geometry, material, count),
    dummy = new Object3D(),
    ids = [];
  mesh.name = "Peripheral asteroids / visual only";
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  const color = new Color();
  function update(distance, time = 0, detail = 3) {
    const cfg = SPACE.asteroids,
      base = Math.floor(distance / cfg.step);
    mesh.count = detail === 0 ? count / 2 : count;
    for (let i = 0; i < count; i++) {
      const cell = base + Math.floor(i / 4),
        side = i % 2 ? -1 : 1,
        tier = Math.floor(i / 2) % 2,
        key = cell * 13 + (side + 1) * 97 + tier * 211;
      ids[i] = `${side}/${tier}/${cell}`;
      const x = side * (cfg.minX + random(key, 1) * (cfg.maxX - cfg.minX));
      const y = tier ? -28 - random(key, 2) * 65 : 14 + random(key, 2) * 105;
      const z = distance - cell * cfg.step - cfg.front - random(key, 3) * 35;
      const size = 1.1 + Math.pow(random(key, 4), 2) * 8.0;
      dummy.position.set(x, y, z);
      dummy.rotation.set(
        random(key, 5) * 6.28 + time * 0.008,
        random(key, 6) * 6.28 + time * 0.013,
        random(key, 7) * 6.28,
      );
      dummy.scale.set(
        size * (0.8 + random(key, 8) * 0.5),
        size,
        size * (0.9 + random(key, 9) * 0.4),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.setRGB(
        0.62 + random(key, 10) * 0.35,
        0.64 + random(key, 10) * 0.3,
        0.68 + random(key, 10) * 0.27,
      );
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
  }
  update(0);
  return { mesh, ids, update, count, radius: geometry.boundingSphere.radius };
}
