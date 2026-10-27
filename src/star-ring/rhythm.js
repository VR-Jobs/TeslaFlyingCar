import { rainbowMultiplier } from "./rainbow-rules.js";
export function rhythmState(run) {
  return (run.rhythm ||= {
    step: 0,
    until: 0,
    charge: 0,
    lastCharge: -99,
    lastScored: -99,
    chains: 0,
    streak: 0,
    layerUntil: 0,
    lastLayer: -99,
    layerNote: 0,
    offset: 0,
    label: "",
  });
}
export function stepRhythm(run, beat, events, dt, offset = 0) {
  const r = rhythmState(run),
    out = [];
  r.offset = offset;
  if (run.phase !== "running" || run.tutorial?.active) {
    r.step = 0;
    r.charge = 0;
    return out;
  }
  if (r.step && run.time > r.until) {
    r.step = 0;
    r.label = "";
  }
  if (!beat || !Number.isFinite(beat.since) || beat.period <= 0) return out;
  const phase = (((beat.since - offset) % beat.period) + beat.period) % beat.period,
    close = Math.min(phase, beat.period - phase) <= 0.105;
  r.charge = run.input.suction && run.attached ? r.charge + dt : 0;
  if (!r.step && r.charge >= 0.25 && close && run.time - r.lastCharge > beat.period * 0.6) {
    r.step = 1;
    r.until = run.time + 8 * beat.period;
    r.lastCharge = run.time;
    r.label = "蓄力已合拍 · 下一拍弹射";
    out.push({ type: "rhythmCharge" });
  }
  for (const e of events) {
    if (e.practice || !["jump", "land"].includes(e.type)) continue;
    if (close && run.time - r.lastScored > 0.12) {
      const points = 30 * rainbowMultiplier(run);
      run.beatHits++;
      run.score += points;
      r.lastScored = run.time;
      r.streak++;
      out.push({ type: "rhythmHit", action: e.type, points });
      if (e.type === "jump" && r.step === 1) {
        r.step = 2;
        r.until = run.time + 12 * beat.period;
        r.label = "弹射合拍 · 平稳接轨";
      } else if (e.type === "land" && r.step === 2) {
        const bonus = 120 * rainbowMultiplier(run);
        run.score += bonus;
        r.chains++;
        r.step = 0;
        r.layerUntil = run.time + 12 * beat.period;
        r.label = "节奏三连 +" + bonus;
        out.push({ type: "rhythmComplete", points: bonus });
      }
    } else {
      r.streak = 0;
      if (e.type === "land") {
        r.step = 0;
        r.label = "";
      }
    }
  }
  if (run.time < r.layerUntil && close && run.time - r.lastLayer > beat.period * 0.65) {
    r.lastLayer = run.time;
    out.push({ type: "rhythmLayer", note: r.layerNote++ % 4 });
  }
  return out;
}
export function rhythmStatus(run) {
  const r = run?.rhythm;
  return {
    step: r?.step || 0,
    chains: r?.chains || 0,
    streak: r?.streak || 0,
    layer: !!r && run.time < r.layerUntil,
    label: r?.label || "",
  };
}
