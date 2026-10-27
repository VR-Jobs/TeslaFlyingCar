import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Js as Scene, P as Vector3 } from "../src/vendor/rendering.js";
import { createCourse, add, mul } from "../src/star-ring/course.js";
import { createRun, stepRun } from "../src/star-ring/simulation.js";
import { createPickupView } from "../src/star-ring/pickups.js";
const checks = [],
  course = createCourse(),
  visual = createPickupView(new Scene(), course);
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
}
check(
  "four-visually-distinct-pickup-types",
  new Set(Object.values(visual.status().types)).size === 4,
);
const sky = visual.items.find((v) => v.item.type === "sky");
sky.anchor.updateWorldMatrix(true, true);
let open = true;
sky.anchor.traverse((m) => {
  if (!m.isMesh) return;
  const p = m.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = sky.anchor.worldToLocal(
      new Vector3().fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld),
    );
    if (Math.hypot(v.x, v.y) < 1.1) open = false;
  }
});
check("golden-ring-has-an-open-center-for-the-car", open);
for (const kind of ["air", "ring", "sky"]) {
  const item = course.pickups.find((v) => v.type === kind),
    index = course.pickups.indexOf(item),
    run = createRun(course);
  run.s = item.s - 1;
  run.lane = run.targetLane = item.lane;
  run.pressure = 40;
  run.input.suction = true;
  run.pos = course.pose(run.s, run.lane).p;
  if (kind === "sky") {
    run.s = item.s;
    const f = course.pose(run.s, run.lane);
    run.attached = false;
    run.airTime = 0.6;
    run.detachCooldown = 0.3;
    run.pos = add(f.p, mul(f.up, item.height));
    run.velocity = mul(f.t, 28);
  }
  visual.reset();
  visual.update(run, 0, 0);
  stepRun(run, course, 1 / 60);
  check(
    "actual-physics-identifies-" + kind,
    run.taken.has(index) &&
      run.events.some((e) => e.type === "pickup" && e.index === index && e.kind === kind),
  );
  visual.update(run, 1 / 60, run.time);
  check(
    "actual-collection-creates-one-" + kind + "-burst",
    visual.status().collectedEffects === 1 && visual.status().activeBursts === 1,
    visual.status(),
  );
  visual.update(run, 1 / 60, run.time + 0.12);
  check(
    kind + "-particles-write-the-uploaded-gpu-buffers",
    visual.points.geometry.attributes.aAlpha.array.some((a) => a > 0) &&
      visual.points.geometry.attributes.position.array.some((p) => Math.abs(p) > 50),
  );
  visual.update(run, 1 / 60, run.time + 0.15);
  check("same-" + kind + "-pickup-cannot-replay-effect", visual.status().collectedEffects === 1);
  visual.update(run, 1 / 60, run.time + 2);
  check(
    kind + "-burst-fully-expires",
    visual.status().activeBursts === 0 && visual.slots.every((s) => !s.pulse.visible),
  );
  const attributes = visual.points.geometry.attributes;
  check(
    kind + "-particles-remain-finite",
    Object.values(attributes).every((a) => [...a.array].every(Number.isFinite)),
  );
}
const stressCourse = {
  ...course,
  pickups: course.pickups.slice(0, 12).map((v) => ({ ...v, s: 100, lane: 0 })),
};
const stress = createPickupView(new Scene(), stressCourse),
  r = createRun(stressCourse);
r.s = 100;
r.pos = stressCourse.pose(100).p;
stress.update(r, 0, 0);
r.taken = new Set(Array.from({ length: 12 }, (_, i) => i));
stress.update(r, 0, 0.1);
check(
  "simultaneous-effects-use-a-bounded-eight-slot-pool",
  stress.status().activeBursts === 8 && stress.slots.length === 8,
);
stress.reset();
stress.update(r, 0, 0.2);
check(
  "checkpoint-reset-does-not-replay-previously-collected-items",
  stress.status().activeBursts === 0 && stress.status().collectedEffects === 0,
);
const idle = createRun(course);
visual.reset();
visual.update(idle, 0, 0, 1, true);
check("reduced-motion-disables-idle-particle-orbits", visual.status().particles === 0);
await fs.writeFile(
  new URL("../evidence/star-ring-pickup-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
