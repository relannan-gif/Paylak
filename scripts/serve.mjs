import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
};
createServer(async (req, res) => {
  try {
    let p = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (p !== root && !p.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      if ((await stat(p)).isDirectory()) p = resolve(p, "index.html");
    } catch {
      if (!extname(p)) p = resolve(root, "index.html");
    }
    const b = await readFile(p);
    res.writeHead(200, {
      "Content-Type": types[extname(p)] || "application/octet-stream",
    });
    res.end(b);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(Number(process.env.PORT || 4174), "127.0.0.1", () =>
  console.log("PAYLAK preview: http://127.0.0.1:" + (process.env.PORT || 4174)),
);
