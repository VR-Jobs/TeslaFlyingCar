import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { landingTime, flipCondition, reachableRoute } from "../src/features/handling-rules.js";
import { installFairTraffic } from "../src/features/fair-traffic.js";
import { journeyState } from "../src/scenery/space-journey.js";
const player = {
  grounded: true,
  lanes: [-3.4, 0, 3.4],
  lane: 1,
  x: 0,
  air: 600,
  laneT: 1,
  laneDur: 0.15,
  y: 0,
  vy: 0,
};
const car = (x, z = -30) => ({
  x,
  z,
  hw: 0.95,
  hl: 2.3,
  h: 1.3,
  ownSpeed: 0,
  mesh: { position: { z } },
  dead: false,
});
assert(landingTime({ ...player, grounded: false, y: 0.5, vy: -8 }) < 0.16);
assert.equal(
  flipCondition({ ...player, grounded: false, y: 0.3, vy: -2 }, { gravity: 28 }),
  "height",
);
assert.equal(flipCondition({ ...player, grounded: false, y: 1.5, vy: 4 }, { gravity: 28 }), null);
assert.equal(
  flipCondition({ ...player, grounded: false, y: 2, vy: 1, air: 0 }, { gravity: 28 }),
  "air",
);
assert(!reachableRoute({ player, cars: player.lanes.map((x) => car(x)), speed: 25 }).reachable);
assert(
  !reachableRoute({ player, cars: player.lanes.map((x) => car(x, -900)), speed: 100, horizon: 20 })
    .reachable,
  "Full-course audit must include distant obstacles",
);
assert(reachableRoute({ player, cars: [car(0)], speed: 25 }).reachable);
assert(
  !reachableRoute({ player, cars: [car(0, -8)], speed: 100 }).reachable,
  "Reaction lock must not allow an instant lane teleport",
);
let cases = 0,
  deferred = 0;
for (const speed of [23, 55, 100])
  for (const air of [0, 600])
    for (const wide of [false, true]) {
      const p = {
        ...player,
        air,
        lanes: wide ? [-6.8, -3.4, 0, 3.4, 6.8] : player.lanes,
        lane: wide ? 2 : 1,
      };
      let row = 0;
      const game = {
        player: p,
        traffic: { list: [], release() {} },
        spawner: {
          gap: () => 1,
          choose: () => null,
          update() {
            // Generate deliberate all-lane walls: only fresh cars can be deferred.
            for (const x of p.lanes) game.traffic.list.push(car(x, -45 - row * 40));
            row++;
          },
        },
      };
      const guard = installFairTraffic(game, () => ({
        mode: "free",
        features: { fairTraffic: true },
      }));
      for (let i = 0; i < 8; i++) {
        const before = game.traffic.list.map((c) => [c, c.z]);
        game.spawner.update(2000, speed, air, 0);
        assert(
          before.every(([c, z]) => c.z === z),
          "Existing vehicles moved by fairness guard",
        );
        assert(
          reachableRoute({ player: p, cars: game.traffic.list, speed }).reachable,
          "Accepted spawn batch blocks every sampled route",
        );
        cases++;
      }
      deferred += guard.counters.deferred;
    }
for (const boundary of [650, 1100, 1600, 1800, 2400, 2900, 3400, 3900, 4700]) {
  const a = journeyState(boundary - 0.001),
    b = journeyState(boundary + 0.001);
  for (const key of ["moon", "belt", "night", "orbit", "progress"])
    assert(Math.abs(a[key] - b[key]) < 0.0001);
}
const report = {
  routeBatches: cases,
  deferred,
  landingPrediction: true,
  flipConditions: true,
  continuousJourney: true,
  scope:
    "Conservative sampled 4.2-second ground-route forecast; current speed, lateral sweep, reaction/animation allowance and air-dependent lane duration. Not a guarantee against arbitrary later player inputs or speed changes.",
};
await fs.writeFile(
  new URL("../evidence/handling-route-checks.json", import.meta.url),
  JSON.stringify(report, null, 2),
);
console.log(report);
