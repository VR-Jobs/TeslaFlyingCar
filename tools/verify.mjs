import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse } from "./vendor/babel-parser.cjs";
import { LocalBackend } from "../src/local/backend.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checks = [];
const check = (name, detail) => {
  checks.push({ name, status: "PASS", detail });
  console.log("PASS", name);
};
const canonical = (node) => {
  const clean = (value) =>
    Array.isArray(value)
      ? value.map(clean)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value)
              .filter(
                ([k]) =>
                  ![
                    "start",
                    "end",
                    "loc",
                    "extra",
                    "leadingComments",
                    "trailingComments",
                    "innerComments",
                  ].includes(k),
              )
              .map(([k, v]) => [k, clean(v)]),
          )
        : value;
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(clean(node)))
    .digest("hex");
};
const core = parse(await fs.readFile(path.join(root, "src/game.js"), "utf8"), {
  sourceType: "module",
});
const baseline = JSON.parse(
  await fs.readFile(path.join(root, "evidence/core-fingerprints.json"), "utf8"),
);
const actual = {};
for (const node of core.program.body) {
  if (node.type === "VariableDeclaration")
    for (const d of node.declarations)
      if (d.id?.name in baseline) actual[d.id.name] = canonical(d.init);
  if (node.type === "FunctionDeclaration" && node.id.name in baseline)
    actual[node.id.name] = canonical(node);
}
assert.deepEqual(actual, baseline);
check(
  "Original gameplay/rendering functions retained",
  `${Object.keys(baseline).length} AST fingerprints match the original after documented symbol renaming`,
);
const source = parse(
  await fs.readFile(path.join(root, "original/assets/game-Da4QmlDf.js"), "utf8"),
  { sourceType: "module" },
);
const symbolMap = JSON.parse(
  await fs.readFile(path.join(root, "evidence/symbol-map.json"), "utf8"),
);
const configs = parse(await fs.readFile(path.join(root, "src/config/gameplay.js"), "utf8"), {
  sourceType: "module",
});
const expectedRules = {};
for (const node of source.program.body)
  if (node.type === "VariableDeclaration")
    for (const d of node.declarations) {
      if (symbolMap[d.id?.name]) expectedRules[symbolMap[d.id.name]] = canonical(d.init);
    }
let ruleCount = 0;
for (const node of configs.program.body)
  for (const d of node.declaration?.declarations || []) {
    assert.equal(
      canonical(d.init),
      expectedRules[d.id.name],
      `Original rule changed: ${d.id.name}`,
    );
    ruleCount++;
  }
