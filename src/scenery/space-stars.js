import {
  B as Group,
  Jr as BufferGeometry,
  L as Float32BufferAttribute,
  Uc as Points,
  gi as ShaderMaterial,
  P as Vector3,
} from "../vendor/rendering.js";
import { SPACE } from "../config/space.js";
import { starVertex, starFragment } from "./space-shaders.js";

export function createCosmicStars() {
  const group = new Group();
  group.name = "Distant steady stellar field";
  const uniforms = { uPixelRatio: { value: 1 } },
    layers = [];
  let seed = SPACE.seed;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const axis = new Vector3(0.52, 0.79, 0.2).normalize(),
    a = new Vector3().crossVectors(axis, new Vector3(0, 0, 1)).normalize(),
    b = new Vector3().crossVectors(axis, a).normalize(),
    direction = new Vector3();
  for (const [name, count] of Object.entries(SPACE.stars)) {
    const positions = [],
      colors = [],
      sizes = [];
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      if (name === "galactic") {
        const latitude = (random() - 0.5) * 0.2;
        direction
          .copy(a)
          .multiplyScalar(Math.cos(angle) * Math.cos(latitude))
          .addScaledVector(b, Math.sin(angle) * Math.cos(latitude))
          .addScaledVector(axis, Math.sin(latitude));
      } else {
        const y = random() * 2 - 1,
          h = Math.sqrt(1 - y * y);
        direction.set(Math.cos(angle) * h, y, Math.sin(angle) * h);
      }
      const radius = SPACE.radius - 20 + random() * 35;
      positions.push(direction.x * radius, direction.y * radius, direction.z * radius);
      const temperature = random(),
        power =
          (name === "bright" ? 0.65 : 0.2) +
          Math.pow(random(), 4) * (name === "bright" ? 1.8 : 1.05);
      const tint =
        temperature < 0.15
          ? [1, 0.82, 0.63]
          : temperature > 0.84
            ? [0.66, 0.8, 1]
            : [0.93, 0.95, 1];
      colors.push(...tint.map((c) => c * power));
      sizes.push(name === "bright" ? 2.3 + random() * 1.7 : 0.8 + random() * 0.6);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new Float32BufferAttribute(sizes, 1));
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: 2,
      fog: false,
      toneMapped: false,
    });
    const points = new Points(geometry, material);
    points.name = `Space stars / ${name}`;
    points.frustumCulled = false;
    points.renderOrder = -5;
    group.add(points);
    layers.push({ points, count });
  }
  return {
    group,
    layers,
    update(pixelRatio, detail) {
      uniforms.uPixelRatio.value = Math.min(2, pixelRatio);
      for (const layer of layers)
        layer.points.geometry.setDrawRange(
          0,
          Math.floor(layer.count * (detail === 0 ? 0.48 : detail === 1 ? 0.76 : 1)),
        );
    },
    count: () => layers.reduce((n, l) => n + l.count, 0),
  };
}
