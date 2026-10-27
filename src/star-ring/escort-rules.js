import { rainbowMultiplier } from "./rainbow-rules.js";
import { add, mul, sub, dot, clamp } from "./course.js";
import { routeCourse } from "./adventure-course.js";
function state(run, course) {
  const key = course.id ?? "baseline";
  if (!run.escort || run.escort.key !== key)
    run.escort = {
      key,
      count: run.escort?.count || 0,
      taken: new Set(),
      waves: [],
      released: run.escort?.released || 0,
      collected: run.escort?.collected || 0,
      cleared: run.escort?.cleared || 0,
      serial: 0,
    };
  return run.escort;
}
export function fragmentPosition(course, item) {
  const p = item.routeId ? course.adventures?.branches.find((b) => b.id === item.routeId) : course;
  if (!p) return null;
  const f = p.pose(item.s, item.lane);
  return add(f.p, mul(f.up, item.height));
}
export function releaseEscort(run, course, cause) {
  if (cause === "grip" || run.tutorial?.active || !run.escort?.count) return;
  const a = run.escort,
    stars = a.count,
    f = course.pose(run.s, run.lane);
  a.count = 0;
  a.released++;
  a.waves.push({
    id: ++a.serial,
    age: 0,
    range: 4 + stars * 8,
    stars,
    p: [...run.pos],
    up: [...f.up],
    right: [...f.right],
    t: [...f.t],
  });
  if (a.waves.length > 2) a.waves.shift();
  run.events.push({ type: "escortBurst", stars });
}
export function stepEscort(run, course, dt) {
  if (!course.voyage || run.tutorial?.active) return;
  const a = state(run, course);
  for (const wave of a.waves) {
    wave.age += dt;
    const radius = wave.range * clamp(wave.age / 0.65, 0, 1);
    for (let i = 0; i < course.hazards.length; i++) {
      const h = course.hazards[i];
      if (h.type === "car" || run.hit.has(i)) continue;
      const p = course.pose(h.s, h.lane).p,
        d = sub(p, wave.p);
      if (Math.abs(dot(d, wave.up)) < 2.5 && Math.hypot(...d) < radius) {
        run.hit.add(i);
        a.cleared++;
        run.score += 15 * rainbowMultiplier(run);
        run.events.push({ type: "escortClear", p, serial: wave.id });
      }
    }
  }
  a.waves = a.waves.filter((w) => w.age < 0.7);
  if (!run.input.suction || run.pressure <= 0 || a.count >= 3) return;
  for (const item of course.voyage.fragments) {
    if (a.count >= 3) break;
    if (
      a.taken.has(item.id) ||
      (item.routeId || null) !== (run.routeId || null) ||
      Math.abs(item.s - run.s) > 11
    )
      continue;
    const p = fragmentPosition(course, item);
    if (!p || Math.hypot(...sub(p, run.pos)) > 6.5) continue;
    a.taken.add(item.id);
    a.count++;
    a.collected++;
    run.events.push({ type: "escortCollect", p, slot: a.count - 1 });
  }
}
export function resetEscort(run) {
  if (run.escort) {
    run.escort.count = 0;
    run.escort.waves = [];
  }
}
export function escortStatus(run) {
  const a = run?.escort;
  return {
    count: a?.count || 0,
    collected: a?.collected || 0,
    released: a?.released || 0,
    cleared: a?.cleared || 0,
    activeWaves: a?.waves.length || 0,
  };
}
