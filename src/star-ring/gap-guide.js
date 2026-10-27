import { clamp } from "./course.js";

// Recommendation assumes a short 0.35 s jet, then regripping at the far lip.
// All current gaps have flat approaches. A curved future gap gets warning only.
export function launchWindow(run, course, gap) {
  const action = gap.auto ? "auto" : run.input.suction ? "release" : "jump";
  const f = course.frame(gap.start - 2);
  const flat = f.up[1] > 0.99 && Math.abs(f.t[1]) < 0.01 && f.curvature < 0.001;
  const impulse = action === "release" ? 4.5 : 8;
  const jetSeconds = gap.auto ? 0 : 0.35;
  const velocity = impulse + 7 * jetSeconds;
  const height = 0.08 + impulse * jetSeconds + 3.5 * jetSeconds * jetSeconds;
  const duration = jetSeconds + (velocity + Math.sqrt(velocity * velocity + 32 * height)) / 16;
  const clearance = run.speed * duration - (gap.end - gap.start);
  const fuel =
    (gap.auto ? 0 : action === "release" ? 20 : 26) + (run.input.boost ? 13 * duration : 0);
  const lowSpeed = gap.auto ? clearance < 7.5 : clearance < 10;
  const reason = !flat ? "curve" : lowSpeed ? "speed" : run.pressure < fuel ? "air" : null;
  const center = gap.auto ? 5 : clamp(clearance * 0.56, 6, 36);
  const half = gap.auto ? 1.5 : Math.min(run.speed * 0.12, Math.max(2, clearance * 0.25));
  return {
    action,
    reason,
    eligible: !reason,
    low: Math.max(3, center - half),
    high: center + half,
    jetSeconds,
  };
}

export function describeGap(run, course) {
  if (!run || run.phase !== "running" || run.tutorial?.active) return null;
  const index = course.gaps.findIndex((g) => run.s < g.end + 8);
  if (index < 0) return null;
  const gap = course.gaps[index],
    distance = gap.start - run.s;
  const warningDistance = clamp(run.speed * 2.6, 55, 140);
  if (distance > warningDistance || (run.attached && distance <= 0)) return null;
  const plan = launchWindow(run, course, gap);
  const flight = !run.attached;
  const ready = !flight && plan.eligible && distance <= plan.high && distance >= plan.low;
  const state = flight
    ? "flight"
    : plan.reason
      ? "blocked"
      : ready
        ? "ready"
        : distance < plan.low
          ? "late"
          : "warning";
  const label = flight
    ? "越过断口再吸附"
    : plan.reason === "speed"
      ? "断轨 · 先加速"
      : plan.reason === "air"
        ? "断轨 · 需要补气"
        : ready
          ? gap.auto
            ? "自动弹射"
            : plan.action === "release"
              ? "松 E · 短喷"
              : "空格起跳 · 短喷"
          : state === "late"
            ? "立即起跳"
            : "断轨将至";
  return {
    ...plan,
    index,
    start: gap.start,
    end: gap.end,
    distance,
    eta: Math.max(0, distance / Math.max(1, run.speed)),
    ready,
    flight,
    state,
    label,
    strength: clamp(1 - distance / warningDistance, 0, 1),
    zoneStart: gap.start - plan.high,
    zoneEnd: gap.start - plan.low,
  };
}

export function createGapGuide() {
  let current = -1,
    level = -1,
    announced = false,
    lastS = 0,
    tail = 0;
  const counts = { warnings: 0, launches: 0, tails: 0 };
  return {
    reset() {
      current = -1;
      level = -1;
      announced = false;
      lastS = 0;
      tail = 0;
      counts.warnings = counts.launches = counts.tails = 0;
    },
    suspend() {
      tail = 0;
    },
    update(run, course, dt) {
      const cue = describeGap(run, course),
        events = [];
      if (run.s < lastS - 4) {
        current = -1;
        announced = false;
        level = -1;
        tail = 0;
      }
      lastS = run.s;
      if (run.phase !== "running" || run.tutorial?.active) {
        tail = 0;
        return { cue, events };
      }
      if (tail > 0) {
        tail -= dt;
        if (tail <= 0) {
          events.push({ type: "gapLaunchTail" });
          counts.tails++;
        }
      }
      if (!cue || cue.flight) return { cue, events };
      if (cue.index !== current) {
        current = cue.index;
        level = -1;
        announced = false;
        tail = 0;
      }
      if (cue.ready && !announced) {
        announced = true;
        tail = 0.105;
        counts.launches++;
        events.push({ type: "gapLaunch" });
      } else if (!announced && !cue.ready) {
        const next = cue.eta <= 0.8 ? 2 : cue.eta <= 1.5 ? 1 : 0;
        if (next > level) {
          level = next;
          counts.warnings++;
          events.push({ type: "gapWarning", level: next });
        }
      }
      return { cue, events };
    },
    status: () => ({ ...counts, pendingTail: tail > 0 }),
  };
}

export function playGapTone(sound, event) {
  if (event.type === "gapWarning")
    sound.tone({
      freq: 280 + event.level * 65,
      freqEnd: 240 + event.level * 65,
      dur: 0.075,
      gain: 0.09,
    });
  if (event.type === "gapLaunch") sound.tone({ freq: 740, freqEnd: 820, dur: 0.07, gain: 0.12 });
  if (event.type === "gapLaunchTail")
    sound.tone({ freq: 1100, freqEnd: 1280, dur: 0.09, gain: 0.1 });
}
