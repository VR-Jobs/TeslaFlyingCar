import {
  DEFAULT_FEATURES,
  normalizeOptions,
  createMetrics,
  evaluateMode,
  landingGrade,
  UTC_DAY,
} from "./rules.js";
import { t } from "./messages.js";
import { installFairTraffic } from "./fair-traffic.js";
import { createDrivingUI } from "./ui.js";
import { LESSONS, LESSON_COUNT, lessonIndex, lessonText, nextAcademyLesson } from "./lessons.js";
import { installItemTraining } from "./item-training.js";

export function installDrivingFeatures(context) {
  const { game, backend, getScreen } = context;
  const profile = () => backend.drivingProfile();
  let freeFeatures = { ...DEFAULT_FEATURES, ...profile().preferences?.freeFeatures };
  let preferences = profile().preferences || {
    mode: profile().lesson < LESSON_COUNT ? "academy" : "free",
    lesson: lessonIndex(profile().lesson),
    features: { ...DEFAULT_FEATURES },
  };
  preferences = { ...normalizeOptions(preferences) };
  let options = normalizeOptions(preferences),
    runId = null,
    metrics = createMetrics(),
    lastReview = null;
  let toastKey = null,
    toastValues = {},
    toastUntil = 0,
    landingCapture = null,
    resolving = false,
    completionRequested = false;
  let lastPersist = 0;
  const manager = {
    suspended: false,
    options: () => options,
    preferences: () => preferences,
    profile,
    metrics: () => ({ ...metrics }),
    lastReview: () => lastReview,
    selectMode(mode) {
      preferences.mode = mode;
      if (mode === "free") preferences.features = { ...freeFeatures };
      preferences.lesson = lessonIndex(profile().lesson);
      savePreferences();
    },
    selectLesson(lesson) {
      preferences.mode = "academy";
      preferences.lesson = lesson;
      savePreferences();
    },
    toggle(key, value) {
      preferences.features[key] = value;
      freeFeatures[key] = value;
      savePreferences();
    },
    board: (query) => backend.drivingBoard(query),
    async start() {
      context.menu();
      await context.start();
    },
    async continueCourse() {
      if (!lastReview || lastReview.mode !== "academy") return;
      const next = lastReview.nextLesson;
      preferences.mode = next < LESSON_COUNT ? "academy" : "free";
      preferences.lesson = lessonIndex(next);
      savePreferences();
      ui.render();
      await manager.start();
    },
    trainingAction: () => training.action(),
    status: () => ({
      options,
      metrics: { ...metrics },
      runId,
      profile: profile(),
      traffic: { ...traffic.counters },
      completion: evaluateMode(options.mode, metrics, options.lesson),
      lastReview,
    }),
  };
  function savePreferences() {
    preferences = { ...normalizeOptions(preferences) };
    options = normalizeOptions(preferences);
    backend.setRunOptions(options);
    backend.saveDrivingPreferences({ ...preferences, freeFeatures });
  }
  savePreferences();
  const active = () => (manager.suspended || options.mode === "classic" ? null : options);
  const traffic = installFairTraffic(game, active);
  const ui = createDrivingUI(manager);
  const toast = (key, values = {}) => {
    toastKey = key;
    toastValues = values;
    toastUntil = game.time + 2.3;
  };
  function begin(run) {
    if (!run) return;
    options = normalizeOptions(run);
    runId = run.runId;
    metrics = { ...createMetrics(), ...run.drivingMetrics };
    completionRequested = false;
    toastKey = null;
    landingCapture = null;
    lastReview = null;
    ui.clearReview();
    if (["daily", "academy"].includes(options.mode))
      traffic.begin(options, run.seed, game.distance, game.distance > 0);
  }
  function best(key, points) {
    if (points >= metrics.bestActionPoints) {
      metrics.bestAction = key;
      metrics.bestActionPoints = points;
    }
  }
  const intro = game.startIntro;
  game.startIntro = function (...args) {
    const out = intro.apply(this, args);
    begin(backend.state.activeRuns[backend.lastStartedRunId]);
    return out;
  };
  const targetSpeed = game.targetSpeed;
  game.targetSpeed = function () {
    const base = targetSpeed.call(this);
    if (!active()) return base;
    if (options.mode === "academy")
      return Math.min(base, options.lesson >= 3 && this.powerActive ? 40 : 23);
    if (options.mode === "precision") return Math.min(base, 30);
    if (options.mode === "escape")
      return Math.min(48, base * (1.1 + Math.min(1, game.time / 45) * 0.25));
    return base;
  };
  const holdStart = game.holdStart,
    canRevive = game.canRevive;
  const restricted = () =>
    !manager.suspended &&
    ["academy", "precision", "stunt", "escape", "daily"].includes(options.mode);
  game.holdStart = function (...args) {
    return restricted() ? false : holdStart?.apply(this, args);
  };
  game.canRevive = function (...args) {
    return restricted() ? false : canRevive?.apply(this, args);
  };
  const playerLand = game.player.land;
  game.player.land = function (...args) {
    if (active())
      landingCapture = landingGrade({
        roll: this.roll + this.rollSettle,
        flip: this.flip + this.flipSettle,
        velocity: this.vy,
        completed: this.tricksThisAir,
        pending: this.trick?.acc || 0,
        credited: this.trick?.credited || false,
      });
    return playerLand.apply(this, args);
  };
  const event = game.onEvent;
  game.onEvent = function (name, data = {}) {
    const before = this.score,
      out = event.call(this, name, data);
    if (!active()) return out;
    if (name === "jump") metrics.jumps++;
    if (name === "trickDone") {
      const complete = (this.player.trick?.acc || 0) >= Math.PI * 2 * 0.92;
      if (complete) {
        metrics.tricks++;
        if (data.type === "barrel") metrics.barrels++;
        else metrics.flips++;
        const key = data.type === "barrel" ? "barrel" : "flip";
        best(key, this.score - before);
        if (options.features.feedback) toast(key);
      }
    }
    return out;
  };
  const resolveLand = game.resolveLand;
  game.resolveLand = function (data) {
    if (!active()) return resolveLand.call(this, data);
    const cleared = this.clearedThisAir;
    const before = this.score,
      grade = landingCapture || { perfect: false, complete: false };
    metrics.landings++;
    metrics.lastLandComplete = grade.complete;
    if (options.features.feedback) data = { ...data, result: grade.perfect ? "perfect" : "clean" };
    if (data.result === "perfect") metrics.perfectLandings++;
    resolving = true;
    const out = resolveLand.call(this, data);
    resolving = false;
    if (options.features.feedback) {
      const key = grade.perfect
        ? "perfect"
        : grade.complete
          ? "rough"
          : data.tricks
            ? "incomplete"
            : "clean";
      toast(key, { points: Math.round(this.score - before), cleared });
      if (grade.perfect) best("perfect", this.score - before);
    }
    landingCapture = null;
    return out;
  };
  const endCombo = game.endCombo;
  game.endCombo = function () {
    const count = this.comboCount,
      out = endCombo.call(this);
    if (active() && count > 0) {
      metrics.comboBreak =
        this.state === "crashing"
          ? "collision"
          : resolving && !metrics.lastLandComplete
            ? "noTrick"
            : "timeout";
      // Keep combo accounting for scoring/review without interrupting play with
      // a "combo lost" banner after every ordinary landing gap.
    }
    return out;
  };
  const crash = game.crash;
  game.crash = function (...args) {
    if (active() && this.state === "playing") metrics.collisions++;
    return crash.apply(this, args);
  };
  const finish = game.finish;
  game.finish = function (...args) {
    if (active()) {
      metrics.distance = Math.floor(this.distance);
      metrics.duration = this.time;
      metrics.maxCombo = this.maxCombo;
      backend.recordDrivingMetrics(this.runId, metrics);
    }
    return finish.apply(this, args);
  };
  const gameOver = game.onGameOver;
  game.onGameOver = async function (result) {
    const run = backend.state.activeRuns[this.runId],
      captured = { ...metrics };
    await gameOver.call(this, result);
    if (manager.suspended || !run || run.mode === "classic") return;
    const evaluation = evaluateMode(run.mode, captured, run.lesson);
    const record = backend.state.runs.find((r) => r.runId === run.runId);
    const advice =
      run.mode === "academy" && run.lesson >= 3
        ? "tip.item"
        : captured.collisions
          ? "tip.collision"
          : captured.airSpent > 650
            ? "tip.air"
            : captured.tricks < 2
              ? "tip.trick"
              : captured.maxCombo < 5
                ? "tip.combo"
                : "tip.good";
    lastReview = {
      mode: run.mode,
      lesson: run.lesson,
      nextLesson: nextAcademyLesson(run.lesson, evaluation.success, profile().lesson),
      success: evaluation.success,
      metrics: captured,
      advice,
      trainingReward: record?.settlement?.driving?.trainingReward || 0,
      failureReason: captured.collisions ? result.reason : null,
    };
    ui.review(lastReview);
    if (run.mode === "academy" || (evaluation.success && !["free", "classic"].includes(run.mode))) {
      document.getElementById("go-story-text").textContent = t(
        run.mode === "academy"
          ? evaluation.success
            ? "lessonComplete"
            : "lessonFailed"
          : "success",
      );
      document.getElementById("go-story").classList.remove("hidden");
    }
    if (run.mode === "academy" && evaluation.success) {
      preferences.lesson = lessonIndex(lastReview.nextLesson);
      preferences.mode = lastReview.nextLesson < LESSON_COUNT ? "academy" : "free";
      savePreferences();
    }
    ui.render();
  };
  const training = installItemTraining(
    context,
    () => options,
    () => metrics,
    () => manager.suspended,
  );
  const step = game.stepSimulation;
  game.stepSimulation = function (dt, events) {
    if (!active()) return step.call(this, dt, events);
    if (this.runId && this.runId !== runId && backend.state.activeRuns[this.runId])
      begin(backend.state.activeRuns[this.runId]);
    const lane = this.player.lane,
      grounded = this.player.grounded,
      air = this.player.air;
    this.drivingStepStart = this.distance;
    training.beforeStep();
    const output = step.call(this, dt, events);
    training.afterStep(dt);
    metrics.distance = this.distance;
    metrics.duration = this.time;
    metrics.maxCombo = this.maxCombo;
    metrics.cleared = this.stats.cleared || 0;
    if (this.state === "playing") {
      if (grounded && this.player.lane !== lane) metrics.laneChanges++;
      if (!this.player.grounded) metrics.airTime += dt;
      if (this.player.hovering) metrics.hoverTime += dt;
      metrics.airSpent += Math.max(0, air - this.player.air);
      metrics.maxHeight = Math.max(metrics.maxHeight, this.player.y);
      const evaluation = evaluateMode(options.mode, metrics, options.lesson);
      if (evaluation.finished && !completionRequested) {
        completionRequested = true;
        this.crashReason = t(evaluation.success ? "success" : "retry");
        this.state = "downed";
        this.finish();
      }
    }
    return output;
  };
  const refresh = () => {
    const inRun = getScreen() === "game" && game.state === "playing" && !manager.suspended;
    const evaluation = evaluateMode(options.mode, metrics, options.lesson),
      p = game.player;
    const grade = landingGrade({
      roll: p.roll + p.rollSettle,
      flip: p.flip + p.flipSettle,
      velocity: p.vy,
      completed: p.tricksThisAir,
      pending: p.trick?.acc || 0,
      credited: p.trick?.credited || false,
    });
    const enhanced = !!active(),
      feedback = enhanced && options.features.feedback,
      low = p.air < 120;
    const landing = feedback && !p.grounded && p.y < 2 && p.vy < 0;
    const threat =
      enhanced && options.features.fairTraffic
        ? game.traffic.list
            .filter(
              (car) =>
                !car.dead && car.z < 0 && Math.abs(car.x - p.x) < car.hw + 1 && p.y < car.h + 0.3,
            )
            .map(
              (car) =>
                Math.max(0, -car.z - car.hl - 2) / Math.max(1, game.speed - (car.ownSpeed || 0)),
            )
            .filter((ttc) => ttc > 0 && ttc < 2.8)
            .sort((a, b) => a - b)[0]
        : null;
    let coach = null;
    if (enhanced && options.features.coaching)
      coach =
        options.mode === "academy"
          ? options.lesson < 3
            ? t("lesson" + options.lesson)
            : (training.coach() ||
                lessonText(options.lesson, "prompt", document.documentElement.lang === "en")) +
              " · " +
              t("trainingFree")
          : options.mode === "free"
            ? metrics.jumps === 0
              ? t("guideJump")
              : metrics.tricks === 0
                ? t("guideRoll")
                : metrics.hoverTime < 1.2
                  ? t("guideFly")
                  : null
            : ["precision", "stunt", "escape", "daily"].includes(options.mode)
              ? t(options.mode + ".desc")
              : null;
    if (enhanced && ["stunt", "escape"].includes(options.mode) && coach)
      coach += ` · ${t("timer", { n: Math.max(0, Math.ceil((options.mode === "stunt" ? 60 : 45) - game.time)) })}`;
    ui.live({
      screen: getScreen(),
      playing: game.state === "playing" || game.state === "headstart" || training.waiting(),
      coach,
      label:
        options.mode === "academy"
          ? t("lesson", { n: options.lesson + 1 }) +
            " · " +
            lessonText(options.lesson, "title", document.documentElement.lang === "en")
          : t(options.mode),
      trainingAction: training.button(),
      progress:
        options.mode === "free"
          ? ((metrics.jumps > 0) + (metrics.tricks > 0) + (metrics.hoverTime >= 1.2)) / 3
          : evaluation.progress,
      toast:
        feedback && toastKey && game.time < toastUntil
          ? `${toastValues.cleared > 1 ? t("cleared", { n: toastValues.cleared }) + " · " : ""}${t(toastKey, toastValues)}${toastValues.points > 0 ? " +" + toastValues.points : ""}`
          : null,
      landing: landing
        ? grade.perfect
          ? t("ready")
          : t("rotation", {
              n: Math.min(100, Math.round(((p.trick?.acc || 0) / (Math.PI * 2)) * 100)),
            })
        : null,
      aligned: grade.perfect,
      warning:
        feedback && low
          ? t("low")
          : threat != null
            ? t("hazard", { n: threat.toFixed(1) })
            : enhanced && options.features.fairTraffic && game.distance % 420 >= 330
              ? t("safe")
              : null,
      lowAir: feedback && low,
    });
    if (inRun && performance.now() - lastPersist > 2000) {
      backend.recordDrivingMetrics(game.runId, metrics);
      backend.persist();
      lastPersist = performance.now();
    }
  };
  const timer = setInterval(refresh, 100);
  manager.refresh = refresh;
  manager.ui = ui;
  manager.dispose = () => clearInterval(timer);
  return manager;
}
