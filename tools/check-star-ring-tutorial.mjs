import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse } from "../src/star-ring/course.js";
import { createRun, command } from "../src/star-ring/simulation.js";
import {
  beginTutorial,
  finishTutorial,
  rememberTutorial,
  shouldTeach,
  stepTutorial,
  tutorialCommand,
} from "../src/star-ring/tutorial.js";

const course = createCourse(),
  checks = [];
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
};
const tick = (run, frames) => {
  for (let i = 0; i < frames; i++) stepTutorial(run, course, 1 / 60);
};
let run = createRun(course);
command(run, course, "suctionRelease");
check("unpaired-release-does-not-launch", run.attached);
beginTutorial(run, course);
tick(run, 180);
check(
  "waits-safely-for-first-input",
  run.tutorial.step === 1 && run.s === 0 && run.time === 0 && run.score === 0,
);
tutorialCommand(run, course, "jumpPress");
check("unrelated-jump-cannot-skip-absorption", run.attached && run.tutorial.step === 1);
tutorialCommand(run, course, "suctionPress");
tick(run, 10);
tutorialCommand(run, course, "suctionRelease");
tick(run, 40);
check("short-tap-does-not-count-as-hold", run.tutorial.step === 1 && run.attached);
tutorialCommand(run, course, "suctionPress");
tick(run, 31);
check(
  "real-hold-unlocks-release-step",
  run.tutorial.step === 2 && run.input.suction && run.attached,
);
tick(run, 120);
check("no-timeout-auto-launch", run.tutorial.step === 2 && run.s === 0);
tutorialCommand(run, course, "suctionRelease");
tick(run, 1);
check(
  "release-uses-real-flight",
  run.tutorial.step === 3 && !run.attached && run.velocity[1] > 0 && run.pos[1] > 0,
);
tick(run, 260);
check(
  "passive-touchdown-does-not-pass-recapture",
  run.tutorial.active && run.tutorial.step === 1 && run.tutorial.retries === 1 && run.falls === 0,
);
tutorialCommand(run, course, "suctionPress");
tick(run, 31);
tutorialCommand(run, course, "suctionRelease");
tick(run, 15);
tutorialCommand(run, course, "suctionPress");
for (let i = 0; i < 360 && run.tutorial.active; i++) tick(run, 1);
check(
  "fresh-airborne-press-and-touchdown-complete",
  run.tutorial.completed && !run.tutorial.active && run.attached,
);
check(
  "practice-starts-clean-race-at-origin",
  run.s === 0 &&
    run.time === 0 &&
    run.score === 0 &&
    run.lands === 0 &&
    run.falls === 0 &&
    run.pressure === 100 &&
    run.speed === 25,
);
check(
  "practice-events-cannot-award-beat-points",
  run.events.length > 0 && run.events.every((e) => e.practice),
);
const profile = { completions: 3 };
check("old-save-gets-new-tutorial", shouldTeach(profile));
check(
  "completion-is-remembered-once",
  rememberTutorial(profile, run.tutorial) &&
    !rememberTutorial(profile, run.tutorial) &&
    profile.tutorialCompleted &&
    !shouldTeach(profile),
);
check(
  "manual-replay-overrides-completed-save",
  shouldTeach(profile, true) && !shouldTeach({}, false),
);
beginTutorial(run, course);
tutorialCommand(run, course, "suctionPress");
tick(run, 31);
tutorialCommand(run, course, "suctionRelease");
tick(run, 30);
finishTutorial(run, course, true);
const skippedProfile = {};
rememberTutorial(skippedProfile, run.tutorial);
check(
  "midair-skip-restores-full-controls-at-origin",
  !run.tutorial.active &&
    run.tutorial.skipped &&
    run.attached &&
    run.s === 0 &&
    run.score === 0 &&
    !run.input.suction &&
    !shouldTeach(skippedProfile) &&
    !skippedProfile.tutorialCompleted,
);
command(run, course, "jumpPress");
check("ordinary-jump-restored-after-skip", !run.attached && run.input.jump);
await fs.writeFile(
  new URL("../evidence/star-ring-tutorial-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, failed: 0, checks }, null, 2));
