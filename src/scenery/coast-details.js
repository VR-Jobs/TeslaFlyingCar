import {
  B as Group,
  R as Mesh,
  H as MeshStandardMaterial,
  Jr as BufferGeometry,
  L as Float32BufferAttribute,
  Lc as InstancedMesh,
  pr as Object3D,
  I as Color,
  gu as SphereGeometry,
  V as CylinderGeometry,
} from "../vendor/rendering.js";

const hash = (n) => {
  const x = Math.sin(n * 127.13 + 83.71) * 43758.5453;
  return x - Math.floor(x);
};
class Builder {
  constructor() {
    this.positions = [];
    this.colors = [];
    this.indices = [];
  }
  vertex(p, color) {
    const i = this.positions.length / 3;
    this.positions.push(...p);
    this.colors.push(color.r, color.g, color.b);
    return i;
  }
  tri(a, b, c) {
    this.indices.push(a, b, c);
  }
  geometry() {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.positions, 3));
    g.setAttribute("color", new Float32BufferAttribute(this.colors, 3));
    g.setIndex(this.indices);
    g.computeVertexNormals();
    return g;
  }
  leaf(center, angle, length, width, color, tilt = 0) {
    const start = this.positions.length / 3,
      c = Math.cos(angle),
      s = Math.sin(angle);
    for (let i = 0; i < 5; i++) {
      const t = i / 4,
        w = Math.sin(t * Math.PI) * width;
      for (const side of [-1, 1])
        this.vertex(
          [
            center[0] + c * length * t - s * w * side,
            center[1] + tilt * t + Math.sin(t * Math.PI) * width * 0.4,
            center[2] + s * length * t + c * w * side,
          ],
          color,
        );
      if (i < 4) {
        const n = start + i * 2;
        this.tri(n, n + 1, n + 2);
        this.tri(n + 1, n + 3, n + 2);
      }
    }
  }
}

function shrubGeometry() {
  const b = new Builder(),
    palette = ["#567b39", "#72944a", "#91a459", "#426a3a"].map((c) => new Color(c));
  for (let i = 0; i < 82; i++) {
    const a = i * 2.39996,
      r = Math.sqrt(hash(i * 3.7)) * 0.95;
    const center = [
      Math.cos(a) * r,
      0.18 + Math.sqrt(Math.max(0, 1 - r * r)) * 0.82 + hash(i * 7.1) * 0.18,
      Math.sin(a) * r,
    ];
    b.leaf(
      center,
      a + hash(i + 3),
      0.23 + hash(i * 9.1) * 0.22,
      0.12 + hash(i * 2.3) * 0.05,
      palette[i % 4],
      (hash(i * 1.7) - 0.5) * 0.28,
    );
  }
  return b.geometry();
}

function flowersGeometry() {
  const b = new Builder(),
    green = new Color("#719447"),
    pink = new Color("#b56c9c"),
    heart = new Color("#e3b8c9");
  for (let i = 0; i < 22; i++) {
    const a = i * 2.39996,
      r = Math.sqrt(hash(i * 8.7)) * 0.9;
    const p = [Math.cos(a) * r, 0.03 + hash(i * 2.7) * 0.05, Math.sin(a) * r];
    b.leaf(p, a, 0.22 + hash(i * 3.1) * 0.18, 0.11, green, 0.015);
    if (i % 3 === 0) {
      const root = b.vertex([p[0], p[1] + 0.07, p[2]], heart);
      for (let j = 0; j < 10; j++) {
        const angle = (j * Math.PI) / 5,
          next = ((j + 1) * Math.PI) / 5;
        const radius = 0.07 + (j % 2) * 0.025;
        const n = b.vertex(
          [p[0] + Math.cos(angle) * radius, p[1] + 0.12, p[2] + Math.sin(angle) * radius],
          pink,
        );
        const m = b.vertex(
          [p[0] + Math.cos(next) * 0.09, p[1] + 0.12, p[2] + Math.sin(next) * 0.09],
          pink,
        );
        b.tri(root, n, m);
      }
    }
  }
  return b.geometry();
}

