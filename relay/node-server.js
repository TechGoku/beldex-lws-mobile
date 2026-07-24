/**
 * Beldex LWS relay — plain Node.js (zero dependencies)
 * ----------------------------------------------------
 * WHY THIS EXISTS
 * Some ISPs (observed on Reliance Jio, India) block the entire `*.beldex.io`
 * domain at two layers:
 *   1. DNS hijack — `lwsapi.beldex.io` resolves to an ISP-owned IP.
 *   2. TLS SNI deep-packet inspection — connecting to the *real* Cloudflare IP
 *      still gets an immediate RST because the ClientHello contains the
 *      blocked hostname. This happens on every port (443, 8443, 2053, ...).
 * Neither a different DNS resolver nor an alternate port defeats that, and a
 * tunnel (ngrok/serveo/trycloudflare) does not help either — it only exposes a
 * machine that is itself still behind the blocking ISP.
 *
 * The only fix is a relay that RUNS OUTSIDE the ISP, on a domain the ISP does
 * not block. This file is the portable fallback target: it runs anywhere Node
 * 18+ runs — Render, Replit, Railway, or any VPS (Hetzner / DigitalOcean /
 * Oracle / Linode / Contabo). All of those hostnames are verified reachable
 * from the blocking network. It is behaviour-identical to the Cloudflare
 * Worker in `relay/cloudflare-worker.js` (same allowlist, same CORS, same
 * health endpoint, same error shapes).
 *
 * RUN IT
 *   node relay/node-server.js                  # listens on 0.0.0.0:8080
 *   PORT=3000 node relay/node-server.js        # or any port
 * No `npm install` — this uses only built-in modules plus the global `fetch`
 * that ships with Node 18+.
 *
 * DEPLOY
 *   Render      : new Web Service -> Runtime "Node" ->
 *                 Build Command: (leave empty)
 *                 Start Command: node relay/node-server.js
 *                 (Render injects $PORT; this file honours it.)
 *   Railway     : same — Start Command `node relay/node-server.js`.
 *   Replit      : create a Node repl, drop this file in, run it; use the
 *                 `*.replit.app` / `*.repl.co` URL.
 *   VPS + nginx : run under systemd on 127.0.0.1:8080 and terminate TLS in
 *                 nginx (`proxy_pass http://127.0.0.1:8080;`). Do NOT expose
 *                 plain HTTP to end users — the request bodies contain the
 *                 wallet's view key.
 *
 * Then in the wallet: Settings -> Server / Node & Proxy -> LWS API URL, paste
 * the relay's base URL and Save & Apply. (Or ship it as FALLBACK_RELAY_URL so
 * the app switches over automatically — see src/services/runtimeConfig.ts.)
 *
 * PRIVACY NOTE
 * The relay sees the same data the LWS already sees (address + view key) and
 * the client IP. Run it under an account YOU control — do not point users at a
 * relay operated by an untrusted third party. This process deliberately never
 * logs request or response bodies.
 */

"use strict";

const http = require("node:http");

const UPSTREAM = "https://lwsapi.beldex.io";
const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

// Bound the upstream call so a hung LWS cannot pin a connection forever.
const UPSTREAM_TIMEOUT_MS = 20_000;

// LWS requests are small JSON documents; the largest (submit_raw_tx) is a few
// hundred KB at worst. Cap the read so the relay cannot be memory-exhausted.
const MAX_BODY_BYTES = 2 * 1024 * 1024;

// Only these LWS endpoints are proxied — keeps the relay from being used as an
// open proxy for arbitrary hosts.
const ALLOWED_PATHS = new Set([
  "/login",
  "/get_address_info",
  "/get_address_txs",
  "/get_unspent_outs",
  "/get_random_outs",
  "/submit_raw_tx",
  "/import_wallet_request",
  "/get_tx_proof",
]);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Write a JSON response. `close` ends the connection after the response has
 * flushed — needed when we answer while the client is still uploading, so the
 * peer stops sending instead of hanging on a half-read request.
 */
