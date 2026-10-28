import { R as Mesh, Ii as PlaneGeometry, gi as ShaderMaterial } from "../vendor/rendering.js";
import { landingTime, flipCondition } from "./handling-rules.js";
import { createLandingBeacon } from "../scenery/landing-beacon.js";

export function installHandling(context, driving) {
  const { game, sound, getScreen } = context,
    p = game.player;
  let buffer = 0,
    bufferedHold = false,
    blockedUntil = 0,
    blockedReason = null,
    landedAt = -99,
    lastImpact = 0,
    bufferedJumps = 0,
    rejected = 0,
    settlement = null;
  const marker = new Mesh(
    new PlaneGeometry(3, 5.5),
    new ShaderMaterial({
      uniforms: { uOpacity: { value: 0 }, uBlocked: { value: 0 }, uHazard: { value: 0 } },
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      fog: false,
      vertexShader:
        "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: `varying vec2 vUv;uniform float uOpacity,uBlocked,uHazard;
      void main(){vec2 p=(vUv-.5)*2.;float d=length(p);
      float ring=(1.-smoothstep(.025,.06,abs(d-.78)))*.65;
      float crosshair=(1.-smoothstep(.014,.03,abs(p.x)))*(1.-smoothstep(.1,.26,abs(p.y)));
      float a=max(ring,crosshair)*uOpacity;if(a<.005)discard;
      vec3 tint=mix(vec3(.85,.94,1.),vec3(1.,.63,.16),uHazard);gl_FragColor=vec4(mix(tint,vec3(1.,.18,.16),uBlocked),a);}`,
    }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.renderOrder = 3;
  marker.name = "Predicted landing footprint / visual aid, no collider";
  marker.visible = false;
  game.scene.add(marker);
  const beacon = createLandingBeacon(marker);
  game.scene.add(beacon.group);
  const indicator = document.createElement("output");
  indicator.id = "handling-indicator";
  indicator.setAttribute("aria-live", "polite");
  indicator.hidden = true;
  document.body.append(indicator);
  function deny(reason) {
    if (game.time < blockedUntil - 0.25) return;
    blockedUntil = game.time + 0.55;
    blockedReason = reason;
    rejected++;
    sound.tone({ freq: reason === "air" ? 180 : 310, freqEnd: 140, dur: 0.07, gain: 0.065 });
  }
  const reset = p.reset;
  p.reset = function (...args) {
    buffer = 0;
    blockedUntil = 0;
    landedAt = -99;
    lastImpact = 0;
    bufferedJumps = rejected = 0;
    return reset.apply(this, args);
  };
  const release = p.releaseControls;
  p.releaseControls = function (...args) {
    buffer = 0;
    return release.apply(this, args);
  };
  const handle = p.handle;
  p.handle = function (event, ctx) {
    if (event === "jumpRelease" && buffer > 0) bufferedHold = false;
    if (["jumpPress", "up", "swipeUp"].includes(event) && !this.grounded && !this.crashed) {
      const remaining = landingTime(this, ctx.gravity);
      if (this.vy < 0 && remaining <= 0.16) {
        buffer = 0.18;
        bufferedHold = event !== "up";
        this.jumpHeld = false;
        return;
      }
      const reason = flipCondition(this, ctx, "kickflip");
      if (reason) {
        deny(reason);
        return;
      }
    }
    return handle.call(this, event, ctx);
  };
  const barrel = p.barrelRoll;
  p.barrelRoll = function (dir, ctx) {
    if (!this.trick) {
      const reason = flipCondition(this, ctx);
      if (reason) {
        // Steering remains available when a rotation cannot finish safely.
        const moved = this.shiftLane(dir, ctx);
        if (moved && !ctx.airInfinite) this.air = Math.max(0, this.air - 12);
        deny(reason);
        return;
      }
    }
    return barrel.call(this, dir, ctx);
  };
  const land = p.land;
  p.land = function (ctx, height) {
    const impact = Math.min(1.6, Math.abs(this.vy) / 14);
    lastImpact = impact;
    landedAt = game.time;
    const out = land.call(this, ctx, height);
    // Bounded, damped compression is driven by the same vertical impact used
    // for audio and smoke; wheel roots stay at road contact.
    this.suspV = -Math.min(2.1, 0.35 + impact * 1.1);
    return out;
  };
  const cloud = game.effects.landingCloud;
  game.effects.landingCloud = function (x, height, impact) {
    // Avoid a huge high-altitude cloud after a slow, carefully controlled descent.
    const intensity = Math.min(1, Math.max(0, impact / 1.6));
    return cloud.call(this, x, 0.3 + 4.5 * intensity, impact * 0.72);
  };
  const update = p.update;
  p.update = function (dt, ctx) {
    const out = update.call(this, dt, ctx);
    this.susp = Math.max(-0.105, Math.min(0.06, this.susp));
    buffer = Math.max(0, buffer - dt);
    return out;
  };
  const step = game.stepSimulation;
  game.stepSimulation = function (...args) {
    const out = step.apply(this, args);
    // Native collision checks and the preceding landing's combo settlement
    // finish before starting the next jump. Never overwrite pendingLand.
    if (buffer > 0 && p.grounded && !p.crashed && this.state === "playing" && !this.pendingLand) {
      buffer = 0;
      p.jumpHeld = bufferedHold;
      p.jump(this.ctx());
      bufferedJumps++;
    }
    return out;
  };
  const crash = game.crash;
  game.crash = function (reason, car) {
    if (this.state === "playing" && car) {
      reason = !p.grounded
        ? p.vy < 0
          ? "落地前碰到前车"
          : "空中翻越时碰到车辆"
        : this.time - landedAt < 0.4
          ? "刚落地时碰到前车"
          : p.laneT < 1
            ? "变道时碰到邻道车辆"
            : "与前方车辆距离不足，发生追尾";
    }
    return crash.call(this, reason, car);
  };
  const over = game.onGameOver;
  game.onGameOver = function (...args) {
    settlement = Promise.resolve(over.apply(this, args));
    return settlement;
  };
  const retry = document.createElement("button");
  retry.id = "quick-restart";
  retry.textContent = "立即重开 · R";
  retry.hidden = true;
  document.body.append(retry);
  let restarting = false;
  async function restart() {
    if (restarting || !["crashing", "downed", "over"].includes(game.state)) return;
    restarting = true;
    retry.disabled = true;
    try {
      game.finish();
      await settlement;
      await driving.start();
    } finally {
      restarting = false;
      retry.disabled = false;
    }
  }
  retry.onclick = restart;
  addEventListener("keydown", (event) => {
    if (
      event.code !== "KeyR" ||
      event.repeat ||
      event.target.closest?.("input,select,textarea") ||
      document.querySelector("dialog[open],#settings:not(.hidden)")
    )
      return;
    if (["crashing", "downed", "over"].includes(game.state)) {
      event.preventDefault();
      restart();
    }
  });
  const visual = game.updateVisual;
  game.updateVisual = function (...args) {
    const out = visual.apply(this, args),
      live = getScreen() === "game";
    const blocked = this.time < blockedUntil;
    marker.visible = live && this.state === "playing" && !p.grounded && !p.crashed && p.y > 0.15;
    if (marker.visible) {
      const remaining = Math.min(2.5, landingTime(p, this.ctx().gravity));
      const laneT = Math.min(1, p.laneT + remaining / Math.max(0.01, p.laneDur));
      const ease = 1 - (1 - laneT) ** 4 * (1 + 2 * laneT);
      const x = p.laneFrom + (p.lanes[p.lane] - p.laneFrom) * ease;
      marker.position.set(x, 0.055, -Math.min(100, this.speed * remaining));
      marker.material.uniforms.uOpacity.value = p.hovering
        ? 0.12
        : 0.28 + 0.18 / (1 + remaining * 3);
      marker.material.uniforms.uBlocked.value = +blocked;
    }
    beacon.update(this.camera);
    indicator.hidden = !live || !blocked || this.state !== "playing";
    document.body.classList.toggle("handling-blocked", !indicator.hidden);
    indicator.textContent = blockedReason === "air" ? "◇ 能量不足" : "↻ 高度不足";
    retry.hidden = !live || !["crashing", "downed"].includes(this.state);
    return out;
  };
  return {
    marker,
    setLandingHazard(value, prediction = null) {
      marker.material.uniforms.uHazard.value = +value;
      marker.scale.set(value ? 1.22 : 1, value ? 1.22 : 1, 1);
      if (value && marker.visible)
        marker.material.uniforms.uOpacity.value = Math.max(
          0.6,
          marker.material.uniforms.uOpacity.value,
        );
      if (prediction && marker.visible) {
        marker.position.x = prediction.x;
        marker.position.z = -Math.min(250, prediction.speed * prediction.time);
        beacon.update();
      }
    },
    status: () => ({
      buffer,
      bufferedJumps,
      rejected,
      lastImpact,
      markerVisible: marker.visible,
      beacon: beacon.status(),
      landingSeconds: landingTime(p, game.ctx().gravity),
      blocked: game.time < blockedUntil ? blockedReason : null,
    }),
  };
}
