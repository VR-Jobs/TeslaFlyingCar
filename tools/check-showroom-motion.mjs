import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { SHOWROOM_DURATIONS, sampleShowroomMotion } from "../src/scenery/showroom-motion.js";

const results = [];
for (const kind of Object.keys(SHOWROOM_DURATIONS)) {
  const duration = SHOWROOM_DURATIONS[kind],
    frames = [];
  for (let i = 0; i <= 1200; i++) {
    const f = sampleShowroomMotion(kind, i / 1200, duration);
    assert.ok(Number.isFinite(f.height) && f.height >= 0);
    assert.ok(
      f.audio.hover >= 0 && f.audio.hover <= 1 && f.audio.thrust >= 0 && f.audio.thrust <= 1,
    );
    frames.push(f);
  }
  const beginning = frames[0],
    end = frames.at(-1);
  assert.equal(beginning.height, 0);
  assert.equal(end.height, 0);
  assert.equal(end.pitch, 0);
  assert.equal(end.roll, 0);
  assert.equal(end.suspension, 0);
  assert.equal(end.audio.hover, 0);
  assert.equal(end.audio.thrust, 0);
  assert.equal(end.camera, 0);
  if (kind === "hover") assert.ok(Math.max(...frames.map((f) => f.camera)) <= 0.25);
  const beforeDescent = sampleShowroomMotion(kind, 0.66, duration);
  if (kind !== "hover") assert.ok(Math.abs(beforeDescent.pitch || beforeDescent.roll) > 6.28);
  assert.ok(frames.some((f) => f.suspension < -0.025) && frames.some((f) => f.suspension > 0.002));
  assert.ok(frames.some((f) => f.phase === "air-brake" && f.audio.thrust > 0.5));
  // Height and audio envelopes must remain continuous across segment boundaries.
  for (const p of [
    0.055, 0.1, 0.13, 0.29, 0.3, 0.34, 0.39, 0.5, 0.59, 0.64, 0.7, 0.78, 0.84, 0.91,
  ]) {
    const a = sampleShowroomMotion(kind, p - 1e-6, duration),
      b = sampleShowroomMotion(kind, p + 1e-6, duration);
    for (const key of ["height", "power"])
      assert.ok(Math.abs(a[key] - b[key]) < 1e-3, `${kind} ${key} jump`);
    for (const key of ["hover", "thrust"])
      assert.ok(Math.abs(a.audio[key] - b.audio[key]) < 1e-3, `${kind} audio jump`);
  }
  results.push({
    kind,
    duration,
    status: "PASS",
    peakHeight: Math.max(...frames.map((f) => f.height)),
    suspensionRange: [
      Math.min(...frames.map((f) => f.suspension)),
      Math.max(...frames.map((f) => f.suspension)),
    ],
  });
}
await fs.writeFile(
  new URL("../evidence/natural-showroom-motion-checks.json", import.meta.url),
  JSON.stringify({ status: "PASS", results }, null, 2),
);
console.log(
  "PASS: three flight profiles; continuous height/audio; upright before descent; damped landing and silent idle.",
);
