export function createAdaptiveQuality() {
  let level = 2,
    base = 2,
    frames = 0,
    slow = 0,
    fast = 0,
    cooldown = 0,
    ema = 16.7,
    peak = 0,
    p95 = 16.7,
    changes = 0,
    samples = [];
  return {
    reset(value = 2) {
      base = level = Math.max(0, Math.min(2, value));
      frames = slow = fast = cooldown = 0;
      ema = 16.7;
      samples = [];
      peak = 0;
      p95 = 16.7;
      changes = 0;
    },
    sample(ms, enabled = true, ceiling = 2) {
      ceiling = Math.max(0, Math.min(2, ceiling));
      if (ceiling !== base) {
        base = ceiling;
        level = Math.min(level, base);
      }
      if (!enabled) {
        level = base;
        slow = fast = 0;
        return;
      }
      if (!Number.isFinite(ms) || ms < 1 || ms > 250) return;
      frames++;
      if (frames < 90) return;
      ema += (ms - ema) * 0.045;
      peak = Math.max(peak, ms);
      samples.push(ms);
      if (samples.length === 120) {
        p95 = [...samples].sort((a, b) => a - b)[113];
        samples = [];
      }
      cooldown = Math.max(0, cooldown - ms / 1000);
      slow = ema > 23 ? slow + ms / 1000 : Math.max(0, slow - ms / 1000);
      fast = ema < 18.5 ? fast + ms / 1000 : 0;
      if (!cooldown && slow > 1.8 && level > 0) {
        level--;
        changes++;
        slow = fast = 0;
        cooldown = 6;
      } else if (!cooldown && fast > 14 && level < base) {
        level++;
        changes++;
        fast = 0;
        cooldown = 10;
      }
    },
    status: () => ({
      level,
      scale: [0.68, 0.84, 1][level],
      particles: [0.35, 0.65, 1][level],
      frames,
      emaMs: ema,
      p95Ms: p95,
      peakMs: peak,
      changes,
    }),
  };
}
