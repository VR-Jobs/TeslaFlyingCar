import { lessonIndex, evaluateItemLesson } from "./lessons.js";
export const RULE_VERSION = "driving-v2";
export const MODES = ["classic", "free", "academy", "precision", "stunt", "escape", "daily"];
export const DEFAULT_FEATURES = { coaching: true, feedback: true, fairTraffic: true };
export const UTC_DAY = (date = new Date()) => date.toISOString().slice(0, 10);
export function hashSeed(text) {
  let h = 2166136261;
  for (const c of String(text)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export const dailySeed = (day) => hashSeed(`${RULE_VERSION}:daily:${day}`);
export function normalizeOptions(input = {}) {
  const mode = MODES.includes(input.mode) ? input.mode : "classic";
  const features = { ...DEFAULT_FEATURES, ...input.features };
  for (const key of Object.keys(DEFAULT_FEATURES)) features[key] = features[key] !== false;
  if (mode === "classic") for (const key of Object.keys(features)) features[key] = false;
  if (["academy", "precision", "stunt", "escape", "daily"].includes(mode)) {
    features.feedback = true;
    features.fairTraffic = true;
  }
  return {
    mode,
    features,
    lesson: lessonIndex(input.lesson),
    ruleset:
      mode === "classic"
        ? "original-v1"
        : `${RULE_VERSION}-f${+features.feedback}-t${+features.fairTraffic}`,
  };
}
export function createMetrics() {
  return {
    jumps: 0,
    laneChanges: 0,
    tricks: 0,
    barrels: 0,
    flips: 0,
    landings: 0,
    perfectLandings: 0,
    airTime: 0,
    hoverTime: 0,
    airSpent: 0,
    maxHeight: 0,
    collisions: 0,
    cleared: 0,
    bestAction: "none",
    bestActionPoints: 0,
    comboBreak: "none",
    distance: 0,
    duration: 0,
    maxCombo: 0,
  };
}
export function evaluateMode(mode, m, lesson = 0) {
  if (mode === "academy") {
    if (lesson >= 3) return evaluateItemLesson(lesson, m);
    const goals = [
      m.laneChanges >= 2 && m.jumps >= 1 && m.landings >= 1,
      m.hoverTime >= 1.2 && m.maxHeight >= 3 && m.landings >= 1,
      m.barrels >= 1 && m.perfectLandings >= 1,
    ];
    return {
      success: goals[lesson] && m.distance >= [150, 200, 220][lesson],
      finished: (goals[lesson] && m.distance >= [150, 200, 220][lesson]) || m.distance >= 600,
      target: [150, 200, 220][lesson],
      progress:
        lesson === 0
          ? Math.min(1, m.laneChanges / 2) * 0.3 +
            Math.min(1, m.jumps) * 0.3 +
            Math.min(1, m.landings) * 0.2 +
            Math.min(1, m.distance / 150) * 0.2
          : lesson === 1
            ? Math.min(1, m.hoverTime / 1.2) * 0.5 +
              Math.min(1, m.maxHeight / 3) * 0.2 +
              Math.min(1, m.landings) * 0.2 +
              Math.min(1, m.distance / 200) * 0.1
            : Math.min(1, m.barrels) * 0.4 +
              Math.min(1, m.perfectLandings) * 0.4 +
              Math.min(1, m.distance / 220) * 0.2,
    };
  }
  if (mode === "precision")
    return {
      success: m.distance >= 800 && m.collisions === 0,
      finished: m.distance >= 800,
      target: 800,
      progress: Math.min(1, m.distance / 800),
    };
  if (mode === "stunt")
    return {
      success: m.tricks >= 6 && m.perfectLandings >= 3,
      finished: (m.tricks >= 6 && m.perfectLandings >= 3) || m.duration >= 60,
      target: 6,
      progress: Math.min(1, m.tricks / 6) * 0.6 + Math.min(1, m.perfectLandings / 3) * 0.4,
    };
  if (mode === "escape")
    return {
      success: m.duration >= 45 && m.collisions === 0,
      finished: m.duration >= 45,
      target: 45,
      progress: Math.min(1, m.duration / 45),
    };
  if (mode === "daily")
    return {
      success: m.distance >= 1200,
      finished: m.distance >= 1200,
      target: 1200,
      progress: Math.min(1, m.distance / 1200),
    };
  return { success: false, finished: false, target: 0, progress: 0 };
}
export function courseRows(seed, count = 18, practice = false) {
  let lane = 1;
  return Array.from({ length: count }, (_, i) => {
    const h = hashSeed(`${seed}:${i}`),
      change = (h % 3) - 1;
    lane = Math.min(2, Math.max(0, lane + change));
    const distance = (practice ? 350 : 180) + i * (practice ? 180 : 78);
    const blocked = [0, 1, 2].filter((x) => x !== lane);
    return {
      index: i,
      distance,
      safeLane: lane,
      blocked: practice ? blocked.slice(0, 1) : blocked.slice(0, i % 3 === 0 ? 2 : 1),
      supply: i % 3 === 1,
    };
  });
}
export function trafficSpacing(distance, airRatio, mode = "free") {
  const recovery = distance % 420 >= 330;
  const base = mode === "precision" ? 1.6 : mode === "escape" ? 0.8 : 1;
  return base * (recovery ? 2 : 1) * (airRatio < 0.22 ? 1.6 : 1);
}
export function safeSpawnZ(z, speed, ownSpeed = 0) {
  return Math.min(z, -Math.max(55, Math.max(0, speed - ownSpeed) * 1.8));
}
const angleDifference = (a) => Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
export function landingGrade({
  roll = 0,
  flip = 0,
  velocity = 0,
  completed = 0,
  pending = 0,
  credited = false,
}) {
  const angle = Math.max(angleDifference(roll), angleDifference(flip));
  const full = completed > 0 || credited || pending >= Math.PI * 2 * 0.92;
  return { perfect: full && angle < 0.32 && Math.abs(velocity) < 20, complete: full, angle };
}
export function classifyRun(run) {
  if (!run.mode) return "legacy";
  if (run.mode === "academy") return "practice";
  return run.startItems?.length || run.revives > 0 ? "assisted" : "pure";
}
export function selectBoard(
  runs,
  { mode = "free", category = "pure", day = UTC_DAY(), ruleset = null } = {},
) {
  return runs
    .filter(
      (r) =>
        (r.mode || "legacy") === mode &&
        classifyRun(r) === category &&
        (!ruleset || r.ruleset === ruleset) &&
        (mode !== "daily" || (r.courseDay === day && r.challengeSuccess)) &&
        (!["precision", "stunt", "escape"].includes(mode) || r.challengeSuccess),
    )
    .sort((a, b) => b.score - a.score || a.duration - b.duration)
    .slice(0, 20);
}
