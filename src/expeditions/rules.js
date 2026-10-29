import { slingshot } from "./slingshot.js";
import { salvage } from "./salvage.js";
import { beatRoad } from "./beat-road.js";
import { timeEcho } from "./time-echo.js";
import { twinResonance } from "./twin-resonance.js";
import { leviathanEscape } from "./leviathan-escape.js";
import { clamp } from "./core.js";
export const MODES = { slingshot, salvage, beatRoad, timeEcho, twinResonance, leviathanEscape };
export function createExpedition(id, seed = 1) {
  if (!MODES[id]) throw new Error("Unknown expedition " + id);
  return MODES[id].create(seed >>> 0);
}
export function commandExpedition(r, action, down = true) {
  if (r.phase !== "running" || !(action in r.input)) return;
  const was = r.input[action];
  r.input[action] = down;
  if (was !== down) MODES[r.id].press?.(r, action, down);
}
export function stepExpedition(r, dt) {
  MODES[r.id].step(r, clamp(dt, 0, 1 / 30));
  if (r.endless && r.metric >= r.goal && r.id !== "leviathanEscape") {
    r.goal += { slingshot: 6, salvage: 12, beatRoad: 36, timeEcho: 3, twinResonance: 12 }[r.id];
  }
}
export function pilotExpedition(r) {
  MODES[r.id].pilot(r);
}
export function continueExpedition(r) {
  if (r.phase !== "finished") return;
  r.phase = "running";
  r.endless = true;
  r.health = Math.max(2, r.health);
  r.energy = Math.max(70, r.energy);
  r.goal += {
    slingshot: 6,
    salvage: 12,
    beatRoad: 36,
    timeEcho: 3,
    twinResonance: 12,
    leviathanEscape: 0,
  }[r.id];
  if (r.id === "timeEcho") {
    r.s = 0;
    r.x = 0;
    r.lap = "record";
    r.lapTime = 0;
    r.record = [];
    r.switches = [false, false];
    r.opened = [false, false];
    r.sampleAt = 0;
  }
  r.events = [];
}

export function abortExpedition(r) {
  if (["running", "dying"].includes(r.phase)) {
    r.phase = "ended";
    r.events = [];
  }
}

export function restoreExpedition(checkpoint, current) {
  const restored = structuredClone(checkpoint);
  if (current.endless) {
    restored.endless = true;
    restored.goal = Math.max(restored.goal, current.goal);
    if (restored.id === "leviathanEscape")
      restored.finishAt = Math.max(restored.finishAt, current.finishAt);
  }
  return restored;
}
