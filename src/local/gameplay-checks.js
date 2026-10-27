/** Isolated control checks using the recovered 60 Hz simulation. */
export async function runGameplayChecks(context) {
  const { game, getScreen } = context;
  if (getScreen() === "menu") await context.start();
  await context.pause(true);
  const originalSpawn = game.spawner.update;
  const results = [];
  const assert = (name, condition, detail) =>
    results.push({ name, status: condition ? "PASS" : "FAIL", detail });
  const step = (count, events = []) => {
    for (let i = 0; i < count; i++) game.stepSimulation(1 / 60, i === 0 ? events : []);
  };
  const reset = () => {
    game.reset();
    game.setRunSeed(123456);
    game.state = "playing";
    game.speed = 25;
    game.launchT = 5;
    game.spawner.update = () => {};
  };
  try {
    reset();
    step(12, ["left"]);
    assert("lane-change", game.player.lane === 0 && game.player.x < 0, {
      lane: game.player.lane,
      x: game.player.x,
    });
    reset();
    step(1, ["up"]);
    let peak = 0;
    for (let i = 0; i < 80; i++) {
      step(1);
      peak = Math.max(peak, game.player.y);
    }
    assert("jump-and-land", peak > 2 && peak < 3.2 && game.player.grounded, {
      peak,
      grounded: game.player.grounded,
    });
    reset();
    step(35, ["jumpPress"]);
    assert("flight-consumes-air", game.player.y > 0.5 && game.player.air < 580, {
      height: game.player.y,
      air: game.player.air,
    });
    reset();
    step(8, ["up"]);
    step(1, ["right"]);
    assert("barrel-roll", game.player.trick?.type === "barrel", { trick: game.player.trick?.type });
    reset();
    step(8, ["up"]);
    step(1, ["up"]);
    assert("front-flip", game.player.trick?.type === "kickflip", {
      trick: game.player.trick?.type,
    });
    reset();
    step(60, ["boostPress"]);
    assert("boost", game.player.boosting && game.speed > 30 && game.player.air < 600, {
      speed: game.speed,
      air: game.player.air,
    });
    reset();
    game.player.air = 0;
    step(1, ["up"]);
    assert("empty-air-jump", game.player.y > 0, { height: game.player.y });
    const deterministic = () => {
      reset();
      for (let i = 0; i < 180; i++)
        step(
          1,
          i === 20
            ? ["up"]
            : i === 28
              ? ["right"]
              : i === 85
                ? ["boostPress"]
                : i === 145
                  ? ["boostRelease"]
                  : [],
        );
      return {
        score: game.score,
        distance: game.distance,
        air: game.player.air,
        lane: game.player.lane,
        y: game.player.y,
      };
    };
    const first = deterministic(),
      second = deterministic();
    assert("fixed-step-repeatability", JSON.stringify(first) === JSON.stringify(second), first);
  } finally {
    game.spawner.update = originalSpawn;
    context.menu();
  }
  return {
    scope:
      "Original simulation; traffic spawning temporarily disabled to isolate controls. No test run submitted.",
    results,
  };
}
