import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  Js as Scene,
  R as Mesh,
  Ii as Plane,
  Fr as Basic,
  gi as Shader,
  I as Color,
  Uc as Points,
  Jr as Geometry,
} from "../src/vendor/rendering.js";
import { createBloomSelection, bloomResolution } from "../src/star-ring/postprocessing.js";

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail });
  assert(pass, name);
}
const scene = new Scene();
scene.background = new Color("#010207");
const originalBackground = scene.background,
  uniforms = { uTime: { value: 0 } };
const lit = new Shader({
  uniforms,
  transparent: true,
  depthWrite: false,
  vertexShader: "void main(){gl_Position=vec4(position,1.);}",
  fragmentShader: "void main(){gl_FragColor=vec4(1.,.5,.2,.7);}",
});
lit.userData.ringBloom = { gain: 4 };
const rail = new Mesh(new Plane(), lit),
  car = new Mesh(new Plane(), new Basic({ color: "white" }));
const glass = new Mesh(new Plane(), new Basic({ transparent: true, opacity: 0.1 }));
const stars = new Points(new Geometry(), new Basic({ color: "white" }));
scene.add(rail, car, glass, stars);
const previousTarget = {},
  target = {},
  clear = new Color("#132334");
let activeTarget = previousTarget,
  clearAlpha = 0.6,
  renderCalls = 0,
  throwDraw = false;
const renderer = {
  autoClear: true,
  getRenderTarget: () => activeTarget,
  setRenderTarget: (v) => (activeTarget = v),
  getClearColor: (c) => c.copy(clear),
  getClearAlpha: () => clearAlpha,
  setClearColor(c, a) {
    clear.set(c);
    if (a !== undefined) clearAlpha = a;
  },
  clear() {},
  render() {
    renderCalls++;
    check(
      "only-registered-track-shader-is-an-hdr-emitter",
      rail.material !== lit &&
        rail.material.uniforms === uniforms &&
        rail.material.defines.RING_BLOOM_MASK === 1,
    );
    check(
      "white-car-remains-a-black-depth-occluder",
      car.visible &&
        car.material.color.getHex() === 0 &&
        car.material.depthWrite &&
        car.material.depthTest,
    );
    check("ordinary-glass-and-stars-cannot-wash-out-bloom", !glass.visible && !stars.visible);
    if (throwDraw) throw Error("simulated draw failure");
  },
};
const selection = createBloomSelection(scene),
  carMaterial = car.material,
  glassMaterial = glass.material;
selection.render(renderer, null, target);
check(
  "selection-restores-beauty-materials-and-visibility",
  rail.material === lit &&
    car.material === carMaterial &&
    glass.material === glassMaterial &&
    glass.visible &&
    stars.visible,
);
check(
  "selection-restores-render-target-background-and-clear-state",
  activeTarget === previousTarget &&
    scene.background === originalBackground &&
    renderer.autoClear &&
    Math.abs(clearAlpha - 0.6) < 1e-6 &&
    clear.getHex() === 0x132334,
);
throwDraw = true;
try {
  selection.render(renderer, null, target);
} catch (error) {
  assert.equal(error.message, "simulated draw failure");
}
check(
  "failed-source-render-cannot-leak-black-materials",
  rail.material === lit &&
    car.material === carMaterial &&
    glass.visible &&
    stars.visible &&
    scene.background === originalBackground &&
    activeTarget === previousTarget,
);
for (const quality of [0, 1, 2]) {
  const r = bloomResolution(7680, 4320, quality),
    budget = [720000, 1300000, 2100000][quality];
  check("4k-and-higher-hdr-budget-tier-" + quality, r.width * r.height < budget * 1.005, {
    ...r,
    pixels: r.width * r.height,
  });
}
selection.dispose();
await fs.writeFile(
  new URL("../evidence/star-ring-bloom-checks.json", import.meta.url),
  JSON.stringify({ checks }, null, 2),
);
console.log(JSON.stringify({ passed: checks.length, renderCalls, checks }, null, 2));
