import {
  Js as Scene,
  B as Group,
  H as Standard,
  P as Vector3,
  dn as Quaternion,
  I as Color,
  xi as Camera,
  Iu as Hemi,
  Yu as Sun,
} from "../vendor/rendering.js";
import { createRoadsterExterior } from "../scenery/roadster-exterior.js";
import MEDIUM from "../assets/roadster-driving-data.js";
import { createCosmicStars } from "../scenery/space-stars.js";
import { createSolarSystem } from "../star-ring/solar-system.js";
import { createFlightEffects } from "../star-ring/flight-effects.js";
import { createRingPostprocessing } from "../star-ring/postprocessing.js";
import { createBatches } from "./batches.js";
import { drawWorld } from "./world.js";
import { echoSample } from "./time-echo.js";
import { pairPositions } from "./twin-resonance.js";
import { clamp } from "./core.js";

export function createExpeditionView(context, preferences) {
  const scene = new Scene(),
    camera = new Camera(65, 1, 0.1, 18000);
  scene.background = new Color("#01030a");
  scene.environment = context.showroom.scene.environment;
  scene.environmentIntensity = 0.8;
  const stars = createCosmicStars();
  stars.group.scale.setScalar(9);
  scene.add(stars.group);
  const key = new Sun("#f4f8ff", 3),
    rim = new Sun("#b3d7fc", 1.4);
  rim.position.set(25, 25, 15);
  scene.add(key, key.target, rim, new Hemi("#c0daf2", "#101b30", 1.45));
  const solarCourse = { seed: 1, section: 0, length: 1700 },
    solar = createSolarSystem(scene, solarCourse, context.renderer);
  const batches = createBatches(scene);
  function vehicle() {
    const materials = Object.fromEntries(
      ["body", "wing", "glass", "carbon", "cavity", "headlight", "taillight", "gold"].map((k) => [
        k,
        context.game.player.car.materials[k]?.clone() || new Standard(),
      ]),
    );
    const exterior = createRoadsterExterior(materials, MEDIUM),
      root = new Group(),
      visual = new Group(),
      sprung = new Group();
    sprung.add(exterior.slots.body, exterior.slots.wing, exterior.supports);
    visual.add(sprung);
    const wheels = Object.entries(exterior.slots)
      .filter(([k]) => k.startsWith("wheel"))
      .map(([, v]) => v);
    visual.add(...wheels);
    root.add(visual);
    scene.add(root);
    return { root, visual, sprung, wheels, materials, exterior, fx: null };
  }
  const car = vehicle();
  car.fx = createFlightEffects(car.visual, context.game.player.car.plumes);
  let second = null,
    secondStyle = null,
    ready = false,
    anchor = 0,
    lastLap = "",
    lastShip = 0;
  const post = createRingPostprocessing(context.renderer, scene, camera),
    look = new Vector3(),
    wanted = new Vector3(),
    forward = new Vector3(0, 0, -1);
  function secondary(style) {
    second ||= vehicle();
    if (secondStyle !== style) {
      const ghost = style === "ghost";
      for (const mesh of second.exterior.meshes) {
        const m = mesh.material;
        m.transparent = ghost;
        m.opacity = ghost ? 0.34 : 1;
        m.depthWrite = !ghost;
        m.needsUpdate = true;
      }
      second.materials.body.color.set(ghost ? "#83dbff" : "#e31937");
      second.materials.wing.color.copy(second.materials.body.color);
      if (!ghost && !second.fx)
        second.fx = createFlightEffects(second.visual, context.game.player.car.plumes);
      secondStyle = style;
    }
    second.root.visible = true;
    return second;
  }
  function pose(v, x, y, s, yaw = 0, roll = 0, pitch = 0) {
    v.root.position.set(x, y + 0.09, -(s - anchor));
    v.root.rotation.set(pitch, yaw, roll);
  }
  function fx(v, r, dt, secondary = false) {
    if (!v.fx) return;
    const free = ["slingshot", "salvage", "twinResonance"].includes(r.id),
      state = {
        phase: r.phase,
        input: {
          suction: r.input.suction,
          jump: !free && r.input.jump,
          boost: r.input.boost || (free && (r.jet > 0 || r.input.jump)),
        },
        attached: !free && r.attached,
        pressure: r.energy,
        speed: r.speed,
        rollProgress: r.id === "twinResonance" ? clamp(Math.abs(r.angularV), 0, 0.9) : 0,
        rollDir: r.angularV || 1,
        flipProgress: 0,
      };
    const n = {
      p: [v.root.position.x, 0, v.root.position.z],
      up: [0, 1, 0],
      t: [0, 0, -1],
      exists: !free && r.attached,
    };
    v.fx.update(
      state,
      n,
      dt,
      r.time,
      context.renderer.getPixelRatio(),
      matchMedia("(prefers-reduced-motion: reduce)").matches,
      (context.game.detail ?? 2) === 0 ? 0.55 : 1,
    );
  }
  function update(r, dt) {
    const previous = anchor;
    anchor = Math.floor(r.s / 120) * 120;
    if (ready && previous !== anchor) {
      const shift = anchor - previous;
      camera.position.z += shift;
      look.z += shift;
    }
    const lap = r.id === "timeEcho" ? `${r.circuit}/${r.lap}` : "";
    if (lap !== lastLap) {
      if (lastLap) ready = false;
      lastLap = lap;
    }
    batches.begin();
    drawWorld(r, (item) => batches.draw(item, anchor));
    batches.end();
    const dying = r.phase === "dying" || r.phase === "dead",
      death = clamp(r.death / 1.9, 0, 1);
    let yaw = -(r.heading || Math.atan2(r.vx, r.speed || 24)),
      roll = r.roll || -r.vx * 0.018;
    if (second) second.root.visible = false;
    let centerY = r.y;
    if (r.id === "twinResonance") {
      const pair = pairPositions(r);
      pose(car, pair[0].x, pair[0].y, r.s, 0, r.angle + Math.PI / 2);
      const other = secondary("pair");
      pose(other, pair[1].x, pair[1].y, r.s, 0, r.angle - Math.PI / 2);
      fx(other, r, dt, true);
      centerY = 6;
    } else {
      pose(car, r.x, r.y, r.s, yaw, roll, dying ? death * 2 : 0);
      if (r.id === "timeEcho" && r.lap === "echo") {
        const ghost = echoSample(r);
        if (ghost) {
          const other = secondary("ghost");
          pose(other, ghost.x, ghost.y, ghost.s, -ghost.yaw, ghost.roll);
          if (other.fx) other.fx.reset();
        }
      }
    }
    if (dying) {
      car.root.position.y += death * 4;
      car.root.rotation.z += death * 2.4;
    }
    if (r.invulnerable > 0 && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      car.materials.body.emissive.setRGB(0.08 * r.invulnerable, 0.015, 0.01);
    else car.materials.body.emissive.set(0);
    car.sprung.position.y =
      -Math.sin((r.time - r.landAt) * 22) *
      Math.exp(-Math.max(0, r.time - r.landAt) * 8) *
      0.055 *
      r.impact;
    for (const wheel of car.wheels) wheel.rotation.x = -r.s / 0.38;
    car.exterior.setWing(r.attached ? 0.08 : 0.4);
    if (second?.root.visible) {
      for (const wheel of second.wheels) wheel.rotation.x = -r.s / 0.38;
      second.exterior.setWing(0.25);
    }
    fx(car, r, dt);
    key.position.copy(car.root.position).add(new Vector3(-4, 7, 6));
    key.target.position.copy(car.root.position);
    const orbital = r.id === "slingshot",
      dual = r.id === "twinResonance";
    const distance = orbital
        ? 15.5
        : dual
          ? 17
          : r.id === "salvage"
            ? 14 + r.cargo.length * 0.25
            : 15,
      height = orbital ? 8.5 : dual ? 5 : r.id === "salvage" ? 7 + r.cargo.length * 0.15 : 6;
    wanted.set(r.x, centerY + height + death * 3, -(r.s - anchor) + distance + death * 8);
    const target = new Vector3(
      r.x - (orbital ? Math.sin(yaw) * 5 : 0),
      centerY + (dual ? -3 : 0.8),
      -(r.s - anchor) -
        (orbital ? Math.cos(yaw) * 5 : r.id === "salvage" ? 2 - r.cargo.length * 0.8 : 10),
    );
    if (!ready) {
      camera.position.copy(wanted);
      look.copy(target);
    } else {
      camera.position.lerp(wanted, 1 - Math.exp(-5 * dt));
      look.lerp(target, 1 - Math.exp(-8 * dt));
    }
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    const canvas = context.renderer.domElement,
      aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    if (aspect !== camera.aspect) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
    stars.group.position.copy(camera.position);
    stars.update(context.renderer.getPixelRatio(), context.game.detail ?? 2);
    solarCourse.seed = r.seed;
    solarCourse.section = Math.floor((r.id === "timeEcho" ? r.distance : r.s) / 1700);
    solar.update(camera, Math.max(0, r.s % 1700), r.time + r.death, 1, context.game.detail ?? 2);
    post.setCrash(death, r.time + r.death);
    post.setVisualSettings(preferences.bloom, (context.game.detail ?? 2) === 0 ? 0.75 : 1);
    ready = true;
  }
  return {
    update,
    reset() {
      ready = false;
      lastLap = "";
      solar.reset();
      car.fx.reset();
      second?.fx?.reset();
    },
    async warm(r) {
      update(r, 0);
      const bodies = [car];
      if (["timeEcho", "twinResonance"].includes(r.id))
        bodies.push(secondary(r.id === "timeEcho" ? "ghost" : "pair"));
      const restore = batches.warm();
      const saved = [];
      for (const v of bodies)
        if (v.fx)
          for (const object of [...v.fx.plumes.map((p) => p.mesh), v.fx.ribbons, v.fx.particles]) {
            saved.push([object, object.visible]);
            object.visible = true;
          }
      try {
        await solar.warm();
        if (context.renderer.compileAsync) await context.renderer.compileAsync(scene, camera);
        await post.precompileBloom(scene, camera);
      } finally {
        restore();
        for (const [o, visible] of saved) o.visible = visible;
      }
    },
    render(dt) {
      context.renderer.setRenderTarget(null);
      post.render(dt, context.game.detail ?? 2);
    },
    suspend() {
      post.suspend();
      car.fx.reset();
      second?.fx?.reset();
    },
    status: () => ({
      kind: "six-distinct-expeditions",
      batches: batches.status(),
      nativeJets: car.fx.status().nativePlumes,
      secondCar: second?.root.visible || false,
      secondaryStyle: secondStyle,
      car: car.exterior.status(),
      effects: car.fx.status(),
      post: post.status(),
      planet: solar.status(),
      anchor,
    }),
  };
}
