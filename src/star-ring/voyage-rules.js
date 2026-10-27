import { rainbowMultiplier } from "./rainbow-rules.js";
import { clamp } from "./course.js";
import { voyageProtected } from "./voyage-plan.js";
export const EVENT_LABELS = {
  supply: "补给舰",
  meteor: "流星群",
  gravity: "引力扰动",
  convoy: "失联车队",
};
export function stepVoyage(run, course, dt) {
  const plan = course.voyage?.event;
  if (run.tutorial?.active) return;
  if (!plan) {
    if (run.voyageState?.key !== (course.id ?? "baseline")) run.voyageState = null;
    return;
  }
  const key = course.id ?? "baseline";
  if (!run.voyageState || run.voyageState.key !== key)
    run.voyageState = { key, phase: "quiet", age: 0, type: plan.type, claims: false };
  const e = run.voyageState;
  if (e.phase === "quiet" && run.s >= plan.warning) {
    e.phase = "warning";
    run.events.push({ type: "voyageWarning", kind: plan.type });
  }
  if (e.phase === "warning" && run.s >= plan.start) {
    e.phase = "active";
    e.age = 0;
    e.initialCollisions = run.collisions;
    e.initialFalls = run.falls;
    run.events.push({ type: "voyageStart", kind: plan.type });
  }
  if (e.phase === "active") {
    e.age += dt;
    if (e.age >= plan.duration || run.s >= plan.end) {
      e.phase = "done";
      if (!e.claims && run.collisions === e.initialCollisions && run.falls === e.initialFalls) {
        e.claims = true;
        run.score += 80 * rainbowMultiplier(run);
        run.pressure = clamp(run.pressure + 8, 0, 100);
        run.events.push({ type: "voyageComplete", kind: plan.type });
        run.voyageNotice = {
          text: EVENT_LABELS[plan.type] + "通过 +" + 80 * rainbowMultiplier(run) + " 分",
          until: run.time + 1.8,
        };
      }
    }
  }
}
export function flightGravity(run, course, cause) {
  if (cause === "branch" || cause === "branchReturn" || cause === "pad" || run.routeId) return 1;
  const e = run.voyageState;
  if (e?.phase !== "active" || e.type !== "gravity") return 1;
  if (voyageProtected(course, run.s - 12, run.s + Math.max(125, run.speed * 3.7))) return 1;
  return 0.85;
}
export function voyageStatus(run) {
  const e = run?.voyageState,
    notice = run?.voyageNotice;
  const label =
    e && e.phase !== "quiet" && e.phase !== "done"
      ? (e.phase === "warning" ? "即将经过 · " : "") + EVENT_LABELS[e.type]
      : "";
  return {
    type: e?.type || null,
    phase: e?.phase || "quiet",
    age: e?.age || 0,
    label,
    notice: notice?.until > (run?.time || 0) ? notice.text : "",
  };
}
