import { Capacitor, registerPlugin } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// JS bridge to the native AppProxy plugin (Android). On web this is a no-op:
// browsers cannot set their own proxy, so the settings persist but only take
// effect inside the native apps.

export type ProxyType = "http" | "https" | "socks";

interface AppProxyNative {
  set(options: {
    enabled: boolean;
    host: string;
    port: number;
    type: ProxyType;
  }): Promise<{ applied: boolean }>;
}

const AppProxy = registerPlugin<AppProxyNative>("AppProxy");

const PROXY_KEY = "beldex_proxy_config";

export interface ProxySettings {
  enabled: boolean;
  host: string;
  port: number;
  // http / https handle both http and https targets; socks (SOCKS5) routes all
  // TCP traffic, VPN-style.
  type: ProxyType;
}

const DEFAULTS: ProxySettings = { enabled: false, host: "", port: 8080, type: "http" };

export interface ProxyPreset {
  id: string;
  label: string;
  description: string;
  host: string;
  port: number;
  type: ProxyType;
}

// Ready-made proxy targets for bypassing ISP-level domain/DNS blocking of the
// LWS backend. These are deliberately all loopback (127.0.0.1): the app never
// ships third-party public proxies, because routing wallet traffic (address +
// view key) through an untrusted relay would be a real security downgrade and
// public proxy lists rot / turn malicious. Instead the user runs a trusted
// local circumvention client (Orbot/Tor is the standard tool for domain
// blocking) and the wallet points at it. "Custom" (no preset) stays available
// for anyone with their own proxy. To bypass a blocked *domain* without a
// proxy at all, point the LWS URL at an alternate mirror host/IP.
export const PROXY_PRESETS: ProxyPreset[] = [
  {
    id: "tor-orbot",
    label: "Tor via Orbot (SOCKS5)",
    description:
      "Routes over the Tor network — bypasses ISP domain/DNS blocking. Requires the Orbot app installed and running in proxy/VPN mode.",
    host: "127.0.0.1",
    port: 9050,
    type: "socks",
  },
  {
    id: "tor-9150",
    label: "Tor daemon (SOCKS5 :9150)",
    description:
      "For a tor client exposing SOCKS5 on 127.0.0.1:9150 (e.g. Tor Browser's bundled tor) on this device.",
    host: "127.0.0.1",
    port: 9150,
    type: "socks",
  },
  {
    id: "local-http",
    label: "Local HTTP proxy (:8080)",
    description:
      "An HTTP proxy you run on this device on 127.0.0.1:8080 (e.g. a local bridge to a remote endpoint).",
    host: "127.0.0.1",
    port: 8080,
    type: "http",
  },
];

export async function loadProxySettings(): Promise<ProxySettings> {
  try {
    const { value } = await Preferences.get({ key: PROXY_KEY });
    if (!value) return { ...DEFAULTS };
    const parsed = JSON.parse(value);
    const type: ProxyType =
      parsed.type === "https" || parsed.type === "socks" ? parsed.type : "http";
    return {
      enabled: !!parsed.enabled,
      host: typeof parsed.host === "string" ? parsed.host : "",
      port: Number.isFinite(parsed.port) ? parsed.port : DEFAULTS.port,
      type,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

async function applyToNative(settings: ProxySettings): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await AppProxy.set({
      enabled: settings.enabled,
      host: settings.host.trim(),
      port: settings.port,
      type: settings.type,
    });
    return true;
  } catch (e) {
    console.error("[Proxy] failed to apply:", e);
    return false;
  }
}

export async function saveProxySettings(settings: ProxySettings): Promise<boolean> {
  await Preferences.set({ key: PROXY_KEY, value: JSON.stringify(settings) });
  return applyToNative(settings);
}

// Called once at startup, before the wallet API client makes any request.
export async function applyProxyFromStorage(): Promise<void> {
  const settings = await loadProxySettings();
  if (settings.enabled && settings.host) {
    await applyToNative(settings);
  }
}
