import { Capacitor } from "@capacitor/core";
import {
  BiometricAuth,
  BiometryType,
  BiometryError,
} from "@aparajita/capacitor-biometric-auth";

// Thin wrapper over @aparajita/capacitor-biometric-auth. Everything degrades
// gracefully to "unavailable" on web or on devices without enrolled biometrics,
// so callers never need platform checks of their own.

export interface BiometryInfo {
  available: boolean;
  // Human label for the enrolled modality, e.g. "Face ID", "Fingerprint".
  label: string;
}

function labelForType(type: BiometryType): string {
  switch (type) {
    case BiometryType.faceId:
      return "Face ID";
    case BiometryType.touchId:
      return "Touch ID";
    case BiometryType.fingerprintAuthentication:
      return "Fingerprint";
    case BiometryType.faceAuthentication:
      return "Face Unlock";
    case BiometryType.irisAuthentication:
      return "Iris";
    default:
      return "Biometrics";
  }
}

export async function getBiometryInfo(): Promise<BiometryInfo> {
  if (!Capacitor.isNativePlatform()) {
    return { available: false, label: "Biometrics" };
  }
  try {
    const result = await BiometricAuth.checkBiometry();
    return {
      available: result.isAvailable,
      label: labelForType(result.biometryType),
    };
  } catch {
    return { available: false, label: "Biometrics" };
  }
}

export interface BiometricAuthResult {
  success: boolean;
  // "canceled" when the user dismissed the prompt; "error" for anything else.
  reason?: "canceled" | "error";
  message?: string;
}

export async function authenticateBiometric(reason: string): Promise<BiometricAuthResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, reason: "error", message: "Biometrics unavailable" };
  }
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Use PIN",
      allowDeviceCredential: false,
      iosFallbackTitle: "Use PIN",
      androidTitle: "Unlock Beldex Wallet",
      androidSubtitle: reason,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof BiometryError) {
      const canceled = /cancel/i.test(error.code) || /cancel/i.test(error.message);
      return {
        success: false,
        reason: canceled ? "canceled" : "error",
        message: error.message,
      };
    }
    return { success: false, reason: "error", message: String(error) };
  }
}
