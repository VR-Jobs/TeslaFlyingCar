import { separateTrackItems } from "./placement.js";
import { createCourse, add, sub, mul, clamp, norm, cross } from "./course.js";
import { installAdventureCourse } from "./adventure-course.js";
import { installRainbow } from "./rainbow-rules.js";
import { installDirector } from "./director.js";
import { installVoyage } from "./voyage-plan.js";

export const RANDOM_LIMITS = {
  maxSpeed: 48,
  rowSpacing: 84,
  gapBefore: 88,
  gapAfter: 104,
  maxFieldItems: 180,
};
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let nonce = 0;
export function newCourseSeed() {
  const data = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(data);
  else data[0] = (Math.random() * 4294967296) >>> 0;
  return (data[0] ^ Math.imul(++nonce, 0x9e3779b9)) >>> 0;
}
function sectionSeed(seed, index) {
  let x = (seed ^ Math.imul(index + 2, 0x9e3779b9)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}
const palettes = [
  [0.45, 0.92, 0.89],
  [0.66, 0.64, 1],
  [0.44, 0.78, 1],
  [1, 0.79, 0.49],
  [0.72, 0.9, 1],
];
export function createSection(seed, index) {
  const rng = seededRandom(sectionSeed(seed, index)),
    range = (a, b) => a + (b - a) * rng(),
    pick = (a) => a[Math.floor(rng() * a.length)];
  const segments = [],
    gaps = [],
    checkpoints = [0],
    corridors = [];
  let at = 0;
  const append = (length, kind, title, options = {}) => {
    const entry = { length, kind, title, options, start: at, end: at + length };
    segments.push(entry);
    at += length;
    return entry;
  };
  append(180, "straight", "起航补给");
  const kinds = ["banked", "helix", "turn", "wave", rng() < 0.55 ? "loop" : "twist"];
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  // Introduce a new structure early on a fresh run; later sections shuffle freely.
  if (index === 0 && !["banked", "helix"].includes(kinds[0])) {
    const at = kinds.indexOf(rng() < 0.5 ? "banked" : "helix");
    [kinds[0], kinds[at]] = [kinds[at], kinds[0]];
  }
  const gapSlots = [0, 2, 4];
  if (rng() < 0.45) gapSlots.push(pick([1, 3]));
  for (let i = 0; i < kinds.length; i++) {
    checkpoints.push(Math.max(0, at - 22));
    const kind = kinds[i],
      tone = pick(palettes),
      spin = rng() < 0.5 ? -1 : 1;
    if (kind === "banked") {
      const slalom = index > 0 && rng() < 0.4;
      const angle = slalom ? range(0.68, 0.88) : range(1.72, 2.02);
      const radius = range(57, 68),
        tilt = range(0.72, 1.04);
      const pattern = slalom ? [1, -2, 1] : [1, -1];
      for (const part of pattern) {
        const direction = spin * Math.sign(part),
          yaw = angle * part * spin;
        append(
          Math.abs(yaw) * radius * 1.875,
          "banked",
          slalom
            ? direction < 0
              ? "左倾波浪弯"
              : "右倾波浪弯"
            : direction < 0
              ? "长左弯 · 侧倾航道"
              : "长右弯 · 侧倾航道",
          { yaw, bank: direction * tilt, tone },
        );
      }
    } else if (kind === "helix") {
      const yaw = spin * Math.PI * 2,
        radius = range(27, 33);
      const rise = (rng() < 0.5 ? -1 : 1) * range(28, 38);
      append(Math.abs(yaw) * radius * 1.875, "helix", rise > 0 ? "螺旋升空" : "螺旋下降", {
        yaw,
        bank: spin * range(0.74, 1.02),
        rise,
        tone,
      });
    } else if (kind === "loop") {
      const radius = range(46, 64);
      append(2 * Math.PI * radius, kind, pick(["流光星环", "引力星环", "极光环路"]), {
        radius,
        exitOffset: spin * range(23, 31),
        tone,
      });
    } else if (kind === "twist")
      append(range(220, 310), kind, spin < 0 ? "逆向螺旋" : "翻转星廊", { spin, tone });
    else if (kind === "turn") {
      const radius = range(88, 120),
        angle = range(0.62, 1.03);
      append(radius * angle, "turn", spin < 0 ? "左旋弯道" : "右旋弯道", {
        radius,
        direction: spin,
        tone,
      });
      append(radius * angle * 2, "turn", "连续反向弯", { radius, direction: -spin, tone });
      append(radius * angle, "turn", "出弯走廊", { radius, direction: spin, tone });
    } else append(range(225, 320), "wave", "星尘起伏", { height: range(8, 15), tone });
    const corridor = append(range(248, 296), "straight", "弹射与补给");
    corridors.push(corridor);
    if (gapSlots.includes(i)) {
      const width = gaps.length === 0 ? range(18, 20) : range(20, 27),
        start = corridor.start + range(96, 114);
      gaps.push({
        start,
        end: start + width,
        auto: gaps.length === 0,
        name: gaps.length === 0 ? "导航弹射" : "深空断轨",
      });
      checkpoints.push(start - 74, start + width + 70);
    }
  }
  append(160, "straight", "跃迁航道");
  const length = at,
    pickups = [];
  const put = (s, lane, type, extra = {}) => {
    if (s < 45 || s > length - 75 || pickups.some((p) => Math.abs(p.s - s) < 7 && p.lane === lane))
      return;
    pickups.push({ s, lane, type, ...extra });
  };
  const safe = (s) => !gaps.some((g) => s > g.start - 10 && s < g.end + 16);
  for (const seg of segments) {
    if (["loop", "twist", "banked", "helix"].includes(seg.kind))
      for (let s = seg.start + 34; s < seg.end - 15; s += range(58, 72))
        put(s, 0, "air", { required: true });
  }
  for (const g of gaps) {
    put(g.start - 52, 0, "air", { required: true });
    put(g.end + 42, 0, "air", { required: true });
    if (!g.auto) put((g.start + g.end) / 2, 0, "sky", { height: 2 });
  }
  let lane = 0;
  for (let s = 62; s < length - 90; s += range(34, 65)) {
    if (!safe(s)) continue;
    const choice = rng();
    if (choice < 0.32) lane = clamp(lane + (rng() < 0.5 ? -3.2 : 3.2), -3.2, 3.2);
    else if (choice > 0.82) lane = pick([-3.2, 0, 3.2]);
    put(s, lane, rng() < 0.27 ? "air" : "ring");
    if (rng() < 0.2 && safe(s + 17)) put(s + 17, lane, "ring");
  }
  pickups.sort((a, b) => a.s - b.s);
  const hazards = [],
    rows = [];
  for (let s = range(250, 300); s < length - 180; s += range(84, 144)) {
    if (
      gaps.some((g) => s > g.start - RANDOM_LIMITS.gapBefore && s < g.end + RANDOM_LIMITS.gapAfter)
    )
      continue;
    const nearAir = pickups.some((p) => p.required && Math.abs(p.s - s) < 18);
    const nearLeap = gaps.some((g) => g.start - s > 0 && g.start - s < 210);
    const open = nearAir || nearLeap ? 0 : pick([-3.2, 0, 3.2]);
    const blocked = [-3.2, 0, 3.2].filter((l) => l !== open);
    if (rng() < 0.64) blocked.splice(Math.floor(rng() * 2), 1);
    rows.push({ s, open, blocked: [...blocked] });
    for (const [i, lane] of blocked.entries()) {
      // Choose without consuming the route RNG: geometric layouts remain reproducible.
      const variety = ((seed >>> 0) + index * 7 + rows.length * 3 + i) % 5;
      hazards.push({
        s,
        lane,
        type: variety === 0 ? "device" : "car",
        paint: Math.abs((seed >>> 0) + index + rows.length + i) % 4,
      });
    }
  }
  const course = createCourse({
    plan: {
      segments,
      gaps,
      checkpoints: checkpoints.sort((a, b) => a - b),
      pickups,
      hazards,
      rows,
      seed,
      index,
      kinds,
    },
  });
  installAdventureCourse(course, seed, index);
  installVoyage(course, seed, index);
  installDirector(course, seed, index);
  installRainbow(course, seed, index);
  return separateTrackItems(course);
}
function windowFor(seed, index) {
  const previous = createSection(seed, index - 1),
    current = createSection(seed, index),
    next = createSection(seed, index + 1);
  const length = current.length,
    start = -80,
    end = length + 600,
    offset = current.displacement;
  let frameCache = null,
    poseCache = null;
  function sampleFrame(s) {
    if (s < 0) {
      const f = previous.frame(previous.length + s);
      return { ...f, s, p: sub(f.p, previous.displacement) };
    }
    if (s > length) {
      const f = next.frame(s - length);
      return { ...f, s, p: add(f.p, offset) };
    }
    return current.frame(s);
  }
  function frame(s) {
    if (frameCache?.has(s)) return frameCache.get(s);
    const value = sampleFrame(s);
    frameCache?.set(s, value);
    return value;
  }
  function pose(s, lane = 0) {
    const key = s + ":" + lane;
    if (poseCache?.has(key)) return poseCache.get(key);
    const f = frame(s),
      a = frame(s - 0.15),
      b = frame(s + 0.15);
    // Use the already orthonormal base implementation for each local window.
    const ds = b.p.map((v, i) => v - a.p[i] + (b.right[i] - a.right[i]) * lane);
    const t = norm(ds),
      up = norm(cross(f.right, t)),
      right = norm(cross(t, up));
    const value = { ...f, s, p: add(f.p, mul(f.right, lane)), t, up, right };
    poseCache?.set(key, value);
    return value;
  }
  const pieces = [
    { c: previous, shift: -previous.length },
    { c: current, shift: 0 },
    { c: next, shift: length },
  ];
  const surfaceGaps = pieces
    .flatMap(({ c, shift }) =>
      c.gaps.map((g) => ({ ...g, start: g.start + shift, end: g.end + shift })),
    )
    .filter((g) => g.end > start && g.start < end);
  const surfaceSegments = pieces.flatMap(({ c, shift }) =>
    c.segments.map((s) => ({ start: s.start + shift, end: s.end + shift })),
  );
  const withPreview = (kind) => [
    ...current[kind],
    ...next[kind].filter((p) => p.s < 220).map((p) => ({ ...p, s: p.s + length, preview: true })),
  ];
  return {
    ...current,
    endless: true,
    randomized: true,
    id: seed + ":" + index,
    seed,
    section: index,
    frame,
    pose,
    displacement: offset,
    surfaceStart: start,
    surfaceEnd: end,
    surfaceGaps,
    surfaceSegments,
    pickups: withPreview("pickups"),
    hazards: withPreview("hazards"),
    recipe: current.recipe,
    get geometryMemoActive() {
      return frameCache !== null;
    },
    async withGeometryCacheAsync(build) {
      if (frameCache) return build();
      frameCache = new Map();
      poseCache = new Map();
      try {
        return await build();
      } finally {
        frameCache = null;
        poseCache = null;
      }
    },
    withGeometryCache(build) {
      if (frameCache) return build();
      frameCache = new Map();
      poseCache = new Map();
      try {
        return build();
      } finally {
        frameCache = null;
        poseCache = null;
      }
    },
  };
}
export function createRandomCourse(initialSeed = newCourseSeed()) {
  let seed = initialSeed >>> 0,
    index = 0,
    current = windowFor(seed, 0),
    prepared = null;
  const control = {
    snapshot: () => current,
    previewNext() {
      if (!prepared) prepared = windowFor(seed, index + 1);
      return prepared;
    },
    setCycle(cycle) {
      index = cycle;
      current = prepared?.section === cycle ? prepared : windowFor(seed, cycle);
      prepared = null;
    },
    reseed(value = newCourseSeed()) {
      seed = value >>> 0;
      index = 0;
      current = windowFor(seed, 0);
      prepared = null;
    },
    randomStatus: () => ({
      seed,
      section: index + 1,
      layout: current.id,
      kinds: current.recipe.kinds,
      gaps: current.gaps.length,
      rows: current.recipe.rows.length,
      previewReady: !!prepared,
      structures: "banked-helical-1",
    }),
  };
  return new Proxy(control, { get: (target, key) => (key in target ? target[key] : current[key]) });
}
