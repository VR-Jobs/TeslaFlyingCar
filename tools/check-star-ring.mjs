import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createCourse, dot } from "../src/star-ring/course.js";
import {
  createRun,
  stepRun,
  command,
  rescue,
  restartCheckpoint,
} from "../src/star-ring/simulation.js";
const c = createCourse(),
  checks = [];
function check(name, ok, detail) {
  checks.push({ name, pass: !!ok, detail });
  assert(ok, name);
}
let inverted = 0,
  loop = 0;
for (let s = 0; s < c.length; s += 0.75) {
  const f = c.pose(s, 3.2);
  assert([...f.p, ...f.t, ...f.up, ...f.right].every(Number.isFinite));
  assert(Math.abs(dot(f.t, f.up)) < 1e-7);
  assert(Math.abs(dot(f.right, f.up)) < 1e-7);
  if (f.up[1] < -0.8) inverted++;
  if (f.kind === "loop") loop++;
}
check("true-3d-loops-and-inverted-surfaces", inverted > 100 && loop > 500, {
  inverted,
  loop,
  length: c.length,
});
for (const s of c.segments.slice(1).map((x) => x.start)) {
  const a = c.frame(s - 0.0001),
    b = c.frame(s + 0.0001);
  assert(Math.hypot(...a.p.map((v, i) => v - b.p[i])) < 0.001);
  assert(dot(a.t, b.t) > 0.9999);
}
check("continuous-track-joins", true);
for (const g of c.gaps) {
  assert(!c.frame((g.start + g.end) / 2).exists);
  assert(c.frame(g.start - 1).exists && c.frame(g.end + 1).exists);
}
check("three-actual-missing-track-spans", c.gaps.length === 3);
let r = createRun(c);
command(r, c, "suctionPress");
for (let i = 0; i < 300; i++) stepRun(r, c, 1 / 60);
command(r, c, "jumpPress");
check("jump-releases-with-world-momentum", !r.attached && Math.hypot(...r.velocity) > 20, {
  velocity: r.velocity,
});
const old = [...r.pos];
stepRun(r, c, 1 / 60);
check(
  "manual-jump-event-survives-next-tick",
  r.events.some((e) => e.type === "jump"),
);
stepRun(r, c, 1 / 60);
check("manual-event-is-not-replayed", !r.events.some((e) => e.type === "jump"));
check("free-flight-integrates-position", Math.hypot(...r.pos.map((v, i) => v - old[i])) > 0.2);
r.checkpoint = 455;
rescue(r, c);
for (let i = 0; i < 45; i++) stepRun(r, c, 1 / 60);
check("fall-restores-checkpoint", r.attached && r.s >= 455 && r.s < 465 && r.falls === 1, {
  s: r.s,
  falls: r.falls,
});
r = createRun(c);
let jumpGap = null;
const visits = new Set();
for (let i = 0; i < 60 * 140 && r.phase !== "finished"; i++) {
  visits.add(c.frame(r.s).title);
  const gap = c.gaps.find((g) => g.start - r.s > -3 && g.start - r.s < 65 && !g.auto);
  if (r.attached) {
    r.input.suction = true;
    r.input.jump = false;
    r.input.boost = !!gap;
    if (gap && gap.start - r.s < 11 && jumpGap !== gap.start) {
      command(r, c, "jumpPress");
      command(r, c, "suctionRelease");
      jumpGap = gap.start;
    }
  } else {
    r.input.jump = r.airTime < 0.24;
    r.input.suction = r.airTime > 0.45;
    r.input.boost = false;
  }
  stepRun(r, c, 1 / 60);
  if (r.phase === "rescue") jumpGap = null;
  // Simulate the explicit R retry after the new death cinematic.
  if (r.phase === "dead") {
    restartCheckpoint(r, c);
    jumpGap = null;
  }
}
check("authored-course-can-be-cleared", r.phase === "finished", {
  s: r.s,
  time: r.time,
  penalty: r.penalty,
  falls: r.falls,
  pressure: r.pressure,
  lands: r.lands,
  rings: r.rings,
  visits: [...visits],
});
check("leaps-reconnect-to-track", r.lands >= 3, { lands: r.lands });
await fs.writeFile(
  new URL("../evidence/star-ring-physics-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify(checks, null, 2));
