import { add, mul, norm, cross, clamp } from "../star-ring/course.js";

export const HALF = 8;
export const CLEARANCE = 0.09;
export const SECTOR = 190;
export const INTRO = 240;
export const FACE_NAMES = [
  ["地面", "Floor"],
  ["右墙", "Right wall"],
  ["天花板", "Ceiling"],
  ["左墙", "Left wall"],
];
export const FACE_COLORS = ["#73ddff", "#ffcb78", "#8de9bf", "#c3a1ff"];
export const FACE_UP = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
];
export function facePoint(face, offset = CLEARANCE) {
  return FACE_UP[face].map((v) => -v * (HALF - offset));
}
export function faceDistance(face, x, y) {
  const n = FACE_UP[face];
  return n[0] * x + n[1] * y + HALF - CLEARANCE;
}
function hash(seed, index) {
  let x = (seed ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}
export function createGravityCourse(seed = 1) {
  // A bounded prefix cache; parity also supplies random-access fallback. Each
  // successive safe face is adjacent, leaving over 4 s to prepare the next jump.
  const gates = new Map();
  const faceAt = (index) => {
    let face = 0;
    for (let k = 0; k <= index; k++) face = (face + (hash(seed, k) > 0.47 ? 1 : 3)) % 4;
    return face;
  };
  const gate = (index) => {
    index = Math.max(0, Math.floor(index));
    if (!gates.has(index)) {
      const s = INTRO + 100 + index * SECTOR;
      gates.set(index, { index, s, start: s - 15, end: s + 33, face: faceAt(index), cell: s + 62 });
      if (gates.size > 14) gates.delete(gates.keys().next().value);
    }
    return gates.get(index);
  };
  const frame = (s) => {
    const p = [Math.sin(s / 220) * 18, 10 + Math.sin(s / 410) * 5, -s];
    const t = norm([(Math.cos(s / 220) * 18) / 220, (Math.cos(s / 410) * 5) / 410, -1]);
    const right = norm(cross(t, [0, 1, 0])),
      up = norm(cross(right, t));
    return { p, t, right, up };
  };
  const world = (s, x, y, anchor = 0) => {
    const f = frame(s),
      a = frame(anchor).p;
    return add(
      f.p.map((v, i) => v - a[i]),
      add(mul(f.right, x), mul(f.up, y)),
    );
  };
  const exists = (face, s, footprint = 0) => {
    if (s < INTRO) return true;
    const index = Math.max(0, Math.floor((s - INTRO - 100) / SECTOR));
    for (let i = Math.max(0, index - 1); i <= index + 1; i++) {
      const g = gate(i);
      if (face !== g.face && s + footprint >= g.start && s - footprint <= g.end) return false;
    }
    return true;
  };
  const nextGate = (s) => {
    let index = Math.max(0, Math.floor((s - INTRO - 100) / SECTOR));
    while (gate(index).end + 3 < s) index++;
    return gate(index);
  };
  return {
    seed,
    gate,
    frame,
    world,
    exists,
    nextGate,
    nearGates(s, distance = 650) {
      const first = Math.max(0, Math.floor((s - INTRO - 100) / SECTOR) - 1);
      return Array.from({ length: Math.ceil(distance / SECTOR) + 3 }, (_, i) => gate(first + i));
    },
    status: () => ({ seed, cachedGates: gates.size, maxCachedGates: 14 }),
  };
}