function sendJson(res, status, obj, close) {
  if (res.writableEnded || res.destroyed) return;
  const body = Buffer.from(JSON.stringify(obj), "utf8");
  const headers = {
    ...corsHeaders(),
    "Content-Type": "application/json",
    "Content-Length": body.length,
  };
  if (close) headers["Connection"] = "close";
  res.writeHead(status, headers);
  res.end(body, () => {
    if (close && res.socket && !res.socket.destroyed) res.socket.end();
  });
}

/**
 * Read the request body verbatim, refusing anything oversized. On overflow the
 * stream is paused (not destroyed) so the caller can still answer with a 413.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers["content-length"]);
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      const err = new Error("Request body too large");
      err.tooLarge = true;
      reject(err);
      return;
    }

    const chunks = [];
    let size = 0;
    let done = false;
    req.on("data", (chunk) => {
      if (done) return;
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        done = true;
        chunks.length = 0; // stop holding the partial upload in memory
        req.pause();
        const err = new Error("Request body too large");
        err.tooLarge = true;
        reject(err);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (done) return;
      done = true;
      resolve(Buffer.concat(chunks));
    });
    req.on("error", (e) => {
      if (done) return;
      done = true;
      reject(e);
    });
  });
}

const server = http.createServer(async (req, res) => {
  // `req.url` is origin-form ("/login?x=1"); the base is only there to satisfy
  // the URL parser, and a malformed target must not crash the process.
  let pathname;
  try {
    pathname = new URL(req.url, "http://relay.invalid").pathname;
  } catch {
    sendJson(res, 400, { Error: "Bad request" });
    return;
  }

  // CORS preflight (browser/WebView builds)
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  // Simple health check so the wallet's "Test Connection" can probe the relay.
  if (pathname === "/" || pathname === "/health") {
    sendJson(res, 200, { relay: "beldex-lws", upstream: UPSTREAM });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { Error: "Method not allowed" });
    return;
  }

  if (!ALLOWED_PATHS.has(pathname)) {
    sendJson(res, 404, { Error: "Unknown endpoint" });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    // Never log `e` alongside the body — only the shape of the failure.
    if (e && e.tooLarge) {
      sendJson(res, 413, { Error: "Request body too large" }, true);
    } else {
      sendJson(res, 400, { Error: "Could not read request body" }, true);
    }
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  // Do not keep the event loop alive purely for this timer.
  if (typeof timer.unref === "function") timer.unref();

  try {
    const upstreamResp = await fetch(UPSTREAM + pathname, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
      signal: controller.signal,
    });
    const buf = Buffer.from(await upstreamResp.arrayBuffer());
    clearTimeout(timer);

    if (res.writableEnded || res.destroyed) return; // client hung up
    res.writeHead(upstreamResp.status, {
      ...corsHeaders(),
      "Content-Type": upstreamResp.headers.get("content-type") || "application/json",
      "Content-Length": buf.length,
    });
    res.end(buf);
  } catch (e) {
    clearTimeout(timer);
    const reason = e && e.name === "AbortError" ? "upstream timeout" : String(e);
    // Log the failure reason only — request bodies hold the address + view key.
    console.error("[relay] upstream failure on " + pathname + ": " + reason);
    sendJson(res, 502, { Error: "Relay upstream failure: " + reason });
  }
});

server.on("clientError", (_err, socket) => {
  if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  else socket.destroy();
});

server.listen(PORT, HOST, () => {
  console.log("[relay] beldex-lws relay listening on " + HOST + ":" + PORT);
  console.log("[relay] upstream " + UPSTREAM);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    console.log("[relay] " + sig + " received, shutting down");
    server.close(() => process.exit(0));
    // Force-exit if connections linger past the shutdown grace period.
    setTimeout(() => process.exit(0), 5_000).unref();
  });
}
