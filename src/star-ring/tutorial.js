import { createRun, command, stepRun } from "./simulation.js";

export const TUTORIAL_VERSION = 1;

export function shouldTeach(profile, override) {
  return override === undefined ? profile.tutorialVersion !== TUTORIAL_VERSION : !!override;
}

export function beginTutorial(run, course, retries = 0) {
  const assist = run.assist;
  Object.assign(run, createRun(course));
  run.assist = assist;
  run.speed = 0;
  run.velocity = [0, 0, 0];
  run.message = "";
  run.messageTime = 0;
  run.tutorial = {
    active: true,
    step: 1,
    held: 0,
    regrip: false,
    retries,
    completed: false,
    skipped: false,
    recorded: false,
  };
}

export function finishTutorial(run, course, skipped = false) {
  const tutorial = run.tutorial;
  if (!tutorial?.active) return;
  const assist = run.assist,
    suction = !skipped && run.input.suction;
  const events = skipped ? [] : run.events.map((event) => ({ ...event, practice: true }));
  Object.assign(run, createRun(course));
  run.assist = assist;
  run.input.suction = suction;
  run.tutorial = tutorial;
  tutorial.active = false;
  tutorial.completed = !skipped;
  tutorial.skipped = skipped;
  run.events = events;
  if (!skipped) run.events.push({ type: "tutorialComplete", practice: true });
  run.message = "";
  run.messageTime = 0;
  run.feedback = skipped ? "开始穿梭" : "教学完成 · 开始穿梭";
  run.feedbackTime = 2;
}

export function rememberTutorial(profile, tutorial) {
  if (!tutorial || tutorial.active || tutorial.recorded) return false;
  profile.tutorialVersion = TUTORIAL_VERSION;
  if (tutorial.completed) profile.tutorialCompleted = true;
  tutorial.recorded = true;
  return true;
}

// Return true when the practice consumes an input. All ordinary driving controls
// become available immediately on completion or skip.
export function tutorialCommand(run, course, event) {
  const t = run.tutorial;
  if (!t?.active) return false;
  if (event === "suctionPress") {
    command(run, course, event);
    if (t.step === 3 && !run.attached) t.regrip = true;
  } else if (event === "suctionRelease") {
    if (t.step === 2 && run.input.suction && run.attached) {
      command(run, course, event);
      t.step = 3;
      t.regrip = false;
    } else {
      run.input.suction = false;
      if (t.step === 1) t.held = 0;
    }
  }
  return true;
}

export function stepTutorial(run, course, dt) {
  const t = run.tutorial;
  if (!t?.active) return;
  if (t.step < 3) {
    run.events = run.pendingEvents.splice(0);
    if (t.step === 1) {
      t.held = run.input.suction ? Math.min(0.5, t.held + dt) : 0;
      if (t.held >= 0.5) t.step = 2;
    }
  } else {
    // A stationary hop on the real track with the real release/recapture rules.
    // Slower physics gives beginners time to read the next instruction.
    run.speed = 0;
    stepRun(run, course, dt * 0.25);
    run.speed = 0;
    run.events = run.events.map((event) => ({ ...event, practice: true }));
    if (run.attached && run.lands > 0) {
      if (t.regrip && run.input.suction) finishTutorial(run, course);
      else beginTutorial(run, course, t.retries + 1);
    } else if (run.phase === "rescue") beginTutorial(run, course, t.retries + 1);
  }
}

export function tutorialCopy(t, touch = false) {
  const key = touch ? "「吸附」" : "E";
  if (t.step === 1)
    return {
      title: "1/3 · 吸附",
      copy: `${t.retries ? "再试一次：" : ""}按住 ${key} 半秒；弯轨行驶时持续吸附`,
      progress: t.held / 1.5,
    };
  if (t.step === 2)
    return { title: "2/3 · 弹射", copy: `松开 ${key}，让汽车轻轻离轨`, progress: 1 / 3 };
  return { title: "3/3 · 重新接轨", copy: `空中重新按住 ${key}，保持到接轨`, progress: 2 / 3 };
}
