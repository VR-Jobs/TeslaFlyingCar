import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = Number(portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || 4173);
const production = args.includes("--dist");
const publicRoot = path.join(root, production ? "dist" : "public");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};
const csp =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:; frame-src 'self'; object-src 'none'; base-uri 'self'";
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  try {
    const url = new URL(req.url, "http://localhost");
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }
    if (url.pathname === "/api/geo") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          countryCode: "XX",
          region: "Local",
          regionCode: null,
        }),
      );
      return;
    }
    if (url.pathname === "/api/server-status" || url.pathname === "/api/local/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          mode: "local",
          payments: false,
          production,
        }),
      );
      return;
    }
    let name = decodeURIComponent(
      url.pathname === "/" ? "/index.html" : url.pathname === "/dev" ? "/dev.html" : url.pathname,
    );
    if (["/legal", "/privacy", "/terms", "/refunds", "/pricing", "/how-to-play"].includes(name))
      name = "/local-info.html";
    const base = !production && name.startsWith("/src/") ? root : publicRoot;
    const filename = path.resolve(base, "." + name);
    if (!filename.startsWith(base + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    const bytes = await fs.readFile(filename);
    res.writeHead(200, {
      "Content-Type": mime[path.extname(filename)] || "application/octet-stream",
    });
    res.end(req.method === "HEAD" ? undefined : bytes);
  } catch (error) {
    res.writeHead(error.code === "ENOENT" ? 404 : 500, {
      "Content-Type": "text/plain",
    });
    res.end(error.code === "ENOENT" ? "Not found" : "Local server error");
  }
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE" ? `Port ${port} is in use. Run with --port 4174.` : error,
  );
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`Roadster Dash local: ${url}/?lang=zh`);
  console.log(`Developer studio:   ${url}/dev`);
  console.log("Ctrl+C stops the server. Runtime needs only Node.js, no npm install.");
  if (args.includes("--open")) {
    const child =
      process.platform === "win32"
        ? spawn("cmd.exe", ["/c", "start", "", `${url}/?lang=zh`], {
            windowsHide: true,
            stdio: "ignore",
          })
        : null;
    child?.unref();
  }
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit()));
