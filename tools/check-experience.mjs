import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createSection } from "../src/star-ring/random-course.js";
import { drivingCue, stepDirector, EXPERIENCE_VERSION } from "../src/star-ring/director.js";
import { stepRhythm, rhythmStatus } from "../src/star-ring/rhythm.js";
import { createGhostRecorder } from "../src/star-ring/ghost.js";
import { createAdaptiveQuality } from "../src/star-ring/adaptive-quality.js";
import { createRun } from "../src/star-ring/simulation.js";
import { createGhostView, createRhythmMarkers } from "../src/star-ring/experience-view.js";
import {
  B as Group,
  R as Mesh,
  ci as Box,
  Fr as Basic,
  P as Vector3,
} from "../src/vendor/rendering.js";
const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
}
for (let seed = 1; seed <= 32; seed++) {
  const c = createSection(seed, seed % 4);
  assert(c.director.recoveries.length === 5);
  assert(c.director.notes.length > 0);
  for (const z of c.director.recoveries) {
    assert(!c.hazards.some((h) => h.s >= z.start && h.s <= z.end));
    assert(
      c.pickups.some((p) => p.type === "air" && p.lane === 0 && p.s >= z.start && p.s <= z.end),
    );
  }
  assert(c.pickups.filter((p) => p.type === "star").length === 2);
  assert(c.pickups.length < 180);
}
check("32-seeded-routes-have-clear-recovery-air-and-rhythm-notes", true);
const c = createSection(11, 0),
  run = createRun(c),
  zone = c.director.recoveries[0];
run.s = zone.start + 5;
run.pressure = 20;
stepDirector(run, c, run.s - 10);
check("recovery-replenishes-low-air-while-progressing", run.pressure > 20 && run.pressure < 25);
const air = run.pressure;
stepDirector(run, c, run.s);
check("standing-still-cannot-farm-recovery-air", run.pressure === air);
run.gripWarningLevel = 0.5;
run.gapCue = { state: "ready", label: "弹射" };
check(
  "critical-HUD-prioritizes-suction-over-secondary-notices",
  drivingCue(run, c).includes("吸附"),
);
run.gripWarningLevel = 0;
check("critical-HUD-retains-gap-cue", drivingCue(run, c) === "弹射");
check(
  "forks-describe-a-safe-main-route-and-a-reward-route",
  c.adventures.branches.every((b) => b.choice.reward > 320 && b.choice.safeTitle.includes("补气")),
);
const r = createRun(c);
r.input.suction = true;
for (let i = 0; i < 20; i++) {
  r.time = i / 60;
  stepRhythm(r, { since: 0, period: 0.5 }, [], 1 / 60);
}
check("holding-suction-on-beat-arms-a-musical-phrase", rhythmStatus(r).step === 1);
r.time = 0.5;
r.attached = false;
let e = stepRhythm(r, { since: 0.02, period: 0.5 }, [{ type: "jump" }], 1 / 60);
check(
  "on-beat-launch-progresses-phrase-and-awards-once",
  rhythmStatus(r).step === 2 && r.beatHits === 1 && r.score === 30,
);
stepRhythm(r, { since: 0.02, period: 0.5 }, [{ type: "jump" }], 1 / 60);
check("duplicate-step-events-do-not-double-score", r.score === 30);
r.time = 1;
r.attached = true;
e = stepRhythm(r, { since: 0.01, period: 0.5 }, [{ type: "land" }], 1 / 60);
check(
  "on-beat-landing-completes-three-stage-phrase",
  rhythmStatus(r).chains === 1 && rhythmStatus(r).layer && r.score === 180,
);
r.time = 1.5;
e = stepRhythm(r, { since: 0, period: 0.5 }, [], 1 / 60);
const n = e.find((e) => e.type === "rhythmLayer")?.note;
r.time = 2;
e = stepRhythm(r, { since: 0, period: 0.5 }, [], 1 / 60);
check(
  "musical-layer-advances-through-different-notes",
  e.some((e) => e.type === "rhythmLayer" && e.note !== n),
);
const score = r.score;
r.time = 2.2;
stepRhythm(r, { since: 0.24, period: 0.5 }, [{ type: "land" }], 1 / 60);
check(
  "off-beat-input-never-causes-death-or-score-deduction",
  r.score === score && r.phase === "running",
);
r.time = 3;
stepRhythm(r, { since: 0.13, period: 0.5 }, [{ type: "jump" }], 1 / 60, 0.1);
check("timing-calibration-adjusts-scoring-window", r.score === score + 30);
const q = createAdaptiveQuality();
q.reset(2);
for (let i = 0; i < 300; i++) q.sample(34, true, 2);
check("sustained-slow-frames-lower-quality", q.status().level < 2, q.status());
const low = q.status().level;
for (let i = 0; i < 30; i++) q.sample(16, true, 2);
check("short-fast-burst-does-not-oscillate-quality", q.status().level === low);
for (let i = 0; i < 2600; i++) q.sample(16, true, 2);
check("sustained-headroom-restores-quality", q.status().level === 2);
q.sample(80, false, 1);
check("manual-quality-ceiling-and-disabled-auto-are-respected", q.status().level === 1);
const memory = {
    value: null,
    getItem() {
      return this.value;
    },
    setItem(k, v) {
      this.value = v;
    },
  },
  g = createGhostRecorder(memory),
  gr = createRun(c);
