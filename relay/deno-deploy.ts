/**
 * Beldex LWS relay — Deno Deploy (deno.dev)
 * -----------------------------------------
 * WHY THIS EXISTS
 * Some ISPs (observed on Reliance Jio, India) block the entire `*.beldex.io`
 * domain at two layers:
 *   1. DNS hijack — `lwsapi.beldex.io` resolves to an ISP-owned IP
 *      (49.44.79.236 / 2405:200:...), not the real origin.
 *   2. TLS SNI deep-packet inspection — connecting to the *real* Cloudflare IP
 *      (104.20.20.55 / 172.66.156.242) still gets an immediate TCP RST (~56ms)
 *      because the ClientHello carries the blocked hostname. This happens on
 *      every port tried (443, 8443, 2053, 2083, 2087, 2096), and domain
 *      fronting fails too (Cloudflare enforces SNI == Host, so it returns 403).
 * Neither a different DNS resolver nor an alternate port defeats that, and
 * tunnels (ngrok / serveo / localhost.run / trycloudflare) do not help either:
 * they only expose a machine that is itself still behind the blocking ISP.
 *
 * The only fix is a relay that RUNS OUTSIDE the ISP on a domain the ISP does
 * not block. `*.deno.dev` is verified reachable from Jio, so this script runs
 * on Deno Deploy and forwards wallet requests to the real LWS from there.
 * The wallet just uses the relay URL as its LWS endpoint — end users install
 * nothing (no Tor/Orbot, no VPN). Deno itself is MIT-licensed open source,
 * which is why this target exists alongside the Cloudflare Worker.
 *
 * Behaviour is byte-for-byte consistent with relay/cloudflare-worker.js:
 * same path allowlist, same CORS headers, same health payload, same error
 * shapes and status codes.
 *
 * DEPLOY TO DENO DEPLOY (free tier, ~3 minutes)
 *   Option A — deployctl:
 *     deno install -Arf jsr:@deno/deployctl
 *     deployctl deploy --project=beldex-lws-relay relay/deno-deploy.ts
 *     -> https://beldex-lws-relay.deno.dev
 *   Option B — dash.deno.com: "New Playground" (or link this repo) and set the
 *     entrypoint to `relay/deno-deploy.ts`. No env vars, no build step needed.
 *
 * RUN LOCALLY (for testing; local runs are still behind the ISP)
 *   deno run --allow-net --allow-env relay/deno-deploy.ts
 *   PORT=9000 deno run --allow-net --allow-env relay/deno-deploy.ts
 *   (`--allow-env` is optional; without it PORT simply falls back to 8000.)
 *
 * Then in the wallet: Settings -> Server / Node & Proxy -> LWS API URL,
 * paste that URL and Save & Apply. (Or ship it as FALLBACK_RELAY_URL so the
 * app switches over automatically — see src/services/runtimeConfig.ts.)
 *
 * PRIVACY NOTE
 * The relay sees the same data the LWS already sees (address + view key) and
 * the client IP. Run it under an account YOU control — do not point users at a
 * relay operated by an untrusted third party. Request bodies are NEVER logged.
 */

const UPSTREAM = "https://lwsapi.beldex.io";

// Bound the upstream fetch so a hung origin can never pin a relay request open.
const UPSTREAM_TIMEOUT_MS = 20_000;

// Only these LWS endpoints are proxied — keeps the relay from being used as an
// open proxy for arbitrary hosts.
const ALLOWED_PATHS = new Set<string>([
  "/login",
  "/get_address_info",
  "/get_address_txs",
  "/get_unspent_outs",
  "/get_random_outs",
  "/submit_raw_tx",
  "/import_wallet_request",
  "/get_tx_proof",
]);

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // CORS preflight (browser/WebView builds)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Simple health check so the wallet's "Test Connection" can probe the relay.
  if (url.pathname === "/" || url.pathname === "/health") {
    return jsonResponse({ relay: "beldex-lws", upstream: UPSTREAM }, 200);
  }

  if (request.method !== "POST") {
    return jsonResponse({ Error: "Method not allowed" }, 405);
  }

  if (!ALLOWED_PATHS.has(url.pathname)) {
    return jsonResponse({ Error: "Unknown endpoint" }, 404);
  }

  // NOTE: the body holds the wallet address + private view key. Read it, pass
  // it through verbatim, and never log it.
  let requestBody: string;
  try {
    requestBody = await request.text();
  } catch (e) {
    return jsonResponse({ Error: "Relay upstream failure: " + e }, 502);
  }

  const timeout = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);

  try {
    const upstreamResp = await fetch(UPSTREAM + url.pathname, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: requestBody,
      signal: timeout,
    });
    const body = await upstreamResp.text();
    return new Response(body, {
      status: upstreamResp.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": upstreamResp.headers.get("content-type") || "application/json",
      },
    });
  } catch (e) {
    return jsonResponse({ Error: "Relay upstream failure: " + e }, 502);
  }
}

// Deno Deploy ignores `port` and serves on its own listener; a local
// `deno run --allow-net` honours PORT (default 8000). Env access is probed
// defensively so running without `--allow-env` neither prompts nor throws.
function readPort(): number {
  try {
    if (Deno.permissions?.querySync?.({ name: "env", variable: "PORT" }).state !== "granted") {
      return 8000;
    }
    return Number(Deno.env.get("PORT") ?? "") || 8000;
  } catch {
    return 8000;
  }
}

Deno.serve({ port: readPort() }, handler);
