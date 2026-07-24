import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

// Native-only shell tweaks. Each call is a no-op on the web build, so the
// same App code runs unchanged in a desktop browser during development.

export async function hideSplashScreen(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await SplashScreen.hide();
  } catch {
    // plugin not available (e.g. web) - ignore
  }
}

export async function applyStatusBarStyle(isDark: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    if (Capacitor.getPlatform() === "android") {
      // Match the app background so the bar doesn't sit as a grey stripe.
      await StatusBar.setBackgroundColor({ color: isDark ? "#0a0a0a" : "#FFFFFF" });
    }
  } catch {
    // ignore on platforms without a configurable status bar
  }
}
