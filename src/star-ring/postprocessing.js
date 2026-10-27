import {
  Sd as Composer,
  Cd as RenderPass,
  Dd as BloomPass,
  Ad as FinishPass,
  hd as Pass,
  cn as Target,
  O as HalfFloat,
  N as Vector2,
  I as Color,
  Fr as Basic,
} from "../vendor/rendering.js";

// Includes both route windows plus all cold-gas/landing emitters warmed before input.
export const RING_MASK_BUDGET = 64;
export const RING_BLOOM = { strength: 0.7, radius: 0.05, threshold: 0.6 };

export function bloomResolution(width, height, detail = 2) {
  const maxPixels = detail === 0 ? 720000 : detail === 1 ? 1300000 : 2100000;
  const scale = Math.min(1, Math.sqrt(maxPixels / Math.max(1, width * height)));
  return {
    width: Math.max(64, Math.round(width * scale)),
    height: Math.max(64, Math.round(height * scale)),
    scale: detail === 0 ? 0.4 : 0.5,
  };
}

// Render only registered emitters into the bloom source, with opaque car and
// chassis silhouettes still writing depth. Always restore original materials.
export function createBloomSelection(scene) {
  const clones = new Map(),
    blacks = new Map();
  const blackBackground = new Color(0);
  let lastEmitters = 0;
  function maskMaterial(source) {
    if (!source.userData.ringBloom) {
      const key = source.side;
      if (!blacks.has(key))
        blacks.set(key, new Basic({ color: 0, side: source.side, toneMapped: false, fog: false }));
      return blacks.get(key);
    }
    if (!clones.has(source)) {
      const material = source.clone(),
        gain = source.userData.ringBloom.gain ?? 3;
      if (source.isShaderMaterial) {
        material.uniforms = source.uniforms;
        material.defines = { ...source.defines, RING_BLOOM_MASK: 1 };
        const end = material.fragmentShader.lastIndexOf("}");
        material.fragmentShader =
          material.fragmentShader.slice(0, end) +
          `\n gl_FragColor.rgb *= ${Number(gain).toFixed(3)};\n` +
          material.fragmentShader.slice(end);
      } else if (material.color) material.color.multiplyScalar(gain);
      material.toneMapped = false;
      clones.set(source, material);
    }
    const mask = clones.get(source);
    mask.opacity = source.opacity;
    if (!source.isShaderMaterial && source.color)
      mask.color.copy(source.color).multiplyScalar(source.userData.ringBloom.gain ?? 3);
    return mask;
  }
  return {
    render(renderer, camera, target, overrideScene = null) {
      const drawScene = overrideScene || scene;
      const originals = [],
        background = drawScene.background,
        oldTarget = renderer.getRenderTarget();
      const clear = new Color();
      renderer.getClearColor(clear);
      const alpha = renderer.getClearAlpha(),
        autoClear = renderer.autoClear;
      lastEmitters = 0;
      try {
        drawScene.background = blackBackground;
        drawScene.traverseVisible((object) => {
          if (!object.material) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          const selected = materials.some((m) => m.userData.ringBloom);
          originals.push([object, object.material, object.visible]);
          if (
            !selected &&
            (object.isPoints || object.isLine || materials.every((m) => m.transparent))
          )
            object.visible = false;
          else {
            object.material = Array.isArray(object.material)
              ? materials.map(maskMaterial)
              : maskMaterial(object.material);
            if (selected) lastEmitters++;
          }
        });
        renderer.autoClear = false;
        renderer.setRenderTarget(target);
        renderer.setClearColor(0, 0);
        renderer.clear();
        renderer.render(drawScene, camera);
      } finally {
        for (const [object, material, visible] of originals) {
          object.material = material;
          object.visible = visible;
        }
        drawScene.background = background;
        renderer.setClearColor(clear, alpha);
        renderer.autoClear = autoClear;
        renderer.setRenderTarget(oldTarget);
      }
    },
    async precompile(renderer, camera, drawScene) {
      if (!renderer.compileAsync) return;
      const saved = [];
      drawScene.traverseVisible((o) => {
        if (!o.material) return;
        saved.push([o, o.material]);
        o.material = Array.isArray(o.material)
          ? o.material.map(maskMaterial)
          : maskMaterial(o.material);
      });
      try {
        await renderer.compileAsync(drawScene, camera);
      } finally {
        for (const [o, m] of saved) o.material = m;
      }
    },
    prune() {
      const live = new Set();
      scene.traverse((o) => {
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m) live.add(m);
      });
      for (const [source, mask] of clones)
        if (!live.has(source)) {
          mask.dispose();
          clones.delete(source);
        }
    },
    status: () => ({
      emitters: lastEmitters,
      cachedMasks: clones.size,
      selective: true,
      occlusion: true,
    }),
    dispose() {
      for (const m of [...clones.values(), ...blacks.values()]) m.dispose();
      clones.clear();
      blacks.clear();
    },
  };
}

