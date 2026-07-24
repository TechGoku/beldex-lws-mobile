import { Preferences } from "@capacitor/preferences";
import normalizeApiUrl from "../utils/normalizeApiUrl";

// Runtime-overridable server config. The build-time .env values are the
// defaults; a user override (set in Server settings) is persisted via
// @capacitor/preferences and takes precedence.
//
// Reads must be synchronous because the wallet config is assembled during
// render and process.env.NETTYPE is consulted in several screens. So we load
// the persisted override once at startup into a module-level cache, and every
// getter reads that cache. Call loadRuntimeConfig() before building the bridge.

const SERVER_URL_KEY = "beldex_custom_server_url";
const NETTYPE_KEY = "beldex_custom_nettype";
// Fallback relay endpoint (see relay/cloudflare-worker.js). Some ISPs block the
// whole *.beldex.io domain (DNS hijack + TLS SNI reset), which no DNS change or
// alternate port defeats. A relay on an unblocked host (e.g. *.workers.dev)
// reaches the LWS from outside the ISP, so users need install nothing.
const RELAY_URL_KEY = "beldex_relay_url";

interface RuntimeConfigCache {
  serverUrl: string | null; // null => use env default
  nettype: number | null; // null => use env default
  relayUrl: string | null; // null => use env default (may be empty = disabled)
  loaded: boolean;
}

const cache: RuntimeConfigCache = {
  serverUrl: null,
  nettype: null,
  relayUrl: null,
  loaded: false,
};

function envServerUrl(): string {
  return (process.env.SERVER_URL || "").trim();
}

function envNetType(): number {
  const parsed = parseInt(process.env.NETTYPE || "0", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function loadRuntimeConfig(): Promise<void> {
  try {
    const [url, nettype, relay] = await Promise.all([
      Preferences.get({ key: SERVER_URL_KEY }),
      Preferences.get({ key: NETTYPE_KEY }),
      Preferences.get({ key: RELAY_URL_KEY }),
    ]);
    cache.serverUrl = url.value && url.value.trim() ? url.value.trim() : null;
    cache.relayUrl = relay.value != null ? relay.value.trim() : null;
    if (nettype.value != null && nettype.value !== "") {
      const n = parseInt(nettype.value, 10);
      cache.nettype = Number.isNaN(n) ? null : n;
    } else {
      cache.nettype = null;
    }
  } catch {
    cache.serverUrl = null;
    cache.nettype = null;
    cache.relayUrl = null;
  }
  cache.loaded = true;
}

// Effective relay URL: user override, else the build-time default. Empty string
// means "no relay configured" (fallback disabled).
export function getRelayUrl(): string {
  const v = cache.relayUrl ?? (process.env.FALLBACK_RELAY_URL || "");
  return (v || "").trim().replace(/\/+$/, "");
}

export async function saveRelayUrl(relayUrl: string): Promise<void> {
  const trimmed = relayUrl.trim();
  await Preferences.set({ key: RELAY_URL_KEY, value: trimmed });
  cache.relayUrl = trimmed;
}

// Effective raw server URL (override, else env default).
export function getRawServerUrl(): string {
  return cache.serverUrl ?? envServerUrl();
}

// Effective API URL, normalized the same way the original build did.
export function getApiUrl(): string {
  return normalizeApiUrl(getRawServerUrl());
}

// Effective network type (override, else env default).
export function getNetType(): number {
  return cache.nettype ?? envNetType();
}

export function isUsingCustomServer(): boolean {
  return cache.serverUrl != null || cache.nettype != null;
}

export async function saveServerConfig(serverUrl: string, nettype: number): Promise<void> {
  const trimmed = serverUrl.trim();
  await Preferences.set({ key: SERVER_URL_KEY, value: trimmed });
  await Preferences.set({ key: NETTYPE_KEY, value: String(nettype) });
  cache.serverUrl = trimmed || null;
  cache.nettype = nettype;
}

export async function resetServerConfig(): Promise<void> {
  await Preferences.remove({ key: SERVER_URL_KEY });
  await Preferences.remove({ key: NETTYPE_KEY });
  cache.serverUrl = null;
  cache.nettype = null;
}

export function getDefaults(): { serverUrl: string; nettype: number } {
  return { serverUrl: envServerUrl(), nettype: envNetType() };
}
