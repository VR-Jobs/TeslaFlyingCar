import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
import * as prettier from "prettier";
import crypto from "node:crypto";
const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = await fs.readFile(path.join(root, "original/assets/game-Da4QmlDf.js"), "utf8");
const ast = parse(raw, { sourceType: "module" });
const statement = (text) => parse(text, { sourceType: "module" }).program.body[0];
const expression = (text) =>
  parse(`(${text})`, { sourceType: "module" }).program.body[0].expression;
const names = {
  IC: "GameSession",
  $S: "PlayerController",
  _T: "GameHud",
  ET: "InputController",
  sT: "ShowroomScene",
  Yh: "WorldEnvironment",
  bf: "RoadSurface",
  zm: "Landscape",
  d_: "TrafficMaterials",
  f_: "TrafficSystem",
  E_: "TrafficSpawner",
  A_: "AmbientTraffic",
  P_: "CameraRig",
  Wv: "PickupSystem",
  sy: "ParticleEffects",
  hb: "SkyShow",
  ky: "MoodDirector",
  Iy: "RoadsidePools",
  zS: "DamageSystem",
  wS: "createRoadster",
  J: "game",
  Y: "backend",
  X: "account",
  _k: "hud",
  vk: "showroom",
  yk: "input",
  mk: "renderer",
  Uk: "composer",
  ck: "settings",
  Q: "screenState",
  G: "translate",
  yx: "language",
  FD: "WalletManager",
  LD: "DailyQuestManager",
  vC: "AchievementTracker",
  oD: "AdaptiveQuality",
  EC: "REPLAY_VERSIONS",
  DC: "FIXED_TIMESTEP",
  OC: "createSeededRandom",
  Hd: "AIR",
  Ud: "PHYSICS",
  Wd: "SPEED_CURVE",
  Gd: "REFILL_CURVE",
  Kd: "TRAFFIC_INTERVAL",
  qd: "PICKUP_INTERVAL",
  Xd: "BOOST",
  tf: "SCORE",
  Pd: "LANES",
  Fd: "WIDE_LANES",
  Id: "ROAD",
  Qd: "ROCKET",
  ef: "STARMAN",
  $d: "SLOW_MOTION",
  Zd: "INVINCIBILITY",
  Vd: "CAR_BOUNDS",
  mE: "createBackend",
  EE: "RemoteAccountController",
  pE: "RemoteBackend",
  iC: "ITEM_CATALOG",
  lC: "ACHIEVEMENT_CATALOG",
  YT: "COSMETIC_CATALOG",
  sE: "QUEST_CATALOG",
  ON: "animationFrame",
  BA: "beginRun",
  YA: "playFromMenu",
  RA: "showMenu",
  ej: "togglePause",
  ST: "loadLocaleFonts",
  IE: "startAnalytics",
};
let programPath;
traverse(ast, {
  Program(p) {
    programPath = p;
    p.stop();
  },
});
const boundary = programPath.scope.getBinding("Md").identifier.start;
// Verify the renderer prefix does not depend on application-owned bindings.
const cross = [];
for (const [name, binding] of Object.entries(programPath.scope.bindings)) {
  if (
    binding.identifier.start >= boundary &&
    binding.referencePaths.some((p) => p.node.start < boundary)
  )
    cross.push(name);
}
if (cross.length) throw Error(`Renderer extraction has forward application references: ${cross}`);
for (const [from, to] of Object.entries(names)) {
  if (!programPath.scope.hasOwnBinding(from))
    throw Error(`Missing expected original binding: ${from}`);
  programPath.scope.rename(from, to);
}
const coreNames = new Set([
  "GameSession",
  "PlayerController",
  "createRoadster",
  "TrafficSystem",
  "TrafficSpawner",
  "WorldEnvironment",
  "ShowroomScene",
  "InputController",
  "AchievementTracker",
  "GameHud",
  "ParticleEffects",
  "DamageSystem",
  "CameraRig",
  "animationFrame",
  "beginRun",
]);
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
const fingerprints = {};
for (const node of ast.program.body) {
  if (node.type === "VariableDeclaration")
    for (const d of node.declarations) {
      if (coreNames.has(d.id.name)) fingerprints[d.id.name] = canonical(d.init);
    }
  if (node.type === "FunctionDeclaration" && coreNames.has(node.id.name))
    fingerprints[node.id.name] = canonical(node);
}
await fs.writeFile(
  path.join(root, "evidence/core-fingerprints.json"),
  JSON.stringify(fingerprints, null, 2) + "\n",
);
const tuning = new Set([
  "AIR",
  "PHYSICS",
  "SPEED_CURVE",
  "REFILL_CURVE",
  "TRAFFIC_INTERVAL",
  "PICKUP_INTERVAL",
  "BOOST",
  "SCORE",
  "LANES",
  "WIDE_LANES",
  "ROAD",
  "ROCKET",
  "STARMAN",
  "SLOW_MOTION",
  "INVINCIBILITY",
  "CAR_BOUNDS",
]);
const flat = [];
for (const node of ast.program.body) {
  if (node.type === "VariableDeclaration")
    for (const d of node.declarations) flat.push({ ...node, declarations: [d], start: d.start });
  else flat.push(node);
}
const vendor = [],
  app = [],
  config = [],
  exports = [];