export function createRingPostprocessing(renderer, scene, camera) {
  const composer = new Composer(renderer);
  composer.setPixelRatio(1);
  composer.renderTarget1.samples = composer.renderTarget2.samples = Math.min(
    2,
    renderer.capabilities.maxSamples || 0,
  );
  const bloom = new BloomPass(
    new Vector2(64, 64),
    RING_BLOOM.strength,
    RING_BLOOM.radius,
    RING_BLOOM.threshold,
  );
  const finish = new FinishPass();
  bloom.compositeMaterial.uniforms.bloomFactors.value = [1, 0.55, 0.18, 0.05, 0.015];
  finish.bloom = bloom;
  finish.apply(null, 0);
  const source = new Target(64, 64, { type: HalfFloat, depthBuffer: true });
  source.texture.name = "StarRing.selective-bloom-source";
  const selection = createBloomSelection(scene);
  class SelectivePass extends Pass {
    constructor() {
      super();
      this.needsSwap = false;
    }
    setSize(w, h) {
      source.setSize(w, h);
      bloom.setSize(w, h);
    }
    render(r) {
      let tick = performance.now();
      selection.render(r, camera, source);
      timings.maskMs = performance.now() - tick;
      tick = performance.now();
      bloom.render(r, null, source);
      timings.bloomMs = performance.now() - tick;
    }
  }
  const timings = {};
  const selective = new SelectivePass();
  const beauty = new RenderPass(scene, camera),
    nativeBeauty = beauty.render.bind(beauty);
  beauty.render = (...args) => {
    const t = performance.now();
    nativeBeauty(...args);
    timings.beautyMs = performance.now() - t;
  };
  composer.addPass(beauty);
  composer.addPass(selective);
  composer.addPass(finish);
  let width = 0,
    height = 0,
    quality = -1,
    enabled = true,
    frames = 0,
    renderScale = 1,
    strengthScale = 1;
  function size(detail) {
    const dimensions = bloomResolution(
      renderer.domElement.width,
      renderer.domElement.height,
      detail,
    );
    dimensions.width = Math.max(64, Math.round(dimensions.width * renderScale));
    dimensions.height = Math.max(64, Math.round(dimensions.height * renderScale));
    if (dimensions.width !== width || dimensions.height !== height || quality !== detail) {
      width = dimensions.width;
      height = dimensions.height;
      quality = detail;
      bloom.resolutionScale = dimensions.scale;
      composer.setSize(width, height);
    }
  }
  return {
    render(dt, detail = 2) {
      size(detail);
      const oldTone = renderer.toneMapping,
        oldExposure = renderer.toneMappingExposure,
        oldAutoReset = renderer.info.autoReset;
      try {
        renderer.info.autoReset = false;
        renderer.info.reset();
        renderer.toneMapping = 4;
        renderer.toneMappingExposure = 1;
        bloom.strength = RING_BLOOM.strength * strengthScale;
        bloom.enabled = enabled && strengthScale > 0.005;
        selective.enabled = bloom.enabled;
        composer.render(dt);
        frames++;
      } finally {
        renderer.toneMapping = oldTone;
        renderer.toneMappingExposure = oldExposure;
        renderer.info.autoReset = oldAutoReset;
      }
    },
    precompileBloom(drawScene, warmCamera) {
      return selection.precompile(renderer, warmCamera, drawScene);
    },
    warmBloom(drawScene, warmCamera, target) {
      selection.render(renderer, warmCamera, target, drawScene);
    },
    setCrash(value, time) {
      finish.uniforms.uCrash.value = value;
      finish.uniforms.uTime.value = time;
      finish.uniforms.uVignette.value = 0.22 * value;
      finish.uniforms.uGrain.value = 0.008 * value;
    },
    prune() {
      selection.prune();
    },
    setVisualSettings(strength, scale) {
      strengthScale = Math.max(0, Math.min(1, strength));
      renderScale = Math.max(0.5, Math.min(1, scale));
    },
    setEnabled(value) {
      enabled = !!value;
    },
    suspend() {
      composer.setSize(1, 1);
      width = height = 0;
    },
    status: () => ({
      maskBudget: RING_MASK_BUDGET,
      timings: { ...timings },
      type: "selective-hdr-bloom",
      enabled,
      frames,
      effectiveStrength: RING_BLOOM.strength * strengthScale,
      renderScale,
      crash: finish.uniforms.uCrash.value,
      width,
      height,
      mips: bloom.nMips,
      ...RING_BLOOM,
      ...selection.status(),
    }),
    dispose() {
      selection.dispose();
      source.dispose();
      bloom.dispose();
      finish.dispose();
      composer.dispose();
    },
  };
}
