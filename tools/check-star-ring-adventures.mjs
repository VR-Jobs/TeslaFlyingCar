import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRandomCourse, createSection } from "../src/star-ring/random-course.js";
import { createRun, stepRun, command, restartCheckpoint } from "../src/star-ring/simulation.js";
import { routeCourse } from "../src/star-ring/adventure-course.js";
import { add, mul, dot, sub } from "../src/star-ring/course.js";
import { getTrackSurface } from "../src/star-ring/track-surface.js";
import { createRouteWindow } from "../src/star-ring/route-window.js";
const checks = [];
const record = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name + " " + JSON.stringify(detail));
};
for (let seed = 1; seed <= 128; seed++) {
  const c = createSection(seed, 0),
    b = c.adventures.branches[0];
  assert(b && c.adventures.chains.length === 2);
  assert(b.metric(b.start) < 0.98 && b.metric(b.start) > 0.65);
  assert(b.width >= 4.5 && b.end > b.start + 140 && b.start > b.launchEnd);
  for (const chain of c.adventures.chains) {
    assert(chain.gates.map((g) => g.action).join(",") === "jump,spin,suction");
    if (!chain.routeId)
      assert(!c.hazards.some((h) => h.s > chain.launchS - 25 && h.s < chain.gates.at(-1).s + 32));
  }
}
record("128-random-layouts-have-real-shortcuts-two-stunt-chains-and-clear-main-launch-zones", true);
function chainTrial(c, chain, spin = "left", doSpin = true) {
  const r = createRun(c);
  r.routeId = chain.routeId;
  r.s = chain.launchS;
  const path = routeCourse(c, r);
  r.pos = path.pose(r.s).p;
  r.velocity = mul(path.frame(r.s).t, 25);
  command(r, c, "jumpPress");
  let held = true;
  for (let i = 0; i < 145 && r.phase === "running"; i++) {
    if (i === 12) {
      command(r, c, "jumpRelease");
      held = false;
    }
    if (i === 23 && doSpin) command(r, c, spin);
    if (i === 25 && spin === "jumpPress") command(r, c, "jumpRelease");
    if (i === 48) command(r, c, "suctionPress");
    stepRun(r, c, 1 / 60);
  }
  return r;
}
let c = createRandomCourse(11),
  chain = c.adventures.chains.find((x) => !x.routeId),
  r = chainTrial(c, chain);
record(
  "real-jump-barrel-and-suction-complete-main-three-gate-chain",
  r.adventure.chains === 1 && r.adventure.gates.size === 3 && r.falls === 0 && r.attached,
  { s: r.s, score: r.score, pressure: r.pressure },
);
record("stunt-input-does-not-steer-player-out-of-the-chain", Math.abs(r.targetLane) < 0.01);
r = chainTrial(c, chain, "jumpPress");
record("frontflip-is-also-accepted-by-the-second-gate", r.adventure.chains === 1 && r.tricks >= 1, {
  tricks: r.tricks,
  phase: r.phase,
});
r = chainTrial(c, chain, "left", false);
record(
  "missing-the-stunt-does-not-kill-or-block-main-route",
  r.adventure.chains === 0 && r.phase === "running" && r.attached && r.falls === 0,
);
const onBranch = c.adventures.chains.find((x) => x.routeId);
r = chainTrial(c, onBranch);
record(
  "optional-shortcut-has-a-working-independent-chain",
  r.adventure.chains === 1 && r.routeId === onBranch.routeId && r.falls === 0,
  { phase: r.phase, s: r.s },
);
const branchReports = [];
for (const seed of [1, 2, 3, 9, 11, 27, 42, 73, 101, 2026]) {
  const route = createRandomCourse(seed),
    b = route.adventures.branches[0],
    run = createRun(route);
  run.s = b.launchS;
  run.lane = run.targetLane = b.side * 3.2;
  run.pos = route.pose(run.s, run.lane).p;
  run.input.suction = true;
  command(run, route, "jumpPress");
  assert(run.routeId === b.id);
  let firstCapture = null,
    returnAt = null;
  for (let i = 0; i < 1400 && run.phase === "running"; i++) {
    if (i === 18) command(run, route, "jumpRelease");
    stepRun(run, route, 1 / 60);
    if (run.routeId && run.attached && !firstCapture) firstCapture = run.s;
    if (!run.routeId && run.attached) {
      returnAt = run.s;
      break;
    }
  }
  const pass =
    run.phase === "running" &&
    run.adventure.branches === 1 &&
    run.falls === 0 &&
    run.trackImpacts === 0 &&
    firstCapture &&
    returnAt;
  branchReports.push({
    seed,
    pass: !!pass,
    firstCapture,
    returnAt,
    falls: run.falls,
    impacts: run.trackImpacts,
    phase: run.phase,
    reason: run.death?.reason,
  });
  assert(pass, JSON.stringify(branchReports.at(-1)));
}
record(
  "ten-seeds-support-launch-manual-E-capture-and-return-without-clipping",
  true,
  branchReports,
);
const b = c.adventures.branches[0],
  solid = getTrackSurface(b),
  f = b.pose(b.start + 40);
