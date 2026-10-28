import {
  B as Group,
  R as Mesh,
  gu as Sphere,
  Jr as Geometry,
  L as Attribute,
  gi as Shader,
  P as Vector3,
} from "../vendor/rendering.js";
import {
  PLANETS,
  PLANET_BY_ID,
  SOLAR_VERSION,
  planetChoice,
  planetForSection,
} from "./planet-rules.js";
import { createPlanetTextureCache } from "./planet-textures.js";
import {
  planetVertex,
  planetFragment,
  atmosphereFragment,
  ringVertex,
  ringFragment,
} from "./planet-shaders.js";

const smooth = (x) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};
export function createSolarSystem(scene, course, renderer, options = {}) {
  const textures = createPlanetTextureCache(renderer, options.decode);
  const globe = new Sphere(1, 80, 56),
    ringGeometry = new Geometry(),
    positions = [],
    indices = [];
  for (let i = 0; i <= 192; i++) {
    const a = (i / 192) * Math.PI * 2;
    for (const r of [1, 2.65]) positions.push(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (i < 192) {
      const j = i * 2;
      indices.push(j, j + 2, j + 1, j + 1, j + 2, j + 3);
    }
  }
  ringGeometry.setAttribute("position", new Attribute(positions, 3));
  ringGeometry.setIndex(indices);
  const sun = new Vector3(-0.5, 0.35, 0.8).normalize();
  function slot() {
    const root = new Group();
    root.visible = false;
    root.name = "NASA textured planet / bounded transition slot";
    scene.add(root);
    const normal = new Vector3(0, 1, 0);
    const uniforms = {
      uMap: { value: textures.neutral },
      uNormalMap: { value: textures.flat },
      uRingMap: { value: textures.neutral },
      uPolar: { value: 1 },
      uAtlas: { value: 0 },
      uKind: { value: 0 },
      uBump: { value: 0 },
      uFade: { value: 1 },
      uSun: { value: sun },
      uRadius: { value: 1 },
      uCenter: { value: root.position },
      uRingNormal: { value: normal },
      uInner: { value: 1.1 },
      uOuter: { value: 2.3 },
      uRings: { value: 0 },
    };
    const body = new Mesh(
      globe,
      new Shader({
        uniforms,
        vertexShader: planetVertex,
        fragmentShader: planetFragment,
        transparent: true,
        depthWrite: true,
        toneMapped: false,
      }),
    );
    body.name = "Planet surface / actual NASA cube atlas or cylindrical map";
    body.renderOrder = -8;
    const atmosphere = new Mesh(
      globe,
      new Shader({
        uniforms: { ...uniforms, uStrength: { value: 0 }, uTint: { value: new Vector3() } },
        vertexShader: planetVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: 2,
        toneMapped: false,
      }),
    );
    atmosphere.name = "Thin sunlit atmosphere / empty Mercury sky";
    atmosphere.renderOrder = -6;
    const rings = new Mesh(
      ringGeometry,
      new Shader({
        uniforms: { ...uniforms, uStrength: { value: 0 } },
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        transparent: true,
        depthWrite: false,
        side: 2,
        toneMapped: false,
      }),
    );
    rings.name = "Planet-bound rings / NASA Saturn alpha profile";
    rings.renderOrder = -7;
    root.add(body, rings, atmosphere);
    return { root, body, atmosphere, rings, uniforms, normal, id: null, planet: null };
  }
  const slots = [slot(), slot()];
  let current = null,
    departing = null,
    changed = -99,
    forced = null,
    clock = 0,
    transition = false,
    choiceSeen = null;
  const errors = [];
  const desired = () =>
    forced
      ? PLANET_BY_ID.get(forced)
      : planetForSection(planetChoice(), course.seed || 0, course.section || 0);
  const next = () =>
    PLANETS[(PLANETS.findIndex((p) => p.id === desired().id) + 1) % PLANETS.length];
  function retain() {
    textures.retain(
      [...new Set([current?.id, departing?.id, desired().id, next().id].filter(Boolean))].slice(
        0,
        3,
      ),
    );
  }
  function configure(s, planet, entry) {
    s.id = planet.id;
    s.planet = planet;
    const u = s.uniforms,
      index = PLANETS.indexOf(planet);
    u.uMap.value = entry.map;
    u.uNormalMap.value = entry.normal;
    u.uRingMap.value = entry.ring;
    u.uPolar.value = planet.polar;
    u.uAtlas.value = planet.atlas;
    u.uKind.value = index;
    u.uBump.value = planet.bump;
    u.uRadius.value = planet.radius;
    u.uInner.value = planet.inner || 1.1;
    u.uOuter.value = planet.outer || 2.3;
    u.uRings.value = planet.id === "saturn" ? 1 : 0;
    s.root.rotation.set(0, 0, (planet.tilt * Math.PI) / 180);
    s.root.scale.setScalar(planet.radius);
    s.root.updateMatrixWorld(true);
    s.normal.set(0, 1, 0).applyQuaternion(s.root.quaternion);
    s.body.scale.set(1, planet.polar, 1);
    s.atmosphere.scale.set(1.014, planet.polar * 1.014, 1.014);
    s.atmosphere.material.uniforms.uStrength.value = planet.atmosphere;
    s.atmosphere.material.uniforms.uTint.value.fromArray(planet.tint);
    s.rings.material.uniforms.uMap = { value: entry.ring };
    s.rings.material.uniforms.uStrength.value = planet.rings;
    s.rings.visible = planet.rings > 0;
    s.atmosphere.visible = planet.atmosphere > 0;
  }
  function commit(planet, entry, instant = false) {
    if (!entry) return;
    const dest = current ? slots.find((s) => s !== current) : slots[0];
    if (departing) departing.root.visible = false;
    departing = instant ? null : current;
    configure(dest, planet, entry);
    current = dest;
    changed = clock;
    transition = !!departing;
    if (instant) for (const s of slots) if (s !== current) s.root.visible = false;
    retain();
  }
  function request(planet) {
    retain();
    return textures.load(planet.id).catch((error) => {
      if (errors.length < 3) errors.push(String(error));
      return null;
    });
  }
  function preload() {
    const p = next();
    if (!textures.get(p.id)) request(p);
  }
  return {
    objects: slots.map((s) => s.root),
    async warm() {
      const p = desired();
      retain();
      const entry = await request(p);
      if (!entry) throw new Error("行星贴图未能准备，请重新开始。 " + errors.at(-1));
      commit(p, entry, true);
      preload();
    },
    reset() {
      forced = null;
      choiceSeen = planetChoice();
      clock = 0;
      changed = -99;
      transition = false;
      departing = null;
      for (const s of slots) {
        s.root.visible = false;
        s.uniforms.uMap.value = textures.neutral;
        s.uniforms.uNormalMap.value = textures.flat;
        s.uniforms.uRingMap.value = textures.neutral;
        s.rings.material.uniforms.uMap.value = textures.neutral;
      }
      current = null;
      retain();
    },
    async preview(id) {
      if (!PLANET_BY_ID.has(id)) return;
      forced = id;
      await this.warm();
    },
    update(camera, s, time, pixel, detail = 2) {
      clock = time;
      const choice = planetChoice();
      if (choiceSeen !== null && choiceSeen !== choice) {
        forced = null;
        choiceSeen = choice;
      }
      choiceSeen = choice;
      const p = desired();
      if (current?.id !== p.id) {
        const entry = textures.get(p.id);
        if (entry) commit(p, entry, !current);
        else request(p);
      }
      const reduced =
        typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = transition ? smooth((time - changed) / (reduced ? 1.2 : 6)) : 1;
      if (transition && t >= 1) {
        departing.root.visible = false;
        departing = null;
        transition = false;
        retain();
        preload();
      }
      const travel = Math.max(0, Math.min(1, s / Math.max(1, course.length || 3000)));
      for (const active of [current, departing])
        if (active) {
          const outgoing = active === departing,
            fade = outgoing ? 1 - t : t;
          active.root.visible = fade > 0.001;
          active.uniforms.uFade.value = fade;
          const offset = outgoing
            ? -1600 - (reduced ? 0 : 1400 * t)
            : -1600 + (transition && !reduced ? (1 - t) * 1700 : 0);
          active.root.position.set(
            camera.position.x + offset,
            camera.position.y - 400 + (outgoing ? t * 140 : 0),
            camera.position.z - 4300,
          );
          const approach = 0.91 + travel * 0.12;
          const scale =
            active.planet.radius *
            approach *
            (outgoing ? 1 - t * 0.25 : transition ? 0.8 + 0.2 * t : 1);
          active.root.scale.setScalar(scale);
          active.uniforms.uRadius.value = scale;
          const spin =
            active.planet.id === "venus" || active.planet.id === "uranus" ? -0.0008 : 0.0014;
          active.body.rotation.y = active.planet.rotation + time * spin;
        }
      if (!transition && current && s > (course.length || 3000) * 0.2) preload();
    },
    status: () => ({
      version: SOLAR_VERSION,
      id: current?.id || desired().id,
      name: (current?.planet || desired()).name,
      ready: !!current,
      transition,
      planetCount: PLANETS.length,
      activeBodies: slots.filter((s) => s.root.visible).length,
      drawableBudget: 6,
      textures: textures.status(),
      errors: [...errors],
    }),
  };
}
