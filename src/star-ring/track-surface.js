import { finishBuild, finishBuildAsync } from "./build-scheduler.js";
import { add, sub, mul, dot, cross, norm, clamp } from "./course.js";

const cache = new WeakMap();
const CELL = 16,
  THICKNESS = 0.45;

export function getTrackSurface(course) {
  course = course.snapshot?.() || course;
  if (cache.has(course)) return cache.get(course);
  const build = () => finishBuild(generateTrackSurface(course));
  return course.withGeometryCache && !course.geometryMemoActive
    ? course.withGeometryCache(build)
    : build();
}
export async function prepareTrackSurface(course, yieldTask) {
  if (cache.has(course)) return cache.get(course);
  return finishBuildAsync(generateTrackSurface(course), yieldTask);
}
function* generateTrackSurface(course) {
  const groups = { top: { positions: [] }, bottom: { positions: [] }, wall: { positions: [] } };
  const triangles = [],
    cells = new Map();
  function triangle(points, routes, kind, expected) {
    let [a, b, c] = points.map((p) => p.map(Math.fround)),
      [sa, sb, sc] = routes;
    if (dot(cross(sub(b, a), sub(c, a)), expected) < 0) {
      [b, c] = [c, b];
      [sb, sc] = [sc, sb];
    }
    const normal = norm(cross(sub(b, a), sub(c, a)));
    if (Math.hypot(...cross(sub(b, a), sub(c, a))) < 1e-8) return;
    const id = triangles.length;
    const min = a.map((v, i) => Math.min(v, b[i], c[i])),
      max = a.map((v, i) => Math.max(v, b[i], c[i]));
    triangles.push({ a, b, c, e1: sub(b, a), e2: sub(c, a), normal, sa, sb, sc, kind, min, max });
    groups[kind].positions.push(...a, ...b, ...c);
    for (let x = Math.floor(min[0] / CELL); x <= Math.floor(max[0] / CELL); x++)
      for (let y = Math.floor(min[1] / CELL); y <= Math.floor(max[1] / CELL); y++)
        for (let z = Math.floor(min[2] / CELL); z <= Math.floor(max[2] / CELL); z++) {
          const key = `${x},${y},${z}`;
          if (!cells.has(key)) cells.set(key, []);
          cells.get(key).push(id);
        }
  }
  function quad(p, s, kind, n) {
    triangle([p[0], p[1], p[2]], [s[0], s[1], s[2]], kind, n);
    triangle([p[1], p[3], p[2]], [s[1], s[3], s[2]], kind, n);
  }
  const surfaceStart = course.surfaceStart ?? 0,
    surfaceEnd = course.surfaceEnd ?? course.length;
  const surfaceGaps = course.surfaceGaps || course.gaps;
  const knots = [
    ...new Set([
      surfaceStart,
      surfaceEnd,
      ...(course.surfaceSegments || course.segments).flatMap((s) => [s.start, s.end]),
      ...surfaceGaps.flatMap((g) => [g.start, g.end]),
      ...Array.from(
        { length: Math.ceil((surfaceEnd - surfaceStart) / 2) },
        (_, i) => surfaceStart + i * 2,
      ),
    ]),
  ]
    .filter((s) => s >= surfaceStart && s <= surfaceEnd)
    .sort((a, b) => a - b);
  const boundary = (s) =>
    s === surfaceStart ||
    s === surfaceEnd ||
    surfaceGaps.some((g) => Math.abs(g.start - s) < 1e-6 || Math.abs(g.end - s) < 1e-6);
  function strip(a, b, width, pose, capStart = false, capEnd = false) {
    const fm = pose((a + b) / 2, 0),
      at = (s, x) => pose(s, x).p,
      under = (s, x) => {
        const f = pose(s, x);
        return add(f.p, mul(f.up, -THICKNESS));
      };
    for (let i = 0; i < 4; i++) {
      const x = -width / 2 + (i * width) / 4,
        xx = x + width / 4,
        ss = [a, a, b, b];
      quad([at(a, x), at(a, xx), at(b, x), at(b, xx)], ss, "top", fm.up);
      quad([under(a, x), under(a, xx), under(b, x), under(b, xx)], ss, "bottom", mul(fm.up, -1));
      for (const [s, cap, sign] of [
        [a, capStart, -1],
        [b, capEnd, 1],
      ])
        if (cap)
          quad(
            [at(s, x), at(s, xx), under(s, x), under(s, xx)],
            [s, s, s, s],
            "wall",
            mul(pose(s, 0).t, sign),
          );
    }
    for (const side of [-1, 1]) {
      const x = (side * width) / 2;
      quad(
        [at(a, x), under(a, x), at(b, x), under(b, x)],
        [a, a, b, b],
        "wall",
        mul(fm.right, side),
      );
    }
  }
  for (let i = 0; i < knots.length - 1; i++) {
    if (i % 16 === 0) yield;
    const a = knots[i],
      b = knots[i + 1];
    if (b - a < 1e-5 || !course.frame((a + b) / 2).exists) continue;
    strip(a, b, course.width, course.pose, boundary(a), boundary(b));
  }
  const origin = course.pose(0),
    platformPose = (s, x = 0) => ({
      ...origin,
      s,
      p: add(origin.p, add(mul(origin.t, s), mul(origin.right, x))),
    });
  if (!course.endless)
    for (let s = -40; s < 0; s += 2) strip(s, s + 2, 14, platformPose, s === -40, s === -2);

  function candidates(min, max) {
    const found = new Set();
    for (let x = Math.floor(min[0] / CELL); x <= Math.floor(max[0] / CELL); x++)
      for (let y = Math.floor(min[1] / CELL); y <= Math.floor(max[1] / CELL); y++)
        for (let z = Math.floor(min[2] / CELL); z <= Math.floor(max[2] / CELL); z++)
          for (const id of cells.get(`${x},${y},${z}`) || []) found.add(id);
    return [...found].map((id) => triangles[id]);
  }
  function intersect(from, to, t) {
    const d = sub(to, from);
    if (dot(d, t.normal) >= -1e-9) return null; // entering the solid, never its exit face
    const p = cross(d, t.e2),
      det = dot(t.e1, p);
    if (Math.abs(det) < 1e-10) return null;
    const inv = 1 / det,
      v = sub(from, t.a),
      u = dot(v, p) * inv;
    if (u < -1e-6 || u > 1.000001) return null;
    const q = cross(v, t.e1),
      w = dot(d, q) * inv;
    if (w < -1e-6 || u + w > 1.000001) return null;
    const time = dot(t.e2, q) * inv;
    if (time < -1e-6 || time > 1.000001) return null;
    return {
      time: clamp(time, 0, 1),
      normal: t.normal,
      kind: t.kind,
      s: t.sa + (t.sb - t.sa) * u + (t.sc - t.sa) * w,
      point: add(from, mul(d, clamp(time, 0, 1))),
    };
  }
  function sweep(from, to, onlyKind = null) {
    const min = from.map((v, i) => Math.min(v, to[i]) - 0.001),
      max = from.map((v, i) => Math.max(v, to[i]) + 0.001);
    let best = null;
    for (const t of candidates(min, max)) {
      if (onlyKind && t.kind !== onlyKind) continue;
      const hit = intersect(from, to, t);
      if (hit && (!best || hit.time < best.time)) best = hit;
    }
    return best;
  }
  const surface = { groups, triangles, thickness: THICKNESS, sweep, candidates, intersect };
  cache.set(course, surface);
  return surface;
}

