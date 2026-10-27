import fs from "node:fs/promises";
import assert from "node:assert/strict";
import crypto from "node:crypto";
const root = new URL("../dist-online/", import.meta.url),
  manifest = JSON.parse(await fs.readFile(new URL("manifest.json", root), "utf8")),
  html = await fs.readFile(new URL("index.html", root), "utf8");
assert.equal(crypto.createHash("sha256").update(html).digest("hex"), manifest.htmlSHA256);
assert(manifest.htmlGzipBytes < 200000);
assert(manifest.fontFiles === 118);
for (const f of manifest.files) {
  assert(/^(assets\/[a-z]+-[a-f0-9]{16}\.(js|css|woff2?))$/.test(f.path));
  const data = await fs.readFile(new URL(f.path, root));
  assert.equal(crypto.createHash("sha256").update(data).digest("hex"), f.sha256);
}
assert(!html.includes("const fonts="));
assert(/<script src="\.\/assets\/game-[a-f0-9]{16}\.js" defer><\/script>/.test(html));
const sheet = manifest.files.find((f) => f.path.endsWith(".css")),
  css = await fs.readFile(new URL(sheet.path, root), "utf8"),
  fontRefs = [...css.matchAll(/\.\/(font-[a-f0-9]{16}\.woff2?)/g)];
assert(fontRefs.length === 118 && css.includes("unicode-range"));
for (const m of fontRefs) assert(manifest.files.some((f) => f.path === "assets/" + m[1]));
console.log(
  JSON.stringify({
    passed: 4,
    htmlGzipBytes: manifest.htmlGzipBytes,
    assets: manifest.files.length,
    fonts: fontRefs.length,
  }),
);
