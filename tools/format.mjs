import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "./vendor/prettier/standalone.mjs";
import * as babel from "./vendor/prettier/plugins/babel.mjs";
import * as estree from "./vendor/prettier/plugins/estree.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [source, target] of [
  ["legal-aZhVeMA7.js", "legal.js"],
  ["module.no-external-BhkPp4Sv.js", "analytics.js"],
]) {
  let raw;
  try {
    raw = await fs.readFile(path.join(root, "src/vendor", target), "utf8");
  } catch {
    raw = await fs.readFile(path.join(root, "original/assets", source), "utf8");
  }
  const formatted = await prettier.format(raw, {
    parser: "babel",
    plugins: [babel, estree],
    printWidth: 100,
  });
  await fs.writeFile(path.join(root, "src/vendor", target), formatted);
  console.log(`Formatted reference: ${target}`);
}
async function sources(dir) {
  const result = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...(await sources(file)));
    else if (/\.m?js$/.test(item.name)) result.push(file);
  }
  return result;
}
const files = [
  ...(await sources(path.join(root, "src"))),
  ...(await fs.readdir(path.join(root, "tools")))
    .filter((n) => n.endsWith(".mjs"))
    .map((n) => path.join(root, "tools", n)),
];
for (const file of files) {
  const text = await fs.readFile(file, "utf8");
  await fs.writeFile(
    file,
    await prettier.format(text, { parser: "babel", plugins: [babel, estree], printWidth: 100 }),
  );
}
