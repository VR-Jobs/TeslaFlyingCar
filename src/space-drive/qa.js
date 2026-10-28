export function installOrbitQA(context, driving, scenery, handling, orbit) {
  if (!new URLSearchParams(location.search).has("orbitQA")) return;
  const { game, backend, sound } = context;
  const panel = document.createElement("div");
  panel.id = "orbit-qa";
  panel.style.cssText =
    "position:fixed;bottom:0;left:0;z-index:9999;display:flex;gap:5px;flex-wrap:wrap;background:#101010ee;padding:5px;color:white;font:11px system-ui";
  const output = document.createElement("output");
  output.id = "orbit-qa-report";
  let step = null;
  const unfreeze = () => {
    if (step) {
      game.stepSimulation = step;
      step = null;
    }
  };
  const freeze = () => {
    step = game.stepSimulation;
    game.stepSimulation = () => 0;
  };
  const button = (text, callback) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.onclick = async () => {
      try {
        await callback();
      } catch (error) {
        output.dataset.report = JSON.stringify({ error: String(error), stack: error.stack });
        output.textContent = String(error);
      }
    };
    panel.append(b);
    return b;
  };
  async function begin() {
    unfreeze();
    context.menu();
    scenery.select("space");
    driving.selectMode("free");
    await driving.start();
    await context.pause(true);
    game.reset();
    game.runSeed = 11;
    game.state = "playing";
    game.speed = 30;
    game.launchT = 5;
    orbit.reset();
    game.stepSimulation(1 / 60, []);
  }
  function pose(distance, y = 0, x = 0) {
    const p = game.player;
    const delta = distance - game.distance;
    for (const car of game.traffic.list) {
      car.z += delta;
      car.mesh.position.z = car.z;
    }
    for (const item of game.pickups.list) {
      item.z += delta;
      item.mesh.position.z = item.z;
    }
    game.distance = distance;
    p.lane = Math.max(0, p.lanes.indexOf(x));
    p.x = p.laneFrom = p.prevX = x;
    p.laneT = 1;
    p.y = y;
    p.vy = 0;
    p.grounded = y === 0;
    p.jumpHeld = false;
    p.crashed = false;
    p.root.position.set(x, y, 0);
  }
  async function capture(kind) {
    await begin();
    if (["detail", "collect", "land"].includes(kind)) {
      const route = orbit.plans().find((p) => p.route).route;
      if (kind === "land") {
        pose(220, 0, route.x);
        game.resolveLand({ impact: 0.95, result: "clean", tricks: 0 });
      } else {
        pose(route.gates[0].d - (kind === "collect" ? 0.2 : 12), 5.6, route.x);
        if (kind === "collect") game.stepSimulation(1 / 60, []);
      }
      if (kind === "detail") {
        game.player.fire(["L1", "L2", "L3", "L4"], 0.8);
        game.player.applyVisual(1 / 60, game.ctx());
      }
      game.time += kind === "land" ? 0.25 : 0.12;
    } else if (kind === "air") {
      const route = orbit.plans().find((p) => p.route).route;
      pose(route.gates[0].d - 38, 0, route.x);
    } else if (kind === "risk") {
      game.traffic.clear();
      pose(190, 3, 0);
      game.player.vy = -3;
      const t = Math.min(2.5, handling.status().landingSeconds);
      game.traffic.add("sedan", 0, -game.speed * t);
    } else pose(kind === "station" ? 6300 : kind === "comet" ? 10100 : 13900);
    freeze();
    await context.pause(false);
    game.updateVisual(1 / 60, 0);
  }
  button("预览空中航线", () => capture("air"));
  button("预览精细金环", () => capture("detail"));
  button("预览穿环光尘", () => capture("collect"));
  button("预览落地光尘", () => capture("land"));
  button("预览落点预警", () => capture("risk"));
  button("预览空间站", () => capture("station"));
  button("预览彗星尘尾", () => capture("comet"));
  button("预览行星环", () => capture("rings"));
  button("运行太空升级检查", async () => {
    const saved = structuredClone(backend.state),
      mode = driving.preferences().mode,
      checks = [];
    const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
    try {
      await begin();
      const route = orbit.plans().find((p) => p.route).route;
      pose(0, 0, route.x);
      const tick = (events) => game.stepSimulation(1 / 60, events || []);
      let frames = 0;
      while (
        game.distance < route.gates[0].d - game.speed * 0.85 &&
        frames++ < 1800 &&
        game.state === "playing"
      )
        tick();
      check(
        "real-planned-traffic-keeps-ground-approach-open",
        game.state === "playing",
        orbit.status().traffic,
      );
      tick(["jumpPress"]);
      let flipped = false,
        released = false;
      while (game.distance < route.gates[2].d + 5 && frames++ < 2400 && game.state === "playing") {
        if (!flipped && game.distance > route.gates[0].d + 2) {
          tick(["jumpRelease"]);
          tick(["jumpPress"]);
          flipped = true;
        } else tick();
      }
      tick(["jumpRelease"]);
      released = true;
      for (let i = 0; i < 150 && !game.player.grounded && game.state === "playing"; i++) tick();
      check("actual-jump-hold-frontflip-passes-three-aerial-rings", orbit.state().gates === 3, {
        gates: orbit.state().gates,
        flipped,
        released,
        y: game.player.y,
      });
      check(
        "actual-safe-landing-banks-chain-and-route-once",
        orbit.state().routes === 1 && orbit.state().banked > 0 && game.player.grounded,
        orbit.status(),
      );
      const routes = orbit.state().routes,
        bonus = orbit.state().bonus;
      game.resolveLand({ impact: 0.4, result: "clean", tricks: 0 });
      check(
        "repeated-land-cannot-repeat-route-reward",
        orbit.state().routes === routes && orbit.state().bonus === bonus,
      );
      freeze();
      await context.pause(false);
      const originalClock = sound.beatClock;
      try {
        sound.beatClock = (beat) => {
          Object.assign(beat, { since: 0.03, period: 0.5 });
          return true;
        };
        const phrases = orbit.state().phrases;
        game.time += 1;
        game.distance += 30;
        game.onEvent("jump", {});
        game.time += 1;
        game.distance += 30;
        game.player.trick = { type: "kickflip", acc: Math.PI * 2, dir: -1, credited: true };
        game.onEvent("trickDone", { type: "kickflip" });
        game.player.trick = null;
        game.time += 1;
        game.distance += 30;
        game.resolveLand({ impact: 0.5, result: "perfect", tricks: 1 });
        check(
          "audio-clock-drives-jump-trick-land-phrase",
          orbit.state().phrases === phrases + 1 && orbit.state().beatHits >= 3,
          orbit.state().beatHits,
        );
        const hits = orbit.state().beatHits;
        game.resolveLand({ impact: 0.5, result: "clean", tricks: 0 });
        check("same-frame-cannot-repeat-musical-reward", orbit.state().beatHits === hits);
      } finally {
        sound.beatClock = originalClock;
        game.player.trick = null;
      }
      pose(game.distance + 40, 3, 0);
      game.player.vy = -3;
      game.traffic.clear();
      const t = handling.status().landingSeconds;
      game.traffic.add("sedan", 0, -game.speed * t);
      game.updateVisual(1 / 60, 0);
      check(
        "moving-road-landing-prediction-detects-car",
        orbit.status().landingHazard && handling.marker.material.uniforms.uHazard.value === 1,
        orbit.status().landingHazard,
      );
      game.traffic.clear();
      game.updateVisual(1 / 60, 0);
      check(
        "landing-warning-clears-when-car-leaves",
        !orbit.status().landingHazard && handling.marker.material.uniforms.uHazard.value === 0,
      );
      const refined = Object.values(game.player.car.plumes);
      check(
        "all-native-nozzles-use-refined-layers",
        refined.length === 10 &&
          refined.every((p) => p.mesh.material.uniforms.uOrbitRefinement?.value === 1),
      );
      scenery.select("coast");
      game.updateVisual(1 / 60, 0);
      const before = orbit.state().bonus;
      game.nearMiss("test");
      check(
        "coast-has-no-orbit-rewards-or-pools",
        !orbit.enabled() && orbit.state().bonus === before && !orbit.view.root.visible,
      );
      check(
        "coast-restores-native-plume-appearance",
        refined.every((p) => p.mesh.material.uniforms.uOrbitRefinement?.value === 0),
      );
      scenery.select("space");
      driving.selectMode("academy");
      check("training-excludes-new-rules", !orbit.enabled());
      driving.selectMode("free");
      document.body.classList.add("star-ring-active");
      check("star-ring-is-isolated", !orbit.enabled());
      document.body.classList.remove("star-ring-active");
      check("new-geometry-warmed-before-play", orbit.view.status().warm);
      check(
        "refined-fx-use-fixed-pools",
        orbit.view.status().version === "orbital-fx-2" &&
          orbit.view.status().effects.capacities.sparks === 144,
      );
      check(
        "pool-counts-stay-bounded",
        orbit.view.status().gateCapacity === 32 && orbit.plans().length < 4,
      );
    } finally {
      unfreeze();
      context.menu();
      driving.selectMode(mode);
      backend.state = saved;
      backend.persist();
    }
    output.dataset.report = JSON.stringify({ checks });
    output.textContent = checks.filter((c) => c.pass).length + " / " + checks.length;
  });
  button("隐藏测试工具", () => (panel.hidden = true));
  panel.append(output);
  document.body.append(panel);
}
