import {
  planSegment,
  inAirCorridor,
  gateCrossing,
  createActionState,
  chainAction,
  bankChain,
  beatAction,
  landingRisk,
  clamp,
} from "./rules.js";
import { reachableRoute, landingTime } from "../features/handling-rules.js";
import { createAdaptiveQuality } from "../star-ring/adaptive-quality.js";
import { createOrbitView } from "./view.js";
import { refineOrbitPlumes } from "./plumes.js";
import { createOrbitUI } from "./ui.js";
import { installOrbitQA } from "./qa.js";

export function installOrbitExperience(context, driving, scenery, handling, comfort) {
  const { game, sound, settings, renderer, getScreen } = context;
  const view = createOrbitView(game.scene),
    ui = createOrbitUI(),
    adaptive = createAdaptiveQuality();
  const p = game.player;
  const plumes = refineOrbitPlumes(p.car);
  let state = createActionState(),
    plans = [],
    nextStart = 170,
    nextIndex = 0,
    identity = null;
  let known = new WeakSet(),
    lastFrame = 0,
    enabledLast = false,
    risk = false,
    warned = -99;
  let notice = "",
    noticeUntil = 0,
    warmPromise = null,
    beatPulse = false,
    lastLayer = -99;
  let metrics = { accepted: 0, omitted: 0, audited: 0, recoveries: 0, maximumCars: 0 };
  const liveMode = () =>
    scenery.isSpace() &&
    driving.options().mode === "free" &&
    !driving.suspended &&
    !document.body.classList.contains("star-ring-active") &&
    !document.body.classList.contains("gravity-flip-active");
  const gates = () => plans.flatMap((plan) => plan.route?.gates || []);
  const clock = {};
  function audio(freq, gain = 0.025, end = freq * 1.3) {
    if (settings.sound && !settings.muted) sound.tone({ freq, freqEnd: end, dur: 0.075, gain });
  }
  function say(text, duration = 1.5) {
    notice = text;
    noticeUntil = game.time + duration;
  }
  function award(points, air) {
    if (game.state !== "playing" || !liveMode()) return;
    const gained = game.addBonus(points, null);
    state.bonus += gained;
    const before = p.air;
    p.air = Math.min(600, p.air + air);
    state.airEarned += p.air - before;
    return gained;
  }
  function reset() {
    state = createActionState();
    view.reset();
    plans = [];
    nextStart = Math.max(170, game.distance + 120);
    nextIndex = 0;
    identity = game.runId;
    known = new WeakSet();
    game.traffic.list.forEach((car) => known.add(car));
    notice = "";
    noticeUntil = 0;
    lastLayer = warned = -99;
    risk = false;
    metrics = { accepted: 0, omitted: 0, audited: 0, recoveries: 0, maximumCars: 0 };
    adaptive.reset(Math.min(2, game.detail ?? 2));
  }
  function rhythm(action) {
    const beat = sound.beatClock(clock) ? clock : null;
    const result = beatAction(
      state,
      action,
      beat,
      game.time,
      game.distance,
      comfort.preferences.rhythmOffset,
    );
    if (!result) return;
    const earned = award(result.points, result.air);
    audio(result.phrase ? 1046.5 : action === "jump" ? 440 : action === "trick" ? 660 : 880);
    say(result.phrase ? "♪ 节奏三连 +" + earned : "♪ 合拍 +" + earned, 1.2);
  }
  function action(kind) {
    if (chainAction(state, kind, game.time, game.distance)) audio(520 + state.chain * 35, 0.018);
  }
  function bank(safe) {
    const result = bankChain(state, game.time, safe);
    if (!result) return;
    const earned = award(result.points, result.air);
    view.bank(game.time, game.distance, p, result.count);
    audio(740, 0.04, 1100);
    say("超车链 ×" + result.count + " · +" + earned + " / 补气");
  }
  function makePlans() {
    const ahead = Math.max(420, game.speed * 7);
    while (nextStart < game.distance + ahead) {
      const plan = planSegment(game.runSeed || 1, nextIndex++, nextStart, game.speed, p.lanes);
      plan.rowIndex = 0;
      plan.supplied = false;
      if (plan.route) {
        plan.route.tricks = 0;
        plan.route.done = false;
      }
      plans.push(plan);
      nextStart = plan.end;
    }
    plans = plans.filter((plan) => plan.end > game.distance - 120);
  }
  function spawnCar(spec, absoluteD) {
    if (
      plans.some((plan) => inAirCorridor(plan, spec.x, absoluteD, spec.type === "semi" ? 9 : 3))
    ) {
      metrics.omitted++;
      return;
    }
    const z = game.distance - absoluteD;
    if (z > -Math.max(100, game.speed * 3)) {
      metrics.omitted++;
      return;
    }
    if (
      game.pickups.list.some(
        (item) =>
          !item.taken &&
          Math.abs(item.x - spec.x) < 2.4 &&
          Math.abs(item.z - z) < (spec.type === "semi" ? 16 : 10) &&
          item.y < 4.7,
      )
    ) {
      metrics.omitted++;
      return;
    }
    const car = game.traffic.add(spec.type, spec.x, z, { ownSpeed: spec.ownSpeed });
    car.orbitSection = true;
    known.add(car);
    const route = reachableRoute({
      player: { ...p, air: 0 },
      cars: game.traffic.list,
      speed: Math.max(game.speed, 30),
      horizon: Math.max(4.2, Math.min(10, -z / Math.max(25, game.speed) + 1)),
    });
    metrics.audited++;
    if (!route.reachable) {
      game.traffic.release(car);
      game.traffic.list.splice(game.traffic.list.indexOf(car), 1);
      metrics.omitted++;
    } else metrics.accepted++;
  }
  const nativeSpawner = game.spawner.update;
  game.spawner.update = function (...args) {
    const active = liveMode(),
      out = nativeSpawner.apply(this, args);
    for (let i = game.traffic.list.length - 1; i >= 0; i--) {
      const car = game.traffic.list[i];
      if (known.has(car)) continue;
      known.add(car);
      // Replace only cars created by this update, before their first rendered frame.
      if (active && !car.orbitSection) {
        game.traffic.release(car);
        game.traffic.list.splice(i, 1);
      }
    }
    if (!active || game.state !== "playing") return out;
    makePlans();
    const ahead = Math.max(380, game.speed * 6.5);
    for (const plan of plans) {
      while (
        plan.rowIndex < plan.rows.length &&
        plan.rows[plan.rowIndex].d < game.distance + ahead
      ) {
        const row = plan.rows[plan.rowIndex++];
        for (const spec of row.cars) spawnCar(spec, row.d);
      }
      if (!plan.supplied && plan.recovery.start < game.distance + ahead) {
        plan.supplied = true;
        const d = Math.max(plan.recovery.start + 30, game.distance + 110);
        if (
          !game.traffic.list.some(
            (car) =>
              !car.dead &&
              Math.abs(car.x - plan.safeX) < car.hw + 1.4 &&
              Math.abs(car.z - (game.distance - d)) < car.hl + 14,
          )
        )
          game.pickups.addCan(plan.safeX, game.distance - d, 1.05);
      }
    }
    metrics.maximumCars = Math.max(metrics.maximumCars, game.traffic.list.length);
    return out;
  };
  const nativeEvent = game.onEvent;
  game.onEvent = function (name, data) {
    const out = nativeEvent.call(this, name, data);
    if (!liveMode() || this.state !== "playing") return out;
    if (name === "jump") rhythm("jump");
    if (name === "trickDone" && (p.trick?.acc || 0) >= Math.PI * 2 * 0.92) {
      action("trick");
      rhythm("trick");
      for (const plan of plans)
        if (plan.route && this.distance >= plan.route.start && this.distance <= plan.route.end)
          plan.route.tricks++;
    }
    return out;
  };
  const nativeNear = game.nearMiss;
  game.nearMiss = function (...args) {
    const out = nativeNear.apply(this, args);
    if (liveMode() && this.state === "playing" && !this.powerInvincible) action("near");
    return out;
  };
  const nativeTraffic = game.checkTraffic;
  game.checkTraffic = function (...args) {
    const cleared = this.stats.cleared,
      out = nativeTraffic.apply(this, args);
    if (
      liveMode() &&
      this.state === "playing" &&
      this.stats.cleared > cleared &&
      !this.powerInvincible
    )
      action("clear");
    return out;
  };
  const nativeLand = game.resolveLand;
  game.resolveLand = function (data) {
    const out = nativeLand.call(this, data);
    if (!liveMode() || this.state !== "playing") return out;
    const safe =
      (data.impact || 0) < 1.4 &&
      Math.abs(p.roll + p.rollSettle) < 0.4 &&
      Math.abs(p.flip + p.flipSettle) < 0.4;
    view.land(this.time, this.distance, p, data.impact || 0);
    if (safe) {
      rhythm("land");
      bank(true);
      for (const plan of plans) {
        const route = plan.route;
        if (
          route &&
          !route.done &&
          this.distance <= route.end + 80 &&
          route.gates.every((g) => g.taken) &&
          route.tricks > 0
        ) {
          route.done = true;
          state.routes++;
          const earned = award(150, 60);
          say("空中航线完成 +" + earned + " · 补气");
          audio(880, 0.04, 1320);
        }
      }
    } else {
      state.chain = state.pending = state.beatStep = 0;
    }
    return out;
  };
  const nativeStep = game.stepSimulation;
  game.stepSimulation = function (dt, events) {
    if (identity !== this.runId || this.distance < (state.lastDistance || 0) - 2) reset();
    const before = { d: this.distance, x: p.x, y: p.y };
    const out = nativeStep.call(this, dt, events);
    if (!liveMode()) return out;
    if (this.state !== "playing") {
      if (p.crashed || this.state === "over") state.chain = state.pending = state.beatStep = 0;
      return out;
    }
    const after = { d: this.distance, x: p.x, y: p.y };
    for (const gate of gates())
      if (gateCrossing(gate, before, after)) {
        gate.taken = true;
        gate.takenAt = this.time;
        view.collect(gate, this.time);
        state.gates++;
        const earned = award(25, 22);
        action("gate");
        audio(660 + (state.gates % 3) * 110, 0.025);
        say("穿环 +" + earned + " · 补气", 0.9);
      }
    const segment = plans.find(
      (plan) => this.distance >= plan.recovery.start && this.distance <= plan.recovery.end,
    );
    const delta = Math.max(0, after.d - before.d);
    if (segment && p.grounded && delta > 0) {
      const gain = Math.min(delta * 0.12, dt * 5);
      p.air = Math.min(600, p.air + gain);
      if (!segment.entered) {
        segment.entered = true;
        metrics.recoveries++;
        audio(390, 0.018, 520);
      }
    }
    if (p.grounded && state.chain && this.time - state.last > 2 && this.time - state.last < 6)
      bank(true);
    if (state.chain && this.time - state.last > 6) state.chain = state.pending = 0;
    if (state.beatStep && this.time > state.beatUntil) state.beatStep = 0;
    state.lastDistance = this.distance;
    return out;
  };
  const nativeRig = game.rig.update;
  game.rig.update = function (...args) {
    const out = nativeRig.apply(this, args);
    if (
      liveMode() &&
      game.state === "playing" &&
      !this.cine &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const pull = clamp((p.y - 0.5) / 4, 0, 1) * 3 * comfort.preferences.shake;
      this.cam.fov += pull;
      this.cam.updateProjectionMatrix();
    }
    return out;
  };
  for (const [name, index] of [
    ["burst", 4],
    ["confetti", 3],
  ]) {
    const native = game.effects[name];
    game.effects[name] = function (...args) {
      if (liveMode() && comfort.preferences.autoQuality && Number.isFinite(args[index]))
        args[index] = Math.max(1, Math.round(args[index] * adaptive.status().particles));
      return native.apply(this, args);
    };
  }
  const nativeVisual = game.updateVisual;
  game.updateVisual = function (...args) {
    const now = performance.now(),
      active = liveMode();
    if (active && this.state === "playing" && lastFrame)
      adaptive.sample(
        now - lastFrame,
        comfort.preferences.autoQuality,
        Math.min(2, this.detail ?? 2),
      );
    lastFrame = now;
    scenery.setRuntimeDetail(
      active && comfort.preferences.autoQuality ? adaptive.status().level : null,
    );
    plumes.set(active);
    const out = nativeVisual.apply(this, args);
    const live = active && getScreen() === "game" && this.state === "playing";
    const quality = comfort.preferences.autoQuality
      ? adaptive.status().level
      : Math.min(2, this.detail ?? 2);
    view.update(gates(), this.distance, this.time, p, quality, live, {
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      pixel: renderer.getPixelRatio(),
    });
    if (active) {
      this.post.samples = Math.min([0, 4, 6, 8][this.detail ?? 2], [0, 4, 6][quality]);
      this.mood.bloom *= quality === 0 ? 0.55 : quality === 1 ? 0.8 : 1;
    } else if (enabledLast) this.post.samples = [0, 4, 6, 8][this.detail ?? 2];
    enabledLast = active;
    const hazard =
      live && !p.grounded
        ? landingRisk(
            { ...p, speed: this.speed },
            this.traffic.list,
            landingTime(p, this.ctx().gravity),
          )
        : { blocked: false };
    handling.setLandingHazard(
      hazard.blocked,
      live && !p.grounded ? { ...hazard, speed: this.speed } : null,
    );
    if (hazard.blocked && !risk && this.time - warned > 2.5) {
      warned = this.time;
      audio(285, 0.025, 220);
    }
    risk = hazard.blocked;
    const beat = sound.beatClock(clock) ? clock : null;
    beatPulse =
      !!beat && Math.min(beat.since % beat.period, beat.period - (beat.since % beat.period)) < 0.1;
    if (
      live &&
      beatPulse &&
      settings.music &&
      comfort.preferences.musicVolume > 0.01 &&
      settings.sound &&
      !settings.muted &&
      this.time < state.layerUntil &&
      this.time - lastLayer > beat.period * 0.65
    ) {
      lastLayer = this.time;
      const notes = state.phrases ? [523.25, 659.25, 783.99, 1046.5] : [130.81, 196];
      audio(
        notes[state.layerNote++ % notes.length],
        (state.phrases ? 0.018 : 0.012) * comfort.preferences.musicVolume,
        notes[(state.layerNote - 1) % notes.length],
      );
    }
    const segment = plans.find((plan) => this.distance >= plan.start && this.distance < plan.end),
      upcoming = plans.find((plan) => plan.start > this.distance);
    const label = scenery.status().journey.chapter;
    const route = plans
      .map((plan) => plan.route)
      .find(
        (route) =>
          route &&
          !route.done &&
          route.end > this.distance &&
          route.start - this.distance < Math.max(110, this.speed * 3),
      );
    const text = risk
      ? "◇ 落点有车"
      : this.time < noticeUntil
        ? notice
        : state.chain
          ? "超车链 ×" + state.chain + " · 落地兑现"
          : segment && this.distance >= segment.recovery.start
            ? "补给缓冲"
            : route
              ? "金环 · 长喷升空穿环"
              : segment?.title || (upcoming ? "前方 · " + upcoming.title : "起航");
    ui.update(live, label, text, beatPulse);
    return out;
  };
  const nativeStart = driving.start;
  driving.start = async function (...args) {
    if (scenery.isSpace() && driving.preferences().mode === "free") {
      ui.preparing(true);
      try {
        warmPromise ||= view
          .warm(renderer, game.camera, [...scenery.warmObjects(), ...plumes.objects])
          .catch((error) => {
            warmPromise = null;
            throw error;
          });
        await warmPromise;
      } finally {
        ui.preparing(false);
      }
    }
    return nativeStart.apply(this, args);
  };
  const help = document.createElement("p");
  help.className = "modal-desc";
  help.textContent =
    "太空普通模式：长按喷气升空穿过金环，前翻后收气落地可获补气；安全连续超车或特技可积累超车链。跟随节拍起跳、完成特技并落地，可获得节奏三连奖励。";
  document.querySelector("#help .modal-buttons")?.before(help);
  const api = {
    reset,
    view,
    state: () => state,
    plans: () => plans,
    enabled: liveMode,
    status: () => ({
      enabled: liveMode(),
      ...state,
      traffic: { ...metrics },
      pools: view.status(),
      quality: adaptive.status(),
      landingHazard: risk,
      activeSections: plans.length,
    }),
  };
  installOrbitQA(context, driving, scenery, handling, api);
  return api;
}
