import { Capacitor, CapacitorHttp } from "@capacitor/core";

// Pre-flight probe for a candidate LWS endpoint. Before the app commits to a
// server (which triggers a logout + reload), we hit the same endpoint the
// wallet uses - POST get_address_info - and classify the answer. This is what
// stops the app from "just getting stuck" on a host that isn't a Beldex LWS:
// instead of the dashboard silently never loading, the user gets a clear
// reachable / not-an-LWS / timed-out verdict up front.

const PROTOCOL_PATTERN = /^https?:\/\//i;
const TIMEOUT_MS = 8000;

export type TestConnectionKind =
  | "ok"
  | "unreachable"
  | "not-lws"
  | "timeout"
  | "inconclusive";

export interface TestConnectionResult {
  ok: boolean;
  kind: TestConnectionKind;
  message: string;
  latencyMs?: number;
  status?: number;
}

// Absolute base URL the wallet would use: preserve an explicit http:// scheme
// (LAN / self-hosted LWS), default bare hosts to https. Mirrors normalizeApiUrl
// but always yields an absolute URL so fetch/CapacitorHttp can call it directly.
function toBaseUrl(rawUrl: string): string {
  const trimmed = (rawUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  const withProto = PROTOCOL_PATTERN.test(trimmed) ? trimmed : `https://${trimmed}`;
  return `${withProto}/`;
}

function looksLikeHtml(s: string): boolean {
  const head = s.slice(0, 200).toLowerCase();
  return head.includes("<!doctype html") || head.includes("<html") || head.startsWith("<");
}

function isJson(data: unknown): boolean {
  if (data && typeof data === "object") return true;
  if (typeof data === "string") {
    const s = data.trim();
    if (!s) return false;
    try {
      JSON.parse(s);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

// Decide what the endpoint is from the shape of the reply we get for a
// deliberately-malformed get_address_info probe. Signals, strongest first:
//  - JSON body                      → a live LWS speaking the protocol.
//  - HTML body / text/html          → a web page: wrong host.
//  - 404 / 405 / 501                → the /get_address_info route doesn't exist
//                                     here → not an LWS.
//  - 502 / 503 / 504                → domain resolves but the LWS backend is
//                                     down (gateway error).
//  - any other status (200/4xx/500) with a non-HTML/empty body
//                                   → the LWS app itself handled our bad input
//                                     and errored. Beldex LWS returns exactly
//                                     this: HTTP 500, text/plain, empty body.
function classifyBody(
  data: unknown,
  status: number,
  contentType?: string
): TestConnectionResult {
  const ct = (contentType || "").toLowerCase();
  const asString = typeof data === "string" ? data.trim() : "";

  if (isJson(data) && !ct.includes("text/html")) {
    return { ok: true, kind: "ok", message: "Connected — valid Beldex LWS endpoint.", status };
  }
  if (ct.includes("text/html") || (asString && looksLikeHtml(asString))) {
    return {
      ok: false,
      kind: "not-lws",
      message: "Reachable, but this host returned a web page, not the LWS API. Check the URL.",
      status,
    };
  }
  if (!status) {
    return { ok: false, kind: "unreachable", message: "Host answered but sent no HTTP status." };
  }
  if (status === 404 || status === 405 || status === 501) {
    return {
      ok: false,
      kind: "not-lws",
      message: `No LWS API at this URL (HTTP ${status}). Check the address/path.`,
      status,
    };
  }
  if (status === 502 || status === 503 || status === 504) {
    return {
      ok: false,
      kind: "unreachable",
      message: `Server reachable but the LWS backend isn't responding (HTTP ${status}).`,
      status,
    };
  }
  // 200 / 400 / 401 / 403 / 422 / 500 … with an empty or plain-text body: the
  // LWS processed our intentionally-invalid request and errored — it's live.
  return {
    ok: true,
    kind: "ok",
    message: `Connected — live Beldex LWS endpoint (HTTP ${status}).`,
    status,
  };
}

// Case-insensitive header lookup (CapacitorHttp preserves original casing,
// fetch lowercases — normalise both).
function headerValue(headers: any, name: string): string | undefined {
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(name) ?? undefined;
  const target = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === target) return headers[key];
  }
  return undefined;
}

// Hard wall-clock timeout independent of the transport's own timeout support,
// so a black-holed TCP connection can't leave the button spinning forever.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout-abort")), ms)),
  ]);
}

export async function testServerConnection(rawUrl: string): Promise<TestConnectionResult> {
  const base = toBaseUrl(rawUrl);
  if (!base) {
    return { ok: false, kind: "unreachable", message: "Enter a server URL first." };
  }
  const url = `${base}get_address_info`;
  const payload = { address: "", view_key: "" };
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  const t0 = Date.now();

  try {
    if (Capacitor.isNativePlatform()) {
      // CapacitorHttp routes through the native stack (no CORS, honours proxy).
      const res: any = await withTimeout(
        CapacitorHttp.post({
          url,
          headers,
          data: payload,
          connectTimeout: TIMEOUT_MS,
          readTimeout: TIMEOUT_MS,
        } as any),
        TIMEOUT_MS + 1500
      );
      const out = classifyBody(
        res?.data,
        Number(res?.status) || 0,
        headerValue(res?.headers, "content-type")
      );
      out.latencyMs = Date.now() - t0;
      return out;
    }

    // Web (dev): plain fetch. Cross-origin LWS servers send no CORS headers, so
    // the browser may block the *response* even when the server is healthy -
    // reported as "inconclusive" rather than a false failure.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: ctrl.signal,
        cache: "no-store",
      });
      const text = await res.text();
      const out = classifyBody(text, res.status, headerValue(res.headers, "content-type"));
      out.latencyMs = Date.now() - t0;
      return out;
    } finally {
      clearTimeout(timer);
    }
  } catch (e: any) {
    const msg = (e && (e.message || String(e))) || "";
    const latencyMs = Date.now() - t0;
    if (/timeout-abort|abort/i.test(msg)) {
      return {
        ok: false,
        kind: "timeout",
        message: `No response within ${TIMEOUT_MS / 1000}s — server unreachable or blocked by your network.`,
        latencyMs,
      };
    }
    if (!Capacitor.isNativePlatform() && /failed to fetch|networkerror|load failed/i.test(msg)) {
      return {
        ok: false,
        kind: "inconclusive",
        message: "Couldn't verify from the browser (CORS/network). This test is reliable in the mobile app.",
        latencyMs,
      };
    }
    return {
      ok: false,
      kind: "unreachable",
      message: `Couldn't reach the server: ${msg || "network error"}.`,
      latencyMs,
    };
  }
}
