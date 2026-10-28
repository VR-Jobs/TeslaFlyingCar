import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  out = path.join(root, "dist-online"),
  assets = path.join(out, "assets");
await fs.mkdir(assets, { recursive: true });
let previous;
try {
  previous = JSON.parse(await fs.readFile(path.join(out, "manifest.json"), "utf8"));
} catch {}
const offline = await fs.readFile(path.join(root, "RoadsterDash.html"), "utf8"),
  files = new Map();
function asset(data, prefix, extension) {
  const bytes = Buffer.from(data),
    hash = crypto.createHash("sha256").update(bytes).digest("hex"),
    name = prefix + "-" + hash.slice(0, 16) + "." + extension;
  files.set("assets/" + name, {
    path: "assets/" + name,
    sha256: hash,
    bytes: bytes.length,
    gzipBytes: zlib.gzipSync(bytes).length,
    data: bytes,
  });
  return name;
}
const planetSources = JSON.parse(
  await fs.readFile(path.join(root, "src/assets/planets/sources.json"), "utf8"),
);
const planetHashes = new Set(planetSources.records.flatMap((p) => p.files.map((f) => f.sha256)));
let index = 0,
  fontFiles = 0,
  planetImages = 0;
const html = offline.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs, source) => {
  index++;
  if (Buffer.byteLength(source) < 65536) return tag;
  new vm.Script(source);
  if (index === 1) {
    const match = source.match(/const fonts=(\{[\s\S]*?\});let css=("(?:\\.|[^"\\])*");for/);
    if (!match) throw new Error("Embedded fonts contract changed");
    const fonts = JSON.parse(match[1]);
    let css = JSON.parse(match[2]);
    for (const [name, base64] of Object.entries(fonts)) {
      const file = asset(
        Buffer.from(base64, "base64"),
        "font",
        name.endsWith(".woff2") ? "woff2" : "woff",
      );
      css = css.split("/fonts/" + name).join("./" + file);
      fontFiles++;
    }
    const sheet = asset(css, "fonts", "css");
    return `<link rel="stylesheet" href="./assets/${sheet}">`;
  }
  const script = source.replace(
    /(["'])data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)\1/g,
    (whole, quote, mime, base64) => {
      const bytes = Buffer.from(base64, "base64");
      if (!planetHashes.has(crypto.createHash("sha256").update(bytes).digest("hex"))) return whole;
      const image = asset(bytes, "planet", mime === "jpeg" ? "jpg" : "png");
      planetImages++;
      return quote + "./assets/" + image + quote;
    },
  );
  const name = asset(script, "game", "js");
  return `<script src="./assets/${name}" defer></script>`;
});
if (planetImages !== planetHashes.size) throw new Error("Planet map extraction changed");
if (fontFiles !== 118 || index !== 3) throw new Error("Standalone script contract changed");
for (const f of files.values()) await fs.writeFile(path.join(out, f.path), f.data);
await fs.writeFile(path.join(out, "index.html"), html);
const manifest = {
  format: "online cached scripts, demand-loaded fonts and planet maps; offline HTML retained",
  generatedUTC: new Date().toISOString(),
  offlineBytes: Buffer.byteLength(offline),
  fontFiles,
  planetImages,
  htmlBytes: Buffer.byteLength(html),
  htmlGzipBytes: zlib.gzipSync(html).length,
  htmlSHA256: crypto.createHash("sha256").update(html).digest("hex"),
  files: [...files.values()].map(({ data, ...meta }) => meta),
};
await fs.writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
await fs.writeFile(
  path.join(root, "evidence/online-build.json"),
  JSON.stringify(manifest, null, 2),
);
for (const f of previous?.files || []) {
  const target = path.resolve(out, f.path);
  if (
    !files.has(f.path) &&
    path.dirname(target) === assets &&
    /^[a-z]+-[a-f0-9]{16}\.(js|css|woff2?|jpg|png)$/.test(path.basename(target))
  )
    await fs.unlink(target).catch((e) => {
      if (e.code !== "ENOENT") throw e;
    });
}
console.log(
  JSON.stringify({
    htmlBytes: manifest.htmlBytes,
    htmlGzipBytes: manifest.htmlGzipBytes,
    fontFiles,
    assets: files.size,
    gameBytes: manifest.files.find((f) => f.path.endsWith(".js")).bytes,
  }),
);
