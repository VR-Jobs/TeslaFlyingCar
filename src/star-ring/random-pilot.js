import { command, stepRun } from "./simulation.js";
export function randomPilotStep(run, course, state, dt = 1 / 60) {
  if (state.lap !== run.laps) {
    state.lap = run.laps;
    state.gap = null;
  }
  const gap = course.gaps.find((g) => g.start - run.s > -3 && g.start - run.s < 95);
  if (run.attached) {
    run.input.suction = true;
    run.input.jump = false;
    run.input.boost = !!gap && !gap.auto;
    const row = course.recipe?.rows.find((r) => (r.clearS ?? r.s + 8) > run.s && r.s - run.s < 140);
    const target = gap ? 0 : (row?.open ?? 0);
    while (run.targetLane < target - 0.1) command(run, course, "right");
    while (run.targetLane > target + 0.1) command(run, course, "left");
    if (gap && !gap.auto && gap.start - run.s < 11 && state.gap !== gap.start) {
      command(run, course, "jumpPress");
      command(run, course, "suctionRelease");
      state.gap = gap.start;
    }
  } else {
    run.input.jump = run.airTime < 0.24;
    run.input.suction = run.airTime > 0.45;
    run.input.boost = false;
  }
  stepRun(run, course, dt);
  if (run.phase === "rescue") state.gap = null;
}