const top = solid.sweep(add(f.p, mul(f.up, 2)), add(f.p, mul(f.up, -1)));
const bottom = solid.sweep(add(f.p, mul(f.up, -2)), add(f.p, mul(f.up, 1)));
record(
  "shortcut-glass-top-and-bottom-have-real-solid-collision",
  top?.kind === "top" && bottom?.kind === "bottom" && dot(top.normal, bottom.normal) < -0.9,
);
r = createRun(c);
r.s = b.launchS;
r.lane = r.targetLane = -b.side * 3.2;
r.pos = c.pose(r.s, r.lane).p;
command(r, c, "jumpPress");
record("ordinary-jump-in-wrong-lane-does-not-force-a-route-change", r.routeId === null);
r = chainTrial(c, chain);
const before = r.adventure.chains;
r.checkpoint = chain.launchS;
restartCheckpoint(r, c);
r.pos = c.pose(r.s).p;
r.input.suction = false;
command(r, c, "jumpPress");
for (let i = 0; i < 145 && r.phase === "running"; i++) {
  if (i === 12) command(r, c, "jumpRelease");
  if (i === 23) command(r, c, "right");
  if (i === 48) command(r, c, "suctionPress");
  stepRun(r, c, 1 / 60);
}
record("checkpoint-repeats-cannot-farm-completion-rewards", r.adventure.chains === before);
record(
  "checkpoint-retry-clears-route-and-transfer-state",
  r.routeId === null && r.adventure.transfer === null,
);
const noE = createRun(c),
  fork = c.adventures.branches[0];
noE.s = fork.launchS;
noE.lane = noE.targetLane = fork.side * 3.2;
noE.pos = c.pose(noE.s, noE.lane).p;
command(noE, c, "jumpPress");
let latchedWithoutE = false;
for (let i = 0; i < 220 && noE.phase === "running"; i++) {
  if (i === 18) command(noE, c, "jumpRelease");
  stepRun(noE, c, 1 / 60);
  if (noE.attached) latchedWithoutE = true;
}
record(
  "transfer-to-another-track-requires-explicit-E-suction",
  !latchedWithoutE && noE.falls === 1,
);
const sharedRoute = createRouteWindow(c.snapshot()),
  sharedMaterials = new Set(Object.values(sharedRoute.glass.materials));
let sharedFaces = 0,
  allShared = true;
sharedRoute.root.traverse((o) => {
  if (o.isMesh && o.name.startsWith("Glass ")) {
    sharedFaces++;
    if (!sharedMaterials.has(o.material)) allShared = false;
  }
});
record(
  "shortcut-shares-main-glass-materials-instead-of-growing-bloom-variants",
  allShared && sharedFaces > sharedRoute.glass.group.children.length,
);
sharedRoute.dispose();

const speedReports = [];
for (const speed of [25, 28, 36, 42, 48]) {
  const run = createRun(c);
  run.s = chain.launchS;
  run.pos = c.pose(run.s).p;
  run.speed = speed;
  command(run, c, "jumpPress");
  for (let i = 0; i < 145 && run.phase === "running"; i++) {
    if (i === (speed > 42 ? 7 : 12)) command(run, c, "jumpRelease");
    if (i === 23) command(run, c, "left");
    if (run.adventure?.attempt?.step === 2) command(run, c, "suctionPress");
    stepRun(run, c, 1 / 60);
  }
  speedReports.push({ speed, complete: run.adventure.chains === 1, falls: run.falls });
  assert(run.adventure.chains === 1 && run.falls === 0);
}
record(
  "normal-and-boost-speeds-can-complete-the-chain-with-speed-appropriate-short-jets",
  true,
  speedReports,
);

await fs.writeFile(
  new URL("../evidence/star-ring-adventure-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, branchRuns: branchReports.length }));