export function createCoastDetails(groundHeight, shoreline) {
  const group = new Group();
  group.name = "Coastal undergrowth and beach finds";
  const shrubs = new InstancedMesh(
    shrubGeometry(),
    new MeshStandardMaterial({ vertexColors: true, roughness: 0.76, side: 2 }),
    110,
  );
  const flowers = new InstancedMesh(
    flowersGeometry(),
    new MeshStandardMaterial({ vertexColors: true, roughness: 0.78, side: 2 }),
    72,
  );
  const shellGeo = new SphereGeometry(1, 14, 8),
    shellP = shellGeo.attributes.position;
  for (let i = 0; i < shellP.count; i++) {
    const x = shellP.getX(i),
      y = shellP.getY(i),
      z = shellP.getZ(i),
      ridge = 1 + 0.045 * Math.cos(Math.atan2(z, x) * 17);
    shellP.setXYZ(i, x * 0.1 * ridge, Math.max(-0.012, y * 0.034), z * 0.075 * ridge);
  }
  shellGeo.computeVertexNormals();
  const shells = new InstancedMesh(
    shellGeo,
    new MeshStandardMaterial({ color: "#eee1c3", roughness: 0.48 }),
    160,
  );
  const woodGeo = new CylinderGeometry(0.065, 0.105, 1.9, 10, 6);
  woodGeo.rotateZ(Math.PI / 2);
  const woodP = woodGeo.attributes.position;
  for (let i = 0; i < woodP.count; i++)
    woodP.setY(i, woodP.getY(i) + Math.sin(woodP.getX(i) * 2) * 0.065);
  woodGeo.computeVertexNormals();
  const wood = new InstancedMesh(
    woodGeo,
    new MeshStandardMaterial({ color: "#a38c64", roughness: 0.96 }),
    18,
  );
  const rockGeo = new SphereGeometry(1, 16, 10),
    rockP = rockGeo.attributes.position;
  for (let i = 0; i < rockP.count; i++) {
    const x = rockP.getX(i),
      y = rockP.getY(i),
      z = rockP.getZ(i),
      n = 1 + 0.1 * Math.sin(x * 11 + z * 7) + 0.08 * Math.sin(y * 13 + x * 6);
    rockP.setXYZ(i, x * n, y * n * 0.65, z * n);
  }
  rockGeo.computeVertexNormals();
  const tidalRocks = new InstancedMesh(
    rockGeo,
    new MeshStandardMaterial({ color: "#8e8d78", roughness: 0.48 }),
    70,
  );
  for (const mesh of [shrubs, flowers, shells, wood, tidalRocks]) {
    mesh.frustumCulled = false;
    mesh.receiveShadow = true;
    mesh.castShadow = mesh === shrubs || mesh === wood || mesh === tidalRocks;
    group.add(mesh);
  }
  const dummy = new Object3D();
  let lastBase = null;
  function place(mesh, index, x, z, worldBase, scale, angle, height = 0, sy = scale) {
    dummy.position.set(x, groundHeight(x, z - worldBase) + height, z);
    dummy.rotation.set(0, angle, 0);
    dummy.scale.set(scale, sy, scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }
  function update(distance) {
    const base = Math.floor(distance / 25),
      worldBase = base * 25;
    group.position.z = distance - worldBase;
    if (base === lastBase) return;
    lastBase = base;
    for (let i = 0; i < 110; i++) {
      const row = Math.floor(i / 5),
        id = base + row,
        j = i % 5,
        h = hash(id * 7.3 + j * 13.9);
      // Dense but irregular understorey on the land side; small beach-side clusters.
      const x = j === 0 ? -16.9 - h * 2.2 : 19 + hash(id * 2.9 + j * 6.1) * 38;
      const z = -row * 25 + (h - 0.5) * 22;
      const size = (j === 0 ? 0.4 : 0.65) + hash(id * 9.7 + j) * 0.9;
      place(
        shrubs,
        i,
        x,
        z,
        worldBase,
        size,
        h * 6.28,
        0,
        size * (0.65 + hash(id + j * 3.9) * 0.45),
      );
    }
    for (let i = 0; i < 72; i++) {
      const row = Math.floor(i / 3),
        id = base + row,
        j = i % 3,
        h = hash(id * 5.3 + j * 9.1),
        z = -row * 25 + h * 17;
      const x = j === 0 ? -15.5 - h * 4.3 : 14 + h * 17;
      place(flowers, i, x, z, worldBase, 0.65 + hash(id + j) * 0.7, h * 6.28, 0.025);
    }
    for (let i = 0; i < 160; i++) {
      const row = Math.floor(i / 7),
        id = base + row,
        h = hash(id * 7.7 + (i % 7) * 17),
        z = -row * 25 + h * 24;
      const x = shoreline(z - worldBase) + 0.4 + hash(id * 8.1 + (i % 7)) * 4.3;
      place(shells, i, x, z, worldBase, 0.55 + h * 1.25, h * 6.28, 0.035, 0.55 + h * 0.7);
    }
    for (let i = 0; i < 18; i++) {
      const id = base + i,
        h = hash(id * 23.4),
        z = -i * 25 + (h - 0.5) * 18;
      if (hash(id * 31.9) < 0.45) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        wood.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const x = shoreline(z - worldBase) + 2.5 + h * 2.5;
      place(wood, i, x, z, worldBase, 0.5 + h * 0.6, h * 2.6, 0.06);
    }
    for (let i = 0; i < 70; i++) {
      const row = Math.floor(i / 3),
        id = base + row,
        j = i % 3,
        h = hash(id * 11.7 + j * 3.1),
        z = -row * 25 + h * 8;
      if (id !== 0 && hash(id * 12.3) < 0.64) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        tidalRocks.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const x = shoreline(z - worldBase) - 0.2 - h * 3.4;
      place(tidalRocks, i, x, z, worldBase, 0.2 + hash(id * 9.8 + j) * 0.8, h * 6.28, 0.08);
    }
    for (const mesh of [shrubs, flowers, shells, wood, tidalRocks])
      mesh.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { group, update };
}
