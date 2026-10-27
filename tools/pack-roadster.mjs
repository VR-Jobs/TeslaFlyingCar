import fs from "node:fs/promises";
import crypto from "node:crypto";
const root = new URL("../", import.meta.url),
  folder = new URL("models/roadster-2026/current/", root);
const data = await fs.readFile(new URL("roadster-exterior.json", folder), "utf8");
const parsed = JSON.parse(data);
if (parsed.schema !== "roadster-blender-exterior-v1") throw Error("Wrong exterior asset");
await fs.mkdir(new URL("src/assets/", root), { recursive: true });
await fs.writeFile(
  new URL("src/assets/roadster-exterior-data.js", root),
  `export default ${data};\n`,
);
const files = {};
for (const name of ["roadster-exterior.blend", "roadster-exterior.glb", "roadster-exterior.json"]) {
  const bytes = await fs.readFile(new URL(name, folder));
  files[name] = {
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  };
}
await fs.writeFile(
  new URL("evidence/roadster-asset-manifest-20261025.json", root),
  JSON.stringify(
    {
      files,
      consumer: "Homepage showroom and derived driving LODs; embedded in standalone HTML",
      precision: parsed.precision,
    },
    null,
    2,
  ),
);
console.log("Packed the evaluated Blender exterior for the offline game.");
await import("./pack-roadster-lods.mjs");
