import { add, sub, mul, dot, cross, norm, clamp } from "./course.js";
export function installAdventureCourse(course, seed = 0, index = 0) {
  const first = course.segments.findIndex((s) => s.kind === "turn"),
    branches = [],
    chains = [];
  if (first >= 0) {
    const start = course.segments[first].start,
      last = course.segments[first + 2];
    if (last?.kind === "turn") {
      const end = last.end,
        a = course.pose(start),
        b = course.pose(end),
        delta = sub(b.p, a.p);
      const side = -(course.segments[first].options.direction || 1),
        span = end - start;
      function point(s) {
        const u = (s - start) / span,
          w = Math.sin(Math.PI * clamp(u, 0, 1)) ** 2;
        return add(
          a.p,
          add(mul(delta, u), add(mul(a.right, side * (8 + 3 * w)), mul(a.up, 3 + 0.5 * w))),
        );
      }
      const begin = start + 24,
        finish = end - 24;
      function frame(s) {
        const p = point(s),
          v = sub(point(s + 0.15), point(s - 0.15)),
          t = norm(v),
          right = norm(cross(t, a.up)),
          up = norm(cross(right, t));
        const ta = norm(sub(point(s), point(s - 0.3))),
          tb = norm(sub(point(s + 0.3), point(s)));
        return {
          s,
          p,
          t,
          right,
          up,
          curvature: Math.hypot(...sub(tb, ta)) / Math.max(0.01, Math.hypot(...v)),
          kind: "branch",
          title: "外环捷径",
          exists: s >= begin && s <= finish,
          tone: [1, 0.75, 0.42],
        };
      }
      const metric = (s) => Math.hypot(...sub(point(s + 0.25), point(s - 0.25))) / 0.5;
      function pose(s, lane = 0) {
        const f = frame(s);
        return { ...f, p: add(f.p, mul(f.right, lane)) };
      }
      const branch = {
        ...course,
        id: "fork-" + index,
        start: begin,
        end: finish,
        launchStart: start - 3,
        launchEnd: start + 14,
        launchS: start + 3,
        side,
        frame,
        pose,
        metric,
        width: 4.6,
        laneLimit: 0.9,
        laneStep: 0.9,
        gaps: [],
        surfaceGaps: [],
        checkpoints: [],
        pickups: [],
        hazards: [],
        endless: true,
        randomized: true,
        surfaceStart: begin,
        surfaceEnd: finish,
        surfaceSegments: [{ start: begin, end: finish }],
        branches: [],
      };
      branches.push(branch);
      const launchS = begin + 56 / metric(begin);
      chains.push(makeChain("fork-chain-" + index, branch.id, launchS, branch));
    }
  }
  const corridor = course.segments.find(
    (s) =>
      s.kind === "straight" &&
      s.title === "弹射与补给" &&
      !course.gaps.some((g) => g.start >= s.start && g.start < s.end),
  );
  if (corridor) {
    const chain = makeChain("main-chain-" + index, null, corridor.start + 65, course);
    chains.unshift(chain);
    if (!course.pickups.some((p) => p.type === "air" && Math.abs(p.s - chain.launchS) < 24))
      course.pickups.push({ s: chain.launchS - 17, lane: 0, type: "air", required: true });
  }
  const clear = (s) =>
    chains.some((c) => !c.routeId && s > c.launchS - 25 && s < c.gates.at(-1).s + 32) ||
    branches.some(
      (b) => (s > b.launchStart - 18 && s < b.start + 22) || (s > b.end - 20 && s < b.end + 76),
    );
  course.hazards = course.hazards.filter((h) => !clear(h.s));
  if (course.recipe) course.recipe.rows = course.recipe.rows.filter((r) => !clear(r.s));
  course.pickups.sort((a, b) => a.s - b.s);
  course.adventures = { branches, chains, seed, index };
  return course;
}
function makeChain(id, routeId, launchS, path) {
  const metric = path.metric?.(launchS) || 1;
  return {
    id,
    routeId,
    launchS,
    gates: [
      { distance: 10, height: 3.3, action: "jump" },
      { distance: 22, height: 4.7, action: "spin" },
      { distance: 32, height: 2.7, action: "suction" },
    ].map((g, i) => ({
      ...g,
      s: launchS + g.distance / metric,
      index: i,
      radius: 2.7,
    })),
  };
}
export function routeCourse(course, run) {
  return course.adventures?.branches.find((b) => b.id === run.routeId) || course;
}
