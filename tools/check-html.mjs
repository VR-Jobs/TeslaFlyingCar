import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { parse } from "./vendor/babel-parser.cjs";
const html = await fs.readFile(new URL("../RoadsterDash.html", import.meta.url), "utf8");
let scripts = 0;
for (const [, attributes, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
  assert(!/\bsrc\s*=|type="module"/.test(attributes), "Script must be inline classic JavaScript");
  if (attributes.includes("application/ld+json")) JSON.parse(content);
  else {
    parse(content, { sourceType: "script" });
    scripts++;
  }
}
assert(scripts >= 3);
assert(!/<link\b[^>]*(?:rel="stylesheet"|rel="manifest"|rel="modulepreload")/i.test(html));
for (const [, src] of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)/gi))
  assert(src.startsWith("data:"), src);
for (const [, src] of html.matchAll(/<link\b[^>]*href=["']([^"']+)/gi)) {
  assert(src.startsWith("data:") || src.startsWith("https://"), src);
}
assert(html.includes('id="driving-styles"'));
assert(html.includes("standalone-info-button"));
assert(html.includes("data:image/png;base64,"));
console.log(
  `PASS: ${scripts} classic inline scripts parse; no module, external script, stylesheet, manifest or image dependencies.`,
);
