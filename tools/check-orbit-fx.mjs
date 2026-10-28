import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { B as Group } from "../src/vendor/rendering.js";
import { createOrbitTransients, FX_BUDGET } from "../src/space-drive/transients.js";
import { createOrbitView } from "../src/space-drive/view.js";
const checks = [];
function check(name, pass) {
  assert(pass, name);
  checks.push({ name, pass: true });
}
const root = new Group(),
  fx = createOrbitTransients(root);
const event = { time: 10, distance: 100, x: 1.4, y: 6.2 };
fx.emit("collect", event);
fx.update(100, 10.12);
check(
  "collection-emits-a-small-soft-light-burst",
  fx.status().sparks > 0 && fx.status().mist === 0,
);
const geom = fx.objects[0].geometry;
const oldZ = geom.attributes.position.getZ(0);
fx.update(125, 10.12);
check(
  "burst-stays-at-its-world-location-while-road-scrolls",
  Math.abs(geom.attributes.position.getZ(0) - oldZ - 25) < 0.0001,
);
const allocations = fx.objects.map((m) => m.geometry);
for (let i = 0; i < 500; i++) fx.emit(i % 2 ? "land" : "collect", { ...event, impact: 0.9 });
fx.update(100, 10.2);
const budget = fx.status();
check("event-spam-cannot-exceed-spark-pool", budget.sparks <= FX_BUDGET.sparks);
check("event-spam-cannot-exceed-mist-pool", budget.mist <= FX_BUDGET.mist);
check("event-spam-cannot-exceed-ripple-pool", budget.ripples <= FX_BUDGET.ripples);
check(
  "events-never-replace-geometries",
  fx.objects.every((m, i) => m.geometry === allocations[i]),
);
check(
  "all-effect-positions-and-colors-remain-finite",
  fx.objects.every((m) =>
    Object.values(m.geometry.attributes).every((a) => Array.from(a.array).every(Number.isFinite)),
  ),
);
check(
  "vehicle-and-road-occlude-all-transparent-effects",
  fx.objects.every((m) => m.material.depthTest && !m.material.depthWrite),
);
fx.update(200, 12);
check(
  "all-transients-expire-without-new-events",
  fx.status().sparks === 0 && fx.status().mist === 0 && fx.status().ripples === 0,
);
fx.reset();
fx.emit("land", { ...event, y: 0.12, impact: 0.15 });
fx.update(100, 10.2);
const gentle = fx.objects[1].geometry.attributes.aSize.getX(0);
fx.reset();
fx.emit("land", { ...event, y: 0.12, impact: 1 });
fx.update(100, 10.2);
check(
  "hard-landing-produces-larger-dispersing-mist",
  fx.objects[1].geometry.attributes.aSize.getX(0) > gentle,
);
const high = fx.status().sparks;
fx.reset();
fx.update(100, 10, { quality: 0, reduced: true });
fx.emit("land", { ...event, y: 0.12, impact: 1 });
fx.update(100, 10.2, { quality: 0, reduced: true });
check("reduced-motion-and-low-quality-lower-particle-count", fx.status().sparks < high);
fx.update(0, 0);
check(
  "restarting-time-clears-old-world-effects",
  fx.status().sparks === 0 && fx.status().mist === 0 && fx.status().ripples === 0,
);
fx.emit("collect", { ...event, x: NaN });
fx.update(100, 10);
check("invalid-event-cannot-poison-pool-buffers", fx.status().sparks === 0);
const view = createOrbitView(new Group());
const gates = Array.from({ length: 200 }, (_, i) => ({ x: 0, y: 6.2, d: 20 + i * 5 }));
view.update(gates, 0, 10, { x: 0 }, 2);
check(
  "gate-detail-and-halo-instances-are-bounded",
  view.root.children.every((m) => !m.isInstancedMesh || m.count <= m.instanceMatrix.count),
);
check(
  "metal-ring-keeps-original-collision-aperture-clear",
  view.root.children[0].geometry.parameters.radius -
    view.root.children[0].geometry.parameters.tube >
    1.05,
);
view.update(gates, 0, 10, { x: 0 }, 0, true, { reduced: true });
check("low-quality-removes-decorative-outer-arcs", view.root.children[3].count === 0);
view.collect(gates[0], 10);
view.update(gates, 0, 10.1, { x: 0 }, 2);
view.reset();
check("run-reset-clears-particle-draw-ranges", view.status().effects.sparks === 0);
view.update(gates, 0, 10.1, { x: 0 }, 2, false);
check("other-scenes-hide-the-entire-effects-root", !view.root.visible);
await fs.writeFile(
  new URL("../evidence/orbit-fx-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, drawCallBudget: view.status().drawCalls }));
