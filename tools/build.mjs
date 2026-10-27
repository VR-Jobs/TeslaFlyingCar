import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await fs.mkdir(path.join(root, "dist"), { recursive: true });
await fs.cp(path.join(root, "public"), path.join(root, "dist"), {
  recursive: true,
});
await fs.cp(path.join(root, "src"), path.join(root, "dist/src"), {
  recursive: true,
});
console.log("Built dist/: native ES modules, same editable game and local assets.");
