import { mul } from "./course.js";
import { layoutConflicts, intersectsTraffic } from "./placement.js";
import { createGhostRecorder } from "./ghost.js";
import { stepRhythm, rhythmStatus } from "./rhythm.js";
import { startRainbow, rainbowStatus, rainbowMultiplier } from "./rainbow-rules.js";
import { RING_MASK_BUDGET } from "./postprocessing.js";
import { yieldBuild } from "./build-scheduler.js";
import { createRandomCourse, newCourseSeed } from "./random-course.js";
import { randomPilotStep } from "./random-pilot.js";
import { createSection } from "./random-course.js";
import { stepEscort, escortStatus } from "./escort-rules.js";
import { trafficStatus } from "./traffic-motion.js";
import { voyageStatus } from "./voyage-rules.js";
import { adventureStatus } from "./adventure-rules.js";
import { challengeSummary, settleChallenge } from "./endless.js";
import { createRun, command, stepRun, rescue, restartCheckpoint } from "./simulation.js";
import { createRouteWindowAsync, createRouteGlow } from "./route-window.js";
import { createRingView } from "./view.js";
import { createRingUI } from "./ui.js";
import { createGapGuide, describeGap, playGapTone } from "./gap-guide.js";
import {
  beginTutorial,
  finishTutorial,
  rememberTutorial,
  shouldTeach,
  stepTutorial,
  tutorialCommand,
} from "./tutorial.js";

