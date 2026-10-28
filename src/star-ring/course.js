import { createSpatialCurve } from "./spatial-curve.js";

export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const mul = (a, s) => a.map((v) => v * s);
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a) => mul(a, 1 / Math.max(1e-9, Math.hypot(...a)));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const smooth = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};

export function createCourse({ endless = false, plan = null } = {}) {
  let origin = [0, 0, 0],
    forward = [0, 0, -1],
    start = 0;
  const segments = [];
  function append(length, kind, title, options = {}) {
    const o = [...origin],
      f = [...forward],
      right = norm(cross(f, [0, 1, 0])),
      spatial = ["banked", "helix"].includes(kind) ? createSpatialCurve(length, options) : null;
    const world = (v) => add(mul(right, v[0]), add([0, v[1], 0], mul(f, v[2])));
    const sample = (d) => {
      let p,
        t,
        up = [0, 1, 0],
        curvature = 0;
      if (spatial) {
        const v = spatial(d);
        const tangent = norm(world(v.t)),
          normal = norm(world(v.up));
        const r = norm(cross(tangent, normal));
        return {
          ...v,
          p: add(o, world(v.p)),
          t: tangent,
          up: norm(cross(r, tangent)),
          right: r,
          kind,
          title,
          tone: options.tone,
        };
      }
      if (kind === "loop") {
        const a = d / options.radius;
        const u = d / length;
        const shift = (options.exitOffset || 0) * smooth(u);
        const drift = ((options.exitOffset || 0) * 6 * u * (1 - u)) / length;
        p = add(
          o,
          add(
            add(mul(f, Math.sin(a) * options.radius), [0, (1 - Math.cos(a)) * options.radius, 0]),
            mul(right, shift),
          ),
        );
        t = norm(add(add(mul(f, Math.cos(a)), [0, Math.sin(a), 0]), mul(right, drift)));
        up = add(mul(f, -Math.sin(a)), [0, Math.cos(a), 0]);
        curvature = 1 / options.radius;
      } else if (kind === "turn") {
        const a = (d / options.radius) * options.direction;
        p = add(
          o,
          add(
            mul(f, (Math.sin(a) * options.radius) / options.direction),
            mul(right, ((1 - Math.cos(a)) * options.radius) / options.direction),
          ),
        );
        t = add(mul(f, Math.cos(a)), mul(right, Math.sin(a)));
        curvature = 1 / options.radius;
      } else if (kind === "wave") {
        const u = d / length,
          h = options.height || 10;
        const slope = ((Math.PI * h) / length) * Math.sin(2 * Math.PI * u);
        p = add(o, add(mul(f, d), [0, h * (1 - Math.cos(2 * Math.PI * u)) * 0.5, 0]));
        t = norm(add(f, [0, slope, 0]));
        up = norm(add(mul(f, -slope), [0, 1, 0]));
        curvature =
          Math.abs(((2 * Math.PI * Math.PI * h) / (length * length)) * Math.cos(2 * Math.PI * u)) /
          Math.pow(1 + slope * slope, 1.5);
      } else {
        p = add(o, mul(f, d));
        t = f;
        if (kind === "twist") {
          const a = smooth(d / length) * Math.PI * 2 * (options.spin || 1);
          up = add([0, Math.cos(a), 0], mul(right, Math.sin(a)));
        }
      }
      const r = norm(cross(t, up));
      up = norm(cross(r, t));
      return { p, t: norm(t), up, right: r, curvature, kind, title, tone: options.tone };
    };
    const end = sample(length);
    segments.push({ start, end: start + length, length, kind, title, options, sample });
    origin = end.p;
    forward = end.t;
    start += length;
  }
  if (plan) for (const s of plan.segments) append(s.length, s.kind, s.title, s.options);
  else {
    append(200, "straight", "启航平台");
    append(240, "twist", "贴壁与倒挂");
    append(80, "straight", "星环入口");
    append(Math.PI * 2 * 46, "loop", "第一星环", { radius: 46, exitOffset: 20 });
    append(190, "straight", "弹射航道");
    append(90, "turn", "外环补给", { radius: 86, direction: 1 });
    append(180, "turn", "切弯航道", { radius: 86, direction: -1 });
    append(90, "turn", "接轨走廊", { radius: 86, direction: 1 });
    append(190, "straight", "深空飞跃");
    append(Math.PI * 2 * 56, "loop", "极光星环", { radius: 56, exitOffset: -20 });
    append(220, "twist", "螺旋归航");
    append(240, "straight", endless ? "跃迁补给走廊" : "终点冲刺");
  }
  const length = start;
  const gaps = plan
    ? plan.gaps.map((g) => ({ ...g }))
    : [
        { start: 875, end: 895, auto: true, name: "初次弹射" },
        { start: 1490, end: 1518, auto: false, name: "深空断轨" },
        {
          start: length - 130,
          end: length - 106,
          auto: false,
          name: endless ? "走廊飞跃" : "最后飞跃",
        },
      ];
  const checkpoints = plan
    ? [...new Set(plan.checkpoints)]
    : [0, 455, 820, 1085, 1455, 1600, 1980, length - 190].filter((s) => s < length);
  function finiteFrame(s) {
    s = clamp(s, 0, length);
    const seg = segments.find((v) => s <= v.end + 0.0001) || segments.at(-1);
    return {
      ...seg.sample(clamp(s - seg.start, 0, seg.length)),
      s,
      exists: !gaps.some((g) => s > g.start && s < g.end),
    };
  }
  const displacement = finiteFrame(length).p;
  function frame(s) {
    if (!endless) return finiteFrame(s);
    const cycle = Math.floor(s / length),
      local = s - cycle * length;
    const f = finiteFrame(local);
    return { ...f, s, p: add(f.p, mul(displacement, cycle)) };
  }
  function pose(s, lane = 0) {
    const v = frame(s),
      a = frame(s - 0.15),
      b = frame(s + 0.15);
    const t = norm(sub(add(b.p, mul(b.right, lane)), add(a.p, mul(a.right, lane))));
    const up = norm(cross(v.right, t));
    return { ...v, p: add(v.p, mul(v.right, lane)), t, up, right: norm(cross(t, up)) };
  }
  const pickups = plan ? plan.pickups.map((p) => ({ ...p })) : [];
  if (!plan) {
    for (let s = 85, i = 0; s < length - 35; s += 55, i++) {
      if (gaps.some((g) => s > g.start - 8 && s < g.end + 8)) continue;
      pickups.push({ s, lane: [0, -3.2, 3.2, 0][i % 4], type: i % 3 === 1 ? "air" : "ring" });
    }
    // Optional airborne hoops on the two manual leaps.
    for (const g of gaps.filter((g) => !g.auto))
      pickups.push({ s: (g.start + g.end) / 2, lane: 0, type: "sky", height: 2 });
  }
  const hazards = plan
    ? plan.hazards.map((h) => ({ ...h }))
    : [270, 385, 1010, 1160, 1310, 1720, 1870, 2140]
        .filter((s) => s < length - 170)
        .map((s, i) => ({ s, lane: [-3.2, 0, 3.2][i % 3] }));
  const baseLanes = pickups.map((v) => v.lane),
    hazardLanes = hazards.map((v) => v.lane);
  function setCycle(cycle) {
    const rotate = (lane, offset) =>
      [-3.2, 0, 3.2][(((Math.round(lane / 3.2) + 1 + offset) % 3) + 3) % 3];
    pickups.forEach((v, i) => {
      v.lane = v.type === "sky" ? 0 : rotate(baseLanes[i], cycle % 3);
    });
    hazards.forEach((v, i) => {
      v.lane = rotate(hazardLanes[i], (cycle * 2) % 3);
    });
  }
  const surfaceStart = endless ? -80 : 0,
    surfaceEnd = endless ? length + 600 : length;
  const surfaceGaps = endless
    ? [-1, 0, 1]
        .flatMap((c) =>
          gaps.map((g) => ({ ...g, start: g.start + c * length, end: g.end + c * length })),
        )
        .filter((g) => g.end > surfaceStart && g.start < surfaceEnd)
    : gaps;
  return {
    length,
    recipe: plan
      ? { seed: plan.seed, index: plan.index, kinds: plan.kinds, rows: plan.rows }
      : null,
    endless,
    displacement,
    surfaceStart,
    surfaceEnd,
    surfaceGaps,
    setCycle,
    surfaceSegments: endless
      ? [-1, 0, 1].flatMap((c) =>
          segments.map((s) => ({ start: s.start + c * length, end: s.end + c * length })),
        )
      : segments,
    segments,
    gaps,
    checkpoints,
    frame,
    pose,
    pickups,
    hazards,
    width: 11.4,
  };
}

export function nearestSurface(course, position, reference, window = 48) {
  let best = null;
  const lo = Math.max(course.endless ? -60 : 0, reference - 12),
    hi = Math.min(course.endless ? course.length + 80 : course.length, reference + window);
  function candidate(s) {
    if (s < lo || s > hi) return null;
    const f = course.frame(s);
    if (!f.exists) return null;
    const lane = clamp(dot(sub(position, f.p), f.right), -course.width / 2, course.width / 2);
    const pose = course.pose(s, lane),
      delta = sub(position, pose.p);
    const value = { ...pose, lane, height: dot(delta, pose.up), distance: Math.hypot(...delta) };
    if (!best || value.distance < best.distance) best = value;
    return value;
  }
  for (let s = lo; s <= hi; s += 1.5) {
    candidate(s);
  }
  for (const gap of course.gaps) {
    candidate(gap.start);
    candidate(gap.end);
  }
  candidate(lo);
  candidate(hi);
  // Project onto the tangent after the coarse search instead of requiring a
  // landing to coincide with one of the 1.5 m sample points.
  for (let i = 0; i < 4 && best; i++)
    candidate(clamp(best.s + dot(sub(position, best.p), best.t), lo, hi));
  return best;
}
