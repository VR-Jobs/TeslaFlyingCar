import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse } from "../src/star-ring/course.js";
import { createRun, command, stepRun } from "../src/star-ring/simulation.js";
import {
  describeGap,
  launchWindow,
  createGapGuide,
  playGapTone,
} from "../src/star-ring/gap-guide.js";

const course = createCourse(),
  gap = course.gaps[1],
  checks = [];
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
};
function approach(speed = 28, lead = 60, suction = true, pressure = 100, g = gap) {
  const run = createRun(course);
  run.s = g.start - lead;
  run.speed = speed;
  run.pos = course.pose(run.s).p;
  run.pressure = pressure;
  run.input.suction = suction;
  return run;
}
let run = approach();
check(
  "advance-warning-is-about-time-not-fixed-distance",
  describeGap(run, course)?.state === "warning" &&
    !describeGap(approach(17, 60), course) &&
    !!describeGap(approach(42, 95), course),
);
check(
  "tutorial-and-nonrunning-suppress-guide",
  !describeGap({ ...run, tutorial: { active: true } }, course) &&
    !describeGap({ ...run, phase: "rescue" }, course),
);
check(
  "low-speed-and-low-air-never-show-ready",
  !describeGap(approach(17, 5), course).eligible &&
    !describeGap(approach(28, 7, true, 8), course).ready,
);
let flights = 0;
const boostedLowAir = approach(42, 18, true, 25);
boostedLowAir.input.boost = true;
check(
  "boost-flight-reserves-extra-energy",
  describeGap(boostedLowAir, course).reason === "air" && !describeGap(boostedLowAir, course).ready,
);
for (const g of course.gaps.filter((g) => !g.auto))
  for (const speed of [27, 28, 32, 42])
    for (const suction of [false, true]) {
      const probe = approach(speed, 30, suction, 100, g),
        window = launchWindow(probe, course, g);
      if (!window.eligible) continue;
      for (const lead of [window.low, (window.low + window.high) / 2, window.high]) {
        const r = approach(speed, lead, suction, 100, g);
        r.input.boost = speed > 35;
        command(r, course, suction ? "suctionRelease" : "jumpPress");
        for (let i = 0; i < 240 && r.phase === "running" && !r.lands; i++) {
          r.input.jump = r.airTime < 0.35;
          r.input.suction = r.s >= g.end - 3;
          stepRun(r, course, 1 / 60);
        }
        assert(
          r.lands > 0 && r.s >= g.end,
          JSON.stringify({ speed, suction, lead, gap: g.start, s: r.s, phase: r.phase }),
        );
        flights++;
      }
    }
check("recommended-window-clears-real-gap-physics", flights >= 40, {
  validatedLaunches: flights,
  recipe: "Short jet .35 s, regrip at far lip minus 3 m; no boost/steering changes after release.",
});
const guide = createGapGuide();
run = approach(28, 70);
let events = [];
for (const lead of [70, 60, 40, 30, 20]) {
  run.s = gap.start - lead;
  events.push(...guide.update(run, course, 1 / 60).events);
}
const window = launchWindow(run, course, gap);
run.s = gap.start - (window.low + window.high) / 2;
for (let i = 0; i < 90; i++) events.push(...guide.update(run, course, 1 / 60).events);
check(
  "warning-escalates-and-double-cue-plays-once",
  events.filter((e) => e.type === "gapWarning").length === 3 &&
    events.filter((e) => e.type === "gapLaunch").length === 1 &&
    events.filter((e) => e.type === "gapLaunchTail").length === 1,
  events,
);
guide.reset();
guide.update(run, course, 1 / 60);
const interrupted = guide.update({ ...run, phase: "rescue" }, course, 1);
check(
  "recovery-discards-outdated-window-tone",
  interrupted.events.length === 0 && !guide.status().pendingTail,
);
guide.reset();
guide.update(run, course, 1 / 60);
guide.suspend();
check(
  "pause-cancels-pending-second-note",
  !guide.update(run, course, 1 / 60).events.length && !guide.status().pendingTail,
);
run.s = gap.start - 65;
guide.update(run, course, 1 / 60);
run.s = gap.start - 7;
check(
  "checkpoint-return-rearms-window-cue",
  guide.update(run, course, 1 / 60).events.some((e) => e.type === "gapLaunch"),
);
const tones = [];
for (const event of events) playGapTone({ tone: (t) => tones.push(t) }, event);
check(
  "quiet-distinct-audio-without-scheduled-timers",
  tones.length === 5 &&
    tones.every((t) => t.gain <= 0.12 && t.dur <= 0.09 && !t.delay) &&
    tones.at(-1).freq > tones.at(-2).freq,
  tones,
);
const automatic = describeGap(approach(28, 5, false, 100, course.gaps[0]), course);
check(
  "automatic-pad-is-labelled-separately",
  automatic.ready && automatic.action === "auto" && automatic.label === "自动弹射",
);
const before = JSON.stringify({ score: run.score, pressure: run.pressure, s: run.s });
describeGap(run, course);
guide.update(run, course, 1 / 60);
check(
  "guidance-does-not-change-score-energy-or-position",
  before === JSON.stringify({ score: run.score, pressure: run.pressure, s: run.s }),
);
await fs.writeFile(
  new URL("../evidence/star-ring-gap-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
