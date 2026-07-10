import { Preferences } from "@capacitor/preferences";
import { getSecure, setSecure, removeSecure } from "./secureStore";

// App-lock persistence. The PIN is never stored in plaintext: a random salt
// plus PBKDF2(pin, salt, 100k) is kept in hardware-backed SECURE storage, so
// the hash can't be pulled from a data dump/backup and brute-forced offline.
// The non-secret flags (enabled, biometric, auto-lock) stay in Preferences.
// This is an app-access gate; wallet keys are encrypted separately.

const PIN_HASH_KEY = "beldex_pin_hash";
const PIN_SALT_KEY = "beldex_pin_salt";
const LOCK_ENABLED_KEY = "beldex_lock_enabled";
const BIOMETRIC_ENABLED_KEY = "beldex_biometric_enabled";
const AUTOLOCK_KEY = "beldex_autolock_seconds";

// 0 = lock immediately on background only (no idle timer); a positive value is
// the idle timeout in seconds; the UI maps a large sentinel to "Never".
export const AUTOLOCK_NEVER = 0;
const AUTOLOCK_DEFAULT = 60;
const PBKDF2_ITERATIONS = 100000;

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
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return toHex(bits);
}

// Remove any PIN hash left in plaintext Preferences by older versions.
async function cleanupLegacyPin(): Promise<void> {
  await Preferences.remove({ key: PIN_HASH_KEY });
  await Preferences.remove({ key: PIN_SALT_KEY });
}

export interface AppLockState {
  lockEnabled: boolean;
  hasPin: boolean;
  biometricEnabled: boolean;
  autoLockSeconds: number;
}

export async function loadAppLockState(): Promise<AppLockState> {
  await cleanupLegacyPin();
  const [enabled, biometric, autolock, secureHash] = await Promise.all([
    Preferences.get({ key: LOCK_ENABLED_KEY }),
    Preferences.get({ key: BIOMETRIC_ENABLED_KEY }),
    Preferences.get({ key: AUTOLOCK_KEY }),
    getSecure(PIN_HASH_KEY),
  ]);
  const parsedAutolock = autolock.value != null ? parseInt(autolock.value, 10) : NaN;
  const hasPin = !!secureHash;
  return {
    // Only consider the lock enabled if a PIN actually exists in secure storage.
    lockEnabled: enabled.value === "true" && hasPin,
    hasPin,
    biometricEnabled: biometric.value === "true",
    autoLockSeconds: Number.isFinite(parsedAutolock) ? parsedAutolock : AUTOLOCK_DEFAULT,
  };
}

export async function setAutoLockSeconds(seconds: number): Promise<void> {
  await Preferences.set({ key: AUTOLOCK_KEY, value: String(seconds) });
}

export async function setPin(pin: string): Promise<void> {
  const salt = randomSalt();
  const hash = await hashPin(pin, salt);
  await setSecure(PIN_SALT_KEY, salt);
  await setSecure(PIN_HASH_KEY, hash);
  await Preferences.set({ key: LOCK_ENABLED_KEY, value: "true" });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const [salt, hash] = await Promise.all([
    getSecure(PIN_SALT_KEY),
    getSecure(PIN_HASH_KEY),
  ]);
  if (!salt || !hash) return false;
  const candidate = await hashPin(pin, salt);
  // Constant-time-ish compare (lengths are fixed hex strings).
  if (candidate.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: String(enabled) });
}

// Fully disable the lock: clears PIN, salt, and both flags.
export async function disableAppLock(): Promise<void> {
  await Promise.all([
    removeSecure(PIN_HASH_KEY),
    removeSecure(PIN_SALT_KEY),
    Preferences.set({ key: LOCK_ENABLED_KEY, value: "false" }),
    Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: "false" }),
  ]);
}
