import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (process.platform === "win32") {
  process.env.ESBUILD_BINARY_PATH = path.join(root, "tools/vendor/esbuild/win32-x64/esbuild.exe");
}
// Windows keeps its vendored binary for installation-free offline builds.
// Linux/macOS (Codespaces and Actions) use the same pinned npm esbuild version.
const { build } = process.platform === "win32"
  ? await import("./vendor/esbuild/api/lib/main.js")
  : await import("esbuild");
const read = (name) => fs.readFile(path.join(root, name), "utf8");
const escapeScript = (s) => s.replace(/<\/script/gi, "<\\/script");
const dataURL = async (name, mime) =>
  `data:${mime};base64,${(await fs.readFile(path.join(root, "public", name))).toString("base64")}`;

const result = await build({
  absWorkingDir: root,
  entryPoints: ["src/game.js"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: ["chrome100", "firefox100", "safari16"],
  define: { "import.meta.url": "location.href", "import.meta.resolve": "undefined" },
  legalComments: "inline",
  minify: true,
});
let game = result.outputFiles[0].text;
for (const image of ["shockwave.png", "ludicrous.png"]) {
  game = game.replaceAll(`/items/${image}`, await dataURL(`items/${image}`, "image/png"));
}

// Each font is embedded once. Object URLs let repeated @font-face entries share it.
// The Chinese edition embeds SC and Latin faces. JP/KR keep system fallbacks;
// their hundreds of unrelated subsets need not inflate every offline copy.
const fontsCSS = (await read("public/assets/fonts.css")).replace(/@font-face\s*\{[^}]*font-family:\s*'Noto Sans (?:JP|KR)'[^}]*\}/g, "");
const fontNames = [...new Set([...fontsCSS.matchAll(/\/fonts\/([^\s)'";]+)/g)].map((m) => m[1]))];
const fontData = {};
for (const name of fontNames)
  fontData[name] = (await fs.readFile(path.join(root, "public/fonts", name))).toString("base64");
const fontBootstrap = `(()=>{const fonts=${JSON.stringify(fontData)};let css=${JSON.stringify(fontsCSS)};for(const [name,data] of Object.entries(fonts)){const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:name.endsWith('.woff2')?'font/woff2':'font/woff'}));css=css.split('/fonts/'+name).join(url)}const s=document.createElement('style');s.id='embedded-fonts';s.textContent=css;document.head.append(s)})();`;

let html = await read("public/index.html");
html = html.replace(/\s*<link\b[^>]*rel="manifest"[^>]*>/g, "");
html = html.replace(/<script\b[^>]*src="\/src\/game\.js"[^>]*><\/script>/g, "");
html = html.replace(
  /<link\b[^>]*href="\/assets\/fonts\.css"[^>]*>/g,
  `<script>${escapeScript(fontBootstrap)}</script>`,
);
const gameCSS = await read("public/assets/game.css");
const drivingCSS = await read("public/assets/driving.css");
// Use callbacks: replacement strings would interpret $& inside minified CSS/JS.
html = html.replace(
  /<link\b[^>]*href="\/assets\/game\.css"[^>]*>/g,
  () => `<style>${gameCSS}</style><style id="driving-styles">${drivingCSS}</style>`,
);
for (const image of ["roadster-model-192.png", "roadster-model-apple-touch.png"]) {
  html = html.replaceAll(`/icons/${image}`, await dataURL(`icons/${image}`, "image/png"));
}
html = html.replace("Roadster Dash 路 Local", "Roadster Dash 路 鍙屽嚮鍗崇帺");
let notices = await read("public/third-party-notices.txt");
for (const name of (await fs.readdir(path.join(root, "docs/font-licenses"))).sort()) {
  notices += `\n\n===== Font license: ${name} =====\n${await read(`docs/font-licenses/${name}`)}`;
}
const adapter = (await read("tools/standalone-ui.js")).replace("__THIRD_PARTY_NOTICES__", () =>
  JSON.stringify(notices),
);
html = html.replace(
  "</body>",
  () => `<script>${escapeScript(game)}\n${escapeScript(adapter)}</script></body>`,
);
const output = path.join(root, "RoadsterDash.html");
await fs.writeFile(output, html);
await fs.writeFile(
  path.join(root, "evidence/standalone-build.json"),
  JSON.stringify(
    {
      format: "self-contained HTML; classic JavaScript; file://",
      file: "RoadsterDash.html",
      bytes: Buffer.byteLength(html),
      sha256: crypto.createHash("sha256").update(html).digest("hex"),
      fontFiles: fontNames.length,
      esbuild: "0.25.12",
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(
  `Built ${output} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MiB), ${fontNames.length} embedded fonts. No server or Node.js needed to play.`,
);