g.start(11);
for (let i = 0; i < 30; i++) {
  gr.time = i * 0.21;
  gr.bestDistance = i * 6;
  gr.score = i;
  g.record(gr, [i * 6, 0, 0, 0, 0, 0, 1]);
}
check(
  "personal-best-ghost-saves-locally",
  g.finish(gr) && JSON.parse(memory.value).version === EXPERIENCE_VERSION,
);
const replay = createGhostRecorder(memory);
replay.start(11);
const pose = replay.playback(0.315);
check(
  "ghost-interpolates-a-matching-seed",
  pose && Math.abs(pose[0] - 9) < 0.01 && Math.abs(Math.hypot(...pose.slice(3)) - 1) < 0.001,
);
replay.start(12);
check("ghost-never-appears-on-a-different-random-route", replay.playback(0.315) === null);
const prior = memory.value;
gr.bestDistance = 10;
check("shorter-runs-do-not-overwrite-personal-best", !g.finish(gr) && memory.value === prior);
g.start(15);
for (let i = 0; i < 26000; i++) {
  gr.time = i * 0.21;
  g.record(gr, [i * 3, 0, 0, 0, 0, 0, 1]);
}
check(
  "long-endless-recordings-decimate-within-fixed-capacity",
  g.status().recorded <= g.status().capacity && g.status().recorded > 1000,
  g.status(),
);
const corrupt = createGhostRecorder({ getItem: () => "{bad json" });
check("corrupt-local-ghost-is-ignored-without-breaking-start", !corrupt.status().available);
const root = new Group(),
  geo = new Box(1, 1, 2),
  body = new Group();
body.add(new Mesh(geo, new Basic()));
const gv = createGhostView(root, { slots: { body } });
gv.update([10, 1, 0, 0, 0, 0, 1], [0, 0, 0], { ghost: true, ghostOpacity: 0.4 }, new Vector3());
check(
  "ghost-reuses-geometry-and-has-no-collider",
  gv.status().visible && gv.root.children[0].children[0].geometry === geo && !gv.status().collision,
);
gv.update([0, 0, 0, 0, 0, 0, 1], [0, 0, 0], { ghost: true }, new Vector3());
check("overlapping-ghost-fades-away-from-player", !gv.status().visible);
gv.update([10, 0, 0, 0, 0, 0, 1], [0, 0, 0], { ghost: false }, new Vector3());
check("ghost-can-be-disabled-independently", !gv.status().visible);
const markers = createRhythmMarkers(root, c, new Basic({ vertexColors: true }));
check(
  "rhythm-markers-preserve-longitudinal-only-track",
  markers.status().notes > 0 && markers.status().transverseLines === 0,
);
await fs.writeFile(
  new URL("../evidence/experience-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length }));
