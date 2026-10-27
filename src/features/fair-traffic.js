import { courseRows, trafficSpacing, safeSpawnZ } from "./rules.js";
import { reachableRoute } from "./handling-rules.js";

export function installFairTraffic(game, active) {
  const update = game.spawner.update,
    gap = game.spawner.gap,
    choose = game.spawner.choose;
  let rows = [],
    index = 0,
    identity = null;
  const seen = new WeakSet();
  const counters = {
    guardedSpawns: 0,
    fixedRows: 0,
    sequenceChecks: 0,
    deferred: 0,
    omitted: 0,
    fixedLayoutReachable: null,
  };
  let lastRoute = null;
  function guard(speed) {
    const fresh = game.traffic.list.filter((car) => !seen.has(car));
    for (const car of fresh) {
      seen.add(car);
      const z = safeSpawnZ(car.z, speed, car.ownSpeed || 0);
      if (z !== car.z) {
        car.z = z;
        car.mesh.position.z = z;
        counters.guardedSpawns++;
      }
      // Include only accepted spawns and this candidate, so a whole newly
      // generated row can be rejected incrementally without moving old cars.
      const cars = game.traffic.list.filter((c) => !fresh.includes(c) || seen.has(c));
      const inspect = () => reachableRoute({ player: game.player, cars, speed });
      lastRoute = inspect();
      counters.sequenceChecks++;
      for (let attempt = 0; !lastRoute.reachable && attempt < 4; attempt++) {
        car.z -= Math.max(24, speed * 0.9);
        car.mesh.position.z = car.z;
        counters.deferred++;
        lastRoute = inspect();
      }
      if (!lastRoute.reachable) {
        game.traffic.release(car);
        game.traffic.list.splice(game.traffic.list.indexOf(car), 1);
        counters.omitted++;
      }
    }
  }
  function begin(options, seed, distance = 0, resume = false) {
    identity = `${options.mode}:${seed}`;
    rows = courseRows(seed, options.mode === "academy" ? 10 : 18, options.mode === "academy");
    index = resume ? rows.filter((r) => r.distance <= distance + 260).length : 0;
    game.traffic.seed = (seed ^ 0x5f3759df) >>> 0;
    counters.fixedRows = 0;
    // Fixed-seed lessons/daily courses keep identical obstacle coordinates.
    // Audit their full ground corridor at high speed and without air instead
    // of moving their rows in response to a particular player's mistakes.
    counters.fixedLayoutReachable = reachableRoute({
      player: { lanes: [-3.4, 0, 3.4], lane: 1, x: 0, air: 0, grounded: true, laneT: 1 },
      cars: rows.flatMap((row) =>
        row.blocked.map((lane) => ({
          x: [-3.4, 0, 3.4][lane],
          z: -row.distance,
          hw: 0.95,
          hl: 2.4,
          h: 1.3,
        })),
      ),
      speed: 100,
      horizon: 20,
    }).reachable;
  }
  game.spawner.gap = function (distance, lanes) {
    const options = active();
    const base = gap.call(this, distance, lanes);
    return options?.features.fairTraffic
      ? base * trafficSpacing(distance, game.player.air / 600, options.mode)
      : base;
  };
  game.spawner.choose = function (distance, score) {
    const options = active();
    if (options?.features.fairTraffic && distance < 600) return null;
    return choose.call(this, distance, score);
  };
  game.spawner.update = function (distance, speed, air, score) {
    const options = active();
    if (options && ["daily", "academy"].includes(options.mode)) {
      if (options.mode === "academy" && options.lesson >= 3) return;
      if (identity !== `${options.mode}:${game.runSeed}`)
        begin(options, game.runSeed, distance, distance > 0);
      while (index < rows.length && rows[index].distance <= distance + 260) {
        const row = rows[index++];
        const advance = Math.max(0, distance - (game.drivingStepStart ?? distance));
        if (row.distance < distance + 20) continue;
        for (const lane of row.blocked)
          game.traffic.add("sedan", [-3.4, 0, 3.4][lane], distance - row.distance - advance);
        if (row.supply)
          game.pickups.addCan(
            [-3.4, 0, 3.4][row.safeLane],
            distance - row.distance - 16 - advance,
            0.8,
          );
        counters.fixedRows++;
      }
      return;
    }
    update.call(this, distance, speed, air, score);
    if (!options?.features.fairTraffic) return;
    guard(speed);
  };
  return { begin, counters, route: () => lastRoute, nextRow: () => rows[index] || null };
}
