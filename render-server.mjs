/**
 * render-server.mjs
 * Node.js HTTP server adapter for TanStack Start SSR on Render.
 * Serves static files from dist/client and forwards all other requests to the SSR handler.
 */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the TanStack Start SSR fetch handler
const { default: ssrHandler } = await import("./dist/server/server.js");

const PORT = process.env.PORT || 3000;
const CLIENT_DIR = join(__dirname, "dist", "client");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".txt": "text/plain",
};

async function tryServeStatic(req, res) {
  const urlPath = new URL(req.url, "http://localhost").pathname;
  const filePath = join(CLIENT_DIR, urlPath);

  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const ext = extname(filePath).toLowerCase();
      const mimeType = MIME_TYPES[ext] || "application/octet-stream";
      const content = await readFile(filePath);
      res.writeHead(200, { "Content-Type": mimeType });
      res.end(content);
      return true;
    }
  } catch {
    // File not found — fall through to SSR
  }
  return false;
}

async function handleSSR(req, res) {
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url, `http://${host}`);

  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (val != null) {
      headers.set(key, Array.isArray(val) ? val.join(", ") : val);
    }
  }

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (chunks.length > 0) body = Buffer.concat(chunks);
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  const response = await ssrHandler.fetch(request, process.env);

  res.statusCode = response.status;
  response.headers.forEach((val, key) => res.setHeader(key, val));

  const buf = await response.arrayBuffer();
  res.end(Buffer.from(buf));
}

const server = http.createServer(async (req, res) => {
  try {
    const servedStatic = await tryServeStatic(req, res);
    if (!servedStatic) {
      await handleSSR(req, res);
    }
  } catch (err) {
    console.error("ExoTrace server error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ExoTrace frontend running on port ${PORT}`);
});
