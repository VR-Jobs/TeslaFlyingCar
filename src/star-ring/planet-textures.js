import { an as Texture, Tc as DataTexture } from "../vendor/rendering.js";
import DATA from "../assets/planet-textures.js";

export function createPlanetTextureCache(renderer, decode = decodeImage) {
  const entries = new Map(),
    pending = new Map();
  let retained = new Set(),
    decoded = 0,
    disposed = 0,
    peak = 0;
  const flat = new DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
  flat.needsUpdate = true;
  const neutral = new DataTexture(new Uint8Array([150, 150, 150, 255]), 1, 1);
  neutral.needsUpdate = true;
  function prune() {
    for (const [id, entry] of entries)
      if (!retained.has(id)) {
        for (const texture of entry.owned) {
          texture.dispose();
          texture.image?.close?.();
        }
        entries.delete(id);
        disposed++;
      }
  }
  async function load(id) {
    if (entries.has(id)) return entries.get(id);
    if (pending.has(id)) return pending.get(id);
    if (!DATA[id]) throw new Error("Unknown planet texture " + id);
    const job = (async () => {
      const entry = { id, map: neutral, normal: flat, ring: neutral, owned: [] };
      try {
        for (const key of ["map", "normal", "ring"])
          if (DATA[id][key]) {
            const source = DATA[id][key];
            const decoded = await decode(
              source,
              Math.min(2048, renderer.capabilities?.maxTextureSize || 2048),
            );
            const texture = new Texture(decoded.image || decoded);
            texture.flipY = decoded.flipY ?? true;
            texture.name = "NASA " + id + " / " + key;
            texture.anisotropy = Math.min(4, renderer.capabilities?.getMaxAnisotropy?.() || 1);
            texture.needsUpdate = true;
            entry[key] = texture;
            entry.owned.push(texture);
            renderer.initTexture?.(texture);
            await new Promise((resolve) =>
              typeof requestAnimationFrame === "function"
                ? requestAnimationFrame(resolve)
                : resolve(),
            );
          }
        entries.set(id, entry);
        decoded++;
        peak = Math.max(peak, entries.size);
        prune();
        return entry;
      } catch (error) {
        for (const texture of entry.owned) {
          texture.dispose();
          texture.image?.close?.();
        }
        throw error;
      } finally {
        pending.delete(id);
      }
    })();
    pending.set(id, job);
    return job;
  }
  return {
    load,
    get: (id) => entries.get(id),
    neutral,
    flat,
    retain(ids) {
      retained = new Set(ids);
      prune();
    },
    status: () => ({
      resident: entries.size,
      pending: pending.size,
      decoded,
      disposed,
      peak,
      maximumResident: 3,
    }),
  };
}
async function decodeImage(source, limit) {
  let blob;
  if (source.src.startsWith("data:")) {
    const split = source.src.indexOf(","),
      mime = source.src.slice(5, source.src.indexOf(";"));
    const bytes = atob(source.src.slice(split + 1)),
      data = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) data[i] = bytes.charCodeAt(i);
    blob = new Blob([data], { type: mime });
  } else {
    const response = await fetch(source.src, { cache: "force-cache" });
    if (!response.ok) throw new Error("Planet map could not load: " + response.status);
    blob = await response.blob();
  }
  if (typeof createImageBitmap === "function") {
    const ratio = Math.min(1, limit / source.width);
    const bitmap = await createImageBitmap(blob, {
      imageOrientation: "flipY",
      resizeWidth: Math.round(source.width * ratio),
      resizeHeight: Math.round(source.height * ratio),
      resizeQuality: "high",
    });
    return { image: bitmap, flipY: false };
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Planet image decode failed"));
    image.src = source.src;
  });
}
