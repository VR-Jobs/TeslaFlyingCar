export function installShowroomAudio({ sound, settings, isHome }) {
  let owned = false,
    meter = null,
    samples = null,
    rms = 0,
    peakRms = 0,
    plays = 0,
    landings = 0,
    profile = { phase: "idle", hover: 0, thrust: 0, spin: 0 };
  const tapped = new Set();
  function stop() {
    if (!owned || !sound.ctx) return;
    const now = sound.ctx.currentTime;
    for (const gain of [sound.hover?.g, sound.thrust?.g, sound.thrust?.og])
      gain?.gain.setTargetAtTime(0, now, 0.06);
    if (sound.hover) sound.hover.level = 0;
    owned = false;
  }
  function unlock() {
    if (!isHome() || !sound) return;
    sound.init();
    sound.setEnabled(settings.sound);
    sound.setMuted(settings.muted);
    if (sound.ctx?.state === "suspended") sound.ctx.resume().catch(() => {});
  }
  for (const event of ["pointerdown", "keydown"])
    addEventListener(
      event,
      (e) => {
        if (e.isTrusted && !e.target.closest?.("#home-sound") && isHome()) unlock();
      },
      true,
    );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  addEventListener("blur", stop);
  new MutationObserver(() => {
    if (!isHome() || settings.muted || !settings.sound) stop();
  }).observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class", "open", "hidden"],
  });
  return {
    unlock,
    update(input) {
      profile =
        input && typeof input === "object"
          ? input
          : { phase: "idle", hover: 0, thrust: 0, spin: 0 };
      const level = Math.max(profile.hover, profile.thrust);
      if (!isHome() || document.hidden || settings.muted || !settings.sound || !sound.ctx) {
        stop();
        return;
      }
      if (level <= 0) {
        stop();
        return;
      }
      if (!owned) plays++;
      owned = true;
      sound.setHover(profile.hover);
      sound.setThrust(profile.thrust);
      sound.hover?.f.frequency.setTargetAtTime(
        900 + profile.hover * 500 + profile.spin * 260,
        sound.t,
        0.1,
      );
      sound.thrust?.o.frequency.setTargetAtTime(
        38 + profile.thrust * 30 + profile.spin * 14,
        sound.t,
        0.12,
      );
      if (!meter) {
        meter = sound.ctx.createAnalyser();
        meter.fftSize = 256;
        samples = new Float32Array(meter.fftSize);
      }
      for (const gain of [sound.hover?.g, sound.thrust?.g, sound.thrust?.og]) {
        if (gain && !tapped.has(gain)) {
          gain.connect(meter);
          tapped.add(gain);
        }
      }
    },
    stop,
    land() {
      if (
        !isHome() ||
        document.hidden ||
        settings.muted ||
        !settings.sound ||
        sound.ctx?.state !== "running"
      )
        return;
      sound.noise({
        dur: 0.18,
        type: "lowpass",
        freq: 180,
        freqEnd: 65,
        gain: 0.13,
        attack: 0.012,
      });
      sound.tone({ freq: 68, freqEnd: 34, dur: 0.18, type: "sine", gain: 0.09, attack: 0.01 });
      sound.noise({
        dur: 0.38,
        type: "bandpass",
        freq: 850,
        freqEnd: 420,
        gain: 0.07,
        attack: 0.035,
      });
      landings++;
    },
    status() {
      if (meter) {
        meter.getFloatTimeDomainData(samples);
        rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
        if (!settings.muted && settings.sound && sound.ctx.state === "running")
          peakRms = Math.max(peakRms, rms);
      }
      return {
        state: sound.ctx?.state || "locked",
        muted: settings.muted || !settings.sound,
        active: owned,
        rms,
        peakRms,
        plays,
        landings,
        profile,
        masterGain: sound.master?.gain.value || 0,
        hoverGain: sound.hover?.g.gain.value || 0,
        thrustGain: sound.thrust?.g.gain.value || 0,
      };
    },
  };
}