check("Default rules match original", `${ruleCount} extracted configuration groups`);
async function walk(dir) {
  let out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    out.push(...(e.isDirectory() ? await walk(p) : [p]));
  }
  return out;
}
let jsCount = 0;
for (const file of (await walk(path.join(root, "src"))).filter((p) => p.endsWith(".js"))) {
  const ast = parse(await fs.readFile(file, "utf8"), { sourceType: "module" });
  jsCount++;
  for (const node of ast.program.body)
    if (node.type === "ImportDeclaration" && node.source.value.startsWith("."))
      await fs.access(path.resolve(path.dirname(file), node.source.value));
}
check(
  "JavaScript syntax and local imports",
  `${jsCount} modules parsed, all static module imports resolve`,
);
for (const name of ["index.html", "dev.html"]) {
  const html = await fs.readFile(path.join(root, "public", name), "utf8");
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const active =
      tag.startsWith("<script") ||
      /rel=["'](?:stylesheet|preload|preconnect|modulepreload)["']/i.test(tag);
    if (active) assert(!/(?:src|href)=["']https?:\/\//i.test(tag), "Remote bootstrap still active");
  }
}
let fontCount = 0;
const fontCss = await fs.readFile(path.join(root, "public/assets/fonts.css"), "utf8");
assert(!fontCss.includes("https://"));
for (const match of fontCss.matchAll(/url\((\/fonts\/[^)]+)\)/g)) {
  await fs.access(path.join(root, "public", match[1]));
  fontCount++;
}
check(
  "Offline presentation assets",
  `${fontCount} font-face references resolve locally; no external script/style bootstrap`,
);
// Test service boundaries independently of WebGL and the original server.
const memory = new Map();
const storage = { getItem: (k) => memory.get(k) || null, setItem: (k, v) => memory.set(k, v) };
const catalogs = {
  items: [
    { id: "revive", price: 100, max: 99 },
    { id: "head_start", price: 15, max: 99, start: true },
  ],
  cosmetics: [
    { id: "paint_red", slot: "paint", price: 0 },
    { id: "paint_blue", slot: "paint", price: 100 },
  ],
  achievements: [
    { id: "first", reward: 10 },
    { id: "three_runs", reward: 30, total: { metric: "runs", target: 3 } },
  ],
  quests: [{ id: "day_runs_3", mode: "day", metric: "runs", target: 3 }],
  defaults: { paint: "paint_red", boost: "boost_white", neon: "neon_off", plate: "RDSTR" },
  defaultOwned: ["paint_red"],
};
const service = new LocalBackend(catalogs, storage);
assert.equal(service.isOnline, false);
await assert.rejects(() => service.buyItem("revive"), /insufficient_coins/);
service.grantDeveloperCoins(500);
await service.buyItem("head_start");
const run = await service.startRun();
await service.useStartItem(run.runId, "head_start");
await service.useStartItem(run.runId, "head_start");
assert.equal(service.state.items.head_start, 0);
const result = {
  runId: run.runId,
  score: 1000,
  distance: 1000,
  duration: 40,
  maxCombo: 3,
  achievements: ["first"],
  stats: {},
};
const settlement = await service.submit(result);
const coins = service.state.coins;
assert.deepEqual(await service.submit(result), settlement);
assert.equal(service.state.coins, coins);
assert.equal(service.state.runs.length, 1);
check(
  "Local start, inventory and settlement",
  "Start items consume once; duplicate submission does not duplicate coins or records",
);
await service.claimAchievements(["first", "first"]);
const afterClaim = service.state.coins;
await service.claimAchievements(["first"]);
assert.equal(service.state.coins, afterClaim);
await service.buyCosmetic("paint_blue");
assert.equal(service.state.loadout.paint, "paint_blue");
const reloaded = new LocalBackend(catalogs, storage);
assert.equal((await reloaded.getMyBest()).score, 1000);
assert.equal(reloaded.state.loadout.paint, "paint_blue");
assert.equal(reloaded.state.coins, service.state.coins);
const exported = reloaded.exportSave();
const before = reloaded.state.coins;
await assert.rejects(() => reloaded.setNickname("!"), /nick.err/);
assert.throws(() => reloaded.importSave({}), /invalid_save/);
reloaded.importSave(exported);
assert.equal(reloaded.state.coins, before);
check(
  "Save persistence, cosmetics and reward claims",
  "Reload/export/import retain scores, wallet and loadout; reward claims are idempotent",
);
const store = await reloaded.shopClient.functions.invoke("coin-checkout", {
  body: { action: "catalog" },
});
assert.equal(store.data.checkoutEnabled, false);
assert.equal(store.data.dailyVisit.reward, 10);
await reloaded.shopClient.functions.invoke("coin-checkout", { body: { action: "claim-visit" } });
const once = reloaded.state.coins;
await reloaded.shopClient.functions.invoke("coin-checkout", { body: { action: "claim-visit" } });
assert.equal(reloaded.state.coins, once);
check("Local store boundary", "Payments disabled; daily visit credit applies once");
await fs.writeFile(
  path.join(root, "evidence/verification.json"),
  JSON.stringify({ date: new Date().toISOString(), checks }, null, 2) + "\n",
);
console.log(`${checks.length} checks passed.`);
