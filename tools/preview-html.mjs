// QA only: serve exactly the standalone HTML; reject all external asset requests.
import http from "node:http";
import fs from "node:fs/promises";
const requests = [];
const server = http.createServer(async (req, res) => {
  requests.push(req.url);
  res.setHeader("Cache-Control", "no-store");
  if (req.url === "/qa-requests") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(requests));
  } else if (new URL(req.url, "http://localhost").pathname === "/orbit-viewport.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(await fs.readFile(new URL("./orbit-viewport.html", import.meta.url)));
  } else if (new URL(req.url, "http://localhost").pathname === "/ui-viewport.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(await fs.readFile(new URL("./ui-viewport.html", import.meta.url)));
  } else if (req.url === "/dev.html" || req.url === "/assets/developer-language.js") {
    const resource =
      req.url === "/dev.html" ? "../public/dev.html" : "../public/assets/developer-language.js";
    res.writeHead(200, {
      "Content-Type": req.url.endsWith(".js")
        ? "text/javascript; charset=utf-8"
        : "text/html; charset=utf-8",
    });
    const content = await fs.readFile(new URL(resource, import.meta.url), "utf8");
    // Keep the existing Chinese QA dashboard; its optional language module reloads
    // the iframe during bootstrap, which would interrupt the standalone load.
    res.end(
      req.url === "/dev.html"
        ? content.replace('<script type="module" src="/assets/developer-language.js"></script>', "")
        : content,
    );
  } else if (new URL(req.url, "http://localhost").pathname.startsWith("/online/")) {
    const relative =
      decodeURIComponent(new URL(req.url, "http://localhost").pathname.slice(8)) || "index.html";
    if (!/^(index\.html|assets\/[a-z]+-[a-f0-9]{16}\.(js|css|woff2?))$/.test(relative)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": relative.endsWith(".js")
        ? "application/javascript; charset=utf-8"
        : relative.endsWith(".css")
          ? "text/css; charset=utf-8"
          : relative.endsWith(".woff2")
            ? "font/woff2"
            : relative.endsWith(".woff")
              ? "font/woff"
              : "text/html; charset=utf-8",
    });
    res.end(await fs.readFile(new URL("../dist-online/" + relative, import.meta.url)));
  } else if (new URL(req.url, "http://localhost").pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(await fs.readFile(new URL("../RoadsterDash.html", import.meta.url)));
  } else {
    console.log("UNEXPECTED", req.url);
    res.writeHead(404);
    res.end();
  }
});
server.listen(4182, "127.0.0.1", () =>
  console.log("Single-file QA preview: http://127.0.0.1:4182"),
);
