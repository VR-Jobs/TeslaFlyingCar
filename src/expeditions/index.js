import { CATALOG, EXPEDITIONS } from "./catalog.js";
import {
  MODES,
  createExpedition,
  commandExpedition,
  stepExpedition,
  pilotExpedition,
  continueExpedition,
  abortExpedition,
  restoreExpedition,
} from "./rules.js";
import { createExpeditionView } from "./view.js";
import { createExpeditionUI } from "./ui.js";
import { finiteState } from "./core.js";

export function installExpeditions(context, comfort, starRing, gravityFlip) {
  const { renderer, sound, settings, input, backend } = context;
  const qa = new URLSearchParams(location.search).has("expeditionQA");
  backend.state.driving.expeditions ||= {};
  for (const mode of EXPEDITIONS) {
    const p = (backend.state.driving.expeditions[mode.id] ||= {});
    for (const field of ["bestScore", "bestMetric", "runs", "wins"])
      if (!Number.isFinite(p[field])) p[field] = 0;
    p.instructionsSeen = !!p.instructionsSeen;
  }
  let r = null,
    view = null,
    active = false,
    paused = false,
    instructions = false,
    started = false,
    settled = false,
    checkpoint = null,
    launching = false,
    accumulator = 0,
    frameTime = 0,
    lastFrame = 0,
    oldTone,
    oldExposure,
    frozen = false,
    pilot = false,
    qaOutput = null;
  const profile = () => backend.state.driving.expeditions[r?.id] || {};
  const release = () => {
    if (r) for (const name of Object.keys(r.input)) r.input[name] = false;
  };
  function bank() {
    if (settled || !r || !started) return;
    settled = true;
    if (qa) return;
    const p = profile();
    p.bestScore = Math.max(p.bestScore, Math.floor(r.score));
    p.bestMetric = Math.max(p.bestMetric, r.metric);
    p.runs++;
    if (r.phase === "finished") p.wins++;
    backend.persist();
  }
  function startAudio() {
    sound.init();
    sound.setPaused(false);
    sound.stopLoops();
    sound.setStar(false);
    sound.setEnabled(settings.sound);
    sound.setMusic(r.id === "beatRoad" ? false : settings.music);
    sound.setMuted(settings.muted);
    sound.startMusic();
    sound.setMusicHype(false, 128);
  }
  const actions = {
    isMuted: () => settings.muted,
    play() {
      instructions = false;
      paused = false;
      started = true;
      if (r.id === "slingshot") r.grace = Math.max(0.8, r.grace);
      if (!qa) {
        profile().instructionsSeen = true;
        backend.persist();
      }
      sound.setPaused(false);
      ui.root.focus();
    },
    help() {
      if (!active) return;
      instructions = true;
      paused = true;
      release();
      sound.setPaused(true);
    },
    pause() {
      if (!active || ["dead", "finished", "ended"].includes(r.phase)) return;
      paused = !paused;
      release();
      sound.setPaused(paused);
      if (!paused) {
        instructions = false;
        if (r.id === "slingshot") r.grace = 0.8;
        ui.root.focus();
      }
    },
    mute() {
      settings.muted = !settings.muted;
      sound.setMuted(settings.muted);
      context.saveSettings();
    },
    retry() {
      manager.launch(r.id, { seed: r.seed, instructions: false });
    },
    checkpoint() {
      if (!checkpoint) {
        actions.retry();
        return;
      }
      const score = r.score;
      r = restoreExpedition(checkpoint, r);
      r.phase = "running";
      r.death = 0;
      r.reason = "";
      r.energy = Math.max(65, r.energy);
      r.health = Math.max(2, r.health);
      r.score = Math.max(0, Math.min(score, r.score) - 80);
      r.invulnerable = 1;
      r.grace = 1;
      release();
      paused = instructions = false;
      settled = false;
      accumulator = 0;
      startAudio();
      view.reset();
      ui.root.focus();
    },
    continue() {
      continueExpedition(r);
      settled = false;
      paused = instructions = false;
      release();
      startAudio();
      ui.root.focus();
    },
    menu() {
      bank();
      manager.stop();
    },
    end() {
      abortExpedition(r);
      bank();
      paused = instructions = false;
      release();
      sound.stopLoops();
      sound.setPaused(false);
    },
    hold(action, down) {
      if (active && !paused && !instructions) commandExpedition(r, action, down);
    },
  };
  const ui = createExpeditionUI(actions);
  function audio(events) {
    for (const e of events) {
      if (e.type === "launchReady") sound.tone({ freq: 880, freqEnd: 1320, dur: 0.1, gain: 0.035 });
      if (e.type === "jump") sound.jump();
      if (e.type === "land") sound.land(0.2 + (e.impact || 0.3) * 0.6);
      if (e.type === "success") sound.pickup(r.combo % 5);
      if (e.type === "pickup") sound.tone({ freq: 480, freqEnd: 1050, dur: 0.13, gain: 0.035 });
      if (e.type === "deliver") sound.tone({ freq: 720, freqEnd: 1440, dur: 0.14, gain: 0.035 });
      if (e.type === "hit" || e.type === "cargoBreak")
        sound.tone({ freq: 220, freqEnd: 90, dur: 0.2, gain: 0.045 });
      if (e.type === "weave")
        sound.tone({ freq: e.perfect ? 1320 : 880, freqEnd: 1760, dur: 0.06, gain: 0.025 });
      if (e.type === "offbeat" || e.type === "miss")
        sound.tone({ freq: 180, freqEnd: 120, dur: 0.05, gain: 0.018 });
      if (e.type === "beat" && settings.music) {
        const chord = [261.63, 329.63, 392, 523.25],
          frequency = chord[Math.floor(e.index / 8) % 4];
        sound.tone({
          freq: frequency * (e.index % 4 === 0 ? 1 : 2),
          dur: 0.13,
          gain: 0.018 * comfort.preferences.musicVolume,
        });
      }
      if (e.type === "echoReady" || e.type === "gate") sound.perfect();
      if (e.type === "win") sound.perfect();
      if (e.type === "death") {
        sound.stopLoops();
        sound.crash?.();
        sound.setMusic(false);
      }
    }
    if (paused || instructions || r.phase !== "running") {
      sound.setHover(0);
      sound.setThrust(0);
      return;
    }
    sound.setHover(r.input.suction && r.energy > 0 ? 0.27 : r.jet > 0 ? 0.65 : 0);
    sound.setThrust((r.input.boost || r.jet > 0) && r.energy > 0 ? 0.6 : 0);
  }
  const manager = {
    async launch(id, { seed, instructions: showInstructions } = {}) {
      if (launching) return;
      if (!CATALOG.has(id)) throw new Error("Unknown expedition");
      launching = true;
      if (active) manager.stop();
      starRing.stop();
      gravityFlip.stop();
      ui.preparing(true, id);
      try {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        r = createExpedition(id, seed ?? (Date.now() ^ Math.floor(performance.now() * 1000)) >>> 0);
        if (id === "beatRoad") r.offset = comfort.preferences.rhythmOffset || 0;
        view ||= createExpeditionView(context, comfort.preferences);
        view.reset();
        await view.warm(r);
        context.menu();
        oldTone = renderer.toneMapping;
        oldExposure = renderer.toneMappingExposure;
        active = true;
        paused = false;
        started = false;
        settled = false;
        checkpoint = null;
        accumulator = frameTime = lastFrame = 0;
        frozen = pilot = false;
        instructions = showInstructions ?? !profile().instructionsSeen;
        input.enabled = false;
        input.queue.length = 0;
        context.game.player.releaseControls();
        document.body.classList.add("expedition-active");
        startAudio();
        ui.show(true);
        if (!instructions) started = true;
        ui.update(r, { paused, instructions, hasCheckpoint: false, profile: profile() });
      } finally {
        ui.preparing(false, id);
        launching = false;
      }
    },
    stop() {
      if (!active) return;
      active = false;
      release();
      sound.stopLoops();
      sound.setPaused(false);
      sound.setStar(false);
      sound.setMusic(settings.music);
      sound.startMusic();
      input.enabled = true;
      input.queue.length = 0;
      ui.show(false);
      document.body.classList.remove("expedition-active");
      renderer.toneMapping = oldTone;
      renderer.toneMappingExposure = oldExposure;
      view.suspend();
      context.menu();
      context.showroom.presentation.entry.arm();
    },
    active: () => active,
    frame(dt, timestamp = performance.now()) {
      if (!active) return;
      frameTime += dt;
      const interval = 1000 / (paused || instructions || frozen ? 30 : 60);
      if (lastFrame && timestamp - lastFrame + 0.1 < interval) return;
      lastFrame =
        !lastFrame || timestamp - lastFrame > 1000
          ? timestamp
          : lastFrame +
            Math.max(1, Math.floor((timestamp - lastFrame + 0.1) / interval)) * interval;
      dt = Math.min(0.05, frameTime);
      frameTime = 0;
      const events = [...r.events];
      r.events = [];
      if (!paused && !instructions && !frozen && !["dead", "finished", "ended"].includes(r.phase)) {
        accumulator += dt;
        while (accumulator >= 1 / 60) {
          if (pilot) pilotExpedition(r);
          stepExpedition(r, 1 / 60);
          if (r.phase === "running" && r.events.some((e) => e.type === "checkpoint")) {
            checkpoint = structuredClone(r);
            checkpoint.events = [];
          }
          events.push(...r.events);
          r.events = [];
          accumulator -= 1 / 60;
        }
      }
      r.events = events;
      view.update(r, paused || instructions || frozen ? 0 : dt);
      audio(events);
      if (["dead", "finished", "ended"].includes(r.phase)) bank();
      ui.update(r, { paused, instructions, hasCheckpoint: !!checkpoint, profile: profile() });
      view.render(dt);
      r.events = [];
      if (qaOutput) qaOutput.dataset.state = JSON.stringify(manager.status());
    },
    status: () => ({
      active,
      id: r?.id || null,
      phase: r?.phase || "idle",
      paused,
      instructions,
      started,
      s: r?.s,
      x: r?.x,
      y: r?.y,
      energy: r?.energy,
      health: r?.health,
      metric: r?.metric,
      goal: r?.goal,
      score: r?.score,
      time: r?.time,
      reason: r?.reason,
      endless: r?.endless,
      cargo: r?.cargo?.length,
      recordSamples: r?.record?.length,
      echoLap: r?.lap,
      orbitIndex: r?.orbitIndex,
      hasCheckpoint: !!checkpoint,
      profile: r ? profile() : null,
      view: view?.status(),
    }),
  };
  function key(event, down) {
    if (!active || event.target.closest?.("input,select,textarea")) return;
    if (event.target.closest?.("button") && ["Space", "Enter"].includes(event.code)) return;
    const binding = Object.entries(comfort.preferences.keys).find(
      ([name, key]) => ["left", "right", "jump", "boost"].includes(name) && key === event.code,
    )?.[0];
    const code = binding
      ? { left: "ArrowLeft", right: "ArrowRight", jump: "Space", boost: "ShiftLeft" }[binding]
      : event.code;
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "KeyA",
        "KeyD",
        "KeyW",
        "KeyE",
        "Space",
        "ShiftLeft",
        "ShiftRight",
        "KeyP",
        "Escape",
        "KeyM",
        "KeyR",
        "KeyH",
        "Enter",
      ].includes(code)
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;
    if (down && code === "KeyM") {
      actions.mute();
      return;
    }
    if (down && code === "KeyH") {
      actions.help();
      return;
    }
    if (down && ["KeyP", "Escape"].includes(code)) {
      if (instructions) {
        actions.play();
        return;
      }
      actions.pause();
      return;
    }
    if (down && code === "KeyR" && !instructions) {
      actions.checkpoint();
      return;
    }
    if (down && code === "Enter" && (paused || instructions)) {
      actions.play();
      return;
    }
    if (paused || instructions) return;
    if (
      down &&
      ["dead", "finished", "ended"].includes(r.phase) &&
      ["Space", "Enter"].includes(code)
    ) {
      actions.retry();
      return;
    }
    const action = ["ArrowLeft", "KeyA"].includes(code)
      ? "left"
      : ["ArrowRight", "KeyD"].includes(code)
        ? "right"
        : code === "KeyE"
          ? "suction"
          : code.startsWith("Shift")
            ? "boost"
            : "jump";
    commandExpedition(r, action, down);
  }
  addEventListener("keydown", (e) => key(e, true), true);
  addEventListener("keyup", (e) => key(e, false), true);
  addEventListener("blur", () => {
    if (active && !paused && !instructions) actions.pause();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && active && !paused && !instructions) actions.pause();
  });
  context.installFrameOverride(manager);
  if (qa) {
    const dock = document.createElement("div");
    dock.id = "expedition-qa";
    dock.style.cssText =
      "position:fixed;bottom:0;left:0;z-index:220;display:flex;gap:4px;flex-wrap:wrap;max-width:98vw;padding:5px;background:#080d16ed;color:#fff;font:11px system-ui";
    const button = (label, fn) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = fn;
      dock.append(b);
      return b;
    };
    qaOutput = document.createElement("output");
    qaOutput.id = "expedition-qa-report";
    button("验证六种模式", async () => {
      const checks = [];
      for (const mode of EXPEDITIONS) {
        try {
          await manager.launch(mode.id, { seed: 11, instructions: false });
          frozen = true;
          for (let i = 0; i < 13000 && r.phase === "running"; i++) {
            pilotExpedition(r);
            stepExpedition(r, 1 / 60);
            r.events = [];
            if (i % 240 === 0) {
              view.update(r, 0.1);
              view.render(1 / 60);
              await new Promise((resolve) => setTimeout(resolve, 0));
            }
          }
          view.update(r, 0.1);
          view.render(1 / 60);
          ui.update(r, {
            paused: false,
            instructions: false,
            hasCheckpoint: false,
            profile: profile(),
          });
          const v = view.status();
          checks.push({
            id: mode.id,
            pass: r.phase === "finished" && finiteState(r) && v.batches.overflow === 0,
            phase: r.phase,
            metric: r.metric,
            goal: r.goal,
            time: r.time,
            batches: v.batches,
            nativeJets: v.nativeJets,
            secondCar: v.secondCar,
          });
        } catch (error) {
          checks.push({ id: mode.id, pass: false, error: String(error.stack) });
        }
        qaOutput.dataset.report = JSON.stringify({ checks });
        qaOutput.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
      }
    });
    for (const mode of EXPEDITIONS) {
      button("自动：" + mode.zh, async () => {
        await manager.launch(mode.id, { seed: 11, instructions: false });
        pilot = true;
      });
      button("预览：" + mode.zh, async () => {
        await manager.launch(mode.id, { seed: 11, instructions: false });
        frozen = true;
        const good = () =>
          mode.id === "slingshot"
            ? !r.orbiting && r.flight > 0.8
            : mode.id === "salvage"
              ? r.cargo.length >= 5 && 240 + r.dockIndex * 280 - r.s < 85
              : mode.id === "beatRoad"
                ? r.hits >= 10
                : mode.id === "timeEcho"
                  ? r.lap === "echo" && r.s > 92
                  : mode.id === "twinResonance"
                    ? r.s > 95
                    : r.s > 245;
        for (let i = 0; i < 13000 && r.phase === "running" && !good(); i++) {
          pilotExpedition(r);
          stepExpedition(r, 1 / 60);
          r.events = [];
        }
        for (let i = 0; i < 40; i++) view.update(r, 1 / 60);
        view.render(1 / 60);
        ui.update(r, {
          paused: false,
          instructions: false,
          hasCheckpoint: false,
          profile: profile(),
        });
        dock.style.display = "none";
      });
    }
    dock.append(qaOutput);
    document.body.append(dock);
  }
  return manager;
}
