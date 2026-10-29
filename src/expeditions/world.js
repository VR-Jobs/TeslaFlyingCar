import { clamp, hash } from "./core.js";
import { planet, launchWindow } from "./slingshot.js";
import { dock, cores, rocks } from "./salvage.js";
import { note, BEAT } from "./beat-road.js";
import { switches, echoSample, ECHO_LENGTH } from "./time-echo.js";
import { pairGate, pairFits, pairPositions } from "./twin-resonance.js";
import { cutSection, nextCut, platformAt } from "./leviathan-escape.js";
export const PALETTE = {
  ice: "#83dfff",
  gold: "#ffd28c",
  mint: "#9cffd5",
  pink: "#ff8cb7",
  violet: "#bea2ff",
  red: "#ff596b",
  metal: "#66798f",
  dark: "#1a2636",
};
const shape = (draw, type, x, y, s, sx, sy, sz, color, rotation = [0, 0, 0], extra = {}) =>
  draw({ type, p: [x, y, s], scale: [sx, sy, sz], color, rotation, ...extra });
export const box = (d, x, y, s, w, h, l, c = PALETTE.dark, type = "solid") =>
  shape(d, type, x, y, s, w, h, l, c);
export const ring = (d, x, y, s, r, c, rotation = [0, 0, 0], type = "ring") =>
  shape(d, type, x, y, s, r, r, r, c, rotation);
