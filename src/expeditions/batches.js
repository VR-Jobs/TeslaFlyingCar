import { cosmicNoise } from "../scenery/space-shaders.js";
import {
  B as Group,
  Lc as InstancedMesh,
  pr as Object3D,
  ci as Box,
  gu as Sphere,
  _u as Torus,
  V as Cylinder,
  H as Standard,
  Fr as Basic,
  I as Color,
  P as Vector3,
  dn as Quaternion,
} from "../vendor/rendering.js";
export const BATCH_CAPACITY = 512;
export function createBatches(scene) {
  const root = new Group();
  scene.add(root);
  const dummy = new Object3D(),
    color = new Color(),
    axis = new Vector3(0, 1, 0),
    direction = new Vector3();
  const geometry = {
    box: new Box(1, 1, 1),
    sphere: new Sphere(1, 16, 12),
    ring: new Torus(1, 0.018, 6, 48),
    cylinder: new Cylinder(0.5, 0.5, 1, 8),
  };
  const rockGeometry = new Sphere(1, 26, 18),
    vertices = rockGeometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i),
      y = vertices.getY(i),
      z = vertices.getZ(i);
    const f =
      1 + 0.055 * Math.sin(x * 11 + y * 7) * Math.cos(z * 9) + 0.025 * Math.sin(y * 23 - z * 13);
    vertices.setXYZ(i, x * f, y * f, z * f);
  }
  rockGeometry.computeVertexNormals();
  const standard = new Standard({ color: "#ffffff", metalness: 0.65, roughness: 0.32 });
  const glass = new Basic({
    color: "#ffffff",
    transparent: true,
    opacity: 0.11,
    depthWrite: false,
    side: 2,
  });
  const light = new Basic({
    color: "#ffffff",
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    toneMapped: false,
  });
  light.userData.ringBloom = { gain: 1.7 };
  const rock = new Standard({ color: "#ffffff", metalness: 0.02, roughness: 0.91 });
  rock.onBeforeCompile = (shader) => {
    shader.vertexShader =
      "varying vec3 vRockLocal;\n" +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvRockLocal=position;",
      );
    shader.fragmentShader =
      "varying vec3 vRockLocal;\n" +
      cosmicNoise +
      "\n" +
      shader.fragmentShader.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nfloat stone=cosmicFbm(vRockLocal*12.);diffuseColor.rgb*=.48+stone*.9;",
      );
  };
  rock.customProgramCacheKey = () => "expedition-detailed-rock-1";
  const specs = {
    solid: [geometry.box, standard],
    glass: [geometry.box, glass],
    light: [geometry.box, light],
    rock: [rockGeometry, rock],
    core: [geometry.sphere, light],
    ring: [geometry.ring, light],
    ringMetal: [geometry.ring, standard],
    beam: [geometry.cylinder, light],
  };
  const batches = {};
  for (const [type, [g, m]] of Object.entries(specs)) {
    const mesh = new InstancedMesh(g, m, BATCH_CAPACITY);
    mesh.count = 0;
    mesh.frustumCulled = false;
    root.add(mesh);
    batches[type] = { mesh, used: 0 };
  }
  let maxInstances = 0,
    overflow = 0;
  return {
    root,
    begin() {
      for (const b of Object.values(batches)) b.used = 0;
    },
    draw(item, anchor) {
      const b = batches[item.type];
      if (!b) return;
      if (b.used >= BATCH_CAPACITY) {
        overflow++;
        return;
      }
      dummy.position.set(item.p[0], item.p[1], -(item.p[2] - anchor));
      dummy.scale.fromArray(item.scale);
      dummy.rotation.fromArray([...item.rotation, "XYZ"]);
      if (item.direction) {
        direction.fromArray(item.direction).normalize();
        dummy.quaternion.setFromUnitVectors(axis, direction);
      }
      dummy.updateMatrix();
      b.mesh.setMatrixAt(b.used, dummy.matrix);
      b.mesh.setColorAt(b.used, color.set(item.color));
      b.used++;
    },
    end() {
      for (const b of Object.values(batches)) {
        b.mesh.count = b.used;
        b.mesh.visible = b.used > 0;
        b.mesh.instanceMatrix.needsUpdate = true;
        if (b.mesh.instanceColor) b.mesh.instanceColor.needsUpdate = true;
        maxInstances = Math.max(maxInstances, b.used);
      }
    },
    warm() {
      const visibility = Object.values(batches).map((b) => [b, b.mesh.visible, b.mesh.count]);
      for (const b of Object.values(batches)) {
        if (!b.mesh.instanceColor) b.mesh.setColorAt(0, color.set("#ffffff"));
        b.mesh.visible = true;
        if (!b.mesh.count) {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0.001);
          dummy.updateMatrix();
          b.mesh.setMatrixAt(0, dummy.matrix);
          b.mesh.count = 1;
        }
      }
      return () => {
        for (const [b, visible, count] of visibility) {
          b.mesh.visible = visible;
          b.mesh.count = count;
        }
      };
    },
    status: () => ({
      batches: 8,
      capacity: BATCH_CAPACITY,
      maxInstances,
      overflow,
      instances: Object.values(batches).reduce((n, b) => n + b.used, 0),
      drawCalls: Object.values(batches).filter((b) => b.used).length,
    }),
    dispose() {
      root.removeFromParent();
      for (const b of Object.values(batches)) b.mesh.dispose();
      for (const g of Object.values(geometry)) g.dispose();
      rockGeometry.dispose();
      for (const m of [standard, glass, light, rock]) m.dispose();
    },
  };
}