export function carProbePoints(course, run) {
  const f = course.pose(run.s, run.lane),
    c = Math.cos(run.roll || 0),
    s = Math.sin(run.roll || 0),
    cp = Math.cos(run.pitch || 0),
    sp = Math.sin(run.pitch || 0);
  const points = [{ p: add(run.pos, mul(f.up, 0.015)), foot: true }];
  for (const h of [0.12, 0.65, 1.25])
    for (const x of [-1.02, 1.02])
      for (const z of [-2.35, 2.35]) {
        const xx = x * c - (h - 0.55) * s,
          rolledY = x * s + (h - 0.55) * c,
          yy = 0.55 + rolledY * cp - z * sp,
          zz = rolledY * sp + z * cp;
        points.push({
          p: add(run.pos, add(mul(f.right, xx), add(mul(f.up, yy), mul(f.t, -zz)))),
          foot: false,
        });
      }
  points.push({ p: add(run.pos, mul(f.up, 1.25)), foot: false });
  return points;
}

export function sweepCar(course, previous, run, foreignOnly = false) {
  const surface = getTrackSurface(course),
    a = carProbePoints(course, previous),
    b = carProbePoints(course, run);
  const all = [...a, ...b].map((v) => v.p),
    min = [0, 1, 2].map((i) => Math.min(...all.map((p) => p[i])) - 0.01),
    max = [0, 1, 2].map((i) => Math.max(...all.map((p) => p[i])) + 0.01);
  const triangles = surface.candidates(min, max);
  let best = null;
  for (let i = 0; i < a.length; i++)
    for (const triangle of triangles) {
      if (
        foreignOnly &&
        Math.min(
          Math.abs(triangle.sa - run.s),
          Math.abs(triangle.sb - run.s),
          Math.abs(triangle.sc - run.s),
        ) < 8
      )
        continue;
      const hit = surface.intersect(a[i].p, b[i].p, triangle);
      if (hit && (!best || hit.time < best.time)) best = { ...hit, foot: a[i].foot };
    }
  return best;
}
