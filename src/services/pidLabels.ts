// Custom-string payment IDs (ported from the browser extension).
//
// A short payment ID is 8 bytes (16 hex chars). We derive one from a user's
// label via SHA-256 (first 8 bytes) — deterministic, so the same label always
// produces the same ID. The label itself never leaves this device: the chain
// carries only the 8-byte ID, and we keep a local pid -> label map to show the
// friendly name again in transaction details.
//
// Labels are not key material, so they live in plaintext Preferences — the
// same tier as the address book (see CLAUDE.md persistence tiers).
import { Preferences } from "@capacitor/preferences";

const LABELS_KEY = "beldex_pid_labels";

export async function deriveShortPid(label: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure crypto unavailable in this WebView");
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(label.trim())
  );
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getPidLabels(): Promise<Record<string, string>> {
  try {
    const { value } = await Preferences.get({ key: LABELS_KEY });
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

export async function savePidLabel(pid: string, label: string): Promise<void> {
  const labels = await getPidLabels();
  labels[pid.toLowerCase()] = label.trim();
  await Preferences.set({ key: LABELS_KEY, value: JSON.stringify(labels) });
}
