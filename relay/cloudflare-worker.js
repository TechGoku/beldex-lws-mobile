/**
 * Beldex LWS relay — Cloudflare Worker
 * ------------------------------------
 * WHY THIS EXISTS
 * Some ISPs (observed on Reliance Jio, India) block the entire `*.beldex.io`
 * domain at two layers:
 *   1. DNS hijack — `lwsapi.beldex.io` resolves to an ISP-owned IP.
 *   2. TLS SNI deep-packet inspection — connecting to the *real* Cloudflare IP
 *      still gets an immediate RST because the ClientHello contains the
 *      blocked hostname. This happens on every port (443, 8443, 2053, ...).
 * Neither a different DNS resolver nor an alternate port defeats that.
 *
 * This Worker runs on `*.workers.dev`, which those ISPs do NOT block, and
 * forwards requests to the real LWS from Cloudflare's edge (outside the ISP).
 * The wallet simply uses the Worker URL as its LWS endpoint — end users install
 * nothing (no Tor/Orbot, no VPN).
 *
 * DEPLOY (free tier, ~3 minutes)
 *   npm i -g wrangler
 *   wrangler login
 *   wrangler deploy relay/cloudflare-worker.js --name beldex-lws-relay --compatibility-date 2024-01-01
 *   -> https://beldex-lws-relay.<your-subdomain>.workers.dev
 *
 * Then in the wallet: Settings -> Server / Node & Proxy -> LWS API URL,
 * paste that URL and Save & Apply. (Or ship it as FALLBACK_RELAY_URL so the
 * app switches over automatically — see src/services/runtimeConfig.ts.)
 *
 * PRIVACY NOTE
 * The relay sees the same data the LWS already sees (address + view key) and
 * the client IP. Run it under an account YOU control — do not point users at a
 * relay operated by an untrusted third party.
 */

const UPSTREAM = "https://lwsapi.beldex.io";

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

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS preflight (browser/WebView builds)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Simple health check so the wallet's "Test Connection" can probe the relay.
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(JSON.stringify({ relay: "beldex-lws", upstream: UPSTREAM }), {
        status: 200,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ Error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_PATHS.has(url.pathname)) {
      return new Response(JSON.stringify({ Error: "Unknown endpoint" }), {
        status: 404,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    try {
      const upstreamResp = await fetch(UPSTREAM + url.pathname, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: await request.text(),
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
      return new Response(JSON.stringify({ Error: "Relay upstream failure: " + e }), {
        status: 502,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }
  },
};
