import { EXPERIENCE_VERSION } from "./director.js";
const KEY = "tesla-music.star-ring-ghost.v1",
  MAX = 4800;
export function createGhostRecorder(storage = null) {
  let saved = null,
    samples = [],
    seed = 0,
    last = -1,
    recording = true,
    interval = 0.2;
  try {
    const v = JSON.parse(storage?.getItem(KEY) || "null");
    if (
      v?.version === EXPERIENCE_VERSION &&
      Array.isArray(v.samples) &&
      v.samples.length >= 2 &&
      v.samples.length <= MAX &&
      Number.isInteger(v.seed) &&
      Number.isFinite(v.distance) &&
      v.distance >= 50 &&
      v.samples.every((s) => Array.isArray(s) && s.length === 8 && s.every(Number.isFinite))
    )
      saved = v;
  } catch {}
  function start(value, allow = true) {
    seed = value >>> 0;
    samples = [];
    last = -1;
    recording = allow;
    interval = 0.2;
  }
  return {
    start,
    record(run, frame) {
      if (!recording || run.phase !== "running" || !frame || run.time - last < interval) return;
      const a = [run.time, ...frame];
      if (a.length !== 8 || !a.every(Number.isFinite)) return;
      if (samples.length >= MAX) {
        samples = samples.filter((_, i) => i % 2 === 0);
        interval *= 2;
      }
      samples.push(a.map((n, i) => Math.round(n * (i ? 1000 : 100)) / (i ? 1000 : 100)));
      last = run.time;
    },
    finish(run) {
      const distance = run.bestDistance || run.completedDistance + run.s;
      if (!recording || samples.length < 10 || !Number.isFinite(distance) || distance < 50)
        return false;
      if (saved && saved.distance >= distance) return false;
      const next = {
        version: EXPERIENCE_VERSION,
        seed,
        distance,
        score: Math.floor(run.score),
        samples,
      };
      try {
        storage?.setItem(KEY, JSON.stringify(next));
        saved = next;
        return true;
      } catch {
        return false;
      }
    },
    playback(time) {
      if (
        !saved ||
        saved.seed !== seed ||
        time < saved.samples[0][0] ||
        time > saved.samples.at(-1)[0]
      )
        return null;
      let lo = 0,
        hi = saved.samples.length - 1;
      while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (saved.samples[m][0] <= time) lo = m;
        else hi = m;
      }
      const a = saved.samples[lo],
        b = saved.samples[hi],
        u = Math.max(0, Math.min(1, (time - a[0]) / Math.max(0.001, b[0] - a[0])));
      if (Math.hypot(b[1] - a[1], b[2] - a[2], b[3] - a[3]) > 70 * (b[0] - a[0]) + 10) return null;
      const q = a.slice(4, 8),
        r = b.slice(4, 8),
        sign = q.reduce((v, n, i) => v + n * r[i], 0) < 0 ? -1 : 1;
      const quat = q.map((n, i) => n + (r[i] * sign - n) * u),
        len = Math.hypot(...quat) || 1;
      return [...a.slice(1, 4).map((n, i) => n + (b[i + 1] - n) * u), ...quat.map((n) => n / len)];
    },
    status: () => ({
      available: !!saved,
      seed: saved?.seed ?? null,
      distance: saved?.distance || 0,
      matching: !!saved && saved.seed === seed,
      recorded: samples.length,
      capacity: MAX,
    }),
  };
}
