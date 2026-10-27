import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  const response = await fetch("http://127.0.0.1:4173/api/local/health", {
    signal: AbortSignal.timeout(1200),
  });
  const health = await response.json();
  if (!response.ok || health.mode !== "local") throw new Error("Unexpected service on 4173");
  console.log("TeslaFlyingCar 已在 4173 端口运行；打开 Ports 面板查看预览。");
} catch (error) {
  // A responding unrelated service must not be replaced.
  if (error.message === "Unexpected service on 4173") throw error;
  fs.mkdirSync(path.join(root, ".cache"), { recursive: true });
  const log = fs.openSync(path.join(root, ".cache", "codespaces-server.log"), "a");
  const child = spawn(process.execPath, ["tools/server.mjs", "--port", "4173"], {
    cwd: root, detached: true, windowsHide: true, stdio: ["ignore", log, log],
  });
  child.unref();
  fs.closeSync(log);
  console.log("TeslaFlyingCar 开发服务器正在启动：4173。日志在 .cache/codespaces-server.log。");
}
