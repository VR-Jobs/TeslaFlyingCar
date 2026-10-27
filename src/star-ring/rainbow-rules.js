import { STARMAN } from "../config/gameplay.js";
import { clamp } from "./course.js";
import { voyageProtected } from "./voyage-plan.js";
import { trafficPose, trafficFrame } from "./traffic-motion.js";
export const RAINBOW = {
  duration: STARMAN.duration,
  scoreMult: STARMAN.scoreMult,
  speedMult: STARMAN.speedMult,
  smash: STARMAN.smash,
  grace: 0.7,
};
export const rainbowActive = (r) => !!r && r.phase === "running" && (r.rainbow?.remaining || 0) > 0;
export const rainbowProtected = (r) =>
  rainbowActive(r) || (r?.phase === "running" && (r.rainbow?.grace || 0) > 0);
export const rainbowMultiplier = (r) => (rainbowActive(r) ? RAINBOW.scoreMult : 1);
function state(r, c) {
  const key = c.id ?? "baseline";
  if (!r.rainbow)
    r.rainbow = { key, remaining: 0, grace: 0, collected: 0, smashed: 0, knocked: new Map() };
  if (r.rainbow.key !== key) {
    r.rainbow.key = key;
    r.rainbow.knocked.clear();
  }
  return r.rainbow;
}
export function startRainbow(r, c) {
  if (r.tutorial?.active) return false;
  const s = state(r, c);
  s.remaining = RAINBOW.duration;
  s.grace = 0;
  s.collected++;
  r.pressure = 100;
  r.events.push({ type: "rainbowStart" });
  return true;
}
export function stepRainbow(r, c, dt) {
  const s = state(r, c),
    active = s.remaining > 0;
  s.remaining = Math.max(0, s.remaining - dt);
  if (active && s.remaining === 0) {
    s.grace = RAINBOW.grace;
    r.pressure = Math.max(r.pressure, 85);
    r.events.push({ type: "rainbowEnd" });
  } else s.grace = Math.max(0, s.grace - dt);
  for (const [i, k] of s.knocked) if (r.time - k.at > 1.25) s.knocked.delete(i);
}
export function resetRainbow(r) {
  if (r.rainbow) {
    r.rainbow.remaining = r.rainbow.grace = 0;
    r.rainbow.knocked.clear();
  }
}
export function rainbowSpeed(r, c) {
  if (
    !rainbowActive(r) ||
    r.routeId ||
    r.adventure?.attempt ||
    c.frame(r.s).kind !== "straight" ||
    voyageProtected(c, r.s - 12, r.s + 125)
  )
    return 1;
  return RAINBOW.speedMult;
}
export function smashRainbowCar(r, c, index) {
  if (!rainbowProtected(r) || r.hit.has(index)) return false;
  const h = c.hazards[index];
  if (!h || h.type !== "car") return false;
  const s = state(r, c),
    pose = trafficPose(c, h, index, r),
    f = trafficFrame(c, pose);
  r.hit.add(index);
  s.smashed++;
  s.knocked.set(index, {
    p: [...f.p],
    right: [...f.right],
    up: [...f.up],
    t: [...f.t],
    side: pose.lane >= r.lane ? 1 : -1,
    at: r.time,
  });
  if (s.knocked.size > 6) s.knocked.delete(s.knocked.keys().next().value);
  r.score += RAINBOW.smash * rainbowMultiplier(r);
  r.events.push({ type: "rainbowSmash", index });
  return true;
}
export function rainbowStatus(r) {
  const s = r?.rainbow;
  return {
    active: rainbowActive(r),
    remaining: s?.remaining || 0,
    grace: s?.grace || 0,
    collected: s?.collected || 0,
    smashed: s?.smashed || 0,
    knocked: s?.knocked.size || 0,
    multiplier: rainbowMultiplier(r),
  };
}
export function installRainbow(c, seed, index) {
  const frac = (n) => {
    let x = (seed ^ Math.imul(index + 7, 31) ^ Math.imul(n, 0x9e3779b9)) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
    return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
  };
  function put(s, replace = false) {
    if (
      s < 90 ||
      s > c.length - 150 ||
      voyageProtected(c, s - 10, s + 10) ||
      c.hazards.some((h) => Math.abs(h.s - s) < 12 && Math.abs(h.lane) < 2.2)
    )
      return false;
    const nearby = c.pickups.filter((p) => Math.abs(p.s - s) < 9 && p.lane === 0);
    if (nearby.some((p) => p.required) || (nearby.length && !replace)) return false;
    if (replace) c.pickups = c.pickups.filter((p) => !nearby.includes(p));
    c.pickups.push({ s, lane: 0, type: "star", height: 1.35 });
    return true;
  }
  let placed = false;
  for (const replace of [false, true]) {
    for (let s = 132; s <= 158; s += 2)
      if (put(s, replace)) {
        placed = true;
        break;
      }
    if (placed) break;
  }
  const span = c.length - 680,
    start = 150 + frac(1) * (span - 150);
  for (let i = 0; i < Math.ceil(span / 13); i++)
    if (put(500 + ((start + i * 13) % span), true)) break;
  c.pickups.sort((a, b) => a.s - b.s);
  return c;
}