export function installStarRing(context, options) {
  const { renderer, sound, backend, input, settings } = context;
  const course = createRandomCourse();
  const gapGuide = createGapGuide();
  let ghostStorage;
  try {
    ghostStorage = localStorage;
  } catch {}
  const ghostRecorder = createGhostRecorder(ghostStorage);
  const isQA = new URLSearchParams(location.search).has("starRingQA");
  let previousTimestamp = null;
  let run = null,
    view = null,
    active = false,
    paused = false,
    accumulator = 0,
    settled = false,
    oldTone,
    oldExposure,
    frozen = false,
    gapAudition = false,
    surfaceProbe = false,
    overview = false;
  backend.state.driving.starRing ||= { completions: 0, bestScore: 0, bestTime: null };
  const actions = {
    pause() {
      if (active && run.phase !== "finished" && run.phase !== "dead") {
        paused = !paused;
        gapGuide.suspend();
        release();
        sound.setPaused(paused);
        ui.update(run, course, paused);
        if (paused) ui.root.querySelector("[data-ring=resume]").focus();
        else ui.root.focus();
      }
    },
    resume() {
      paused = false;
      sound.setPaused(false);
      ui.root.focus();
    },
    checkpoint() {
      if (!run || run.phase === "finished") return;
      if (run.tutorial?.active) {
        paused = false;
        sound.setPaused(false);
        beginTutorial(run, course);
        ui.root.focus();
        return;
      }
      paused = false;
      sound.setPaused(false);
      if (run.phase === "dead" || run.phase === "dying") {
        restartCheckpoint(run, course);
        view.reset();
        gapGuide.reset();
        sound.setMusic(settings.music);
        sound.startMusic();
        ui.root.focus();
        return;
      }
      const before = run.events.length;
      rescue(run, course);
      run.pendingEvents.push(...run.events.splice(before));
      ui.root.focus();
    },
    replay() {
      if (run && run.time > 1) finish();
      manager.launch({ replayBest: true, tutorial: false });
    },
    restart() {
      manager.launch();
    },
    tutorial() {
      manager.launch({ tutorial: true });
    },
    skip() {
      finishTutorial(run, course, true);
      saveTutorial();
      ui.root.focus();
    },
    end() {
      if (!run || run.phase === "finished" || run.tutorial?.active) return;
      run.phase = "finished";
      paused = false;
      release();
      sound.setPaused(false);
      finish();
      ui.update(run, course, false);
    },
    menu() {
      if (run?.endless && run.time > 1 && !run.tutorial?.active) finish();
      manager.stop();
    },
    mute() {
      gapGuide.suspend();
      settings.muted = !settings.muted;
      sound.setMuted(settings.muted);
      context.saveSettings();
      ui.root.querySelector("[data-ring=mute]").textContent = settings.muted
        ? "静音 · M"
        : "声音 · M";
    },
    assist(value) {
      if (run) run.assist = value;
    },
    hold(action, down) {
      if (action === "left" || action === "right") {
        control(action + (down ? "Press" : "Release"));
        return;
      }
      control(action + (down ? "Press" : "Release"));
    },
  };
  const ui = createRingUI(actions, options.comfort.preferences);
  function control(event) {
    if (!run || paused || run.phase !== "running") return;
    const wasBoost = run.input.boost;
    if (!tutorialCommand(run, course, event)) command(run, course, event);
    if (wasBoost && !run.input.boost && event === "boostRelease")
      sound.tone({ freq: 240, freqEnd: 90, dur: 0.12, gain: 0.025 });
  }
  function saveTutorial() {
    if (rememberTutorial(backend.state.driving.starRing, run?.tutorial)) backend.persist();
  }
  function release() {
    if (run) {
      for (const key of Object.keys(run.input)) run.input[key] = false;
      if (run.tutorial?.active && run.tutorial.step === 2) {
        run.tutorial.step = 1;
        run.tutorial.held = 0;
      }
    }
  }
  function finish() {
    if (settled) return;
    settled = true;
    if (run && !run.tutorial?.active) ghostRecorder.finish(run);
    sound.stopLoops();
    if (!run.death) sound.perfect();
    const profile = backend.state.driving.starRing;
    const reward = 25 + run.rings * 2 + (profile.completions === 0 ? 50 : 0);
    if (run.endless) {
      const earned = settleChallenge(profile, run, course);
      backend.credit(earned, "star-ring-endless");
      if (run.laps > 0) options.onWin();
      backend.persist();
      ui.result(run, earned, profile);
      return;
    }
    profile.completions++;
    profile.bestScore = Math.max(profile.bestScore, Math.floor(run.score));
    const time = run.time + run.penalty;
    profile.bestTime = profile.bestTime === null ? time : Math.min(profile.bestTime, time);
    backend.credit(reward, "star-ring-clear");
    options.onWin();
    backend.persist();
    ui.result(run, reward, profile);
  }
  function audio() {
    if (paused) return;
    if (run.phase !== "running") {
      sound.setStar(false);
      sound.setHover(0);
      sound.setThrust(0);
    } else {
      sound.setHover(
        run.pressure <= 0
          ? 0
          : run.attached
            ? run.input.suction
              ? 0.28
              : 0
            : run.input.suction
              ? 0.4
              : run.input.jump
                ? 0.7
                : 0,
      );
      sound.setThrust(
        run.input.boost && run.pressure > 0 ? 0.65 * Math.min(1, run.pressure / 20) : 0,
      );
      sound.hover?.f.frequency.setTargetAtTime(
        run.attached ? 480 + run.speed * 5 : 1080 + Math.abs(run.roll) * 20,
        sound.t,
        0.08,
      );
    }
    const clock = {};
    const musicEvents = stepRhythm(
      run,
      sound.beatClock(clock) ? clock : null,
      run.events,
      1 / 60,
      options.comfort.preferences.rhythmOffset || 0,
    );
    run.events.push(...musicEvents);
    for (const e of run.events) {
      if (e.type === "rhythmHit") sound.tone({ freq: 880, freqEnd: 1320, dur: 0.1, gain: 0.04 });
      if (e.type === "rhythmCharge") sound.tone({ freq: 330, freqEnd: 495, dur: 0.1, gain: 0.025 });
      if (e.type === "rhythmComplete") {
        run.feedback = "节奏三连 +" + e.points;
        run.feedbackTime = 1.5;
        sound.perfect();
      }
      if (e.type === "rhythmLayer" && settings.music && !settings.muted)
        sound.tone({ freq: [523.25, 659.25, 783.99, 1046.5][e.note], dur: 0.13, gain: 0.025 });
      if (e.type === "rainbowStart") {
        sound.starStart();
        sound.setStar(true);
      }
      if (e.type === "rainbowEnd") {
        sound.starEnd();
        sound.setStar(false);
        sound.setMusicHype(false, 128);
      }
      if (e.type === "rainbowSmash" || e.type === "rainbowClear")
        sound.smash(run.rainbow?.smashed || 1);
      if (e.type === "escortCollect")
        sound.tone({
          freq: 700 + e.slot * 170,
          freqEnd: 1200 + e.slot * 170,
          dur: 0.12,
          gain: 0.045,
        });
      if (e.type === "escortBurst")
        sound.tone({ freq: 150 + e.stars * 40, freqEnd: 65, dur: 0.32, gain: 0.09 });
      if (e.type === "escortClear") sound.tone({ freq: 210, freqEnd: 100, dur: 0.08, gain: 0.025 });
      if (e.type === "nearMiss") sound.tone({ freq: 640, freqEnd: 1280, dur: 0.13, gain: 0.045 });
      if (e.type === "trafficSignal")
        sound.tone({ freq: 470, freqEnd: 470, dur: 0.08, gain: 0.025 });
      if (e.type === "voyageWarning")
        sound.tone({ freq: 460, freqEnd: 680, dur: 0.25, gain: 0.035 });
      if (e.type === "voyageStart") sound.tone({ freq: 520, freqEnd: 900, dur: 0.3, gain: 0.04 });
      if (e.type === "voyageComplete") sound.perfect();
      if (e.type === "chainGate")
        sound.tone({
          freq: 660 + (run.adventure?.attempt?.step || 0) * 220,
          freqEnd: 1320,
          dur: 0.12,
          gain: 0.065,
        });
      if (e.type === "branchLaunch" || e.type === "branchReturn") sound.jump();
      if (e.type === "branchAttach" || e.type === "branchComplete" || e.type === "chainComplete")
        sound.perfect();
      if (e.type === "gripWarning")
        sound.tone({ freq: 185 + e.level * 45, freqEnd: 130, dur: 0.08, gain: 0.055 });
      if (e.type === "gripLost") sound.tone({ freq: 320, freqEnd: 110, dur: 0.24, gain: 0.065 });
      if (e.type === "flip") sound.jump();
      if (e.type === "spinBlocked")
        sound.tone({ freq: 180, freqEnd: 125, dur: 0.055, gain: 0.025 });
      if (e.type === "death") {
        ghostRecorder.finish(run);
        sound.stopLoops();
        sound.crash?.();
        sound.tone({ freq: 210, freqEnd: 48, dur: 0.7, gain: 0.08 });
        sound.setMusic(false);
      }
      if (e.type === "jump") sound.jump();
      if (e.type === "land") sound.land(0.35 + e.impact * 0.45);
      if (e.type === "pickup") {
        if (e.kind === "air") sound.tone({ freq: 420, freqEnd: 980, dur: 0.16, gain: 0.045 });
        else if (e.kind === "sky") sound.tone({ freq: 880, freqEnd: 1760, dur: 0.22, gain: 0.05 });
        else sound.pickup(run.combo % 5);
      }
      if (e.type === "hit") sound.warn();
      if (e.type === "trackImpact") sound.land(0.8);
      if (e.type === "sector") sound.tone({ freq: 740, freqEnd: 1480, dur: 0.22, gain: 0.09 });
      if (e.type === "checkpoint") sound.tone({ freq: 660, freqEnd: 980, dur: 0.13, gain: 0.09 });
      if (e.type === "rescue") sound.tone({ freq: 180, freqEnd: 100, dur: 0.2, gain: 0.1 });
      if (e.type === "trick") sound.perfect();
      if (e.type === "tutorialComplete") sound.perfect();
      playGapTone(sound, e);
    }
  }
  const manager = {
    async launch({ tutorial, endless = true, seed, replayBest = false } = {}) {
      if (manager.launching) return;
      manager.launching = true;
      if (active) manager.stop();
      ui.preparing(true, "正在准备星环赛道…");
      const yieldTask = yieldBuild;
      let candidate = null;
      try {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        course.reseed((replayBest ? ghostRecorder.status().seed : null) ?? seed ?? newCourseSeed());
        const glow = view?.sharedGlow || createRouteGlow();
        candidate = await createRouteWindowAsync(course.snapshot(), yieldTask, glow);
        candidate.sharedGlow = glow;
        ui.preparing(true, "正在预热车辆与轨道…");
        if (view) view.stageRoute(candidate);
        else view = createRingView(context, course, options.comfort, candidate);
        candidate = null;
        view.reset();
        await view.warmEntrance(yieldTask);
        const ghost = createRun(course);
        view.update(ghost, 0);
        view.render(0);
        await yieldTask();
        manager.start({ tutorial, endless, reuseCourse: true });
      } finally {
        candidate?.dispose();
        ui.preparing(false);
        manager.launching = false;
      }
    },
    start({ tutorial, endless = true, seed, reuseCourse = false } = {}) {
      if (!active) {
        context.menu();
        oldTone = renderer.toneMapping;
        oldExposure = renderer.toneMappingExposure;
      }
      const qaSeed = new URLSearchParams(location.search).has("starRingQA")
        ? new URLSearchParams(location.search).get("ringSeed")
        : null;
      if (!reuseCourse) course.reseed(seed ?? (qaSeed !== null ? Number(qaSeed) : newCourseSeed()));
      view ||= createRingView(context, course, options.comfort);
      view.reset();
      run = createRun(course);
      run.endless = endless;
      ghostRecorder.start(course.randomStatus().seed, !isQA);
      run.ghostMatching = ghostRecorder.status().matching;
      previousTimestamp = null;
      gapGuide.reset();
      run.assist = ui.root.querySelector("#ring-assist").checked;
      if (shouldTeach(backend.state.driving.starRing, tutorial)) beginTutorial(run, course);
      active = true;
      paused = false;
      settled = false;
      accumulator = 0;
      frozen = false;
      gapAudition = false;
      surfaceProbe = false;
      overview = false;
      input.enabled = false;
      input.queue.length = 0;
      document.body.classList.add("star-ring-active");
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
      ui.root.style.visibility = "";
      ui.update(run, course, false);
    },
    stop() {
      if (!active) return;
      sound.setStar(false);
      if (run && !run.tutorial?.active) ghostRecorder.finish(run);
      active = false;
      gapGuide.suspend();
      release();
      sound.stopLoops();
      sound.setPaused(false);
      sound.setMusic(settings.music);
      sound.startMusic();
      input.enabled = true;
      input.queue.length = 0;
      ui.show(false);
      document.body.classList.remove("star-ring-active");
      renderer.toneMapping = oldTone;
      renderer.toneMappingExposure = oldExposure;
      view.suspend();
      context.menu();
      context.showroom.presentation.entry.arm();
    },
    active: () => active,
    ghostStatus: () => ghostRecorder.status(),
    frame(dt, timestamp = performance.now()) {
      if (!active) return;
      const frameEvents = [];
      if (!paused && !frozen && run.phase !== "finished" && run.phase !== "dead") {
        accumulator += dt;
        while (accumulator >= 1 / 60) {
          const wasRescue = run.phase === "rescue";
          if (run.tutorial?.active) stepTutorial(run, course, 1 / 60);
          else stepRun(run, course, 1 / 60);
          const gapSignals = gapGuide.update(run, course, 1 / 60);
          run.events.push(...gapSignals.events);
          saveTutorial();
          if (wasRescue && run.phase === "running") view.reset();
          audio();
          frameEvents.push(...run.events);
          accumulator -= 1 / 60;
          if (surfaceProbe && (run.trackImpacts > 0 || run.lands > 0)) {
            surfaceProbe = false;
            frozen = true;
            accumulator = 0;
            break;
          }
          if (gapAudition && gapGuide.status().tails > 0) {
            gapAudition = false;
            frozen = true;
            accumulator = 0;
            break;
          }
          if (run.phase === "dead") break;
          if (run.phase === "finished") {
            finish();
            break;
          }
        }
      }
      // A rendered frame may contain multiple fixed steps, or no physics step.
      run.events = frameEvents;
      run.gapCue = describeGap(run, course);
      if (!paused) view.update(run, dt);
      if (!paused && run.phase === "running" && run.s > 130 && run.s < course.length - 160)
        view.prepare();
      if (overview) view.overview(overview);
      ui.update(run, course, paused);
      renderer.setRenderTarget(null);
      renderer.toneMappingExposure = 1;
      renderer.clear();
      if (!paused && !frozen && run.phase === "running" && !run.tutorial?.active)
        ghostRecorder.record(run, view.ghostFrame(run));
      if (!frozen) view.applyGhost(ghostRecorder.playback(run.time), run);
      view.render(dt);
      if (previousTimestamp !== null && !paused && !frozen && run.phase === "running")
        view.observePerformance(timestamp - previousTimestamp);
      previousTimestamp = timestamp;
    },
    status: () => ({
      active,
      paused,
      adventure: adventureStatus(run),
      phase: run?.phase || "idle",
      s: run?.s || 0,
      length: course.length,
      challenge: run ? challengeSummary(run, course) : null,
      randomness: course.randomStatus(),
      attached: run?.attached,
      grip: run
        ? {
            required: run.gripRequired,
            level: run.gripWarningLevel,
            stress: run.gripStress,
            cause: run.detachCause,
            pitch: run.pitch,
            flipProgress: run.flipProgress,
          }
        : null,
      death: run?.death
        ? { reason: run.death.reason, elapsed: run.death.elapsed, duration: run.death.duration }
        : null,
      pressure: run?.pressure,
      checkpoint: run?.checkpoint,
      falls: run?.falls,
      score: run?.score,
      rings: run?.rings,
      trackImpacts: run?.trackImpacts,
      lastTrackContact: run?.lastTrackContact,
      suction: run?.input.suction,
      jump: run?.input.jump,
      lane: run?.lane,
      steering: run?.steering,
      stage: run ? course.frame(run.s).title : "",
      tutorial: run?.tutorial ? { ...run.tutorial } : null,
      gapCue: run?.gapCue || null,
      gapSounds: gapGuide.status(),
      escort: escortStatus(run),
      rainbow: rainbowStatus(run),
      rhythm: rhythmStatus(run),
      director: run?.director,
      ghost: ghostRecorder.status(),
      traffic: trafficStatus(run),
      voyage: voyageStatus(run),
      view: view?.status(),
      profile: backend.state.driving.starRing,
    }),
    course,
  };
  function key(event, down) {
    if (!active || event.target.closest?.("input,select,textarea")) return;
    if (event.target.closest?.("button") && ["Space", "Enter"].includes(event.code)) return;
    const code = event.code;
    const known = [
      "Enter",
      "KeyE",
      "Space",
      "ArrowUp",
      "KeyW",
      "ArrowLeft",
      "KeyA",
      "ArrowRight",
      "KeyD",
      "ArrowDown",
      "KeyS",
      "ShiftLeft",
      "ShiftRight",
      "KeyP",
      "Escape",
      "KeyR",
      "KeyM",
    ];
    if (!known.includes(code)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.repeat) return;
    if (down && run.phase === "finished" && (code === "Space" || code === "Enter")) {
      manager.start();
      return;
    }
    if (down && run.phase === "finished" && code === "Escape") {
      manager.stop();
      return;
    }
    if (down && code === "Enter") {
      if (paused) actions.resume();
      return;
    }
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
    if (paused || run.phase === "finished") return;
    if (code === "ArrowLeft" || code === "KeyA") {
      control("left" + (down ? "Press" : "Release"));
      return;
    }
    if (code === "ArrowRight" || code === "KeyD") {
      control("right" + (down ? "Press" : "Release"));
      return;
    }
    const action =
      code === "KeyE"
        ? "suction"
        : code.startsWith("Shift")
          ? "boost"
          : code === "ArrowDown" || code === "KeyS"
            ? "brake"
            : "jump";
    control(action + (down ? "Press" : "Release"));
  }
  addEventListener("keydown", (e) => key(e, true), true);
  addEventListener("keyup", (e) => key(e, false), true);
  addEventListener("blur", () => {
    if (active && run.phase !== "finished" && !paused) actions.pause();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && active && !paused) actions.pause();
  });
  context.installFrameOverride(manager);
  if (new URLSearchParams(location.search).has("starRingQA")) {
    const qa = document.createElement("div");
    qa.id = "star-ring-qa";
    qa.style.cssText =
      "position:fixed;bottom:0;left:0;z-index:9999;background:#10151eee;color:white;padding:5px;display:flex;gap:5px;flex-wrap:wrap;max-width:100vw;box-sizing:border-box;font:11px system-ui";
    const output = document.createElement("output");
    output.id = "star-ring-qa-report";
    output.style.cssText = "max-width:150px;overflow:hidden;white-space:nowrap";
    const make = (text, fn) => {
      const b = document.createElement("button");
      b.textContent = text;
      b.onclick = fn;
      qa.append(b);
      return b;
    };
    const structurePreview = (kind, wide = false) => {
      manager.start({ tutorial: false, seed: 11 });
      const segment = course.segments.find((s) =>
        kind === "helix"
          ? s.kind === "helix"
          : s.kind === "banked" && Math.sign(s.options.yaw) === (kind === "left" ? -1 : 1),
      );
      const targetS = segment.start + (wide ? 12 : segment.length * 0.27);
      run.s = segment.start + 1;
      run.pos = course.pose(run.s).p;
      run.velocity = mul(course.pose(run.s).t, 28);
      run.speed = 28;
      run.input.suction = true;
      const pilot = {};
      for (let i = 0; i < 1000 && run.s < targetS && run.phase === "running"; i++)
        randomPilotStep(run, course, pilot);
      frozen = true;
      overview = wide ? segment : false;
      for (let i = 0; i < 45; i++) view.update(run, 1 / 60);
      if (wide) view.overview(segment);
      view.render(1 / 60);
      ui.update(run, course, false);
    };
    make("新轨道：长左弯", () => structurePreview("left"));
    make("新轨道：长右弯", () => structurePreview("right"));
    make("新轨道：螺旋驾驶", () => structurePreview("helix"));
    make("新轨道：螺旋全景", () => structurePreview("helix", true));
    make("验证：立体轨道", () => {
      const backup = structuredClone(backend.state),
        checks = [];
      const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
      try {
        manager.start({ tutorial: false, seed: 11 });
        run.input.suction = true;
        command(run, course, "leftPress");
        for (let i = 0; i < 24; i++) stepRun(run, course, 1 / 60);
        check(
          "keyboard-and-touch-hold-drive-continuous-left-input",
          run.targetLane < -1 && run.targetLane > -2,
        );
        command(run, course, "leftRelease");
        const lane = run.targetLane;
        for (let i = 0; i < 24; i++) stepRun(run, course, 1 / 60);
        check(
          "release-stops-steering-without-stuck-key",
          run.targetLane === lane && !run.input.left,
        );
        const seg = course.segments.find((s) => s.kind === "banked");
        run.s = seg.start + seg.length * 0.42;
        run.lane = run.targetLane = 0;
        run.pos = course.pose(run.s).p;
        run.velocity = mul(course.pose(run.s).t, 28);
        run.speed = 28;
        for (let i = 0; i < 90; i++) stepRun(run, course, 1 / 60);
        check(
          "suction-follows-actual-banked-collision-surface",
          run.phase === "running" && run.attached && run.trackImpacts === 0,
          { bank: course.frame(run.s).bank, steering: run.steering },
        );
        run.input.suction = false;
        let warning = false;
        for (let i = 0; i < 86; i++) {
          stepRun(run, course, 1 / 60);
          warning ||= run.events.some((e) => e.type === "gripWarning");
        }
        check(
          "new-bank-warns-before-drifting-off",
          warning && !run.attached && run.detachCause === "grip",
        );
        check(
          "new-bends-and-helices-use-shared-glass-surface",
          course.segments.some((s) => s.kind === "helix") &&
            course.randomStatus().structures === "banked-helical-1",
        );
      } catch (error) {
        check("exception", false, String(error.stack));
      } finally {
        manager.stop();
        backend.state = backup;
        backend.persist();
        options.onRestore();
      }
      output.dataset.report = JSON.stringify({ checks });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });
    const voyagePreview = (kind) => {
      manager.start({ tutorial: false, seed: 11 });
      if (kind === "stars") {
        run.s = 54;
        run.pos = course.pose(run.s).p;
        run.input.suction = true;
        for (let i = 0; i < 125; i++) stepRun(run, course, 1 / 60);
      } else if (kind === "convoy") {
        const cell = course.voyage.cells.find((c) => c.changing);
        run.s = cell.anchor - 95;
        run.lane = run.targetLane = cell.open;
        run.pos = course.pose(run.s, run.lane).p;
        run.input.suction = true;
        for (let i = 0; i < 90; i++) stepRun(run, course, 1 / 60);
      } else if (kind === "burst") {
        const h = course.hazards.find((h) => h.type === "device" && h.cluster);
        run.s = h.s - 10;
        run.lane = run.targetLane = h.lane;
        run.pos = course.pose(run.s, run.lane).p;
        stepEscort(run, course, 1 / 60);
        run.escort.count = 3;
        command(run, course, "jumpPress");
        for (let i = 0; i < 18; i++) stepRun(run, course, 1 / 60);
      } else {
        const section = Array.from({ length: 8 }, (_, i) => i * 2 + 2).find(
          (n) => createSection(11, n).voyage.event?.type === kind,
        );
        course.setCycle(section);
        run.laps = section;
        const e = course.voyage.event;
        run.s = e.start + 5;
        run.pos = course.pose(run.s).p;
        run.input.suction = true;
        stepRun(run, course, 1 / 60);
        run.voyageState.age = 2;
      }
      frozen = true;
      overview = false;
      view.update(run, 1 / 60);
      view.render(1 / 60);
      ui.update(run, course, false);
    };
    make("预览：彩虹五角星", () => {
      manager.start({ tutorial: false, seed: 11 });
      const star = course.pickups.find((p) => p.type === "star");
      run.s = star.s - 15;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      stepRun(run, course, 1 / 60);
      frozen = true;
      view.update(run, 1 / 60);
      view.render(1 / 60);
      ui.update(run, course, false);
    });
    make("验证：道具间距", async () => {
      await yieldBuild();
      manager.start({ tutorial: false, seed: 1 });
      const cases = course.hazards
        .filter((h) => h.type === "device")
        .flatMap((h) =>
          course.pickups
            .filter((p) => ["ring", "air"].includes(p.type) && Math.abs(p.s - h.s) < 28)
            .map((p) => ({ h, p, d: Math.abs(p.s - h.s) })),
        )
        .sort((a, b) => a.d - b.d);
      const chosen = cases[0] || { h: course.hazards[0], p: course.pickups[8] };
      run.s = Math.max(40, Math.min(chosen.h.s, chosen.p.s) - 24);
      run.lane = run.targetLane = 0;
      run.time = 18;
      run.pos = course.pose(run.s, run.lane).p;
      run.input.suction = true;
      run.messageTime = run.feedbackTime = 0;
      view.update(run, 1 / 60);
      view.render(1 / 60);
      ui.update(run, course, false);
      frozen = true;
      const issues = layoutConflicts(course.snapshot()),
        checks = [
          {
            name: "all-main-pickups-fragments-and-gates-have-clearance",
            pass: issues.length === 0,
          },
          {
            name: "cars-and-red-obstacles-remain-in-the-challenge",
            pass:
              course.hazards.filter((h) => h.type === "car").length >= 5 &&
              course.hazards.some((h) => h.type === "device"),
          },
          {
            name: "required-air-and-both-rainbow-stars-are-preserved",
            pass:
              course.pickups.filter((p) => p.required && p.type === "air").length >= 8 &&
              course.pickups.filter((p) => p.type === "star" && !p.preview).length === 2,
          },
          {
            name: "nearby-obstacle-and-pickup-have-separate-physical-space",
            pass: !intersectsTraffic(chosen.p, chosen.h),
          },
        ];
      output.dataset.report = JSON.stringify({
        checks,
        issues,
        placement: course.placement,
        example: { obstacle: chosen.h, pickup: chosen.p },
        traffic: view.status().traffic,
      });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });
    make("验证：七项体验升级", async () => {
      await yieldBuild();
      manager.start({ tutorial: false, seed: 11 });
      const checks = [],
        prefs = options.comfort.preferences,
        saved = {
          bloom: prefs.bloom,
          autoQuality: prefs.autoQuality,
          compactHUD: prefs.compactHUD,
          ghost: prefs.ghost,
          ghostOpacity: prefs.ghostOpacity,
        };
      try {
        prefs.compactHUD = true;
        prefs.ghost = true;
        prefs.ghostOpacity = 0.4;
        const zone = course.director.recoveries[0];
        run.s = zone.start + 25;
        run.time = 12;
        run.pos = course.pose(run.s).p;
        run.input.suction = true;
        run.pressure = 55;
        stepRun(run, course, 1 / 60);
        view.update(run, 1 / 60);
        ui.update(run, course, false);
        view.render(1 / 60);
        checks.push({
          name: "compact-HUD-releases-the-car-and-tail-view",
          pass:
            ui.root.classList.contains("ring-compact") &&
            getComputedStyle(ui.root.querySelector(".ring-keys")).display === "none",
        });
        checks.push({
          name: "one-critical-cue-and-directed-recovery-air",
          pass:
            ui.root.querySelectorAll("#ring-critical-cue").length === 1 &&
            run.director?.phase === "recover" &&
            course.director.notes.length > 0,
        });
        checks.push({
          name: "rhythm-edge-markers-and-meaningful-fork-choice",
          pass:
            view.status().rhythmMarkers.notes > 0 &&
            course.adventures.branches.every((b) => b.choice.reward === 440),
        });
        const music = createRun(course);
        music.input.suction = true;
        for (let i = 0; i < 20; i++) {
          music.time = i / 60;
          stepRhythm(music, { since: 0, period: 0.5 }, [], 1 / 60);
        }
        music.time = 0.5;
        music.attached = false;
        stepRhythm(music, { since: 0, period: 0.5 }, [{ type: "jump" }], 1 / 60);
        music.time = 1;
        music.attached = true;
        stepRhythm(music, { since: 0, period: 0.5 }, [{ type: "land" }], 1 / 60);
        checks.push({
          name: "suction-launch-landing-unlocks-musical-layer",
          pass: rhythmStatus(music).chains === 1 && rhythmStatus(music).layer,
        });
        const f = view.ghostFrame(run),
          t = course.pose(run.s).t;
        view.applyGhost([f[0] + t[0] * 15, f[1] + t[1] * 15, f[2] + t[2] * 15, ...f.slice(3)], run);
        checks.push({
          name: "personal-ghost-renders-with-shared-geometry-and-no-collider",
          pass:
            view.status().ghost.visible &&
            view.status().ghost.sharedGeometry &&
            !view.status().ghost.collision,
        });
        prefs.bloom = 0;
        view.render(1 / 60);
        checks.push({
          name: "bloom-slider-can-fully-disable-light-halo",
          pass: view.status().postprocessing.effectiveStrength === 0,
        });
        prefs.bloom = saved.bloom;
        prefs.autoQuality = true;
        const initial = view.status().quality.level;
        for (let i = 0; i < 330; i++) view.observePerformance(40);
        const low = view.status().quality;
        view.render(1 / 60);
        checks.push({
          name: "automatic-quality-reduces-render-target-and-particles",
          pass: initial === 0 || (low.level < initial && low.scale < 1 && low.particles < 1),
        });
        checks.push({
          name: "independent-visual-and-ghost-settings-are-available",
          pass: [
            "rainbow",
            "bloom",
            "speedLines",
            "ghostOpacity",
            "ghost",
            "autoQuality",
            "compactHUD",
            "rhythmOffset",
          ].every((k) => document.getElementById("comfort-" + k)),
        });
        checks.push({
          name: "fixed-resource-pools-stay-within-bloom-budget",
          pass:
            view.status().postprocessing.cachedMasks < RING_MASK_BUDGET &&
            view.status().streaming.liveWindows <= 2,
        });
      } catch (error) {
        checks.push({ name: "exception", pass: false, error: String(error.stack) });
      } finally {
        Object.assign(prefs, saved);
        view.reset();
        view.update(run, 1 / 60);
        ui.update(run, course, false);
        frozen = true;
        view.render(1 / 60);
      }
      output.dataset.report = JSON.stringify({
        checks,
        view: view.status(),
        director: course.director,
        ghost: ghostRecorder.status(),
      });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });
    make("预览：本地影车与节奏", () => {
      manager.start({ tutorial: false, seed: 11 });
      const n = course.director.notes[0];
      run.s = n.s - 25;
      run.time = 18;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      run.input.boost = true;
      for (let i = 0; i < 30; i++) {
        stepRun(run, course, 1 / 60);
        view.update(run, 1 / 60);
      }
      const f = view.ghostFrame(run),
        t = course.pose(run.s).t;
      view.applyGhost([f[0] + t[0] * 16, f[1] + t[1] * 16, f[2] + t[2] * 16, ...f.slice(3)], run);
      run.ghostMatching = true;
      run.rhythm = {
        step: 2,
        chains: 1,
        streak: 3,
        layerUntil: run.time + 5,
        label: "弹射合拍 · 平稳接轨",
      };
      frozen = true;
      view.render(1 / 60);
      ui.update(run, course, false);
    });
    make("验证：喷气尾流", async () => {
      await yieldBuild();
      manager.start({ tutorial: false, seed: 11 });
      const star = course.pickups.find((p) => p.type === "star");
      run.s = star.s - 2;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      for (let i = 0; i < 100; i++) {
        stepRun(run, course, 1 / 60);
        view.update(run, 1 / 60);
      }
      view.render(1 / 60);
      ui.update(run, course, false);
      const s = view.status(),
        w = s.rainbow,
        checks = [
          {
            name: "real-star-renders-four-volumetric-nozzle-streams-without-flat-bands",
            pass: w.activeVertices > 0 && w.ports === 4 && w.bands === 0 && w.softErodedEdges,
          },
          {
            name: "mist-and-history-use-bounded-pools",
            pass:
              w.particles > 0 &&
              w.particles <= 192 &&
              w.history <= 32 &&
              w.maximumAge <= w.lifetime + 1e-5,
          },
          {
            name: "gas-uses-shared-native-noise-and-historical-road-clip",
            pass: w.sharedNativeNoise && w.historicalFloorClip,
          },
          {
            name: "original-layered-jets-and-rainbow-screen-remain-active",
            pass:
              s.flightEffects.nativePlumes === 10 &&
              s.flightEffects.levels.R1 > 0.5 &&
              ui.rainbowScreen.status().edge,
          },
          {
            name: "selective-bloom-remains-within-mask-budget",
            pass: s.postprocessing.cachedMasks < RING_MASK_BUDGET,
          },
        ];
      frozen = true;
      output.dataset.report = JSON.stringify({
        checks,
        wake: w,
        flight: s.flightEffects,
        screen: ui.rainbowScreen.status(),
        bloom: s.postprocessing,
      });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });
    make("预览：彩虹无敌", () => {
      manager.start({ tutorial: false, seed: 11 });
      const star = course.pickups.find((p) => p.type === "star");
      run.s = star.s - 2;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      for (let i = 0; i < 90; i++) {
        stepRun(run, course, 1 / 60);
        view.update(run, 1 / 60);
      }
      audio();
      frozen = true;
      view.render(1 / 60);
      ui.update(run, course, false);
    });
    make("验证：彩虹屏幕", async () => {
      await yieldBuild();
      manager.start({ tutorial: false, seed: 11 });
      const checks = [],
        star = course.pickups.find((p) => p.type === "star"),
        edge = ui.root.querySelector("#ring-star-overlay"),
        native = document.querySelector("#star-overlay");
      run.s = star.s - 2;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      for (let i = 0; i < 90; i++) {
        stepRun(run, course, 1 / 60);
        view.update(run, 1 / 60);
      }
      ui.update(run, course, false);
      const active = ui.rainbowScreen.status();
      checks.push({
        name: "actual-collection-enables-border-score-and-meter",
        pass: active.edge && active.score && active.meter,
      });
      checks.push({
        name: "border-shares-original-gradient-center-mask-and-opacity",
        pass:
          getComputedStyle(edge, "::before").backgroundImage ===
            getComputedStyle(native, "::before").backgroundImage &&
          getComputedStyle(edge).maskImage === getComputedStyle(native).maskImage &&
          getComputedStyle(edge).maskImage.includes("52%"),
      });
      checks.push({
        name: "screen-effects-do-not-intercept-controls",
        pass: getComputedStyle(edge).pointerEvents === "none",
      });
      run.rainbow.remaining = 1.5;
      ui.update(run, course, true);
      checks.push({
        name: "last-two-seconds-have-ending-cue-and-pause-freezes-colors",
        pass:
          ui.rainbowScreen.status().ending &&
          getComputedStyle(edge, "::before").animationPlayState === "paused",
      });
      run.rainbow.remaining = 0;
      ui.update(run, course, false);
      checks.push({
        name: "expiry-removes-border-score-flash-and-meter",
        pass:
          !ui.rainbowScreen.status().edge &&
          !ui.rainbowScreen.status().score &&
          !ui.rainbowScreen.status().meter &&
          ui.rainbowScreen.status().flash === 0,
      });
      startRainbow(run, course);
      ui.update(run, course, false);
      checks.push({
        name: "new-star-restarts-acquisition-flash",
        pass: ui.rainbowScreen.status().flash > 0.8,
      });
      ui.show(false);
      checks.push({
        name: "leaving-mode-clears-screen-effects",
        pass: !ui.rainbowScreen.status().edge && !ui.rainbowScreen.status().meter,
      });
      ui.show(true);
      run.rainbow.remaining = 6.5;
      ui.update(run, course, false);
      frozen = true;
      view.render(1 / 60);
      output.dataset.report = JSON.stringify({
        checks,
        screen: ui.rainbowScreen.status(),
        rainbow: rainbowStatus(run),
      });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });
    make("验证：彩虹道具", async () => {
      await yieldBuild();
      manager.start({ tutorial: false, seed: 11 });
      const checks = [],
        star = course.pickups.find((p) => p.type === "star");
      run.s = star.s - 2;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      for (let i = 0; i < 90; i++) {
        stepRun(run, course, 1 / 60);
        view.update(run, 1 / 60);
      }
      audio();
      view.render(1 / 60);
      frozen = true;
      ui.update(run, course, false);
      checks.push({
        name: "actual-star-collection-starts-eight-second-power",
        pass:
          run.rainbow?.collected === 1 && run.rainbow.remaining > 6 && run.rainbow.remaining < 8,
      });
      checks.push({
        name: "rainbow-car-and-pooled-trails-render",
        pass:
          view.status().rainbow.activeVertices > 0 &&
          view.status().rainbow.history <= 32 &&
          view.status().rainbow.ports === 4 &&
          view.status().rainbow.bands === 0 &&
          view.status().rainbow.blackGlassPreserved,
      });
      checks.push({
        name: "countdown-beside-energy-and-double-score",
        pass: rainbowMultiplier(run) === 2 && !ui.root.querySelector("#ring-rainbow").hidden,
      });
      output.dataset.report = JSON.stringify({
        checks,
        rainbow: rainbowStatus(run),
        view: view.status().rainbow,
      });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });
    make("性能：预载与区段切换", async () => {
      const checks = [];
      const started = performance.now();
      await manager.launch({ tutorial: false, seed: 11 });
      paused = true;
      frozen = true;
      const startMs = performance.now() - started;
      run.s = course.length - 35;
      run.pos = course.pose(run.s).p;
      view.update(run, 1 / 60);
      view.render(1 / 60);
      view.prepare();
      const wait = performance.now();
      while (!view.status().streaming.prepared && performance.now() - wait < 20000)
        await new Promise((r) => setTimeout(r, 16));
      const preload = view.status().streaming;
      run.s = course.length - 0.2;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      for (let i = 0; i < 3; i++) stepRun(run, course, 1 / 60);
      view.update(run, 1 / 60);
      for (let i = 0; i < 5; i++) view.render(1 / 60);
      const after = view.status();
      checks.push({
        name: "prepared-section-swap",
        pass: run.laps === 1 && after.loading.usedPrepared,
      });
      output.dataset.report = JSON.stringify({
        checks,
        startMs,
        preload,
        loading: after.loading,
        postprocessing: after.postprocessing,
      });
      output.textContent = "性能完成";
      paused = false;
      frozen = true;
      ui.update(run, course, false);
    });
    make("预览：护航与补给舰", () => voyagePreview("stars"));
    make("预览：动态车队", () => voyagePreview("convoy"));
    make("预览：护航冲击波", () => voyagePreview("burst"));
    make("预览：流星事件", () => voyagePreview("meteor"));
    make("预览：引力事件", () => voyagePreview("gravity"));
    make("验证：航行新机制", () => {
      const checks = [];
      voyagePreview("stars");
      audio();
      checks.push({
        name: "actual-E-collects-three-orbiting-stars",
        pass: run.escort.count === 3 && view.status().escort.stars === 3,
        state: escortStatus(run),
      });
      checks.push({
        name: "supply-ship-remains-outside-road",
        pass: view.status().voyage.supplyVisible && view.status().voyage.eventOutsideRoad,
      });
      voyagePreview("convoy");
      checks.push({
        name: "convoy-moves-and-signals",
        pass: view.status().traffic.moving > 0 && view.status().traffic.signaling > 0,
        state: view.status().traffic,
      });
      voyagePreview("burst");
      audio();
      checks.push({
        name: "ejection-releases-and-clears-devices",
        pass: run.escort.released === 1 && run.escort.cleared > 0 && view.status().escort.waves > 0,
        state: escortStatus(run),
      });
      voyagePreview("meteor");
      checks.push({ name: "distant-meteors-render", pass: view.status().voyage.meteors === 7 });
      voyagePreview("gravity");
      checks.push({
        name: "gravity-event-renders",
        pass: view.status().voyage.event === "gravity",
      });
      output.dataset.report = JSON.stringify({ checks, view: view.status() });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
    });

    make("预览：分岔跳轨", () => {
      manager.start({ tutorial: false, seed: 11 });
      const b = course.adventures.branches[0];
      run.s = b.launchS - 18;
      run.pos = course.pose(run.s).p;
      run.time = 10;
      run.input.suction = true;
      frozen = true;
      overview = false;
      stepRun(run, course, 1 / 60);
    });
    make("预览：外环驾驶", () => {
      manager.start({ tutorial: false, seed: 11 });
      const b = course.adventures.branches[0];
      run.routeId = b.id;
      run.s = b.start + 28;
      run.pos = b.pose(run.s).p;
      run.velocity = b.frame(run.s).t.map((v) => v * 28);
      run.time = 10;
      run.input.suction = true;
      frozen = true;
      overview = false;
      stepRun(run, course, 1 / 60);
    });
    make("预览：连环特技门", () => {
      manager.start({ tutorial: false, seed: 11 });
      const c = course.adventures.chains.find((c) => !c.routeId);
      run.s = c.launchS - 9;
      run.pos = course.pose(run.s).p;
      run.time = 10;
      frozen = true;
      overview = false;
      stepRun(run, course, 1 / 60);
    });
    make("验证：捷径与连环门", async () => {
      const backup = structuredClone(backend.state),
        checks = [];
      try {
        manager.start({ tutorial: false, seed: 11 });
        frozen = true;
        const b = course.adventures.branches[0];
        run.s = b.launchS;
        run.lane = run.targetLane = b.side * 3.2;
        run.pos = course.pose(run.s, run.lane).p;
        run.input.suction = true;
        command(run, course, "jumpPress");
        let sawBranch = false;
        for (let i = 0; i < 1000 && run.phase === "running"; i++) {
          if (i === 18) command(run, course, "jumpRelease");
          stepRun(run, course, 1 / 60);
          if (run.routeId && run.attached) sawBranch = true;
          if (i % 15 === 0) {
            view.update(run, 1 / 60);
            view.render(1 / 60);
            await new Promise((r) => setTimeout(r, 0));
          }
          if (run.adventure?.branches > 0) break;
        }
        checks.push({
          name: "actual-branch-transfer-and-main-reconnection",
          pass:
            sawBranch && run.adventure?.branches === 1 && run.falls === 0 && run.trackImpacts === 0,
          adventure: adventureStatus(run),
        });
        const render = view.status().adventures;
        checks.push({
          name: "glass-shortcut-and-six-action-gates-are-rendered",
          pass: render.branches === 1 && render.gates === 6,
          render,
        });
        manager.start({ tutorial: false, seed: 11 });
        frozen = true;
        const chain = course.adventures.chains.find((c) => !c.routeId);
        run.s = chain.launchS;
        run.pos = course.pose(run.s).p;
        command(run, course, "jumpPress");
        for (let i = 0; i < 145 && run.phase === "running"; i++) {
          if (i === 12) command(run, course, "jumpRelease");
          if (i === 23) command(run, course, "left");
          if (i === 48) command(run, course, "suctionPress");
          stepRun(run, course, 1 / 60);
          if (i % 10 === 0) {
            view.update(run, 1 / 60);
            view.render(1 / 60);
            await new Promise((r) => setTimeout(r, 0));
          }
        }
        checks.push({
          name: "actual-jump-spin-E-three-gate-completion",
          pass: run.adventure?.chains === 1 && run.falls === 0,
          adventure: adventureStatus(run),
        });
      } catch (e) {
        checks.push({ name: "exception", pass: false, error: String(e.stack) });
      } finally {
        backend.state = backup;
        backend.persist();
        options.onRestore();
      }
      output.dataset.report = JSON.stringify({ checks, view: view.status() });
      output.textContent = JSON.stringify(checks);
    });
    make("预览：汽车障碍", () => {
      manager.start({ tutorial: false, seed: 11 });
      const row = course.recipe.rows.find(
        (r) =>
          r.blocked.length === 2 &&
          r.blocked.every((l) =>
            course.hazards.some((h) => h.s === r.s && h.lane === l && h.type === "car"),
          ),
      );
      const h = course.hazards.find((h) => h.type === "car" && (!row || h.s === row.s));
      run.s = h.s - 19;
      run.lane = run.targetLane = row?.open ?? 0;
      run.pos = course.pose(run.s, run.lane).p;
      run.input.suction = true;
      run.time = 9;
      frozen = true;
      overview = false;
    });
    make("演示：汽车碰撞", () => {
      manager.start({ tutorial: false, seed: 11 });
      const h = course.hazards.find((h) => h.type === "car");
      run.s = h.s - 12;
      run.lane = run.targetLane = h.lane;
      run.pos = course.pose(run.s, run.lane).p;
      run.input.suction = true;
    });
    make("验证：汽车障碍", () => {
      const backup = structuredClone(backend.state),
        checks = [];
      try {
        manager.start({ tutorial: false, seed: 11 });
        frozen = true;
        const h = course.hazards.find((h) => h.type === "car");
        run.s = h.s - 18;
        run.pos = course.pose(run.s).p;
        run.input.suction = true;
        run.time = 8;
        view.update(run, 1 / 60);
        view.render(1 / 60);
        const visible = view.status().traffic;
        checks.push({
          name: "actual-Blender-traffic-visible-with-lights-and-shared-geometry",
          pass:
            visible.visible > 0 &&
            visible.batches === 15 &&
            visible.blackGlass &&
            visible.tailLights,
          observed: visible,
        });
        run.s = h.s - 10;
        run.lane = run.targetLane = h.lane;
        run.pos = course.pose(run.s, run.lane).p;
        for (let i = 0; i < 90 && run.phase === "running"; i++) {
          stepRun(run, course, 1 / 60);
          view.update(run, 1 / 60);
        }
        const crash = run.phase === "dying" && run.death?.cause === "traffic";
        checks.push({
          name: "actual-vehicle-contact-triggers-space-crash",
          pass: crash,
          reason: run.death?.reason,
          sparks: view.status().traffic.impacts,
        });
        for (let i = 0; i < 145 && run.phase === "dying"; i++) {
          stepRun(run, course, 1 / 60);
          view.update(run, 1 / 60);
        }
        checks.push({
          name: "vehicle-crash-uses-original-gray-postprocessing",
          pass: run.phase === "dead" && view.status().postprocessing.crash === 1,
        });
        const falls = run.falls;
        restartCheckpoint(run, course);
        view.reset();
        view.update(run, 1 / 60);
        view.render(1 / 60);
        checks.push({
          name: "checkpoint-retry-restores-color-without-extra-failure",
          pass:
            run.phase === "running" &&
            run.falls === falls &&
            view.status().postprocessing.crash === 0,
        });
      } catch (e) {
        checks.push({ name: "exception", pass: false, error: String(e.stack) });
      } finally {
        backend.state = backup;
        backend.persist();
        options.onRestore();
      }
      output.dataset.report = JSON.stringify({ checks, traffic: view.status().traffic });
      output.textContent = JSON.stringify(checks);
    });
    make("预览星环", () => {
      manager.start({ tutorial: false });
      run.s = 480;
      run.pos = course.pose(480).p;
      run.input.suction = true;
      frozen = true;
      overview = true;
    });
    make("预览倒挂", () => {
      manager.start({ tutorial: false });
      run.s = 660;
      run.pos = course.pose(660).p;
      run.input.suction = true;
      frozen = true;
    });
    make("截图星环", () => {
      manager.start({ tutorial: false });
      run.s = course.segments.find((s) => s.kind === "loop").start - 22;
      run.pos = course.pose(run.s).p;
      frozen = true;
      overview = false;
      ui.root.style.visibility = "hidden";
    });
    make("自动通关检查", async () => {
      const backup = structuredClone(backend.state);
      manager.start({ tutorial: false, endless: false });
      paused = true;
      let jumpGap = null;
      const checks = [];
      const coins = backend.state.coins;
      try {
        for (let i = 0; i < 60 * 140 && run.phase !== "finished"; i++) {
          const gap = course.gaps.find(
            (g) => g.start - run.s > -3 && g.start - run.s < 65 && !g.auto,
          );
          if (run.attached) {
            run.input.suction = true;
            run.input.jump = false;
            run.input.boost = !!gap;
            if (gap && gap.start - run.s < 11 && jumpGap !== gap.start) {
              command(run, course, "jumpPress");
              command(run, course, "suctionRelease");
              jumpGap = gap.start;
            }
          } else {
            run.input.jump = run.airTime < 0.24;
            run.input.suction = run.airTime > 0.45;
            run.input.boost = false;
          }
          stepRun(run, course, 1 / 60);
          if (run.phase === "rescue") jumpGap = null;
          if (run.phase === "dead") {
            restartCheckpoint(run, course);
            jumpGap = null;
          }
          if (i % 450 === 0) {
            view.update(run, 1 / 60);
            await new Promise((r) => setTimeout(r, 0));
          }
        }
        const finished = run.phase === "finished";
        checks.push({
          name: "full-course-completion",
          pass: finished,
          s: run.s,
          time: run.time,
          falls: run.falls,
          lands: run.lands,
        });
        if (finished) {
          finish();
          const first = backend.state.coins;
          finish();
          checks.push({
            name: "reward-settles-once",
            pass: first > coins && backend.state.coins === first,
            coins: first - coins,
          });
          checks.push({
            name: "paint-unlocked",
            pass: backend.state.driving.journey.earned.includes("starRing"),
          });
        }
      } catch (e) {
        checks.push({ name: "exception", pass: false, error: String(e.stack) });
      } finally {
        backend.state = backup;
        backend.persist();
        options.onRestore();
        paused = false;
      }
      const report = { checks, view: view.status() };
      output.dataset.report = JSON.stringify(report);
      output.textContent = JSON.stringify(report);
    });
    make("验证：无限挑战", async () => {
      const backup = structuredClone(backend.state);
      manager.start({ tutorial: false, seed: 42 });
      paused = true;
      const checks = [],
        driver = {},
        layouts = new Set(),
        samples = [];
      let maximumGeometry = 0,
        maximumMasks = 0,
        maximumLiveWindows = 0;
      try {
        for (let i = 0; i < 60 * 1600 && run.laps < 8; i++) {
          randomPilotStep(run, course, driver);
          if (i % 180 === 0) {
            view.update(run, 1 / 60);
            view.prepare();
            view.render(1 / 60);
            const status = view.status();
            maximumGeometry = Math.max(maximumGeometry, renderer.info.memory.geometries);
            maximumMasks = Math.max(maximumMasks, status.postprocessing.cachedMasks);
            maximumLiveWindows = Math.max(maximumLiveWindows, status.streaming.liveWindows);
            if (!layouts.has(status.streaming.layout)) {
              layouts.add(status.streaming.layout);
              samples.push({
                layout: status.streaming.layout,
                geometries: renderer.info.memory.geometries,
                resources: view.resources(),
                streaming: status.streaming,
              });
            }
            await new Promise((r) => setTimeout(r, 0));
          }
        }
        view.update(run, 1 / 60);
        view.render(1 / 60);
        layouts.add(view.status().streaming.layout);
        checks.push({
          name: "eight-different-random-sections-continue-without-finishing",
          pass: run.laps === 8 && run.phase === "running" && layouts.size >= 8,
          laps: run.laps,
          distance: run.bestDistance,
          time: run.time,
          layouts: [...layouts],
        });
        checks.push({
          name: "random-window-gpu-and-bloom-caches-remain-bounded",
          pass:
            maximumGeometry < 900 &&
            maximumMasks < RING_MASK_BUDGET &&
            maximumLiveWindows <= 2 &&
            view.status().streaming.created - view.status().streaming.retired <= 2,
          maximumGeometry,
          maximumMasks,
          maximumLiveWindows,
          samples,
        });
        checks.push({
          name: "random-generated-routes-require-no-fall-or-bottom-impact",
          pass: run.falls === 0 && run.trackImpacts === 0,
          falls: run.falls,
          trackImpacts: run.trackImpacts,
        });
        const base = backend.state.coins;
        run.phase = "finished";
        finish();
        const first = backend.state.coins;
        finish();
        checks.push({
          name: "random-route-settlement-and-distance-save-once",
          pass:
            first > base &&
            backend.state.coins === first &&
            backend.state.driving.starRing.bestEndlessDistance >= run.bestDistance,
          reward: first - base,
        });
      } catch (e) {
        checks.push({ name: "exception", pass: false, error: String(e.stack) });
      } finally {
        backend.state = backup;
        backend.persist();
        options.onRestore();
        paused = false;
        frozen = true;
      }
      const report = {
        checks,
        challenge: challengeSummary(run, course),
        randomness: course.randomStatus(),
        view: view.status(),
      };
      output.dataset.report = JSON.stringify(report);
      output.textContent = JSON.stringify(report);
      ui.update(run, course, false);
    });
    for (const [label, seed] of [
      ["预览：随机路线 A", 11],
      ["预览：随机路线 B", 27],
    ])
      make(label, () => {
        manager.start({ tutorial: false, seed });
        run.s = course.segments[1].start - 22;
        run.pos = course.pose(run.s).p;
        run.input.suction = true;
        run.messageTime = 0;
        frozen = true;
      });
    make("预览：区段接续", () => {
      manager.start({ tutorial: false });
      run.s = course.length - 18;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      run.messageTime = 0;
      frozen = false;
    });
    make("隐藏测试工具", () => (qa.style.display = "none"));
    make("光晕：开", () => view?.setBloom(true));
    make("光晕：关", () => view?.setBloom(false));
    make("验证：道具收集", () => {
      manager.start({ tutorial: false });
      const item = course.pickups.find((v) => v.type === "air"),
        index = course.pickups.indexOf(item);
      run.s = item.s - 4;
      run.lane = run.targetLane = item.lane;
      run.pos = course.pose(run.s, run.lane).p;
      run.pressure = 40;
      run.input.suction = true;
      run.time = 10;
      run.messageTime = 0;
      view.update(run, 0);
      let collectedAt = null;
      const events = [];
      for (let i = 0; i < 60; i++) {
        stepRun(run, course, 1 / 60);
        audio();
        view.update(run, 1 / 60);
        events.push(...run.events.filter((e) => e.type === "pickup"));
        if (run.taken.has(index) && collectedAt === null) collectedAt = run.time;
        if (collectedAt !== null && run.time - collectedAt > 0.18) break;
      }
      frozen = true;
      const result = {
        taken: run.taken.has(index),
        pressure: run.pressure,
        events,
        view: view.status().pickups,
      };
      output.dataset.pickup = JSON.stringify(result);
      output.textContent = JSON.stringify(result);
    });
    for (const [label, type] of [
      ["预览：积分道具", "ring"],
      ["预览：补气道具", "air"],
      ["预览：飞跃环", "sky"],
    ])
      make(label, () => {
        manager.start({ tutorial: false });
        const item = course.pickups.find((v) => v.type === type);
        run.s = type === "sky" ? course.gaps[1].start - 7 : item.s - 5;
        run.lane = run.targetLane = item.lane;
        run.pos = course.pose(run.s, run.lane).p;
        run.input.suction = true;
        run.messageTime = 0;
        run.time = 10;
        run.speed = 28;
        frozen = true;
      });
    make("教学演示", () => manager.start({ tutorial: true }));
    make("按住吸附", () => control("suctionPress"));
    make("松开弹射", () => control("suctionRelease"));
    make("再次吸附", () => control("suctionPress"));
    const gapPreview = (lead, pressure = 100) => {
      manager.start({ tutorial: false });
      run.s = course.gaps[1].start - lead;
      run.speed = 28;
      run.pressure = pressure;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      run.time = 10;
      run.message = "";
      run.messageTime = 0;
      frozen = true;
    };
    make("预警：断轨", () => gapPreview(48));
    make("预警：弹射区", () => gapPreview(7));
    make("预警：低气量", () => gapPreview(7, 8));
    make("试听：断轨", () => {
      gapPreview(70);
      frozen = false;
      gapAudition = true;
    });
    make("预览：环路入口", () => {
      manager.start({ tutorial: false });
      run.s = course.segments.find((s) => s.kind === "loop").start - 22;
      run.pos = course.pose(run.s).p;
      run.input.suction = true;
      run.messageTime = 0;
      frozen = true;
    });
    for (const [label, kind, offset] of [
      ["预览：吸附段", "twist", 60],
      ["预览：切弯", "turn", 25],
    ])
      make(label, () => {
        manager.start({ tutorial: false });
        run.s = course.segments.find((s) => s.kind === kind).start + offset;
        run.pos = course.pose(run.s).p;
        run.input.suction = true;
        run.messageTime = 0;
        frozen = true;
      });
    const collisionProbe = (bottom) => {
      manager.start({ tutorial: false });
      run.s = 100;
      run.speed = 0;
      run.attached = false;
      run.airTime = 0.6;
      run.pos = [0, bottom ? -2.5 : 2.5, -100];
      run.velocity = [0, bottom ? 35 : -300, 0];
      run.input.suction = bottom;
      run.messageTime = 0;
      surfaceProbe = true;
    };
    make("验证：底面碰撞", () => collisionProbe(true));
    make("验证：高速落地", () => collisionProbe(false));
    const flightPose = (kind) => {
      manager.start({ tutorial: false, seed: 11 });
      run.s = 90;
      run.pos = [0, 4.5, -90];
      run.near = course.pose(90);
      run.attached = false;
      run.velocity = [0, 0, -28];
      run.speed = 28;
      run.airTime = 0.65;
      run.input.jump = true;
      run.time = 10;
      if (kind === "barrel") {
        run.rollProgress = 0.32;
        run.rollDir = 1;
        run.roll = Math.PI * 2 * 0.191;
      } else {
        run.flipProgress = 0.42;
        run.pitch = -Math.PI * 2 * 0.353;
      }
      run.messageTime = 0;
      frozen = true;
      view.update(run, 1 / 60);
    };
    const gripPose = () => {
      manager.start({ tutorial: false, seed: 11 });
      const curve = course.segments.find((s) => s.kind === "turn");
      run.s = curve.start + 4;
      run.pos = course.pose(run.s).p;
      run.speed = 28;
      run.velocity = course.pose(run.s).t.map((v) => v * 28);
      run.messageTime = 0;
      run.invuln = 10;
      view.update(run, 1 / 60);
    };
    const deathPose = (capture) => {
      gripPose();
      if (capture) {
        for (let i = 0; i < 420; i++) {
          stepRun(run, course, 1 / 60);
          view.update(run, 1 / 60);
          if (run.phase === "dying" && run.death.elapsed > 1.9) break;
        }
        frozen = true;
      } else frozen = false;
    };
    // Explicit QA-only fixtures: no rewards, records or ghost data are persisted.
    const previewUI = (kind) => {
      if (kind === "dead") {
        deathPose(true);
        for (let i = 0; i < 180 && run.phase !== "dead"; i++) {
          stepRun(run, course, 1 / 60);
          view.update(run, 1 / 60);
        }
      } else {
        manager.start({ tutorial: false, seed: 11 });
        run.s = 90;
        run.pos = course.pose(run.s).p;
        run.endless = kind !== "clear";
        run.time = 87.6;
        run.score = 5310;
        run.laps = 2;
        run.bestDistance = 4876;
        run.rings = 34;
        run.tricks = 8;
        run.lands = 16;
        run.beatHits = 11;
        if (kind === "clear") run.s = course.length;
        if (["clear", "endless"].includes(kind)) run.phase = "finished";
      }
      settled = true;
      frozen = true;
      paused = kind === "pause";
      sound.stopLoops();
      sound.setPaused(paused);
      view.update(run, 1 / 60);
      view.render(1 / 60);
      if (run.phase === "finished")
        ui.result(run, 49, {
          bestEndlessDistance: 4876,
          bestEndlessScore: 5310,
          bestTime: 87.6,
          bestScore: 5310,
        });
      ui.update(run, course, paused);
    };
    make("界面：通关", () => previewUI("clear"));
    make("界面：无限结算", () => previewUI("endless"));
    make("界面：失败", () => previewUI("dead"));
    make("界面：暂停", () => previewUI("pause"));
    make("验证：统一界面", () => {
      const checks = [];
      const nativeCard = getComputedStyle(document.querySelector("#gameover .go-card"));
      const nativePrimary = getComputedStyle(document.querySelector("#retry-btn"));
      for (const kind of ["clear", "endless", "dead", "pause"]) {
        previewUI(kind);
        const card = ui.root.querySelector(".go-card"),
          style = getComputedStyle(card);
        const primary = [...card.querySelectorAll("button.primary")].filter(
          (b) => b.getClientRects().length,
        );
        card.getAnimations().forEach((animation) => animation.finish());
        const rect = card.getBoundingClientRect();
        checks.push({
          name: kind + "-shared-card-and-one-white-primary",
          pass:
            style.backgroundColor === nativeCard.backgroundColor &&
            style.borderColor === nativeCard.borderColor &&
            primary.length === 1 &&
            getComputedStyle(primary[0]).backgroundColor === nativePrimary.backgroundColor,
        });
        checks.push({
          name: kind + "-dialog-fits-viewport-and-hides-driving-hud",
          pass:
            rect.left >= 0 &&
            rect.right <= innerWidth &&
            rect.top >= 0 &&
            rect.bottom <= innerHeight &&
            getComputedStyle(ui.root.querySelector(".ring-bottom")).visibility === "hidden",
        });
        if (kind === "dead") {
          actions.checkpoint();
          ui.update(run, course, false);
          checks.push({
            name: "checkpoint-removes-dialog-and-restores-driving",
            pass:
              run.phase === "running" &&
              ui.root.querySelector("#ring-overlay").hidden &&
              !ui.root.classList.contains("ring-dialog-open"),
          });
        }
      }
      actions.resume();
      run.pressure = 42;
      ui.update(run, course, false);
      const energy = ui.root.querySelector("#ring-energy"),
        fill = ui.root.querySelector("#ring-air-fill");
      const nativeAir = getComputedStyle(document.querySelector("#air-fill"));
      checks.push({
        name: "air-uses-native-rectangle-ticks-gradient-and-pressure",
        pass:
          energy.value === 42 &&
          fill.style.transform === "scaleX(0.42)" &&
          getComputedStyle(fill).backgroundImage === nativeAir.backgroundImage &&
          ui.root.querySelector(".air-ticks") !== null &&
          getComputedStyle(fill.parentElement).height === "16px",
      });
      run.pressure = 10;
      ui.update(run, course, false);
      checks.push({
        name: "low-air-native-warning",
        pass: energy.parentElement.classList.contains("low"),
      });
      startRainbow(run, course);
      ui.update(run, course, false);
      checks.push({
        name: "rainbow-shares-inv-label-track-countdown-and-edge",
        pass:
          !!ui.root.querySelector("#ring-rainbow.inv-bar.rainbow.on .inv-label") &&
          ui.root.querySelector("#ring-rainbow-time").textContent === "8.0 秒" &&
          ui.rainbowScreen.status().edge &&
          energy.parentElement.classList.contains("infinite"),
      });
      ui.update(run, course, true);
      checks.push({
        name: "rainbow-pause-retains-frozen-countdown",
        pass:
          ui.root.querySelector("#ring-rainbow").hasAttribute("data-paused") &&
          ui.root.querySelector("#ring-rainbow-time").textContent === "8.0 秒",
      });
      run.rainbow.remaining = 0;
      ui.update(run, course, false);
      checks.push({
        name: "rainbow-expiry-clears-meter-edge-and-infinite-air",
        pass:
          ui.root.querySelector("#ring-rainbow").hidden &&
          !ui.rainbowScreen.status().edge &&
          !energy.parentElement.classList.contains("infinite"),
      });
      output.dataset.report = JSON.stringify({ checks });
      output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
      previewUI("endless");
    });

    make("预览：复杂喷气", () => flightPose("barrel"));
    make("预览：前空翻", () => flightPose("flip"));
    make("预览：吸气流", () => {
      gripPose();
      run.input.suction = true;
      frozen = true;
    });
    make("预览：吸附预警", () => {
      gripPose();
      for (let i = 0; i < 55; i++) stepRun(run, course, 1 / 60);
      frozen = true;
    });
    make("演示：脱轨死亡", () => deathPose(false));
    make("截图：灰色死亡", () => deathPose(true));
    make("验证：飞行表现", () => {
      const backup = structuredClone(backend.state),
        checks = [];
      try {
        flightPose("barrel");
        for (let i = 0; i < 60; i++) view.update(run, 1 / 60);
        view.render(1 / 60);
        const fx = view.status().flightEffects;
        checks.push({
          name: "original-scene-plumes-reused-with-RCS-and-floor-clipping",
          pass:
            fx.nativePlumes === 10 &&
            fx.sharedNativeGeometry &&
            fx.sharedNativeNoise &&
            fx.jet > 0.9 &&
            fx.levels.S1 > 0.5,
          observed: fx,
        });
        gripPose();
        run.input.suction = true;
        for (let i = 0; i < 60; i++) view.update(run, 1 / 60);
        view.render(1 / 60);
        checks.push({
          name: "held-E-draws-visible-converging-intake",
          pass:
            view.status().flightEffects.suction > 0.9 &&
            view.status().flightEffects.particles > 100,
          observed: view.status().flightEffects,
        });
        gripPose();
        for (let i = 0; i < 55; i++) stepRun(run, course, 1 / 60);
        view.update(run, 1 / 60);
        view.render(1 / 60);
        checks.push({
          name: "real-missing-E-warns-before-loss",
          pass: run.attached && run.gripWarningLevel > 0.5 && view.status().glass.gripWarning > 0.5,
          level: run.gripWarningLevel,
        });
        deathPose(true);
        view.render(1 / 60);
        checks.push({
          name: "real-drift-leads-to-space-tumble-and-original-crash-grayscale",
          pass:
            run.phase === "dying" &&
            view.status().postprocessing.crash === 1 &&
            view.status().death.active,
          observed: { death: run.death, view: view.status().death },
        });
        const before = run.falls;
        restartCheckpoint(run, course);
        view.reset();
        view.update(run, 1 / 60);
        view.render(1 / 60);
        checks.push({
          name: "checkpoint-retry-restores-color-and-vehicle-without-double-counting-death",
          pass:
            run.phase === "running" &&
            run.death === null &&
            run.falls === before &&
            view.status().postprocessing.crash === 0,
        });
      } catch (error) {
        checks.push({ name: "exception", pass: false, error: String(error.stack) });
      } finally {
        backend.state = backup;
        backend.persist();
        options.onRestore();
        frozen = true;
      }
      const result = { checks, view: view.status() };
      output.dataset.report = JSON.stringify(result);
      output.textContent = JSON.stringify(result);
    });
    const structureFixture = new URLSearchParams(location.search).get("structureFixture");
    const fixtureLabels = {
      left: "新轨道：长左弯",
      right: "新轨道：长右弯",
      helix: "新轨道：螺旋驾驶",
      overview: "新轨道：螺旋全景",
    };
    if (fixtureLabels[structureFixture])
      requestAnimationFrame(() => {
        [...qa.querySelectorAll("button")]
          .find((b) => b.textContent === fixtureLabels[structureFixture])
          .click();
        qa.style.display = "none";
      });
    const uiFixture = new URLSearchParams(location.search).get("uiFixture");
    if (["clear", "endless", "dead", "pause", "rainbow", "check"].includes(uiFixture)) {
      requestAnimationFrame(() => {
        const label =
          uiFixture === "check"
            ? "验证：统一界面"
            : uiFixture === "rainbow"
              ? "预览：彩虹无敌"
              : "界面：" +
                { clear: "通关", endless: "无限结算", dead: "失败", pause: "暂停" }[uiFixture];
        [...qa.querySelectorAll("button")].find((b) => b.textContent === label).click();
        qa.style.display = "none";
      });
    }
    qa.append(output);
    document.body.append(qa);
  }
  return manager;
}
