import assert from "node:assert/strict";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { createRandomCourse } from "../src/star-ring/random-course.js";
import {
  createRouteWindow,
  createRouteWindowAsync,
  createRouteGlow,
} from "../src/star-ring/route-window.js";
const { warmRouteGPU } = await import("../src/star-ring/loading-warm.js");
const {
  Js: Scene,
  xi: Camera,
  B: Group,
  R: Mesh,
  ci: Box,
  Fr: Basic,
} = await import("../src/vendor/rendering.js");
const checks = [];
const check = (name, pass, detail) => {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
};
function geometrySignature(route) {
  const values = [],
    seen = new Set();
  route.root.traverse((o) => {
    if (!o.geometry || seen.has(o.geometry)) return;
    seen.add(o.geometry);
    const g = o.geometry;
    values.push(
      Object.entries(g.attributes)
        .map(
          ([key, a]) =>
            key +
            ":" +
            a.count +
            ":" +
            crypto
              .createHash("sha256")
              .update(Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength))
              .digest("hex"),
        )
        .sort()
        .join("|") +
        ":" +
        (g.index
          ? crypto.createHash("sha256").update(Buffer.from(g.index.array.buffer)).digest("hex")
          : "none"),
    );
  });
  return values.sort();
}
const reports = [];
for (const seed of [11, 27, 42]) {
  const c = createRandomCourse(seed).snapshot(),
    sync = createRouteWindow(c);
  let yields = 0;
  const asyncRoute = await createRouteWindowAsync(c, async () => {
    yields++;
    await Promise.resolve();
  });
  assert.deepEqual(geometrySignature(sync), geometrySignature(asyncRoute));
  check(
    "synchronous-and-interruptible-builds-preserve-all-rendered-geometry-" + seed,
    yields > 30,
    { yields },
  );
  const all = new Set();
  asyncRoute.root.traverse((o) => {
    if (o.geometry) all.add(o.geometry);
  });
  let disposed = 0;
  for (const g of all) g.addEventListener("dispose", () => disposed++);
  asyncRoute.dispose();
  assert.equal(disposed, all.size);
  sync.dispose();
  reports.push({ seed, yields, disposed });
}
for (const at of [1, 20, 80]) {
  let yields = 0,
    aborted = false;
  try {
    await createRouteWindowAsync(createRandomCourse(at).snapshot(), async () => {
      if (++yields === at) {
        const e = new Error("superseded");
        e.name = "AbortError";
        throw e;
      }
    });
  } catch (e) {
    aborted = e.name === "AbortError";
  }
  check("cancelled-preload-stops-without-publishing-partial-route-" + at, aborted);
}
const glow = createRouteGlow(),
  c = createRandomCourse(11).snapshot(),
  route = await createRouteWindowAsync(c, async () => {}, glow);
let glowDisposed = false;
glow.addEventListener("dispose", () => (glowDisposed = true));
route.dispose();
check("retiring-a-staged-route-retains-the-view-owned-glow", !glowDisposed);
glow.dispose();
const warmCourse = createRandomCourse(11).snapshot(),
  warmRoute = createRouteWindow(warmCourse),
  stageScene = new Scene(),
  extra = new Group(),
  hiddenGeometry = new Box(1, 1, 1),
  hiddenMaterial = new Basic(),
  hidden = new Mesh(hiddenGeometry, hiddenMaterial);
hidden.visible = false;
extra.add(hidden);
let disposedExtra = false;
hiddenGeometry.addEventListener("dispose", () => (disposedExtra = true));
const uploaded = new Set(),
  fakeRenderer = {
    toneMapping: 0,
    toneMappingExposure: 1,
    getRenderTarget: () => null,
    setRenderTarget() {},
    clear() {},
    compileAsync: async () => {},
    render(s) {
      s.traverseVisible((o) => {
        if (o.geometry) uploaded.add(o.geometry);
      });
    },
  };
await warmRouteGPU(
  fakeRenderer,
  stageScene,
  new Camera(),
  warmRoute,
  { precompileBloom: async () => {}, warmBloom() {} },
  async () => {},
  [extra],
);
check(
  "hidden-first-use-effects-are-warmed-without-disposing-shared-buffers",
  uploaded.has(hiddenGeometry) && !disposedExtra && hidden.visible === false,
);
warmRoute.dispose();
hiddenGeometry.dispose();
hiddenMaterial.dispose();
const text = await fs.readFile(new URL("../src/local/home.js", import.meta.url), "utf8");
check(
  "public-home-entry-awaits-the-asynchronous-launch",
  /await\s+starRing\.launch\([^)]*\)/.test(text),
);
await fs.writeFile(
  new URL("../evidence/loading-performance-checks.json", import.meta.url),
  JSON.stringify({ checks, reports }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, reports }));