export const orb = (d, x, y, s, r, c, type = "rock") => shape(d, type, x, y, s, r, r, r, c);
export function beam(d, a, b, width, c) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    ds = b[2] - a[2],
    length = Math.hypot(dx, dy, ds);
  if (length < 0.001) return;
  shape(
    d,
    "beam",
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
    (a[2] + b[2]) / 2,
    width,
    length,
    width,
    c,
    [0, 0, 0],
    { direction: [dx, dy, -ds] },
  );
}
export function road(d, start, end, x = 0, width = 12, c = PALETTE.ice, y = 0) {
  for (let s = start; s < end; s += 22) {
    const length = Math.min(22, end - s);
    box(d, x, y - 0.13, s + length / 2, width, 0.18, length, PALETTE.dark, "glass");
    for (const side of [-1, 1])
      box(
        d,
        x + side * (width / 2 - 0.05),
        y + 0.025,
        s + length / 2,
        0.045,
        0.05,
        length,
        c,
        "light",
      );
  }
}
export function energyCore(d, x, y, s, t, color = PALETTE.mint) {
  orb(d, x, y, s, 0.25, color, "core");
  ring(d, x, y, s, 0.62, PALETTE.metal, [t * 0.25, t * 0.4, 0], "ringMetal");
  ring(d, x, y, s, 0.51, color, [Math.PI / 2, t * 0.3, t * 0.2]);
  for (const side of [-1, 1]) {
    box(d, x + side * 0.39, y, s, 0.13, 0.7, 0.7, "#738796");
    box(d, x, y + side * 0.39, s, 0.7, 0.13, 0.7, "#536777");
  }
}
function ship(d, x, s, t, scale = 1) {
  box(d, x, 4, s, 10 * scale, 2.4 * scale, 12 * scale, PALETTE.metal);
  box(d, x, 5.3, s + 1, 4 * scale, 1.2 * scale, 5 * scale, "#c4d5df");
  for (const side of [-1, 1]) {
    box(d, x + side * 8 * scale, 4, s, 6 * scale, 0.25 * scale, 9 * scale, "#133251");
    for (let k = 0; k < 3; k++)
      box(
        d,
        x + side * 8 * scale,
        4.18,
        s - 3 * scale + k * 3 * scale,
        5.5 * scale,
        0.04,
        0.08,
        PALETTE.ice,
        "light",
      );
  }
  ring(d, x, 1.8, s - 5 * scale, 3.5 * scale, PALETTE.mint, [Math.PI / 2, 0, 0]);
}
export function drawWorld(r, d) {
  const behind = r.s - 45,
    front = r.s + 480;
  if (r.id === "slingshot") {
    for (let i = Math.max(0, r.orbitIndex - 1); i < r.orbitIndex + 5; i++) {
      const p = planet(r, i),
        color = ["#9aa4b8", "#c4a479", "#8796a9", "#b77350", "#8fa5a5"][i % 5];
      orb(d, p.x, -5, p.s, p.radius, color);
      ring(
        d,
        p.x,
        0,
        p.s,
        p.orbit,
        i === r.orbitIndex ? (launchWindow(r).ready ? PALETTE.mint : PALETTE.gold) : PALETTE.ice,
        [Math.PI / 2, 0, 0],
      );
      ring(d, p.x, -0.1, p.s, p.orbit + 1.2, "#405269", [Math.PI / 2, 0, 0]);
      if (i === r.orbitIndex) {
        const cue = launchWindow(r);
        for (let j = -3; j <= 3; j++) {
          const a = cue.angle + j * 0.075;
          orb(
            d,
            p.x + Math.cos(a) * p.orbit,
            0.2,
            p.s + Math.sin(a) * p.orbit,
            0.18,
            PALETTE.mint,
            "core",
          );
        }
      }
    }
    const p = planet(r, r.orbitIndex + 1);
    ring(d, p.x, 2, p.s, 2.5, PALETTE.mint);
    return;
  }
  if (r.id === "salvage") {
    for (const c of cores(r).filter(
      (c) => !r.collected.includes(c.id) && c.s > behind && c.s < front,
    ))
      energyCore(d, c.x, 1, c.s, r.time);
    for (const c of r.dropped) energyCore(d, c.x, 0.3, c.s, r.time, PALETTE.gold);
    for (const q of rocks(r)) orb(d, q.x, 0, q.s, 2.2, "#6f7786");
    const target = dock(r, r.dockIndex);
    ship(d, target.x, target.s, r.time);
    ship(d, dock(r, r.dockIndex + 1).x, dock(r, r.dockIndex + 1).s, r.time);
    let previous = [r.x, 0.6, r.s - 2];
    for (const c of r.cargo) {
      energyCore(d, c.x, 0.6, c.s, r.time, c.stress > 0.5 ? PALETTE.red : PALETTE.mint);
      beam(d, previous, [c.x, 0.6, c.s], 0.025, c.stress > 0.5 ? PALETTE.red : PALETTE.ice);
      previous = [c.x, 0.6, c.s];
    }
    for (let s = Math.floor(behind / 30) * 30; s < front; s += 30) {
      ring(d, -12, -1, s, 0.23, PALETTE.ice, [Math.PI / 2, 0, 0]);
      ring(d, 12, -1, s, 0.23, PALETTE.ice, [Math.PI / 2, 0, 0]);
    }
    return;
  }
  if (r.id === "beatRoad") {
    for (const tile of r.tiles)
      road(d, Math.max(behind, tile.start), tile.end, 0, 12, PALETTE.violet);
    for (let i = r.note; i < r.note + 12; i++) {
      const n = note(r, i),
        s = r.s + (n.time - r.time) * 24;
      const x = n.lane * 3.4;
      ring(d, x, 1.2, s, 0.9, i === r.note ? PALETTE.mint : PALETTE.violet);
      orb(d, x, 1.2, s, 0.15, PALETTE.gold, "core");
      if (i === r.note) {
        const progress = clamp((n.time - r.time) / BEAT, 0, 1);
        ring(d, x, 1.2, s, 0.9 + progress * 1.5, PALETTE.gold);
      }
    }
    if (r.time - (r.weaveAt ?? -10) < 0.18)
      beam(d, [r.x, 0.4, r.s - 2], [r.x, 0.2, r.s + 22], 0.08, PALETTE.mint);
    for (let i = 0; i < 3; i++)
      box(d, (i - 1) * 3.4, -0.4, r.s + 200, 0.03, 0.03, 500, "#17223c", "light");
    return;
  }
  if (r.id === "timeEcho") {
    road(d, -25, ECHO_LENGTH + 30, 0, 14, PALETTE.ice);
    for (const x of [-2, 2]) box(d, x, 0.025, 180, 0.025, 0.025, 410, "#58778d", "light");
    for (const g of switches(r)) {
      const lane = r.lap === "record" ? g.lane : -g.lane;
      for (let s = g.s - 55; s <= g.s; s += 9)
        box(
          d,
          lane * 4,
          0.06,
          s,
          1.4,
          0.06,
          2.2,
          r.lap === "record" ? PALETTE.ice : PALETTE.gold,
          "light",
        );
      for (const side of [-1, 1]) {
        box(
          d,
          side * 4,
          0.04,
          g.s,
          3.1,
          0.08,
          8,
          side === g.lane ? PALETTE.ice : PALETTE.gold,
          "light",
        );
      }
      if (r.lap === "echo") {
        box(
          d,
          0,
          r.opened[g.index] ? 6 : 1.2,
          g.s + 15,
          13,
          0.4,
          1,
          r.opened[g.index] ? PALETTE.mint : PALETTE.red,
          "light",
        );
        for (const side of [-1, 1])
          box(d, side * 6.6, 2.6, g.s + 15, 0.35, 5.2, 0.5, PALETTE.metal);
      }
    }
    ring(d, 0, 3, 359, 5, PALETTE.violet);
    ring(d, 0, 3, -7, 5, PALETTE.ice);
    for (let i = 5; i < r.record.length; i += 5) {
      const a = r.record[i - 5],
        b = r.record[i];
      beam(d, [a.x, 0.06, a.s], [b.x, 0.06, b.s], 0.018, PALETTE.ice);
    }
    return;
  }
  if (r.id === "twinResonance") {
    const positions = pairPositions(r);
    for (const p of positions) {
      beam(d, [p.x, p.y, r.s - 45], [p.x, p.y, r.s + 260], 0.025, PALETTE.ice);
    }
    beam(
      d,
      [positions[0].x, positions[0].y, r.s],
      [positions[1].x, positions[1].y, r.s],
      0.045,
      r.input.suction ? PALETTE.mint : r.input.jump ? PALETTE.pink : PALETTE.ice,
    );
    for (let k = r.gate; k < r.gate + 3; k++) {
      const g = pairGate(r, k),
        c = k === r.gate && pairFits(r, g) ? PALETTE.mint : PALETTE.gold;
      if (g.type === "pinch") {
        ring(d, 0, 6, g.s, 3.9, c);
        for (const side of [-1, 1]) box(d, side * 7, 6, g.s, 6, 16, 0.5, PALETTE.dark, "glass");
      }
      if (g.type === "spread") {
        orb(d, 0, 6, g.s, 3.2, PALETTE.metal);
        ring(d, 0, 6, g.s, 6.6, c);
      }
      if (g.type === "horizontal") {
        for (const side of [-1, 1]) box(d, 0, 6 + side * 6.2, g.s, 17, 5, 0.6, PALETTE.metal);
        for (const y of [2.5, 9.5]) box(d, 0, y, g.s, 17, 0.06, 0.6, c, "light");
      }
      if (g.type === "vertical") {
        for (const side of [-1, 1]) box(d, side * 6.2, 6, g.s, 5, 17, 0.6, PALETTE.metal);
        for (const x of [-3.5, 3.5]) box(d, x, 6, g.s, 0.06, 17, 0.6, c, "light");
      }
    }
    return;
  }
  if (r.id === "leviathanEscape") {
    const first = Math.max(0, Math.floor((behind - 170) / 185));
    for (let s = Math.floor(behind / 8) * 8; s < front; s += 8) {
      for (let lane = -1; lane <= 1; lane++) {
        const p = platformAt(r, s + 4, lane * 5.5),
          g = p.section,
          destructed = r.s > g.start - 18;
        if (p.exists || !destructed) {
          road(
            d,
            s,
            s + 8,
            lane * 5.5,
            5,
            !p.exists
              ? PALETTE.red
              : lane === g.safe && s > g.start - 100 && s < g.end
                ? PALETTE.mint
                : PALETTE.ice,
            p.exists ? p.y : 0,
          );
        } else if (s < r.s + 15 && s > r.s - 65) {
          const age = Math.max(0.1, (r.s + 18 - s) / 25);
          box(
            d,
            lane * 5.5 + Math.sin(s) * age,
            -2 - age * age * 5,
            s + 4,
            4.7,
            0.15,
            6,
            PALETTE.metal,
          );
        }
      }
    }
    for (let i = first; i < first + 4; i++) {
      const g = cutSection(r, i);
      for (let s = g.start - 110; s < g.start - 10; s += 12)
        box(d, g.safe * 5.5, 0.05, s, 1.5, 0.05, 2.2, PALETTE.mint, "light");
      if (g.end + 30 > r.s) energyCore(d, g.safe * 5.5, 1.2, g.end + 30, r.time);
    }
    const g = nextCut(r),
      strike = clamp((r.s - (g.start - 110)) / 90, 0, 1);
    box(d, 0, 20, r.s + 18, 38, 7, 95, "#293847");
    for (const side of [-1, 1]) {
      box(d, side * 16, 15, r.s + 25, 5, 8, 108, PALETTE.metal);
      for (let k = 0; k < 4; k++)
        box(d, side * 14.8, 10.8, r.s - 10 + k * 19, 0.15, 0.2, 12, PALETTE.red, "light");
    }
    for (let lane = -1; lane <= 1; lane++)
      if (lane !== g.safe) {
        beam(
          d,
          [lane * 5.5, 16, g.start - 6],
          [lane * 5.5, 8 - strike * 2, g.start - 6],
          0.32,
          PALETTE.metal,
        );
        if (r.s < g.start)
          beam(
            d,
            [lane * 5.5, 7 - strike * 2, g.start - 6],
            [lane * 5.5, 0.1, g.start - 6],
            0.04,
            PALETTE.red,
          );
      }
    ring(d, 0, 13, r.s - r.chase - 18, 14, PALETTE.red);
    orb(d, 0, 13, r.s - r.chase - 24, 13, "#2d3a49");
    ring(d, 0, 4, r.finishAt, 8, PALETTE.mint);
    ring(d, 0, 4, r.finishAt + 2, 8.4, PALETTE.ice);
    return;
  }
}
