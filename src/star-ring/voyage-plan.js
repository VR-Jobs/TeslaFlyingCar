import { clamp } from "./course.js";
const sample = (seed, n) => {
  let x = (seed ^ Math.imul(n + 11, 0x9e3779b9)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
};
export function voyageProtected(course, lo, hi) {
  if (course.gaps.some((g) => hi > g.start - 90 && lo < g.end + 106)) return true;
  const a = course.adventures;
  return (
    !!a &&
    (a.chains.some((c) => !c.routeId && hi > c.launchS - 32 && lo < c.gates.at(-1).s + 42) ||
      a.branches.some(
        (b) =>
          (hi > b.launchStart - 26 && lo < b.start + 34) || (hi > b.end - 26 && lo < b.end + 90),
      ))
  );
}
export function installVoyage(course, seed, index) {
  const cells = [],
    key = (seed >>> 0) ^ Math.imul(index + 7, 31);
  function cell(anchor, open, changing) {
    if (
      voyageProtected(course, anchor - 40, anchor + 110) ||
      cells.some((c) => Math.abs(c.anchor - anchor) < 330)
    )
      return false;
    const blocked = [-3.2, 0, 3.2].filter((l) => l !== open);
    if (sample(key, Math.floor(anchor)) < 0.5) blocked.reverse();
    const id = "convoy-" + index + "-" + cells.length;
    const entry = {
      id,
      anchor,
      open,
      min: anchor - 24,
      max: anchor + 88,
      clearS: anchor + 96,
      changing,
    };
    course.hazards = course.hazards.filter((h) => h.s < anchor - 100 || h.s > anchor + 150);
    course.recipe.rows = course.recipe.rows.filter((r) => r.s < anchor - 100 || r.s > anchor + 150);
    course.recipe.rows.push({
      s: anchor,
      open,
      blocked: [...blocked],
      cellId: id,
      clearS: entry.clearS,
    });
    const offsets = changing ? [-24, 0, 24] : [-12, -12, 22];
    for (const [j, offset] of offsets.entries()) {
      const lane = blocked[j % 2],
        target = j === 2 && changing ? blocked[1] : lane;
      course.hazards.push({
        s: anchor + offset,
        lane,
        type: "car",
        paint: (seed + index + j + cells.length) % 4,
        motion: {
          cellId: id,
          anchor,
          speed: 6 + sample(key, j + cells.length * 7) * 1.8,
          maxTravel: 64,
          laneTo: target,
          signal: 1.8,
          changeSeconds: 2,
          merge: target !== lane,
        },
      });
    }
    cells.push(entry);
    return true;
  }
  const curved = course.segments.filter(
    (s) => (s.kind === "loop" || s.kind === "twist") && s.length > 210,
  );
  for (const seg of curved) {
    if (cell(seg.start + 62, 0, false)) break;
  }
  // The final straight gives the merging convoy a wide, predictable approach.
  cell(course.length - 100, sample(key, 4) < 0.5 ? -3.2 : 3.2, true);
  if (index % 2 === 0 && index > 0 && sample(key, 9) > 0.45)
    for (const seg of curved) if (cell(seg.start + 75, 0, false)) break;
  // Keep clusters in a single blocked lane: escort pulses can clear a visible group.
  const devices = course.hazards.filter((h) => h.type === "device");
  for (const d of devices) {
    const row = course.recipe.rows.find((r) => r.s === d.s);
    if (
      !row ||
      voyageProtected(course, d.s - 8, d.s + 8) ||
      cells.some((c) => d.s > c.anchor - 100 && d.s < c.anchor + 150)
    )
      continue;
    for (const off of [-6, 6]) course.hazards.push({ ...d, s: d.s + off, cluster: d.s });
    row.clearS = d.s + 14;
  }
  const fragments = [];
  const put = (s, lane, routeId = null) => {
    if (
      s < 30 ||
      s > course.length - 40 ||
      course.gaps.some((g) => s > g.start - 6 && s < g.end + 10)
    )
      return;
    fragments.push({
      id: "fragment-" + index + "-" + fragments.length,
      s,
      lane,
      routeId,
      height: 1.05,
    });
  };
  for (const s of [62, 70, 78]) put(s, 0);
  for (let s = 190; s < course.length - 80; s += 110 + sample(key, Math.floor(s)) * 35)
    put(s, [-3.2, 0, 3.2][Math.floor(sample(key, Math.floor(s) + 1) * 3)]);
  for (const b of course.adventures?.branches || [])
    for (let s = b.start + 22; s < b.end - 22; s += 42) put(s, 0, b.id);
  let event = null;
  if (index % 2 === 0) {
    const sequence = ["meteor", "gravity", "convoy", "supply"],
      order = Math.floor(index / 2) - 1,
      block = Math.floor(order / 4);
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(sample(seed ^ Math.imul(block + 3, 71), i) * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }
    const type = index === 0 ? "supply" : sequence[order % 4];
    const wave = course.segments.find((s) => s.kind === "wave");
    const convoy = cells.find((c) => c.changing) || cells[0];
    let start =
      type === "convoy" && convoy
        ? convoy.anchor - 105
        : type === "gravity" && wave
          ? wave.start + 30
          : type === "meteor"
            ? (curved[0]?.start || 250) + 35
            : 100;
    const end =
      type === "convoy" && convoy
        ? Math.min(course.length - 38, convoy.anchor + 115)
        : type === "gravity" && wave
          ? wave.end - 18
          : Math.min(course.length - 60, start + 260);
    event = {
      id: "event-" + index,
      type,
      start,
      warning: Math.max(5, start - 90),
      end,
      duration: type === "gravity" ? 10 : 9,
      cellId: convoy?.id,
    };
    if (type === "supply") for (const d of [20, 38, 56, 90, 120, 150]) put(start + d, 0);
  }
  course.hazards.sort((a, b) => a.s - b.s);
  course.recipe.rows.sort((a, b) => a.s - b.s);
  course.voyage = { cells, fragments, event, seed, index };
  return course;
}
