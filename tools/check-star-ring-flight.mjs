import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse, add, mul, sub, dot } from "../src/star-ring/course.js";
import {
  createRun,
  command,
  stepRun,
  restartCheckpoint,
  rescue,
} from "../src/star-ring/simulation.js";
import { beginDeath, deathFrame } from "../src/star-ring/failure.js";
import { requiresSuction, spinEase } from "../src/star-ring/grip.js";
import { carProbePoints } from "../src/star-ring/track-surface.js";
const c = createCourse(),
  checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
}
const curve = c.segments.find((s) => s.kind === "turn");
function onCurve() {
  const r = createRun(c);
  r.s = curve.start + 4;
  r.pos = c.pose(r.s).p;
  r.speed = 28;
  r.velocity = mul(c.pose(r.s).t, 28);
  return r;
}
const straight = createRun(c);
for (let i = 0; i < 300; i++) stepRun(straight, c, 1 / 60);
check("normal-straight-driving-does-not-demand-E", straight.attached && straight.gripStress === 0);
let r = onCurve();
for (let i = 0; i < 36; i++) stepRun(r, c, 1 / 60);
check(
  "curve-gives-warning-before-detaching",
  r.attached && r.gripWarningLevel > 0.3 && r.gripWarningLevel < 1,
  { level: r.gripWarningLevel },
);
command(r, c, "suctionPress");
for (let i = 0; i < 30; i++) stepRun(r, c, 1 / 60);
check(
  "E-during-warning-restores-grip-without-a-fall",
  r.attached && r.gripStress === 0 && r.falls === 0,
);
command(r, c, "suctionRelease");
check(
  "releasing-E-on-a-curve-starts-warning-rather-than-instant-jump",
  r.attached && !r.input.suction,
);
r = onCurve();
let warned = false,
  lost = false,
  deathStarted = false;
for (let i = 0; i < 360 && r.phase !== "dead"; i++) {
  stepRun(r, c, 1 / 60);
  warned ||= r.events.some((e) => e.type === "gripWarning");
  lost ||= r.events.some((e) => e.type === "gripLost");
  deathStarted ||= r.phase === "dying";
}
check(
  "ignored-warning-detaches-and-enters-space-death",
  warned && lost && deathStarted && r.phase === "dead",
  { falls: r.falls, phase: r.phase, reason: r.death?.reason },
);
check(
  "death-flight-moves-away-from-track-and-desaturates",
  Math.hypot(...sub(r.pos, r.death.origin)) > 35 && deathFrame(r).gray === 1,
  { distance: Math.hypot(...sub(r.pos, r.death.origin)), gray: deathFrame(r).gray },
);
const score = r.score,
  distance = r.bestDistance,
  time = r.time;
for (let i = 0; i < 120; i++) stepRun(r, c, 1 / 60);
check(
  "gray-death-screen-does-not-keep-scoring-or-moving-the-clock",
  r.score === score && r.bestDistance === distance && r.time === time,
);
restartCheckpoint(r, c);
check(
  "checkpoint-retry-clears-death-and-grip-state",
  r.phase === "running" && r.death === null && r.gripStress === 0 && r.attached && r.pitch === 0,
);
r.pressure = 0;
restartCheckpoint(r, c);
check("checkpoint-retry-refills-air-to-avoid-repeat-death", r.pressure >= 78 && r.near === null);
r = onCurve();
r.pressure = 0;
r.input.suction = true;
for (let i = 0; i < 240 && r.phase === "running"; i++) stepRun(r, c, 1 / 60);
check("empty-air-death-has-accurate-reason", r.death?.reason === "气量耗尽，无法维持吸附");
r = onCurve();
for (let i = 0; i < 86 && r.attached; i++) stepRun(r, c, 1 / 60);
check(
  "drift-is-recoverable-before-death",
  !r.attached &&
    r.detachCause === "grip" &&
    r.phase === "running" &&
    !r.events.some((e) => e.type === "jump"),
);
command(r, c, "suctionPress");
for (let i = 0; i < 60 && r.phase === "running" && !r.attached; i++) stepRun(r, c, 1 / 60);
check(
  "prompt-E-can-recapture-an-early-drift",
  r.attached && r.phase === "running" && r.falls === 0,
  { phase: r.phase, airTime: r.airTime, height: r.near?.height },
);
r = createRun(c);
r.s = 100;
r.pos = [0, 4, -100];
r.attached = false;
r.airTime = 0.6;
r.velocity = [0, 0, -28];
r.input.suction = true;
command(r, c, "jumpPress");
check("second-Space-at-safe-height-starts-frontflip", r.flipProgress > 0 && r.pressure === 90);
let maximumPitch = 0;
for (let i = 0; i < 50 && r.phase === "running"; i++) {
  stepRun(r, c, 1 / 60);
  maximumPitch = Math.max(maximumPitch, Math.abs(r.pitch));
}
check(
  "frontflip-finishes-with-an-upright-car",
  maximumPitch > 6 && r.pitch === 0 && r.tricks >= 1,
  { maximumPitch, phase: r.phase, tricks: r.tricks },
);
r = createRun(c);
r.s = 100;
r.pos = [0, 0.6, -100];
r.attached = false;
r.airTime = 0.2;
r.velocity = [0, 2, -28];
command(r, c, "jumpPress");
check("low-height-frontflip-is-rejected-with-feedback", r.flipProgress === 0 && r.spinBlocked > 0);
check(
  "spin-envelope-has-soft-start-and-finish",
  spinEase(0.01) < 0.00002 && 1 - spinEase(0.99) < 0.00002,
);
r = createRun(c);
r.s = 100;
r.pos = [0, 4, -100];
r.pitch = Math.PI / 2;
const probes = carProbePoints(c, r);
const ys = probes.filter((p) => !p.foot).map((p) => p.p[1]);
check("collision-probes-rotate-with-frontflip-pitch", Math.max(...ys) - Math.min(...ys) > 4.6);
r = onCurve();
r.input.suction = true;
for (let i = 0; i < 150; i++) stepRun(r, c, 1 / 60);
check(
  "held-E-keeps-normal-cornering-secure",
  r.attached && r.phase === "running" && r.gripStress === 0,
);
await fs.writeFile(
  new URL("../evidence/star-ring-flight-physics-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length }));
