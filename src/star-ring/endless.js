import { rainbowMultiplier } from "./rainbow-rules.js";
import { add, sub, nearestSurface } from "./course.js";

export const ENDLESS = { cruise: 28, maximumCruise: 36, boost: 42, maximumBoost: 48 };
export function challengeSpeed(run) {
  const level = run.endless ? Math.min(8, run.laps || 0) : 0;
  return { cruise: ENDLESS.cruise + level, boost: ENDLESS.boost + Math.min(6, level) };
}
export function advanceEndless(run, course) {
  if (!run.endless) return;
  while (run.s >= course.length && run.phase === "running") {
    const offset = course.displacement;
    run.s -= course.length;
    run.completedDistance += course.length;
    run.worldOrigin = add(run.worldOrigin, offset);
    run.pos = sub(run.pos, offset);
    run.laps++;
    run.checkpoint = 0;
    run.checkpointIndex = 0;
    run.taken.clear();
    run.hit.clear();
    run.autoPads.clear();
    course.setCycle(run.laps);
    run.near = nearestSurface(course, run.pos, run.s);
    run.pressure = Math.max(run.pressure, 85);
    run.score += (350 + Math.min(run.combo, 20) * 10) * rainbowMultiplier(run);
    run.feedback = "第 " + (run.laps + 1) + " 区段 · 补给就绪";
    run.feedbackTime = 2;
    run.events.push({ type: "sector", lap: run.laps });
  }
  run.distance = run.completedDistance + run.s;
  run.bestDistance = Math.max(run.bestDistance, run.distance);
}
export function challengeSummary(run, course) {
  return {
    mode: run.endless ? "endless" : "course",
    distance: run.endless ? Math.max(run.bestDistance, run.completedDistance + run.s) : run.s,
    laps: run.laps || 0,
    level: run.endless ? Math.min(9, (run.laps || 0) + 1) : 1,
    localDistance: run.s,
    localLimit: course.length,
  };
}
export function settleChallenge(profile, run, course) {
  profile.endlessRuns = (profile.endlessRuns || 0) + 1;
  profile.bestEndlessScore = Math.max(profile.bestEndlessScore || 0, Math.floor(run.score));
  profile.bestEndlessDistance = Math.max(profile.bestEndlessDistance || 0, run.bestDistance);
  profile.longestEndlessTime = Math.max(profile.longestEndlessTime || 0, run.time);
  return Math.min(500, Math.floor(run.bestDistance / 150) + Math.floor(run.rings / 3));
}
