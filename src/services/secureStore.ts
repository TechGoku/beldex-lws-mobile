import { SecureStorage } from "@aparajita/capacitor-secure-storage";

// Hardware-backed encrypted storage for sensitive values (wallet keys, PIN
// hash). On device each value is encrypted with a key held in the Android
// Keystore / iOS Keychain, so it is not readable from a plain data dump or
// device backup. On web it degrades to localStorage (dev only).

export async function getSecure(key: string): Promise<string | null> {
  try {
    return await SecureStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setSecure(key: string, value: string): Promise<void> {
  await SecureStorage.setItem(key, value);
}

export async function removeSecure(key: string): Promise<void> {
  try {
    await SecureStorage.removeItem(key);
  } catch {
    // key may not exist - ignore
  }
}
