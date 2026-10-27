import { runGameplayChecks } from "./gameplay-checks.js";
import { installLanguageButton, setGameLanguage } from "./language.js";
import { installDrivingFeatures } from "../features/index.js";
import { runDrivingBrowserChecks } from "../features/browser-checks.js";
import { installCoastScene } from "../scenery/coast.js";
import { installSpaceGame } from "../scenery/space-game.js";
import { installHome } from "./home.js";
import { runShowroomChecks } from "../scenery/showroom-checks.js";
export function installDeveloperBridge(context) {
  installLanguageButton();
  const driving = installDrivingFeatures(context);
  const coast = installCoastScene(context);
  const scenery = installSpaceGame(context, coast);
  installHome(context, driving);
  const { game, input, backend, getScreen, config, renderer } = context;
  const errors = [];
  let gameplayChecks = null;
  let drivingChecks = null;
  let showroomChecks = null;
  addEventListener("error", (event) => errors.push(String(event.message)));
  addEventListener("unhandledrejection", (event) => errors.push(String(event.reason)));
  const status = () => ({
    screen: getScreen(),
    state: game.state,
    score: Math.round(game.score),
    distance: Math.round(game.distance),
    speed: game.speed,
    runId: game.runId,
    player: {
      lane: game.player.lane,
      x: game.player.x,
      y: game.player.y,
      air: game.player.air,
      grounded: game.player.grounded,
      hovering: game.player.hovering,
      trick: game.player.trick?.type || null,
    },
    coins: backend.state.coins,
    savedRuns: backend.state.runs.length,
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    config: structuredClone(config),
    errors: [...errors],
    showroom: {
      elapsed: context.showroom.t,
      nextDemo: context.showroom.nextDemoT,
      entry: context.showroom.presentation.entry.status(),
      yaw: context.showroom.yaw,
      cameraPitch: context.showroom.pitch,
      parallax: context.showroom.presentation.parallax.status(),
      animation: context.showroom.demo?.kind || "idle",
      animationTime: context.showroom.demo?.t || 0,
      height: context.showroom.lift.position.y,
      pitch: context.showroom.stunt.rotation.x,
      roll: context.showroom.stunt.rotation.z,
      inspecting: context.showroom.inspecting,
      dragging: context.showroom.dragging,
      containersVisible: context.showroom.set.parts.containers.visible,
      clearance: context.showroom.presentation.clearance.status(),
      audio: context.showroom.presentation.audio.status(),
      jetLevel: context.showroom.presentation.jets.level(),
      motion: context.showroom.presentation.motion.status(),
      landing: context.showroom.presentation.landing.status(),
    },
    gameplayChecks,
    drivingChecks,
    showroomChecks,
    driving: driving.status(),
    scenery: scenery.status(),
  });
  const save = (data, filename) => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const api = {
    status,
    config,
    game,
    input,
    backend,
    driving,
    scenery,
    start: () => context.start(),
    pause: () => context.pause(getScreen() !== "paused"),
    menu: () => context.menu(),
    exportSave: () => save(backend.exportSave(), "roadsterdash-save.json"),
    exportConfig: () => save(config, "roadsterdash-gameplay.json"),
    grantCoins: async () => {
      backend.grantDeveloperCoins();
      await context.refreshWallet();
      await context.refreshMenu();
    },
    async importSave(data) {
      backend.importSave(data);
      location.reload();
    },
  };
  Object.defineProperty(window, "roadster", { value: api });
  const diagnostic = document.createElement("output");
  diagnostic.id = "local-diagnostics";
  diagnostic.hidden = true;
  document.body.append(diagnostic);
  setInterval(() => {
    const state = status();
    diagnostic.dataset.state = JSON.stringify(state);
    diagnostic.dataset.showroomPhase = state.showroom.motion.phase;
    diagnostic.dataset.showroomSmoke = state.showroom.landing.active ? "active" : "idle";
    diagnostic.dataset.showroomSmokeAge = String(Math.floor(state.showroom.landing.age * 2));
    if (parent !== window) parent.postMessage({ type: "roadster:status", state }, location.origin);
  }, 500);
  addEventListener("message", async (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== parent ||
      event.data?.type !== "roadster:command"
    )
      return;
    const { command, payload } = event.data;
    try {
      if (command === "start") await api.start();
      if (command === "language") setGameLanguage(payload);
      if (command === "pause") api.pause();
      if (command === "menu") api.menu();
      if (command === "grantCoins") await api.grantCoins();
      if (command === "exportSave") api.exportSave();
      if (command === "exportConfig") api.exportConfig();
      if (command === "importSave") await api.importSave(payload);
      if (command === "config") {
        for (const [group, values] of Object.entries(payload || {})) {
          if (!config[group] || Array.isArray(config[group])) continue;
          for (const [key, value] of Object.entries(values)) {
            if (typeof config[group][key] === "number" && Number.isFinite(value) && value >= 0)
              config[group][key] = value;
          }
        }
      }
      if (
        command === "input" &&
        [
          "left",
          "right",
          "jumpPress",
          "jumpRelease",
          "boostPress",
          "boostRelease",
          "down",
          "item",
        ].includes(payload)
      )
        input.push(payload);
      if (command === "focus") window.focus();
      if (command === "showroomChecks") showroomChecks = runShowroomChecks(context.showroom);
      if (command === "drivingChecks")
        drivingChecks = await runDrivingBrowserChecks(context, driving);
      if (command === "gameplayChecks") {
        driving.suspended = true;
        try {
          gameplayChecks = await runGameplayChecks(context);
        } finally {
          driving.suspended = false;
        }
      }
    } catch (error) {
      errors.push(String(error));
    }
  });
}
