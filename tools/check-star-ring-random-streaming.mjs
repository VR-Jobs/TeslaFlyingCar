import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Js as Scene, I as Color } from "../src/vendor/rendering.js";
import { createRandomCourse } from "../src/star-ring/random-course.js";
import { createRouteWindow } from "../src/star-ring/route-window.js";
import { createBloomSelection } from "../src/star-ring/postprocessing.js";
import { createRun } from "../src/star-ring/simulation.js";
const c = createRandomCourse(42),
  scene = new Scene(),
  selection = createBloomSelection(scene),
  reports = [];
const renderer = {
  autoClear: true,
  getRenderTarget: () => null,
  getClearColor: (v) => v.set(0),
  getClearAlpha: () => 1,
  setRenderTarget() {},
  setClearColor() {},
  clear() {},
  render() {},
};
let current = createRouteWindow(c.snapshot());
scene.add(current.root);
let maximumMasks = 0,
  maximumBuildMs = 0;
for (let lap = 0; lap < 8; lap++) {
  const run = createRun(c);
  run.laps = lap;
  current.pickups.update(run, 0, 0);
  selection.render(renderer, null, null);
  maximumMasks = Math.max(maximumMasks, selection.status().cachedMasks);
  const next = c.previewNext(),
    start = performance.now(),
    prepared = createRouteWindow(next),
    buildMs = performance.now() - start;
  maximumBuildMs = Math.max(maximumBuildMs, buildMs);
  const geometries = new Set();
  current.root.traverse((o) => {
    if (o.geometry) geometries.add(o.geometry);
  });
  let disposed = 0;
  for (const g of geometries) g.addEventListener("dispose", () => disposed++);
  c.setCycle(lap + 1);
  current.dispose();
  assert(disposed === geometries.size, "retired visible geometries not all disposed");
  scene.add(prepared.root);
  current = prepared;
  selection.prune();
  assert(scene.children.length === 1);
  assert(selection.status().cachedMasks < 48);
  reports.push({
    lap,
    layout: c.id,
    disposed,
    buildMs,
    cachedMasks: selection.status().cachedMasks,
  });
}
current.dispose();
selection.prune();
assert(selection.status().cachedMasks === 0, "bloom materials retained after route disposal");
const checks = [
  {
    name: "eight-random-window-replacements-dispose-all-retired-geometries",
    pass: true,
    detail: reports,
  },
  {
    name: "route-bloom-mask-cache-is-pruned-with-retired-materials",
    pass: maximumMasks < 48 && selection.status().cachedMasks === 0,
    maximumMasks,
  },
  { name: "one-active-window-plus-one-prepared-window-bounds-scene", pass: true },
];
selection.dispose();
await fs.writeFile(
  new URL("../evidence/star-ring-random-streaming-checks.json", import.meta.url),
  JSON.stringify({ checks, maximumBuildMs }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, maximumBuildMs, maximumMasks }));
