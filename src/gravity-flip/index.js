import { createGravityCourse, FACE_UP, facePoint } from "./course.js";
import {
  createGravityRun,
  commandGravity,
  stepGravity,
  restartGravityCheckpoint,
  gravityCue,
  gravityPilot,
  selectGravityTarget,
} from "./rules.js";
import { createGravityView } from "./view.js";
import { createGravityUI } from "./ui.js";

export function installGravityFlip(context, comfort, starRing) {
  const { sound, renderer, input, settings, backend } = context;
  const qaMode = new URLSearchParams(location.search).has("gravityQA");
  const course = createGravityCourse(Date.now() >>> 0);
  let run = null,
    view = null,
    active = false,
    paused = false,
    accumulator = 0,
    settled = false,
    launching = false;
  let frozen = false,
    pilot = false,
    oldTone,
    oldExposure,
    warningTick = -1,
    lastCue = false,
    frameTime = 0,
    lastFrame = 0;
  backend.state.driving.gravityFlip ||= {
    bestScore: 0,
    bestDistance: 0,
    runs: 0,
    tutorialComplete: false,
  };
  const profile = () => backend.state.driving.gravityFlip;
  const release = () => {
    if (run) for (const key of Object.keys(run.input)) run.input[key] = false;
  };
  function saveResult() {
    if (settled || !run || run.tutorial) return;
    settled = true;
    if (qaMode) return;
    const record = profile();
    record.bestScore = Math.max(record.bestScore || 0, Math.floor(run.score));
    record.bestDistance = Math.max(record.bestDistance || 0, Math.floor(run.s));
    record.runs = (record.runs || 0) + 1;
    backend.persist();
  }
  const actions = {
    isMuted: () => settings.muted,
    pause() {
      if (!active || !["running", "dying"].includes(run.phase)) return;
      paused = !paused;
      release();
      sound.setPaused(paused);
      if (!paused) ui.root.focus();
    },
    resume() {
      paused = false;
      sound.setPaused(false);
      ui.root.focus();
    },
    restart() {
      manager.launch({ tutorial: false });
    },
    checkpoint() {
      if (!run || run.phase === "finished") return;
      restartGravityCheckpoint(run);
      settled = false;
      paused = false;
      accumulator = 0;
      sound.setPaused(false);
      sound.setMusic(settings.music);
      sound.startMusic();
      view.reset();
      ui.root.focus();
    },
    menu() {
      saveResult();
      manager.stop();
    },
    end() {
      run.phase = "finished";
      paused = false;
      release();
      saveResult();
      sound.stopLoops();
      sound.setPaused(false);
    },
    mute() {
      settings.muted = !settings.muted;
      sound.setMuted(settings.muted);
      context.saveSettings();
    },
    skip() {
      if (!run?.tutorial) return;
      run.tutorial = null;
      if (!qaMode) {
        profile().tutorialComplete = true;
        backend.persist();
      }
      ui.root.focus();
    },
    hold(action, down) {
      if (active && !paused) commandGravity(run, course, action, down);
    },
  };
  const ui = createGravityUI(actions);
  function audio(events) {
    for (const event of events) {
      if (event.type === "jump") sound.jump();
      if (event.type === "land") sound.land(0.2 + event.impact * 0.6);
      if (event.type === "impact") sound.land(0.75);
      if (event.type === "gate") sound.tone({ freq: 740, freqEnd: 1100, dur: 0.12, gain: 0.045 });
      if (event.type === "cell") sound.tone({ freq: 520, freqEnd: 1260, dur: 0.18, gain: 0.04 });
      if (event.type === "circuit") sound.perfect();
      if (event.type === "blocked") sound.tone({ freq: 180, freqEnd: 130, dur: 0.06, gain: 0.02 });
      if (event.type === "tutorialStep") sound.pickup(1);
      if (event.type === "tutorialComplete") {
        sound.perfect();
        if (!qaMode) {
          profile().tutorialComplete = true;
          backend.persist();
        }
      }
      if (event.type === "death") {
        sound.crash?.();
        sound.stopLoops();
        sound.setMusic(false);
      }
    }
    if (run.phase !== "running" || paused) {
      sound.setHover(0);
      sound.setThrust(0);
      return;
    }
    sound.setHover(
      run.pressure > 0
        ? run.attached
          ? run.input.suction
            ? 0.27
            : 0
          : run.jetTime > 0 || run.input.jump
            ? 0.75
            : run.input.suction
              ? 0.42
              : 0
        : 0,
    );
    sound.setThrust(run.input.boost && run.pressure > 0 ? 0.7 : 0);
    sound.hover?.f.frequency.setTargetAtTime(
      run.attached ? 580 : 1200 - Math.min(1, run.airTime) * 430,
      sound.t,
      0.08,
    );
    const tick = Math.floor(run.warning * 5);
    if (tick > 0 && tick !== warningTick)
      sound.tone({ freq: 180 + tick * 38, freqEnd: 170, dur: 0.05, gain: 0.025 });
    warningTick = tick;
    const cue = gravityCue(run, course);
    if (cue.launch && !lastCue) sound.tone({ freq: 880, freqEnd: 1320, dur: 0.08, gain: 0.04 });
    lastCue = cue.launch;
  }
  const manager = {
    async launch({ tutorial, seed } = {}) {
      if (launching) return;
      launching = true;
      if (active) manager.stop();
      starRing.stop();
      ui.preparing(true);
      try {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        Object.assign(
          course,
          createGravityCourse(seed ?? (Date.now() ^ Math.floor(performance.now() * 1000)) >>> 0),
        );
        run = createGravityRun({ tutorial: tutorial ?? !profile().tutorialComplete });
        view ||= createGravityView(context, course, comfort.preferences);
        view.reset();
        view.update(run, 0);
        await view.warm();
        context.menu();
        oldTone = renderer.toneMapping;
        oldExposure = renderer.toneMappingExposure;
        active = true;
        paused = false;
        settled = false;
        accumulator = 0;
        frozen = false;
        pilot = false;
        warningTick = -1;
        lastCue = false;
        frameTime = 0;
        lastFrame = 0;
        input.enabled = false;
        input.queue.length = 0;
        context.game.player.releaseControls();
        document.body.classList.add("gravity-flip-active");
        sound.init();
        sound.setPaused(false);
        sound.setStar(false);
        sound.stopLoops();
        sound.setEnabled(settings.sound);
        sound.setMusic(settings.music);
        sound.setMuted(settings.muted);
        sound.startMusic();
        sound.setMusicHype(false, 128);
        ui.show(true);
        ui.update(run, course, paused, profile());
      } finally {
        ui.preparing(false);
        launching = false;
      }
    },
    stop() {
      if (!active) return;
      active = false;
      release();
      sound.stopLoops();
      sound.setPaused(false);
      sound.setMusic(settings.music);
      sound.startMusic();
      input.enabled = true;
      input.queue.length = 0;
      ui.show(false);
      document.body.classList.remove("gravity-flip-active");
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
      const interval = 1000 / (paused || frozen ? 30 : 60);
      if (lastFrame && timestamp - lastFrame + 0.1 < interval) return;
      lastFrame =
        !lastFrame || timestamp - lastFrame > 1000
          ? timestamp
          : lastFrame +
            Math.max(1, Math.floor((timestamp - lastFrame + 0.1) / interval)) * interval;
      dt = Math.min(0.05, frameTime);
      frameTime = 0;
      const events = [];
      if (!paused && !frozen && !["dead", "finished"].includes(run.phase)) {
        accumulator += Math.min(0.05, dt);
        while (accumulator >= 1 / 60) {
          if (pilot) gravityPilot(run, course);
          stepGravity(run, course, 1 / 60);
          events.push(...run.events);
          run.events = [];
          accumulator -= 1 / 60;
        }
      }
      run.events = events;
      view.update(run, paused || frozen ? 0 : dt);
      audio(events);
      run.events = [];
      if (run.phase === "dead") saveResult();
      ui.update(run, course, paused, profile());
      view.render(dt);
      if (qaOutput) qaOutput.dataset.state = JSON.stringify(manager.status());
    },
    status: () => ({
      active,
      paused,
      phase: run?.phase || "idle",
      tutorial: run?.tutorial,
      s: run?.s,
      face: run?.face,
      target: run?.target,
      attached: run?.attached,
      x: run?.x,
      y: run?.y,
      pressure: run?.pressure,
      gates: run?.gates,
      transfers: run?.transfers,
      combo: run?.combo,
      circuits: run?.circuits,
      warning: run?.warning,
      maxPenetration: run?.maxPenetration,
      course: course.status(),
      view: view?.status(),
      profile: profile(),
    }),
  };
  function key(event, down) {
    if (!active || event.target.closest?.("input,select,textarea")) return;
    if (event.target.closest?.("button") && ["Space", "Enter"].includes(event.code)) return;
    const binding = Object.entries(comfort.preferences.keys).find(
      ([name, value]) => ["left", "right", "jump", "boost"].includes(name) && value === event.code,
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
        "Enter",
      ].includes(code)
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;
    if (down && (code === "KeyP" || code === "Escape")) {
      actions.pause();
      return;
    }
    if (down && code === "KeyM") {
      actions.mute();
      return;
    }
    if (down && code === "KeyR") {
      actions.checkpoint();
      return;
    }
    if (down && code === "Enter" && paused) {
      actions.resume();
      return;
    }
    if (down && ["Space", "Enter"].includes(code) && ["dead", "finished"].includes(run.phase)) {
      actions.restart();
      return;
    }
    if (paused) return;
    const action = ["ArrowLeft", "KeyA"].includes(code)
      ? "left"
      : ["ArrowRight", "KeyD"].includes(code)
        ? "right"
        : code === "KeyE"
          ? "suction"
          : code.startsWith("Shift")
            ? "boost"
            : "jump";
    commandGravity(run, course, action, down);
  }
  addEventListener("keydown", (e) => key(e, true), true);
  addEventListener("keyup", (e) => key(e, false), true);
  addEventListener("blur", () => {
    if (active && !paused) actions.pause();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && active && !paused) actions.pause();
  });
  context.installFrameOverride(manager);
  let qaOutput = null;
  if (qaMode) {
    const dock = document.createElement("div");
    dock.id = "gravity-qa";
    dock.style.cssText =
      "position:fixed;bottom:2px;left:2px;z-index:200;display:flex;gap:5px;background:#090d13e8;padding:5px;font:11px system-ui;color:white;max-width:95vw;flex-wrap:wrap";
    const button = (label, action) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = action;
      dock.append(b);
      return b;
    };
    qaOutput = document.createElement("output");
    qaOutput.id = "gravity-qa-report";
    button("开始教学", () => manager.launch({ tutorial: true, seed: 11 }));
    button("自动巡航", async () => {
      await manager.launch({ tutorial: true, seed: 11 });
      pilot = true;
    });
    button("冻结 / 继续", () => {
      frozen = !frozen;
      ui.root.focus();
    });
    button("空中换面画面", async () => {
      await manager.launch({ tutorial: false, seed: 11 });
      frozen = true;
      run.s = 60;
      run.input.suction = true;
      view.reset();
      view.update(run, 1 / 60);
      commandGravity(run, course, "jump");
      for (let i = 0; i < 18; i++) {
        run.events = [];
        stepGravity(run, course, 1 / 60);
        view.update(run, 1 / 60);
      }
      view.render(1 / 60);
      ui.update(run, course, false, profile());
      dock.style.display = "none";
    });
    button("失稳测试", async () => {
      await manager.launch({ tutorial: false, seed: 11 });
      frozen = true;
      run.s = 60;
      run.input.suction = true;
      for (let n = 0; n < 2; n++) {
        selectGravityTarget(run, 1);
        commandGravity(run, course, "jump");
        for (let i = 0; i < 180 && !run.attached; i++) {
          run.events = [];
          stepGravity(run, course, 1 / 60);
          if (run.jetTime < 0.15) run.input.jump = false;
        }
      }
      view.reset();
      run.input.suction = false;
      frozen = false;
    });
    button("验证四面接轨", async () => {
      const checks = [];
      try {
        await manager.launch({ tutorial: false, seed: 11 });
        frozen = true;
        run.s = 40;
        run.input.suction = true;
        for (let face = 1; face <= 4; face++) {
          selectGravityTarget(run, 1);
          commandGravity(run, course, "jump");
          let i = 0;
          for (; i < 180 && !run.attached; i++) {
            run.events = [];
            stepGravity(run, course, 1 / 60);
            if (run.jetTime < 0.15) run.input.jump = false;
            if (i % 8 === 0) {
              view.update(run, 8 / 60);
              view.render(1 / 60);
              await new Promise((resolve) => requestAnimationFrame(resolve));
            }
          }
          checks.push({
            name: "contact-face-" + (face % 4),
            pass: run.attached && run.face === face % 4 && run.maxPenetration < 0.001,
            steps: i,
          });
        }
        checks.push({ name: "one-full-circuit", pass: run.circuits === 1 });
        checks.push({
          name: "native-jets-intake-and-bloom",
          pass:
            view.status().effects.nativePlumes === 10 &&
            view.status().post.type === "selective-hdr-bloom",
        });
      } catch (error) {
        checks.push({ name: "exception", pass: false, detail: String(error.stack) });
      }
      qaOutput.dataset.report = JSON.stringify({ checks });
      qaOutput.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });
    for (const [label, face] of [
      ["地面画面", 0],
      ["右墙画面", 1],
      ["天花板画面", 2],
      ["左墙画面", 3],
    ])
      button(label, async () => {
        await manager.launch({ tutorial: false, seed: 11 });
        frozen = true;
        run.s = 60;
        run.input.suction = true;
        for (let n = 0; n < face; n++) {
          selectGravityTarget(run, 1);
          commandGravity(run, course, "jump");
          for (let i = 0; i < 180 && !run.attached; i++) {
            run.events = [];
            stepGravity(run, course, 1 / 60);
            if (run.jetTime < 0.15) run.input.jump = false;
          }
        }
        for (let i = 0; i < 50; i++) view.update(run, 1 / 60);
        view.render(1 / 60);
        ui.update(run, course, false, profile());
        dock.style.display = "none";
      });
    dock.append(qaOutput);
    document.body.append(dock);
  }
  return manager;
}
