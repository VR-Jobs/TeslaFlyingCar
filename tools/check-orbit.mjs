import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  planSegment,
  inAirCorridor,
  gateCrossing,
  createActionState,
  chainAction,
  bankChain,
  beatAction,
  landingRisk,
} from "../src/space-drive/rules.js";
import { reachableRoute } from "../src/features/handling-rules.js";
import { journeyState } from "../src/scenery/space-journey.js";
import { createOrbitView } from "../src/space-drive/view.js";
import { B as Group } from "../src/vendor/rendering.js";
const checks = [];
function check(name, pass) {
  checks.push({ name, pass: !!pass });
  assert(pass, name);
}
const patterns = new Set();
for (let seed = 1; seed <= 24; seed++)
  for (const speed of [25, 42, 65, 100])
    for (const lanes of [
      [-3.4, 0, 3.4],
      [-6.8, -3.4, 0, 3.4, 6.8],
    ]) {
      const plan = planSegment(seed, seed % 10, 170, speed, lanes);
      patterns.add(plan.kind);
      assert.deepEqual(plan, planSegment(seed, seed % 10, 170, speed, lanes));
      assert(plan.end > plan.recovery.start && plan.recovery.start > plan.start + 250);
      const cars = plan.rows.flatMap((row) =>
        row.cars
          .filter((car) => !inAirCorridor(plan, car.x, row.d, car.type === "semi" ? 9 : 3))
          .map((car) => ({
            ...car,
            z: -row.d,
            hw: car.type === "semi" ? 1.25 : 0.92,
            hl: car.type === "semi" ? 8.5 : 2.3,
            h: car.type === "semi" ? 4 : 1.42,
          })),
      );
      const p = { x: 0, lane: lanes.indexOf(0), laneT: 1, air: 0, grounded: true, lanes };
      assert(
        reachableRoute({ player: p, cars, speed, horizon: plan.end / speed + 2 }).reachable,
        `seed ${seed}, speed ${speed}`,
      );
      assert(plan.rows.every((row) => row.d < plan.recovery.start - 45));
    }
check("192-seeded-patterns-keep-zero-air-ground-route", true);
check("all-five-patterns-appear", patterns.size === 5);
const a = planSegment(11, 0, 170, 30);
check("first-section-offers-optional-air-route", !!a.route);
check("recovery-is-guaranteed-every-fifth-section", planSegment(11, 4, 2000, 45).kind === "supply");
const gate = { x: 0, y: 6.2, d: 100 };
check(
  "swept-gate-collection-works-at-high-speed",
  gateCrossing(gate, { d: 90, x: 0, y: 6.2 }, { d: 110, x: 0, y: 6.2 }),
);
check(
  "ground-route-does-not-collect-air-gates",
  !gateCrossing(gate, { d: 90, x: 0, y: 0 }, { d: 110, x: 0, y: 0 }),
);
check(
  "wrong-lane-cannot-collect-gate",
  !gateCrossing(gate, { d: 90, x: 3.4, y: 6.2 }, { d: 110, x: 3.4, y: 6.2 }),
);
check(
  "gate-cannot-be-collected-twice",
  !gateCrossing({ ...gate, taken: true }, { d: 90, x: 0, y: 6.2 }, { d: 110, x: 0, y: 6.2 }),
);
const s = createActionState();
check("near-miss-starts-chain", chainAction(s, "near", 1, 50));
check("stationary-input-spam-cannot-build-chain", !chainAction(s, "near", 2, 50));
chainAction(s, "clear", 2, 80);
chainAction(s, "trick", 3, 110);
check("unsafe-landing-does-not-cash-in", bankChain(s, 3.5, false) === null);
const reward = bankChain(s, 4, true);
check("safe-landing-banks-score-and-air", reward.points > 60 && reward.air === 30 && s.chain === 0);
check("same-chain-cannot-be-cashed-twice", bankChain(s, 4, true) === null);
chainAction(s, "near", 5, 150);
check("expired-chain-cannot-be-cashed", bankChain(s, 12, true) === null);
const b = createActionState(),
  clock = { since: 0.04, period: 0.5 };
check(
  "rhythm-does-not-invent-beats-without-audio-clock",
  beatAction(b, "jump", null, 0, 10) === null,
);
check(
  "off-beat-jump-still-earns-no-rhythm-penalty",
  beatAction(b, "jump", { since: 0.25, period: 0.5 }, 0, 10) === null && b.beatStep === 0,
);
beatAction(b, "jump", clock, 1, 30);
beatAction(b, "trick", clock, 2, 60);
check(
  "real-action-order-builds-musical-phrase",
  beatAction(b, "land", clock, 3, 90).phrase && b.phrases === 1,
);
check("same-action-frame-cannot-repeat-beat-reward", beatAction(b, "land", clock, 3, 90) === null);
const p = { x: 0, lane: 1, lanes: [-3.4, 0, 3.4], laneFrom: 0, laneT: 1, speed: 40 };
check(
  "landing-prediction-includes-relative-traffic-motion",
  landingRisk(p, [{ x: 0, z: -30, ownSpeed: 10, hl: 2.3, hw: 1 }], 1).blocked,
);
check("different-lane-is-safe", !landingRisk(p, [{ x: 3.4, z: -40, hl: 2.3, hw: 1 }], 1).blocked);
check(
  "lane-changing-vehicle-sweep-is-dangerous",
  landingRisk(p, [{ x: 3.4, z: -40, laneChange: { to: 0 }, hl: 2.3, hw: 1 }], 1).blocked,
);
check(
  "first-4700m-remains-compatible",
  journeyState(0).chapter === "近地轨道" && journeyState(4700).night === 1,
);
const chapters = new Set();
for (let d = 4700; d <= 60000; d += 100) {
  const j = journeyState(d);
  chapters.add(j.chapter);
  for (const key of ["moon", "belt", "night", "orbit", "station", "comet", "rings"]) {
    assert(j[key] >= 0 && j[key] <= 1);
    assert(Math.abs(j[key] - journeyState(d + 0.01)[key]) < 0.001);
  }
}
check("journey-keeps-changing-for-long-runs", chapters.size >= 7);
const view = createOrbitView(new Group());
const gates = Array.from({ length: 120 }, (_, i) => ({ x: 0, y: 6.2, d: i * 5 }));
view.update(gates, 0, 0, { x: 0 }, 2);
check(
  "120-input-gates-cannot-exceed-fixed-render-pool",
  view.status().visibleGates <= 32 && view.status().drawCalls === 8,
);
view.update(gates, 0, 0, { x: 0 }, 0, false);
check("other-scenes-hide-all-new-meshes", !view.root.visible);
await fs.writeFile(
  new URL("../evidence/orbit-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length }));
