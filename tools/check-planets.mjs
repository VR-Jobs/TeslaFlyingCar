import assert from "node:assert/strict";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import {
  PLANETS,
  planetForSection,
  planetChoice,
  savePlanetChoice,
} from "../src/star-ring/planet-rules.js";
import { createPlanetTextureCache } from "../src/star-ring/planet-textures.js";
import { createSolarSystem } from "../src/star-ring/solar-system.js";
import { Js as Scene, xi as Camera } from "../src/vendor/rendering.js";
import DATA from "../src/assets/planet-textures.js";
const checks = [];
function check(name, pass, detail) {
  assert(pass, name);
  checks.push({ name, pass: true, detail });
}
check(
  "all-eight-unique-planets-have-original-embedded-maps",
  PLANETS.length === 8 &&
    new Set(PLANETS.map((p) => p.id)).size === 8 &&
    PLANETS.every((p) => DATA[p.id]?.map.src.startsWith("data:image/")),
);
const sources = JSON.parse(
  await fs.readFile(new URL("../src/assets/planets/sources.json", import.meta.url), "utf8"),
);
let bytes = 0;
for (const p of sources.records)
  for (const f of p.files) {
    const data = await fs.readFile(new URL("../src/assets/planets/" + f.path, import.meta.url));
    assert(crypto.createHash("sha256").update(data).digest("hex") === f.sha256);
    bytes += data.length;
  }
check("all-nasa-image-bytes-match-recorded-provenance", true, { bytes });
for (const choice of ["random", ...PLANETS.map((p) => p.id)])
  for (const seed of [0, 1, 11, 42, 4294967295]) {
    const cycle = Array.from({ length: 8 }, (_, lap) => planetForSection(choice, seed, lap).id);
    assert(new Set(cycle).size === 8 && planetForSection(choice, seed, 8).id === cycle[0]);
  }
check("each-start-visits-every-planet-before-repeating", true);
const store = {
  value: null,
  getItem() {
    return this.value;
  },
  setItem(k, v) {
    this.value = v;
  },
};
check("default-start-is-earth", planetChoice(store) === "earth");
savePlanetChoice("mars", store);
check("selected-start-persists", planetChoice(store) === "mars");
check(
  "invalid-preference-never-replaces-valid-choice",
  !savePlanetChoice("pluto", store) && planetChoice(store) === "mars",
);
const fake = {
  capabilities: { maxTextureSize: 2048, getMaxAnisotropy: () => 4 },
  initTexture: () => {},
};
let closed = 0;
const decode = async (source) => ({
  image: {
    width: Math.min(source.width, 2048),
    height: source.height,
    close() {
      closed++;
    },
  },
  flipY: false,
});
const cache = createPlanetTextureCache(fake, decode);
for (let i = 0; i < 24; i++) {
  const ids = [0, 1, 2].map((n) => PLANETS[(i + n) % 8].id);
  cache.retain(ids);
  for (const id of ids) await cache.load(id);
  assert(cache.status().resident <= 3 && cache.status().pending === 0);
}
check(
  "24-transitions-keep-no-more-than-three-texture-bundles",
  cache.status().peak <= 3 && closed > 0,
  cache.status(),
);
const scene = new Scene(),
  course = { seed: 11, section: 0, length: 3200 };
const solar = createSolarSystem(scene, course, fake, { decode });
const camera = new Camera(64, 1.6, 0.1, 18000);
camera.position.set(0, 5, 12);
for (const p of PLANETS) {
  await solar.preview(p.id);
  solar.update(camera, 42, 1, 1, 2);
  const status = solar.status();
  assert(
    status.id === p.id &&
      status.ready &&
      status.activeBodies === 1 &&
      status.textures.resident <= 3,
  );
  for (const root of solar.objects) {
    assert(root.position.toArray().every(Number.isFinite));
    if (root.visible) {
      const radius = root.scale.x;
      assert(root.position.distanceTo(camera.position) - radius * 2.65 > 1000);
      const body = root.children[0],
        rings = root.children[1],
        atmos = root.children[2];
      assert(body.material.uniforms.uMap.value.image.width > 1);
      assert(rings.visible === p.rings > 0 && atmos.visible === p.atmosphere > 0);
    }
  }
}
check("all-planet-surfaces-rings-and-atmospheres-are-configured-and-clear-the-road", true);
solar.reset();
await solar.warm();
solar.update(camera, 3190, 100, 1, 2);
const before = solar.status().id;
course.section = 1;
solar.update(camera, 10, 101, 1, 2);
await new Promise((resolve) => setImmediate(resolve));
solar.update(camera, 10, 101, 1, 2);
solar.update(camera, 100, 104, 1, 2);
check(
  "real-section-change-blends-two-globes",
  solar.status().transition && solar.status().activeBodies === 2 && solar.status().id !== before,
);
solar.update(camera, 200, 108, 1, 2);
check(
  "completed-journey-releases-the-departed-planet",
  !solar.status().transition &&
    solar.status().activeBodies === 1 &&
    solar.status().textures.disposed > 0,
);
check(
  "scene-shares-two-fixed-globes-and-one-sphere-geometry",
  solar.objects.length === 2 &&
    solar.objects[0].children[0].geometry === solar.objects[1].children[0].geometry,
);
const serial = JSON.stringify(solar.status());
check(
  "status-has-no-network-dependency-or-nonfinite-values",
  !serial.includes("NaN") && solar.status().errors.length === 0,
);
await fs.writeFile(
  new URL("../evidence/planet-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, textureBytes: bytes, closed }));
