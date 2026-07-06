import { Preferences } from "@capacitor/preferences";

const STORAGE_KEY = "beldex_saved_addresses";

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  paymentId?: string;
  createdAt: number;
}

// Backed by @capacitor/preferences, which persists to UserDefaults on iOS and
// SharedPreferences on Android - durable across app restarts, unlike WebView
// localStorage which the OS can evict under storage pressure.
export async function loadAddresses(): Promise<SavedAddress[]> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function persistAddresses(addresses: SavedAddress[]): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(addresses) });
}
