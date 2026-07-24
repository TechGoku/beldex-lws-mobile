import { Capacitor } from "@capacitor/core";

const PROTOCOL_PATTERN = /^https?:\/\//i;
const LOCAL_HOST_PATTERN = /^(localhost|127\.0\.0\.1)$/i;

export default function normalizeApiUrl(apiUrl?: string): string {
  const trimmedApiUrl = apiUrl?.trim() ?? "";

  if (!trimmedApiUrl) {
    return "";
  }

  const withoutProtocol = trimmedApiUrl.replace(PROTOCOL_PATTERN, "");
  const withoutTrailingSlash = withoutProtocol.replace(/\/+$/, "");

  // The `/api` rewrite exists for webpack-dev-server's proxy. The Capacitor
  // WebView also serves from https://localhost, but has no such proxy - on
  // device we must always call SERVER_URL directly.
  if (
    !Capacitor.isNativePlatform() &&
    typeof window !== "undefined" &&
    LOCAL_HOST_PATTERN.test(window.location.hostname)
  ) {
    return `${window.location.origin}/api/`;
  }

  // HTTP support: when the user *explicitly* types http:// (e.g. a self-hosted
  // or LAN LWS with no TLS), keep the scheme so patchBeldexNetServiceUtils
  // builds a plain-HTTP absolute request URL. Bare hosts and https:// keep the
  // original protocol-less authority, which the SDK resolves over https - so
  // the default/secure path is completely unchanged.
  if (/^http:\/\//i.test(trimmedApiUrl)) {
    return `http://${withoutTrailingSlash}/`;
  }

  return `${withoutTrailingSlash}/`;
}
