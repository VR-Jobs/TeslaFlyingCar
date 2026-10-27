// Shared by input assistance, the landing marker and sequence planning.
export function landingTime(player, gravity = 28) {
  if (player.grounded) return 0;
  const g = Math.max(1, gravity * (player.trick?.type === "kickflip" ? 0.55 : 1));
  return Math.max(0, (player.vy + Math.sqrt(player.vy ** 2 + 2 * g * Math.max(0, player.y))) / g);
}
export function flipCondition(p, ctx, kind = "barrel") {
  if (p.crashed || p.grounded) return "ground";
  if (!ctx.airInfinite && p.air < (kind === "kickflip" ? 20 : 40)) return "air";
  // Keep a complete normal jump available for tricks; reject last-moment
  // rotations rather than accelerating a full revolution into the ground.
  if (p.y < 0.7 && p.vy < 2) return "height";
  if (kind === "barrel" && landingTime(p, ctx.gravity) < 0.32 && !p.hovering) return "height";
  return null;
}

// Conservative ground route. No jump/boost is required to use this path.
// Sweep transitions as well as endpoints; this prevents "safe lane" teleporting.
export function reachableRoute({ player, cars, speed, horizon = 4.2 }) {
  const lanes = player.lanes || [-3.4, 0, 3.4],
    tick = 0.1;
  const obstacles = cars.filter(
    (c) => !c.dead && c.z < 12 && c.z > -Math.max(600, speed * horizon + 50),
  );
  const shift = player.air > 3 ? (player.grounded ? 0.15 : 0.32) : 0.35;
  const lock = Math.max(
    0.22,
    (1 - (player.laneT ?? 1)) * (player.laneDur || shift),
    player.trick ? Math.min(0.3, Math.max(0, 6.283 - player.trick.acc) / 9) : 0,
  );
  const safe = (x, time) =>
    obstacles.every((c) => {
      const z = c.z + Math.max(0, speed - (c.ownSpeed || 0)) * time;
      // Include a little uncertainty for native lane-changing traffic.
      const width = (c.hw || 1) + 1.06;
      const left = c.laneChange ? Math.min(c.x, c.laneChange.to) : c.x;
      const right = c.laneChange ? Math.max(c.x, c.laneChange.to) : c.x;
      return (
        Math.abs(z) > (c.hl || 2.4) + 2.5 || x < left - width || x > right + width || c.yMin > 1.5
      );
    });
  const sweep = (a, b, start, duration) => {
    const samples = Math.max(2, Math.ceil(duration / 0.025));
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      if (!safe(a + (b - a) * t, start + duration * t)) return false;
    }
    return true;
  };
  const steps = Math.ceil(horizon / tick),
    buckets = Array.from({ length: steps + 8 }, () => new Set());
  const start = Math.ceil(lock / tick);
  if (sweep(player.x, lanes[player.lane], 0, start * tick)) buckets[start].add(player.lane);
  const shiftSteps = Math.ceil((shift + 0.08) / tick);
  for (let i = start; i < steps; i++)
    for (const lane of buckets[i]) {
      if (sweep(lanes[lane], lanes[lane], i * tick, tick)) buckets[i + 1].add(lane);
      for (const target of [lane - 1, lane + 1]) {
        if (target < 0 || target >= lanes.length || i + shiftSteps > steps) continue;
        if (sweep(lanes[lane], lanes[target], i * tick, shiftSteps * tick))
          buckets[i + shiftSteps].add(target);
      }
    }
  return {
    reachable: buckets[steps].size > 0,
    endLanes: [...buckets[steps]],
    horizon,
    lock,
    shift,
  };
}
