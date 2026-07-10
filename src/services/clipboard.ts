import { Clipboard } from "@capacitor/clipboard";

// Reliable copy-to-clipboard. On device, navigator.clipboard.writeText is often
// blocked/undefined inside the WebView, so use the native Clipboard plugin and
// fall back to the web API (and a hidden-textarea execCommand) otherwise.
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await Clipboard.write({ string: text });
    return true;
  } catch {
    // fall through to web fallbacks
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

// Read text from the clipboard (used by "paste" affordances).
export async function readClipboard(): Promise<string> {
  try {
    const { value } = await Clipboard.read();
    if (typeof value === "string") return value;
  } catch {
    // fall through
  }
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch {
    // fall through
  }
  return "";
}
