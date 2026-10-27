import { clamp } from "./course.js";
export const EXPERIENCE_VERSION = "experience-2-clearance";
export function installDirector(course, seed, index) {
  const phases = [],
    recoveries = [],
    notes = [];
  const addAir = (s) => {
    if (course.pickups.some((p) => p.lane === 0 && Math.abs(p.s - s) < 9)) return;
    course.pickups.push({ s, lane: 0, type: "air", required: true, director: true });
  };
  for (const seg of course.segments) {
    if (seg.kind !== "straight") {
      const split = Math.min(seg.end, seg.start + 55);
      phases.push(
        { start: seg.start, end: split, kind: "learn", title: "观察与准备" },
        { start: split, end: seg.end, kind: "challenge", title: "连续挑战" },
      );
      continue;
    }
    if (seg.title !== "弹射与补给") continue;
    const end = seg.start + 58 + (((seed + index * 13 + Math.floor(seg.start)) >>> 0) % 13),
      zone = { start: seg.start + 3, end, kind: "recover", title: "补气缓冲" };
    recoveries.push(zone);
    phases.push(zone);
    // No obstacle can drift from just outside the recovery corridor into it.
    course.hazards = course.hazards.filter((h) => h.s < zone.start - 70 || h.s > zone.end + 10);
    course.recipe.rows = course.recipe.rows.filter(
      (r) => r.s < zone.start - 70 || r.s > zone.end + 10,
    );
    addAir(seg.start + 22);
    addAir(seg.start + 50);
    if (!course.gaps.some((g) => g.start > seg.start && g.start < seg.end) && !notes.length) {
      const period = 60 / 128,
        spacing = 28 * period;
      for (let i = 0; i < 6; i++) {
        const s = seg.start + 132 + i * spacing;
        course.hazards = course.hazards.filter(
          (h) => Math.abs(h.s - s) > 12 || Math.abs(h.lane) > 2.2,
        );
        const nearby = course.pickups.filter((p) => p.lane === 0 && Math.abs(p.s - s) < 8);
        if (nearby.some((p) => p.required)) continue;
        course.pickups = course.pickups.filter((p) => !nearby.includes(p));
        course.pickups.push({ s, lane: 0, type: "ring", rhythm: true });
        notes.push({ s, beat: i, period });
      }
    }
  }
  for (const b of course.adventures?.branches || []) {
    b.choice = { title: "特技高收益", reward: 440, safeTitle: "主路稳定补气" };
    addAir(b.launchStart - 35);
    addAir(b.start + 45);
  }
  // Retain obstacle variety after clearing recovery areas, using an already blocked lane.
  if (!course.hazards.some((h) => h.type === "device")) {
    const staticCar = course.hazards.find((h) => h.type === "car" && !h.motion);
    if (staticCar) staticCar.type = "device";
  }
  course.pickups.sort((a, b) => a.s - b.s);
  course.director = {
    version: EXPERIENCE_VERSION,
    phases: phases.sort((a, b) => a.start - b.start),
    recoveries,
    notes,
  };
  return course;
}
export function stepDirector(run, course, wasS) {
  if (!course.director || run.tutorial?.active || run.phase !== "running") return;
  const key = course.id ?? "baseline";
  if (run.director?.key !== key) run.director = { key, zone: -1, added: 0, phase: "flow" };
  const d = run.director,
    z = course.director.recoveries.findIndex((z) => run.s >= z.start && run.s <= z.end);
  d.phase = course.director.phases.find((p) => run.s >= p.start && run.s < p.end)?.kind || "flow";
  if (z !== d.zone) {
    d.zone = z;
    d.added = 0;
  }
  if (z >= 0 && run.attached && run.pressure < 70) {
    const add = Math.min(10 - d.added, Math.max(0, run.s - wasS) * 0.16);
    run.pressure = clamp(run.pressure + add, 0, 100);
    d.added += add;
  }
}
export function drivingCue(run, course) {
  if (run.phase !== "running") return "";
  if (run.gripWarningLevel > 0.05)
    return run.gripWarningReason === "air" ? "气量不足 · 寻找补气" : "吸附不足 · 按住 E";
  if (run.detachCause === "grip" && !run.attached) return "按住 E 重新接轨";
  if (run.gapCue?.state && run.gapCue.state !== "off") return run.gapCue.label || "准备弹射";
  if (run.spinBlocked > 0) return "先升高再翻转";
  if (run.adventure?.attempt) return run.adventure.cue;
  const branch = course.adventures?.branches.find(
    (b) => b.launchS - run.s > -8 && b.launchS - run.s < 65,
  );
  if (branch) return (branch.side < 0 ? "左" : "右") + "侧金色：特技高收益 · 蓝色主路：补气";
  if (run.director?.phase === "recover" && run.pressure < 65) return "补气缓冲 · 准备下一段";
  return "";
}
