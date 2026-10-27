import fs from "node:fs/promises";
const root = new URL("../", import.meta.url);
for (const [name, source] of [
  ["roadster-exterior", "current"],
  ["roadster-driving", "lod/driving"],
  ["roadster-distant", "lod/distant"],
]) {
  const data = JSON.parse(
    await fs.readFile(new URL(`models/roadster-2026/${source}/roadster-exterior.json`, root)),
  );
  for (const g of data.groups) {
    const n = Buffer.from(g.normal, "base64"),
      normal = Buffer.alloc(n.length / 2);
    for (let i = 0; i < n.length / 4; i++)
      normal.writeInt16LE(
        Math.round(Math.max(-1, Math.min(1, n.readFloatLE(i * 4))) * 32767),
        i * 2,
      );
    g.normal = normal.toString("base64");
    g.normalEncoding = "snorm16";
    const idx = Buffer.from(g.index, "base64");
    let maximum = 0;
    for (let i = 0; i < idx.length; i += 4) maximum = Math.max(maximum, idx.readUInt32LE(i));
    if (maximum < 65536) {
      const compact = Buffer.alloc(idx.length / 2);
      for (let i = 0; i < idx.length / 4; i++)
        compact.writeUInt16LE(idx.readUInt32LE(i * 4), i * 2);
      g.index = compact.toString("base64");
      g.indexEncoding = "uint16";
    }
  }
  await fs.writeFile(
    new URL(`src/assets/${name}-data.js`, root),
    `export default ${JSON.stringify(data)};\n`,
  );
  console.log(
    name,
    data.groups.reduce(
      (s, g) => s + Buffer.from(g.index, "base64").length / (g.indexEncoding === "uint16" ? 6 : 12),
      0,
    ),
  );
}
