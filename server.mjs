import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/__mobile") {
      res
        .writeHead(200, { "Content-Type": "text/html" })
        .end(
          '<html><body style="margin:0;background:#ddd;display:flex;justify-content:center"><iframe title="MAPAN mobile 390px" src="/" style="border:0;width:390px;height:844px;background:white"></iframe></body></html>',
        );
      return;
    }
    const path = resolve(root, "." + decodeURIComponent(pathname));
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    const file = path === root ? resolve(root, "index.html") : path;
    const body = await readFile(file);
    res
      .writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".svg": "image/svg+xml",
          }[extname(file)] || "application/octet-stream",
      })
      .end(body);
  } catch {
    res.writeHead(404).end("Halaman tidak ditemukan");
  }
}).listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