for (const node of flat) {
  if (node.type === "ImportDeclaration") {
    app.push(node);
    continue;
  }
  if (node.type === "VariableDeclaration" && tuning.has(node.declarations[0].id.name)) {
    config.push(node);
    continue;
  }
  if (node.start < boundary) {
    vendor.push(node);
    if (node.type === "VariableDeclaration") exports.push(node.declarations[0].id.name);
    else if (node.type === "FunctionDeclaration" || node.type === "ClassDeclaration")
      exports.push(node.id.name);
  } else app.push(node);
}
// These are explicit local integration changes; gameplay and rendering bodies are retained.
ast.program.body = app;
traverse(ast, {
  VariableDeclarator(p) {
    if (p.node.id.name === "language") p.node.init = expression("hx(gx) || hx(_x) || `zh`");
  },
  FunctionDeclaration(p) {
    if (p.node.id.name === "createBackend")
      p.get("body").replaceWith(
        statement(
          `function x(){return new LocalBackend({items:ITEM_CATALOG,cosmetics:COSMETIC_CATALOG,achievements:ACHIEVEMENT_CATALOG,quests:QUEST_CATALOG,defaults:eE,defaultOwned:tE,achievementMet:_C});}`,
        ).body,
      );
    if (p.node.id.name === "startAnalytics")
      p.get("body").replaceWith(statement(`function x(){return;}`).body);
    if (p.node.id.name === "loadLocaleFonts")
      p.get("body").replaceWith(statement(`function x(){return;}`).body);
  },
  NewExpression(p) {
    if (p.node.callee.name === "RemoteAccountController") p.node.callee.name = "LocalAccount";
  },
  CallExpression(p) {
    if (p.node.callee.name === "YO") {
      const prop = p.node.arguments[0]?.properties?.find((n) => n.key.name === "client");
      if (prop) prop.value = expression("backend.shopClient");
    }
  },
  ImportDeclaration(p) {
    const value = p.node.source.value;
    if (value.includes("modulepreload-polyfill-"))
      p.node.source.value = "./vendor/modulepreload-polyfill.js";
    if (value.includes("auth-client-")) p.node.source.value = "./vendor/auth-client.js";
  },
});
const prefix = [
  statement(`import { ${exports.join(",")} } from './vendor/rendering.js';`),
  statement(`import { ${[...tuning].join(",")} } from './config/gameplay.js';`),
  statement(`import { LocalBackend, LocalAccount } from './local/backend.js';`),
  statement(`import { installDeveloperBridge } from './local/developer-bridge.js';`),
];
ast.program.body.unshift(...prefix);
ast.program.body.push(
  statement(
    `installDeveloperBridge({game,input,backend,getScreen:()=>screenState,settings,saveSettings:lk,refreshWallet:()=>Bj({force:true}),refreshMenu:MA,start:playFromMenu,pause:togglePause,menu:showMenu,config:{AIR,PHYSICS,SPEED_CURVE,REFILL_CURVE,TRAFFIC_INTERVAL,PICKUP_INTERVAL,BOOST,SCORE,ROAD,ROCKET,STARMAN},catalogs:{items:ITEM_CATALOG,cosmetics:COSMETIC_CATALOG},renderer});`,
  ),
);
const format = async (text) => prettier.format(text, { parser: "babel", printWidth: 100 });
await fs.mkdir(path.join(root, "src/config"), { recursive: true });
await fs.writeFile(
  path.join(root, "src/game.js"),
  await format(
    `// Recovered deployment code. Names are analyst-assigned; see docs/code-structure.txt.\n${generate(ast, { comments: true }).code}`,
  ),
);
await fs.writeFile(
  path.join(root, "src/vendor/rendering.js"),
  await format(`${vendor.map((n) => generate(n).code).join("\n")}\nexport {${exports.join(",")}};`),
);
await fs.writeFile(
  path.join(root, "src/config/gameplay.js"),
  await format(
    `// Values extracted from the original deployment. Edit and reload to change gameplay.\n${config.map((n) => "export " + generate(n).code).join("\n")}`,
  ),
);
for (const [original, target] of [
  ["auth-client-BoJN4b5B.js", "auth-client.js"],
  ["modulepreload-polyfill-P2Xu9kJm.js", "modulepreload-polyfill.js"],
]) {
  const source = await fs.readFile(path.join(root, "original/assets", original), "utf8");
  await fs.writeFile(path.join(root, "src/vendor", target), await format(source));
}
await fs.writeFile(
  path.join(root, "evidence/symbol-map.json"),
  JSON.stringify(names, null, 2) + "\n",
);
await fs.writeFile(
  path.join(root, "evidence/recovery-transform.json"),
  JSON.stringify(
    {
      rendererExports: exports.length,
      renamedBindings: Object.keys(names).length,
      tuningModules: config.length,
      changes: [
        "LocalBackend replaces original backend factory",
        "LocalAccount replaces remote identity controller",
        "Local shop client replaces Supabase client at coin-store boundary",
        "Analytics initializer and dynamic font loader become local no-ops",
        "Developer bridge appended",
      ],
      sourceMapRecovered: false,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Recovered: ${exports.length} renderer exports, ${Object.keys(names).length} semantic names, ${config.length} editable rule groups.`,
);
