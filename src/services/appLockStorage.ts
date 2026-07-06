import { Preferences } from "@capacitor/preferences";

// App-lock persistence. The PIN is never stored in plaintext: we keep a random
// salt plus SHA-256(salt + pin). This is an app-access gate; it is not what
// encrypts the wallet keys. Backed by @capacitor/preferences (native storage).

const PIN_HASH_KEY = "beldex_pin_hash";
const PIN_SALT_KEY = "beldex_pin_salt";
const LOCK_ENABLED_KEY = "beldex_lock_enabled";
const BIOMETRIC_ENABLED_KEY = "beldex_biometric_enabled";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export interface AppLockState {
  lockEnabled: boolean;
  hasPin: boolean;
  biometricEnabled: boolean;
}

export async function loadAppLockState(): Promise<AppLockState> {
  const [enabled, hash, biometric] = await Promise.all([
    Preferences.get({ key: LOCK_ENABLED_KEY }),
    Preferences.get({ key: PIN_HASH_KEY }),
    Preferences.get({ key: BIOMETRIC_ENABLED_KEY }),
  ]);
  return {
    lockEnabled: enabled.value === "true",
    hasPin: !!hash.value,
    biometricEnabled: biometric.value === "true",
  };
}

export async function setPin(pin: string): Promise<void> {
  const salt = randomSalt();
  const hash = await hashPin(pin, salt);
  await Preferences.set({ key: PIN_SALT_KEY, value: salt });
  await Preferences.set({ key: PIN_HASH_KEY, value: hash });
  await Preferences.set({ key: LOCK_ENABLED_KEY, value: "true" });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const [salt, hash] = await Promise.all([
    Preferences.get({ key: PIN_SALT_KEY }),
    Preferences.get({ key: PIN_HASH_KEY }),
  ]);
  if (!salt.value || !hash.value) return false;
  const candidate = await hashPin(pin, salt.value);
  return candidate === hash.value;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: String(enabled) });
}

// Fully disable the lock: clears PIN, salt, and both flags.
export async function disableAppLock(): Promise<void> {
  await Promise.all([
    Preferences.remove({ key: PIN_HASH_KEY }),
    Preferences.remove({ key: PIN_SALT_KEY }),
    Preferences.set({ key: LOCK_ENABLED_KEY, value: "false" }),
    Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: "false" }),
  ]);
}
