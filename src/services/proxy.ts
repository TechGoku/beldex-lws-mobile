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
