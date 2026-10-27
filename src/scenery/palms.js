import {
  B as Group,
  R as Mesh,
  H as MeshStandardMaterial,
  Jr as BufferGeometry,
  L as Float32BufferAttribute,
  Lc as InstancedMesh,
  pr as Object3D,
  I as Color,
  Gc as CanvasTexture,
  Qe as SRGBColorSpace,
  f as RepeatWrapping,
} from "../vendor/rendering.js";
import { COAST } from "../config/coast.js";

const random = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
  return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
};
const hash = (n) => {
  const v = Math.sin(n * 127.17 + 73.31) * 43758.5453;
  return v - Math.floor(v);
};

class GeometryBuilder {
  constructor() {
    this.p = [];
    this.uv = [];
    this.colors = [];
    this.indices = [];
  }
  vertex(p, uv, color) {
    const index = this.p.length / 3;
    this.p.push(...p);
    this.uv.push(...uv);
    this.colors.push(color.r, color.g, color.b);
    return index;
  }
  triangle(a, b, c) {
    this.indices.push(a, b, c);
  }
  geometry() {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.p, 3));
    g.setAttribute("uv", new Float32BufferAttribute(this.uv, 2));
    g.setAttribute("color", new Float32BufferAttribute(this.colors, 3));
    g.setIndex(this.indices);
    g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }
}

function barkTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d"),
    rng = random(71421);
  ctx.fillStyle = "#b1a78f";
  ctx.fillRect(0, 0, 512, 1024);
  // Old leaf scars wrap around a coconut trunk; fine vertical fibres break them up.
  for (let y = -20; y < 1024; ) {
    const band = 45 + rng() * 35;
    const gradient = ctx.createLinearGradient(0, y, 0, y + band);
    gradient.addColorStop(0, "#8c8472");
    gradient.addColorStop(0.09, "#c3bba4");
    gradient.addColorStop(0.48, "#b0a791");
    gradient.addColorStop(0.93, "#ada38b");
    gradient.addColorStop(1, "#827b6c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, 512, band);
    ctx.strokeStyle = "rgba(73,63,44,.24)";
    ctx.lineWidth = 0.8 + rng() * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, y + 4);
    for (let x = 0; x <= 512; x += 4)
      ctx.lineTo(x, y + 3 + Math.sin(x * 0.021 + y) * 3 + Math.sin(x * 0.061) * 1.3);
    ctx.stroke();
    y += band;
  }
  for (let i = 0; i < 10000; i++) {
    const x = rng() * 512,
      y = rng() * 1024;
    ctx.strokeStyle =
      rng() > 0.5
        ? `rgba(47,39,26,${0.04 + rng() * 0.18})`
        : `rgba(233,226,200,${0.06 + rng() * 0.24})`;
    ctx.lineWidth = 0.3 + rng() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + rng() * 3 - 1.5, y + 2 + rng() * 24);
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function buildPalm(seed) {
  const rng = random(seed),
    trunk = new GeometryBuilder(),
    leaf = new GeometryBuilder(),
    ribs = new GeometryBuilder(),
    fruit = new GeometryBuilder();
  const height = 10.1 + rng() * 4.6,
    lean = 1.2 + rng() * 2.2,
    twist = rng() * 6.28;
  const base = new Color("#eeead9"),
    crown = new Color("#d8dbbd");
  const trunkPoint = (t) => [
    lean * t * t + Math.sin(t * Math.PI) * 0.16,
    height * t,
    Math.sin(t * 2.2) * 0.36,
  ];
  const rings = 64,
    sides = 16;
  for (let row = 0; row <= rings; row++) {
    const t = row / rings,
      center = trunkPoint(t);
    const radius =
      (0.255 * (1 - t) + 0.125 * t + 0.1 * Math.exp(-t * 22)) * (1 + 0.007 * Math.sin(t * 103));
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      trunk.vertex(
        [center[0] + Math.cos(a) * radius, center[1], center[2] + Math.sin(a) * radius],
        [j / sides, (t * height) / 2.8],
        base.clone().lerp(crown, t),
      );
      if (row < rings && j < sides) {
        const a0 = row * (sides + 1) + j,
          a1 = a0 + sides + 1;
        trunk.triangle(a0, a1, a0 + 1);
        trunk.triangle(a0 + 1, a1, a1 + 1);
      }
    }
  }
  const head = trunkPoint(1),
    green = ["#507d35", "#668c3b", "#729745", "#3d7135", "#7b9c48"].map((c) => new Color(c));
  const stemColor = new Color("#8b994b"),
    tipColor = new Color("#9a9b4c");
  for (let frond = 0; frond < 23; frond++) {
    const a = frond * 2.399963 + twist + rng() * 0.15,
      c = Math.cos(a),
      s = Math.sin(a);
    const tier = frond / 22,
      length = 3.2 + Math.sin(tier * Math.PI) * 2.1 + rng() * 0.7;
    const rise = 3.6 - tier * 4.6,
      drop = 0.85 + tier * 2.0;
    const center = (t) => {
      const r = length * t;
      return [head[0] + c * r, head[1] + rise * Math.sin(t * 1.6) - drop * t * t, head[2] + s * r];
    };
    // Raised central rachis, with a narrowing square cross section.
    const ribOffset = ribs.p.length / 3;
    for (let row = 0; row <= 16; row++) {
      const t = row / 16,
        p = center(t),
        radius = 0.045 * (1 - t) + 0.003;
      for (let j = 0; j < 4; j++) {
        const theta = (j * Math.PI) / 2;
        ribs.vertex(
          [
            p[0] - s * Math.cos(theta) * radius,
            p[1] + Math.sin(theta) * radius,
            p[2] + c * Math.cos(theta) * radius,
          ],
          [j / 4, t],
          stemColor,
        );
      }
      if (row < 16)
        for (let j = 0; j < 4; j++) {
          const n = ribOffset + row * 4 + j,
            next = ribOffset + row * 4 + ((j + 1) % 4);
          ribs.triangle(n, n + 4, next);
          ribs.triangle(next, n + 4, next + 4);
        }
    }
    const shade =
      frond > 20 ? new Color(frond === 21 ? "#9d8b4c" : "#a39859") : green[frond % green.length];
    // Separate tapered pinnae, with gaps, a folded centre and drooping tips.
    for (let k = 0; k < 29; k++)
      for (const side of [-1, 1]) {
        if (rng() < (frond > 20 ? 0.075 : 0.012)) continue;
        const t = 0.12 + (k / 29) * 0.86 + side * 0.004 + (rng() - 0.5) * 0.012,
          p = center(t);
        const bladeLength =
          (0.23 + Math.pow(Math.sin(t * Math.PI), 0.72) * 1.35) * (0.88 + rng() * 0.24);
        const dx = -s * side * 0.94 + c * 0.32,
          dz = c * side * 0.94 + s * 0.32;
        const offset = leaf.p.length / 3,
          width = (0.041 + Math.sin(t * Math.PI) * 0.035) * (0.8 + rng() * 0.35);
        const bladeShade = shade.clone().multiplyScalar(0.83 + rng() * 0.25);
        for (let j = 0; j < 4; j++) {
          const u = j / 3,
            w = Math.sin(u * Math.PI) * width + (j === 0 ? 0.008 : 0);
          const sag = (0.23 + tier * 0.38) * u * u;
          for (const edge of [-1, 1]) {
            const color = bladeShade.clone().lerp(tipColor, Math.pow(u, 5) * (0.16 + tier * 0.18));
            leaf.vertex(
              [
                p[0] + dx * bladeLength * u - dz * w * edge,
                p[1] - sag + Math.sin(u * Math.PI) * 0.07 + edge * w * 0.28,
                p[2] + dz * bladeLength * u + dx * w * edge,
              ],
              [(edge + 1) / 2, u],
              color,
            );
          }
          if (j < 3) {
            const n = offset + j * 2;
            leaf.triangle(n, n + 1, n + 2);
            leaf.triangle(n + 1, n + 3, n + 2);
          }
        }
      }
  }
  // Green/brown, slightly oblong coconuts tucked under the crown.
  for (let n = 0; n < 6; n++) {
    const a = n * 2.4,
      p = [head[0] + Math.cos(a) * 0.3, head[1] - 0.28 - rng() * 0.45, head[2] + Math.sin(a) * 0.3];
    const offset = fruit.p.length / 3,
      color = new Color(n % 3 ? "#6f7740" : "#887340");
    for (let row = 0; row <= 7; row++)
      for (let j = 0; j <= 10; j++) {
        const theta = (row / 7) * Math.PI,
          phi = (j / 10) * Math.PI * 2,
          radius = 0.19 + 0.015 * Math.sin(phi * 3);
        fruit.vertex(
          [
            p[0] + Math.sin(theta) * Math.cos(phi) * radius,
            p[1] + Math.cos(theta) * radius * 1.32,
            p[2] + Math.sin(theta) * Math.sin(phi) * radius,
          ],
          [j / 10, row / 7],
          color,
        );
        if (row < 7 && j < 10) {
          const i = offset + row * 11 + j;
          fruit.triangle(i, i + 1, i + 11);
          fruit.triangle(i + 1, i + 12, i + 11);
        }
      }
  }
  return [trunk.geometry(), leaf.geometry(), ribs.geometry(), fruit.geometry()];
}

