import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  B as Group,
  R as Mesh,
  gi as Shader,
  V as Cylinder,
  L as Attribute,
  I as Color,
  P as Vector3,
} from "../src/vendor/rendering.js";
import { createFlightEffects } from "../src/star-ring/flight-effects.js";
import { createCourse } from "../src/star-ring/course.js";
import { createRun } from "../src/star-ring/simulation.js";
const game = await fs.readFile(new URL("../src/game.js", import.meta.url), "utf8");
const vertex = game.match(/var yy = `([\s\S]*?)`;/)[1],
  fragment = game.match(/var by = `([\s\S]*?)`;/)[1];
const geometry = new Cylinder(0.2, 0.6, 1, 24, 22, true);
geometry.setAttribute(
  "aLayer",
  new Attribute(new Float32Array(geometry.attributes.position.count).fill(1), 1),
);
const templates = {};
for (const id of ["L1", "L2", "L3", "L4", "R1", "R2", "R3", "R4", "S1", "S2"]) {
  const material = new Shader({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uSpread: { value: 0.52 },
      uSeed: { value: 1 },
      uNoise: { value: null },
      uTint: { value: new Color(1, 1, 1) },
      uLight: { value: new Color(1, 1, 1) },
      uSun: { value: new Vector3(0, 1, 0) },
      uWind: { value: new Vector3() },
    },
  });
  templates[id] = { mesh: new Mesh(geometry, material) };
}
const fx = createFlightEffects(new Group(), templates),
  c = createCourse(),
  r = createRun(c),
  near = c.pose(0),
  checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
}
r.input.suction = true;
for (let i = 0; i < 40; i++) fx.update(r, near, 1 / 60, i / 60, 1, false);
check(
  "held-E-draws-converging-ribbons-and-air-particles",
  fx.status().suction > 0.95 && fx.ribbons.visible && fx.status().particles > 80,
  fx.status(),
);
check(
  "all-ten-jets-share-the-original-geometry",
  fx.plumes.every((p) => p.mesh.geometry === geometry),
);
check(
  "native-shaders-retain-real-noise-layers-and-curved-floor-clipping",
  fx.plumes.every(
    (p) =>
      p.material.vertexShader.includes("aLayer") &&
      p.material.fragmentShader.includes("uNoise") &&
      p.material.fragmentShader.includes("floorDistance"),
  ),
);
r.attached = false;
r.input.jump = true;
r.input.suction = false;
r.rollProgress = 0.3;
r.rollDir = 1;
for (let i = 0; i < 45; i++) fx.update(r, near, 1 / 60, 1 + i / 60, 1, false);
check(
  "jet-and-roll-use-lift-and-side-RCS-plumes",
  fx.status().jet > 0.95 && fx.status().levels.S1 > 0.5 && fx.status().levels.L1 > 0.9,
  fx.status(),
);
check(
  "fixed-particle-pool-stays-within-capacity",
  fx.status().particles <= fx.status().particleCapacity,
);
check(
  "gas-and-ribbon-gpu-attributes-remain-finite",
  [fx.particles, fx.ribbons].every((o) =>
    Object.values(o.geometry.attributes).every((a) => [...a.array].every(Number.isFinite)),
  ),
);
r.phase = "dead";
r.rollProgress = 0;
for (let i = 0; i < 120; i++) fx.update(r, near, 1 / 60, 3 + i / 60, 1, false);
check(
  "death-turns-off-valves-and-intake",
  fx.status().jet < 0.01 && fx.status().suction < 0.01 && !fx.ribbons.visible,
);
fx.reset();
check(
  "restart-clears-effects-without-allocating-new-plumes",
  fx.status().nativePlumes === 10 && fx.plumes.every((p) => !p.mesh.visible),
);
await fs.writeFile(
  new URL("../evidence/star-ring-flight-effect-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length }));
