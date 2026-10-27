import { dailySeed, UTC_DAY } from "./rules.js";
import { LESSONS, LESSON_COUNT } from "./lessons.js";
export async function runDrivingBrowserChecks(context, driving) {
  const { game, backend } = context,
    results = [];
  const record = (name, ok, detail) => results.push({ name, status: ok ? "PASS" : "FAIL", detail });
  const settle = () => new Promise((resolve) => setTimeout(resolve, 40));
  async function setup(mode, lesson = 0) {
    context.menu();
    driving.selectMode(mode);
    if (mode === "academy") driving.selectLesson(lesson);
    await context.start();
    await context.pause(true);
    game.reset();
    game.state = "playing";
    game.speed = 23;
    game.launchT = 5;
    game.runId = backend.lastStartedRunId;
  }
  const step = (events) => game.stepSimulation(1 / 60, events || []);
  for (let lesson = 0; lesson < LESSON_COUNT; lesson++) {
    await setup("academy", lesson);
    const inventoryBefore = JSON.stringify(backend.state.items);
    for (let i = 0; i < 2800 && !["over", "idle"].includes(game.state); i++) {
      const events =
        lesson === 0
          ? i === 10
            ? ["left"]
            : i === 30
              ? ["right"]
              : i === 50
                ? ["up"]
                : []
          : lesson === 1
            ? i === 10
              ? ["jumpPress"]
              : i === 120
                ? ["jumpRelease"]
                : []
            : lesson === 2 && i === 10
              ? ["up"]
              : lesson === 2 && i === 18
                ? ["right"]
                : [];
      step(events);
      if (lesson >= 3) {
        const id = LESSONS[lesson].id;
        if (["head_start", "start_revive", "coin_double"].includes(id) && game.state === "playing")
          driving.trainingAction();
        if (id === "revive" && game.state === "downed") driving.trainingAction();
        if (game.item === "ludicrous" || (game.item === "shockwave" && game.distance > 95))
          driving.trainingAction();
      }
    }
    await settle();
    const run = backend.state.runs.find((r) => r.runId === game.runId);
    record(`academy-lesson-${lesson + 1}`, !!run?.challengeSuccess, {
      mode: run?.mode,
      metrics: run?.drivingMetrics,
      reward: run?.settlement?.driving?.trainingReward,
    });
    record(
      `academy-${lesson + 1}-inventory-preserved`,
      JSON.stringify(backend.state.items) === inventoryBefore,
      backend.state.items,
    );
    if (lesson < 3)
      record(
        `academy-${lesson + 1}-next-button`,
        document
          .getElementById("retry-btn")
          .textContent.includes(document.documentElement.lang === "en" ? "Next lesson" : "下一关"),
        document.getElementById("retry-btn").textContent,
      );
    if (lesson === 0 || lesson === 2 || lesson === LESSON_COUNT - 1) {
      document.getElementById("retry-btn").click();
      await settle();
      record(
        lesson === 0
          ? "next-button-launches-second-lesson"
          : lesson === 2
            ? "third-lesson-next-starts-item-training"
            : "final-lesson-finish-starts-free-drive",
        lesson === LESSON_COUNT - 1
          ? backend.state.activeRuns[backend.lastStartedRunId]?.mode === "free"
          : backend.state.activeRuns[backend.lastStartedRunId]?.lesson === lesson + 1,
        backend.state.activeRuns[backend.lastStartedRunId],
      );
    }
  }
  await setup("academy", 0);
  for (let i = 0; i < 2500 && game.state !== "over"; i++) step([]);
  await settle();
  record(
    "failed-lesson-keeps-retry",
    document
      .getElementById("retry-btn")
      .textContent.includes(document.documentElement.lang === "en" ? "Retry" : "重试"),
    document.getElementById("retry-btn").textContent,
  );
  record(
    "failed-lesson-does-not-skip",
    driving.preferences().mode === "academy" && driving.preferences().lesson === 0,
    driving.preferences(),
  );
  const samples = [];
  for (let run = 0; run < 2; run++) {
    await setup("daily");
    for (let i = 0; i < 300 && game.distance < 100 && game.state === "playing"; i++)
      step(i === 0 && run === 1 ? ["boostPress"] : []);
    samples.push({
      seed: game.runSeed,
      cars: game.traffic.list
        .map((c) => ({ type: c.type, x: c.x, D: Math.round((game.distance - c.z) * 1000) / 1000 }))
        .sort((a, b) => a.D - b.D || a.x - b.x),
    });
  }
  record(
    "daily-layout-independent-of-boost",
    samples[0].seed === dailySeed(UTC_DAY()) &&
      JSON.stringify(samples[0]) === JSON.stringify(samples[1]),
    samples,
  );
  const collisionCheck = game.checkTraffic;
  try {
    game.checkTraffic = () => {};
    for (const mode of ["precision", "stunt", "escape"]) {
      await setup(mode);
      for (let i = 0; i < 4200 && game.state === "playing"; i++) {
        let events = [];
        if (mode === "stunt") {
          if (i % 120 === 10) events = ["up"];
          if (i % 120 === 18) events = [Math.floor(i / 120) % 2 ? "left" : "right"];
        }
        step(events);
      }
      await settle();
      const row = backend.state.runs.find((r) => r.runId === game.runId);
      record(`${mode}-completion-contract`, !!row?.challengeSuccess, {
        mode: row?.mode,
        metrics: row?.drivingMetrics,
      });
    }
  } finally {
    game.checkTraffic = collisionCheck;
  }
  await setup("classic");
  step(["up"]);
  record(
    "original-mode-opt-out",
    driving.options().mode === "classic" &&
      !driving.options().features.feedback &&
      !driving.options().features.fairTraffic &&
      game.player.y > 0,
    { options: driving.options(), height: game.player.y },
  );
  context.menu();
  driving.selectMode("free");
  driving.ui.render();
  return {
    scope:
      "Actual recovered simulation with enhancement hooks, fixed 60 Hz, intro skipped. All fourteen lessons exercise real pickups, power-ups, shield collisions, head-start flight and auto/manual revives. The three challenge completion-contract tests temporarily suppress collisions to isolate end conditions; all lessons and daily-layout tests keep collision checks. Records are local to this test origin.",
    results,
  };
}
