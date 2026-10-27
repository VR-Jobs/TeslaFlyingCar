import { runGameplayChecks } from "./gameplay-checks.js";
import { runDrivingBrowserChecks } from "../features/browser-checks.js";
export function installIterationChecks(
  context,
  driving,
  handling,
  scenery,
  exterior,
  comfort,
  progress,
) {
  if (!new URLSearchParams(location.search).has("iterationQA")) return;
  const panel = document.createElement("div");
  panel.id = "iteration-qa";
  panel.style.cssText =
    "position:fixed;bottom:4px;left:4px;z-index:9999;display:flex;gap:4px;max-width:95vw;background:#090909d9;padding:5px;font:11px system-ui;color:white";
  const button = document.createElement("button");
  button.textContent = "运行本轮检查";
  button.id = "iteration-run";
  const output = document.createElement("output");
  output.id = "iteration-output";
  output.style.cssText =
    "max-width:180px;max-height:20px;overflow:hidden;white-space:nowrap;display:block";
  panel.append(button, output);
  document.body.append(panel);
  const captureStyle = document.createElement("style");
  captureStyle.textContent = `.scene-capture #hud,.scene-capture #driving-coach,
    .scene-capture #driving-feedback,.scene-capture #driving-warning,
    .scene-capture #driving-landing,.scene-capture #handling-indicator,
    .scene-capture #quick-restart,.scene-capture #toast{display:none!important}`;
  document.head.append(captureStyle);
  const { game, backend } = context;
  const nativeStep = game.stepSimulation;
  const result = (rows, name, ok, detail) =>
    rows.push({ name, status: ok ? "PASS" : "FAIL", detail });
  button.onclick = async () => {
    game.stepSimulation = nativeStep;
    button.disabled = true;
    output.textContent = "检查中";
    const state = structuredClone(backend.state),
      prefs = structuredClone(driving.preferences()),
      rows = [];
    try {
      const core = await runGameplayChecks(context);
      rows.push(...core.results);
      context.menu();
      driving.selectMode("free");
      await context.start();
      await context.pause(true);
      const reset = () => {
        game.reset();
        game.state = "playing";
        game.speed = 25;
        game.launchT = 5;
        game.spawner.update = () => {};
      };
      const spawn = game.spawner.update;
      try {
        reset();
        const p = game.player;
        p.grounded = false;
        p.y = 0.5;
        p.vy = -8;
        p.maxY = 2.5;
        p.handle("jumpPress", game.ctx());
        p.handle("jumpRelease", game.ctx());
        for (let i = 0; i < 8; i++) game.stepSimulation(1 / 60, []);
        result(
          rows,
          "tap-buffer-rejumps-once",
          handling.status().bufferedJumps === 1 && !p.grounded && !p.trick && p.vy > 0,
          { ...handling.status(), y: p.y, vy: p.vy },
        );
        result(
          rows,
          "preceding-landing-settled",
          !game.pendingLand && driving.metrics().landings >= 1,
          driving.metrics(),
        );
        for (let i = 0; i < 90; i++) game.stepSimulation(1 / 60, []);
        result(
          rows,
          "buffer-does-not-auto-repeat",
          p.grounded && handling.status().bufferedJumps === 1,
          handling.status(),
        );
        reset();
        p.grounded = false;
        p.y = 0.5;
        p.vy = -8;
        p.maxY = 2.5;
        p.handle("jumpPress", game.ctx());
        for (let i = 0; i < 24; i++) game.stepSimulation(1 / 60, []);
        result(
          rows,
          "buffer-held-jump-transitions-to-flight",
          handling.status().bufferedJumps === 1 && p.hovering && p.jumpHeld,
          handling.status(),
        );
        reset();
        p.grounded = false;
        p.y = 0.5;
        p.vy = -8;
        p.maxY = 2.5;
        p.handle("jumpPress", game.ctx());
        p.releaseControls();
        for (let i = 0; i < 12; i++) game.stepSimulation(1 / 60, []);
        result(
          rows,
          "blur-release-cancels-buffer",
          p.grounded && handling.status().bufferedJumps === 0,
          handling.status(),
        );
        reset();
        p.grounded = false;
        p.y = 0.4;
        p.vy = -1;
        p.handle("right", game.ctx());
        result(
          rows,
          "low-rotation-denied-steering-retained",
          !p.trick && p.lane === 2 && handling.status().blocked === "height",
          handling.status(),
        );
        reset();
        p.handle("up", game.ctx());
        for (let i = 0; i < 8; i++) game.stepSimulation(1 / 60, []);
        p.handle("right", game.ctx());
        result(rows, "normal-jump-still-allows-barrel", p.trick?.type === "barrel", {
          y: p.y,
          type: p.trick?.type,
        });
        reset();
        p.grounded = false;
        p.y = 2;
        p.vy = 4;
        p.air = 0;
        p.handle("up", game.ctx());
        result(
          rows,
          "no-air-rotation-feedback",
          !p.trick && handling.status().blocked === "air",
          handling.status(),
        );
        reset();
        p.grounded = false;
        p.y = 3;
        p.vy = -8;
        p.maxY = 3;
        for (let i = 0; i < 50 && !p.grounded; i++) game.stepSimulation(1 / 60, []);
        result(
          rows,
          "impact-body-stays-above-road",
          p.susp >= -0.105 && p.car.body.position.y >= -0.064,
          { impact: handling.status().lastImpact, compression: p.car.body.position.y },
        );
        reset();
        p.grounded = false;
        p.y = 0.6;
        p.vy = -4;
        const obstacle = game.traffic.add("sedan", 0, -50);
        game.crash("collision", obstacle);
        result(
          rows,
          "specific-descending-collision-reason",
          game.crashReason === "落地前碰到前车",
          game.crashReason,
        );
        const oldRun = backend.lastStartedRunId;
        await document.getElementById("quick-restart").onclick();
        result(
          rows,
          "quick-restart-settles-and-starts-new-run",
          backend.lastStartedRunId !== oldRun && game.state === "intro",
          { state: game.state, run: backend.lastStartedRunId },
        );
      } finally {
        game.spawner.update = spawn;
        context.menu();
      }
      const lessons = await runDrivingBrowserChecks(context, driving);
      rows.push(...lessons.results);
      result(
        rows,
        "fixed-layout-full-course-audit",
        driving.status().traffic.fixedLayoutReachable === true,
        driving.status().traffic,
      );
      result(
        rows,
        "journey-medal-unlock",
        progress.status().earned.includes("orbit"),
        progress.status(),
      );
      scenery.select("coast");
      result(
        rows,
        "lazy-coast-first-selection",
        scenery.status().coast.initialized && scenery.status().selected === "coast",
        scenery.status().coast,
      );
      scenery.select("space");
      game.env.update(2700, 0);
      result(
        rows,
        "space-switch-restores-isolation",
        scenery.status().terrestrialVisible === 0 && scenery.status().roadPreserved,
        scenery.status(),
      );
      result(
        rows,
        "lod-budget",
        exterior.status().medium.triangles < 40000 && exterior.status().low.triangles < 22000,
        exterior.status(),
      );
      result(
        rows,
        "four-home-buttons",
        document.querySelectorAll(".minimal-actions button").length === 4,
      );
      result(
        rows,
        "three-core-lessons-optional-items",
        document.querySelectorAll(".core-lessons button").length === 3 &&
          document.querySelectorAll(".item-lessons button").length === 11,
      );
      result(
        rows,
        "persisted-comfort-controls",
        document.querySelectorAll(".comfort-settings input[type=range]").length === 5 &&
          document.querySelectorAll("select[id^=key-]").length === 6,
        comfort.status(),
      );
      const oldJump = comfort.preferences.keys.jump;
      comfort.preferences.keys.jump = "KeyJ";
      context.input.queue.length = 0;
      const keyEvent = (code) => ({
        code,
        target: document.body,
        repeat: false,
        preventDefault() {},
      });
      context.input.onKey(keyEvent("KeyJ"), true);
      context.input.onKey(keyEvent("KeyJ"), false);
      const mapped = context.input.drain();
      context.input.onKey(keyEvent("Space"), true);
      context.input.onKey(keyEvent("Space"), false);
      result(
        rows,
        "remapped-input-and-release",
        mapped.includes("jumpPress") &&
          mapped.includes("jumpRelease") &&
          context.input.drain().length === 0,
        mapped,
      );
      comfort.preferences.keys.jump = oldJump;
    } catch (error) {
      result(rows, "exception", false, String(error.stack || error));
    } finally {
      context.menu();
      backend.state = state;
      backend.persist();
      progress.refresh();
      driving.selectMode(prefs.mode);
      driving.selectLesson(prefs.lesson);
      driving.selectMode(prefs.mode);
      button.disabled = false;
    }
    const report = {
      results: rows,
      passed: rows.filter((r) => r.status === "PASS").length,
      failed: rows.filter((r) => r.status === "FAIL").length,
    };
    output.textContent = JSON.stringify(report);
    output.dataset.report = JSON.stringify(report);
  };
  for (const [label, distance, captureScene] of [
    ["预览轨道", 0],
    ["预览月球", 1600],
    ["预览小行星", 3000],
    ["预览背光", 5000],
    ["预览落点光幕", 0],
    ["截图：黑暗星空", 350, "space"],
    ["截图：浅蓝海岸", 350, "coast"],
  ]) {
    const b = document.createElement("button");
    b.textContent = label;
    b.onclick = async () => {
      context.menu();
      driving.selectMode("free");
      await context.start();
      if (captureScene) scenery.select(captureScene);
      game.reset();
      document.body.classList.toggle("scene-capture", !!captureScene);
      game.state = "playing";
      game.speed = 25;
      game.distance = distance;
      game.traffic.clear();
      if (label === "预览落点光幕") {
        Object.assign(game.player, {
          grounded: false,
          y: 3,
          vy: 6,
          x: -3.4,
          laneFrom: -3.4,
          lane: 2,
          laneT: 0,
          laneDur: 0.32,
        });
      }
      game.stepSimulation = () => 0;
      game.player.applyVisual(0, game.ctx());
      game.env.update(distance, 0);
      output.textContent = "";
    };
    panel.append(b);
  }
  const hide = document.createElement("button");
  hide.textContent = "隐藏测试工具";
  hide.onclick = () => {
    panel.style.display = "none";
  };
  panel.append(hide);
}
