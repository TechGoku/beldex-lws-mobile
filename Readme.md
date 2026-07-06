# 💎 Beldex LWS Mobile

Native Android and iOS wallet apps for the **Beldex Light Wallet Service (LWS)**, built by wrapping the [beldex-lws-frontend](https://github.com/Beldex-Coin/beldex-lws-frontend) React/TypeScript codebase in [Capacitor](https://capacitorjs.com/) native shells.

The wallet's cryptography (address decoding, transaction construction, key derivation) runs through a compiled WASM module (`@bdxi/beldex-app-bridge`). WASM isn't portable to a plain React Native/Hermes runtime, but it runs unmodified inside the system WebView that Capacitor wraps — so this project reuses the existing web codebase and business logic as-is instead of re-implementing the wallet core natively per platform.

---

## What's different from the web frontend

* **Capacitor** wraps the built web app (`dist/`) into real Android (`/android`) and iOS (`/ios`) projects that build with Android Studio / Xcode and ship to the Play Store / App Store.
* **Local address book**: saved recipient addresses are persisted on-device via [`@capacitor/preferences`](https://capacitorjs.com/docs/apis/preferences) (backed by `SharedPreferences` on Android and `UserDefaults` on iOS), not the server. See [Saved addresses](#saved-addresses) below.
* Mobile-appropriate `<head>` meta (safe-area viewport, status bar), and Capacitor's `@capacitor/status-bar` / `@capacitor/splash-screen` / `@capacitor/app` plugins for a native feel.

Everything else (screens, Redux store, LWS API client, routing) is the same code as the web frontend.

---

## Saved addresses

A new "Saved Addresses" feature was added for the mobile apps:

* On the **Send** screen, the bookmark icon next to the address field saves the currently-entered address (with a label you choose) for reuse later; the contacts icon opens a picker of previously saved addresses (selecting one fills in the address and payment ID).
* **Settings → Manage Saved Addresses** opens the full address book to add, edit, or delete entries directly.
* Storage: `src/services/addressBookStorage.ts` (Capacitor Preferences read/write) and `src/stores/features/addressBookSlice.ts` (Redux Toolkit slice + thunks). Data lives only on the device — it is never sent to the LWS server.

On mobile the wallet uses a **bottom tab layout** (Wallet / Send / Contacts / History) instead of the web's single scrolling page — see `src/components/bottomNav/BottomNav.tsx` and the mobile branch of `src/pages/myWallet/index.tsx`.

---

## App lock (PIN & biometrics)

Access to the app can be gated behind a PIN and, where available, device biometrics (Face ID / Touch ID / fingerprint).

* **Settings → Security (PIN & Biometrics)**: enable App Lock (sets a 6-digit PIN), change the PIN, and toggle biometric unlock.
* When enabled, the app shows a full-screen lock (`src/pages/lock/index.tsx`) on launch and whenever it returns from the background. Unlock with the PIN, or biometrics if enabled.
* The PIN is never stored in plaintext — a random salt plus `SHA-256(salt+pin)` is kept in Capacitor Preferences (`src/services/appLockStorage.ts`). This is an access gate, not wallet-key encryption.
* Biometrics use `@aparajita/capacitor-biometric-auth` (`src/services/biometric.ts`), pinned to **v8.x for Capacitor 6**. It degrades gracefully: on web, or on a device with no enrolled biometrics, the option is shown disabled and only the PIN is used.
* State lives in `src/stores/features/securitySlice.ts`.

## Custom server / node

The wallet can point at your own Beldex Light Wallet Service instead of the build-time default.

* **Settings → Server / Node Settings**: enter a custom LWS API URL and pick the network (Mainnet / Testnet / Stagenet). Saving logs out and reloads so the wallet reconnects to the new endpoint.
* The override is persisted in Capacitor Preferences and read at startup by `src/services/runtimeConfig.ts`, which overrides the `.env` defaults (`SERVER_URL` / `NETTYPE`) app-wide. "Reset to Default" clears the override.

> **Networking note:** on device, WebView `fetch`/`XHR` is routed through the native HTTP stack via Capacitor's `CapacitorHttp` plugin (enabled in `capacitor.config.ts`), because the LWS server does not send CORS headers. `src/utils/netProbe.ts` logs a startup connectivity check to `adb logcat -s Capacitor/Console` for diagnosing endpoint issues.

---

## Prerequisites

* **Node.js** v18+ and npm v9+
* **Android**: Android Studio (Giraffe or newer), JDK 17
* **iOS**: macOS with Xcode 15+ and [CocoaPods](https://cocoapods.org/) — the `ios/` project can only be built/run on macOS

### Installation

```bash
npm install
```

### Environment setup

Copy `.env.default` to `.env` and fill in the values described below, then rebuild/re-sync before shipping to a device.

| Variable | Description |
| :--- | :--- |
| `NETTYPE` | Network: `0` Mainnet, `1` Testnet, `2` Stagenet. |
| `SERVER_URL` | LWS API endpoint. |
| `APP_NAME` | App identity used in the User-Agent/headers. |
| `APP_VERSION` | App version string. |
| `WEB_VERSION` | Version shown in the header. |

---

## Development

Run in a desktop browser (fastest feedback loop for UI work; native plugins fall back to web implementations, e.g. Preferences uses `localStorage`):

```bash
npm start
```

---

## Building the native apps

```bash
# 1. Build the web bundle and copy it into android/ and ios/
npm run cap:sync

# 2. Open in the platform IDE to run on a simulator/device or produce a release build
npm run android   # opens Android Studio
npm run ios       # opens Xcode (macOS only)
```

`npm run android` / `npm run ios` both run `cap:sync` first, then open the native IDE via `npx cap open <platform>`.

### Building an APK from the command line

```bash
npm run cap:sync
cd android
./gradlew assembleDebug      # debug APK -> android/app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease    # release APK (unsigned) -> .../release/app-release-unsigned.apk
```

The release APK must be zipaligned and signed before it can be installed:

```bash
BT=$ANDROID_HOME/build-tools/35.0.0
$BT/zipalign -f -p 4 app-release-unsigned.apk app-release-aligned.apk
$BT/apksigner sign --ks <your-keystore> --out beldex-lws-mobile.apk app-release-aligned.apk
```

> ⚠️ **Before publishing:** generate a dedicated release keystore (`keytool -genkeypair ...`) and keep it safe — Play Store updates must always be signed with the same key. Do not ship builds signed with the Android debug keystore.

The Android and iOS projects (`/android`, `/ios`) are committed to this repo, since they hold platform config (permissions, signing, plugin registration) that isn't safe to regenerate blindly. If they're ever deleted, recreate them with:

```bash
npm run cap:add:android
npm run cap:add:ios   # macOS only - requires CocoaPods
```

---

## 🔗 Official Links

* **Official Web Wallet**: [wallet.beldex.io](https://wallet.beldex.io)
* **Official Website**: [beldex.io](https://beldex.io)
* **Block Explorer**: [explorer.beldex.io](https://explorer.beldex.io)

---

## 🏗 Technology Stack

* **Core**: React 18, TypeScript, Capacitor 6
* **State**: Redux Toolkit & Redux Persist
* **Local storage**: `@capacitor/preferences` (saved addresses)
* **Styling**: Material UI (MUI) & SASS
* **Bundler**: Webpack 5
* **Wallet crypto**: `@bdxi/beldex-app-bridge` (WASM)

---

## 📄 License

This project is proprietary. For licensing inquiries, please contact the [Beldex Team](https://beldex.io).