function addWind(material, uniforms, flutter = false) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `uniform float uCoastTime; uniform float uCoastTravel;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
      float palmPhase = 0.0;
      #ifdef USE_INSTANCING
        palmPhase = instanceMatrix[3].x * .51 + (instanceMatrix[3].z + modelMatrix[3].z - uCoastTravel) * .071;
      #endif
      float palmBend = pow(clamp(position.y / 14.0, 0.0, 1.5), 2.0);
      transformed.x += sin(uCoastTime * .72 + palmPhase) * .17 * palmBend;
      transformed.z += cos(uCoastTime * .53 + palmPhase) * .11 * palmBend;
      ${flutter ? "transformed.y += sin(uCoastTime * 2.1 + position.x * 2.7 + position.z * 1.9 + palmPhase) * .055 * palmBend;" : ""}`,
      );
    if (flutter) {
      shader.vertexShader = `varying vec2 vCoastLeafUV;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvCoastLeafUV=uv;",
      );
      shader.fragmentShader = `varying vec2 vCoastLeafUV;\n${shader.fragmentShader}`
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
        float leafVein=1.0-smoothstep(.012,.055,abs(vCoastLeafUV.x-.5));
        float leafFibre=sin(vCoastLeafUV.x*90.0+vCoastLeafUV.y*12.0)*.023;
        diffuseColor.rgb*=.96+leafVein*.09+leafFibre;`,
        )
        .replace(
          "#include <opaque_fragment>",
          `
      // A little transmitted skylight through thin coconut pinnae.
      outgoingLight += diffuseColor.rgb * vec3(.32, .45, .15) * .48;
      #include <opaque_fragment>`,
        );
    }
  };
  material.customProgramCacheKey = () => `coast-palm-${flutter}`;
  return material;
}

export function createPalms(uniforms, groundHeight) {
  const group = new Group();
  group.name = "Detailed coconut palms";
  const bark = barkTexture();
  const materials = [
    addWind(
      new MeshStandardMaterial({
        map: bark,
        bumpMap: bark,
        bumpScale: 0.015,
        roughness: 0.94,
        vertexColors: true,
      }),
      uniforms,
    ),
    addWind(
      new MeshStandardMaterial({ roughness: 0.55, side: 2, vertexColors: true }),
      uniforms,
      true,
    ),
    addWind(new MeshStandardMaterial({ roughness: 0.87, vertexColors: true }), uniforms),
    addWind(new MeshStandardMaterial({ roughness: 0.79, vertexColors: true }), uniforms),
  ];
  const variants = Array.from({ length: COAST.palmVariants }, (_, v) => buildPalm(1801 + v * 371));
  const sets = variants.map((geometries) =>
    geometries.map((geometry, part) => {
      const mesh = new InstancedMesh(geometry, materials[part], COAST.palmSlots * 3);
      mesh.count = 0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      group.add(mesh);
      return mesh;
    }),
  );
  const dummy = new Object3D();
  let lastBase = null;
  function update(distance) {
    const base = Math.floor(distance / COAST.palmSpacing),
      offset = distance - base * COAST.palmSpacing;
    group.position.z = offset;
    if (base === lastBase) return;
    lastBase = base;
    const counts = Array(COAST.palmVariants).fill(0);
    for (let i = -2; i < COAST.palmSlots - 2; i++)
      for (const side of [-1, 1]) {
        const id = base + i,
          h = hash(id * 7.1 + side * 3.3),
          variant = Math.floor(hash(id * 2.3 + side) * sets.length);
        // Alternating gaps keep views of the lagoon open; palms never occupy the road.
        if (side < 0 && h < 0.2) continue;
        const x = side < 0 ? -(12.5 + h * 4.5) : 15 + h * 20;
        const z = -i * COAST.palmSpacing + (hash(id * 13.4 + side) - 0.5) * 12;
        const scale = 0.77 + hash(id * 6.1 + side * 5.4) * 0.42;
        dummy.position.set(x, groundHeight(x, z - base * COAST.palmSpacing), z);
        dummy.rotation.set(0, h * Math.PI * 2, 0);
        dummy.scale.set(scale, scale * (0.9 + h * 0.18), scale);
        dummy.updateMatrix();
        for (const mesh of sets[variant]) mesh.setMatrixAt(counts[variant], dummy.matrix);
        counts[variant]++;
        // Juvenile palms in occasional small groves rather than a uniform avenue.
        if (hash(id * 19.7 + side * 4) > 0.64) {
          const v = (variant + 1) % sets.length,
            extraX = side < 0 ? x - 1.8 : x + 3.7;
          const extraZ = z - 4.0 - hash(id * 6.7) * 3.5;
          const juvenile = scale * (0.53 + hash(id + side * 8.1) * 0.18);
          dummy.position.set(
            extraX,
            groundHeight(extraX, extraZ - base * COAST.palmSpacing),
            extraZ,
          );
          dummy.rotation.y = h * 6.28 + 1.6;
          dummy.scale.set(juvenile, juvenile, juvenile);
          dummy.updateMatrix();
          for (const mesh of sets[v]) mesh.setMatrixAt(counts[v], dummy.matrix);
          counts[v]++;
        }
      }
    sets.forEach((meshes, v) =>
      meshes.forEach((mesh) => {
        mesh.count = counts[v];
        mesh.instanceMatrix.needsUpdate = true;
      }),
    );
  }
  update(0);
  return { group, update, count: () => sets.reduce((n, v) => n + v[0].count, 0) };
}
