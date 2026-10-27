// Conservative model footprints, including rotation, bobbing and a readable gap.
export const CLEARANCE = { side: 0.14, ahead: 4, between: 2.4 };
export function pickupFootprint(p) {
  return p.fragment
    ? { x: 0.34, s: 0.34 }
    : p.type === "sky"
      ? { x: 2.5, s: 0.6 }
      : p.type === "star"
        ? { x: 1.32, s: 1.32 }
        : p.type === "air"
          ? { x: 0.78, s: 0.78 }
          : { x: 1.24, s: 1.24 };
}
export function trafficEnvelope(h) {
  const m = h.motion,
    merge = !!m?.merge && m.laneTo !== h.lane,
    x = h.type === "car" ? (merge ? 1.72 : 1.12) : 1.4,
    s = h.type === "car" ? 2.75 : 1.45,
    target = merge ? m.laneTo : h.lane;
  return {
    lo: h.s - s,
    hi: h.s + (m?.maxTravel || 0) + s,
    left: Math.min(h.lane, target) - x,
    right: Math.max(h.lane, target) + x,
  };
}
export function intersectsTraffic(p, h, padding = CLEARANCE.ahead) {
  const a = pickupFootprint(p),
    b = trafficEnvelope(h);
  return (
    p.s + a.s + padding > b.lo &&
    p.s - a.s - padding < b.hi &&
    p.lane + a.x + CLEARANCE.side > b.left &&
    p.lane - a.x - CLEARANCE.side < b.right
  );
}
export function intersectsPickup(a, b, padding = CLEARANCE.between) {
  if ((a.routeId || null) !== (b.routeId || null)) return false;
  const x = pickupFootprint(a),
    y = pickupFootprint(b);
  return (
    Math.abs(a.s - b.s) < x.s + y.s + padding &&
    Math.abs(a.lane - b.lane) < x.x + y.x + CLEARANCE.side
  );
}
function gateConflict(c, p) {
  return (c.adventures?.chains || []).some(
    (chain) =>
      (chain.routeId || null) === (p.routeId || null) &&
      chain.gates.some(
        (g) =>
          Math.abs(g.s - p.s) < pickupFootprint(p).s + 3.8 &&
          Math.abs(p.lane) < pickupFootprint(p).x + 2.9,
      ),
  );
}
function valid(c, p) {
  const path = p.routeId ? c.adventures?.branches.find((b) => b.id === p.routeId) : c;
  if (
    !path ||
    p.s < Math.max(28, path.start || 0) + 3 ||
    p.s > Math.min(c.length - 32, path.end || c.length) - 3
  )
    return false;
  if (Math.abs(p.lane) + pickupFootprint(p).x > (path.width || 12) / 2 - 0.05) return false;
  if (
    p.type !== "sky" &&
    (path.gaps || []).some(
      (g) => p.s > g.start - 3 - pickupFootprint(p).s && p.s < g.end + 4 + pickupFootprint(p).s,
    )
  )
    return false;
  return !gateConflict(c, p);
}
export function layoutConflicts(c) {
  const issues = [],
    pickups = c.pickups || [],
    fragments = (c.voyage?.fragments || []).map((f) => ({ ...f, fragment: true }));
  for (const [i, p] of [...pickups, ...fragments].entries()) {
    if (!p.routeId)
      for (const [j, h] of (c.hazards || []).entries())
        if (intersectsTraffic(p, h))
          issues.push({
            kind: "traffic",
            i,
            j,
            type: p.type || "fragment",
            hazard: h.type,
            s: p.s,
            lane: p.lane,
          });
    if (gateConflict(c, p)) issues.push({ kind: "gate", i, s: p.s });
  }
  const all = [...pickups, ...fragments];
  for (let i = 0; i < all.length; i++)
    for (let j = i + 1; j < all.length; j++)
      if (intersectsPickup(all[i], all[j])) issues.push({ kind: "pickup", i, j, s: all[i].s });
  return issues;
}
export function separateTrackItems(c) {
  const report = {
      movedPickups: 0,
      movedFragments: 0,
      adjustedTraffic: 0,
      removedHazards: 0,
      droppedOptional: 0,
    },
    placed = [],
    reserved = [];
  const solid = (p) => valid(c, p) && !placed.some((q) => intersectsPickup(p, q));
  function trafficFree(p) {
    return !!p.routeId || !c.hazards.some((h) => intersectsTraffic(p, h));
  }
  function reserve(p) {
    if (p.routeId) return;
    c.hazards = c.hazards.filter((h) => {
      if (!intersectsTraffic(p, h)) return true;
      const m = h.motion;
      if (m) {
        // Prefer keeping the convoy: cancel only a crossing merge, then shorten travel.
        if (m.merge) {
          m.merge = false;
          m.laneTo = h.lane;
          report.adjustedTraffic++;
        }
        if (!intersectsTraffic(p, h)) return true;
        const space = p.s - h.s - 2.75 - pickupFootprint(p).s - CLEARANCE.ahead - 0.05;
        if (space >= 0 && space < m.maxTravel) {
          m.maxTravel = space;
          report.adjustedTraffic++;
        }
        if (!intersectsTraffic(p, h)) return true;
      }
      report.removedHazards++;
      return false;
    });
    reserved.push(p);
  }
  const offsets = [0, -8, 8, -16, 16, -26, 26, -40, 40, -58, 58, -80, 80],
    lanes = [0, -3.2, 3.2];
  function choose(p, essential = false, fragment = false) {
    const original = { s: p.s, lane: p.lane };
    // Keep gates, first rainbow stars and musical notes at their authored positions.
    const fixed = p.type === "star" || p.type === "sky" || p.rhythm;
    for (const d of fixed ? [0] : essential ? [0, -8, 8, -16, 16, -24, 24] : offsets) {
      const options =
        essential || fixed
          ? [original.lane]
          : fragment
            ? [original.lane, original.lane < 0 ? 0 : -1.65, original.lane > 0 ? 0 : 1.65, ...lanes]
            : [original.lane, ...lanes.filter((l) => l !== original.lane)];
      for (const lane of options) {
        const q = { ...p, s: original.s + d, lane };
        if (!solid(q) || (!essential && !trafficFree(q))) continue;
        Object.assign(p, { s: q.s, lane: q.lane });
        if (essential) reserve(p);
        placed.push(p);
        return true;
      }
    }
    return false;
  }
  // Lifeline air and authored action rewards take priority over optional scenery/traffic.
  const essential = c.pickups.filter(
      (p) => p.required || p.type === "star" || p.type === "sky" || p.rhythm,
    ),
    optional = c.pickups.filter((p) => !essential.includes(p)),
    accepted = [];
  for (const p of essential) {
    const before = [p.s, p.lane];
    if (!choose(p, true))
      throw new Error("No safe required pickup slot at " + p.s + " (" + p.type + ")");
    if (p.s !== before[0] || p.lane !== before[1]) report.movedPickups++;
    accepted.push(p);
  }
  if (!c.hazards.some((h) => h.type === "device")) {
    const car = c.hazards.find(
      (h) =>
        h.type === "car" &&
        !h.motion &&
        !reserved.some((p) => intersectsTraffic(p, { ...h, type: "device" })),
    );
    if (car) car.type = "device";
  }
  for (const p of optional) {
    const before = [p.s, p.lane];
    if (!choose(p)) {
      report.droppedOptional++;
      continue;
    }
    if (p.s !== before[0] || p.lane !== before[1]) report.movedPickups++;
    accepted.push(p);
  }
  c.pickups = accepted.sort((a, b) => a.s - b.s);
  if (c.voyage) {
    const fragments = [];
    for (const item of c.voyage.fragments) {
      const p = { ...item, fragment: true },
        before = [p.s, p.lane];
      if (!choose(p, false, true)) continue;
      if (p.s !== before[0] || p.lane !== before[1]) report.movedFragments++;
      item.s = p.s;
      item.lane = p.lane;
      fragments.push(item);
    }
    c.voyage.fragments = fragments;
  }
  // Guide lights follow the actual retained note positions.
  if (c.director)
    c.director.notes = c.director.notes.filter((n) =>
      c.pickups.some((p) => p.rhythm && Math.abs(p.s - n.s) < 0.01),
    );
  c.placement = report;
  return c;
}
