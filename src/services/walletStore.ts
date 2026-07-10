import { Preferences } from "@capacitor/preferences";
import { getSecure, setSecure, removeSecure } from "./secureStore";

// Multi-wallet persistence. Saved wallets contain private key material, so the
// list is kept in hardware-backed secure storage (Keystore/Keychain), NOT the
// plaintext @capacitor/preferences. The active-wallet id is not secret and
// stays in Preferences.

const WALLETS_KEY = "beldex_wallets";
const ACTIVE_KEY = "beldex_active_wallet_id";
const MIGRATED_KEY = "beldex_wallets_migrated_v1";

// One-time move of any wallets saved by older versions (plaintext Preferences)
// into secure storage, then wipe the plaintext copy.
async function migrateFromPreferencesOnce(): Promise<void> {
  const migrated = await Preferences.get({ key: MIGRATED_KEY });
  if (migrated.value === "true") return;
  const old = await Preferences.get({ key: WALLETS_KEY });
  if (old.value) {
    const existing = await getSecure(WALLETS_KEY);
    if (!existing) {
      await setSecure(WALLETS_KEY, old.value);
    }
    await Preferences.remove({ key: WALLETS_KEY });
  }
  await Preferences.set({ key: MIGRATED_KEY, value: "true" });
}

export interface SavedWallet {
  id: string;
  name: string;
  address_string: string;
  sec_viewKey_string: string;
  pub_viewKey_string: string;
  sec_spendKey_string: string;
  pub_spendKey_string: string;
  mnemonic_string: string;
  sec_seed_string: string;
  mnemonic_language: string;
  createdAt: number;
}

// Fields we accept when registering a wallet from a login result.
export type WalletSeed = Partial<SavedWallet> & {
  address_string: string;
  sec_viewKey_string: string;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadWallets(): Promise<SavedWallet[]> {
  await migrateFromPreferencesOnce();
  const value = await getSecure(WALLETS_KEY);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persist(wallets: SavedWallet[]): Promise<void> {
  await setSecure(WALLETS_KEY, JSON.stringify(wallets));
}

export async function getActiveWalletId(): Promise<string | null> {
  const { value } = await Preferences.get({ key: ACTIVE_KEY });
  return value || null;
}

export async function setActiveWalletId(id: string): Promise<void> {
  await Preferences.set({ key: ACTIVE_KEY, value: id });
}

// Add a wallet (if its address isn't already saved) and mark it active.
// Returns the full list plus the active wallet.
export async function registerWallet(
  seed: WalletSeed,
  name?: string
): Promise<{ wallets: SavedWallet[]; active: SavedWallet }> {
  const wallets = await loadWallets();
  const existing = wallets.find((w) => w.address_string === seed.address_string);
  if (existing) {
    await setActiveWalletId(existing.id);
    return { wallets, active: existing };
  }

  const defaultName = name?.trim() || `Wallet ${wallets.length + 1}`;
  const wallet: SavedWallet = {
    id: newId(),
    name: defaultName,
    address_string: seed.address_string,
    sec_viewKey_string: seed.sec_viewKey_string,
    pub_viewKey_string: seed.pub_viewKey_string || "",
    sec_spendKey_string: seed.sec_spendKey_string || "",
    pub_spendKey_string: seed.pub_spendKey_string || "",
    mnemonic_string: seed.mnemonic_string || "",
    sec_seed_string: seed.sec_seed_string || "",
    mnemonic_language: seed.mnemonic_language || "",
    createdAt: Date.now(),
  };
  const next = [...wallets, wallet];
  await persist(next);
  await setActiveWalletId(wallet.id);
  return { wallets: next, active: wallet };
}

export async function renameWallet(id: string, name: string): Promise<SavedWallet[]> {
  const wallets = await loadWallets();
  const next = wallets.map((w) => (w.id === id ? { ...w, name: name.trim() || w.name } : w));
  await persist(next);
  return next;
}

export async function deleteWallet(id: string): Promise<SavedWallet[]> {
  const wallets = await loadWallets();
  const next = wallets.filter((w) => w.id !== id);
  await persist(next);
  const active = await getActiveWalletId();
  if (active === id) {
    if (next.length > 0) {
      await setActiveWalletId(next[0].id);
    } else {
      await Preferences.remove({ key: ACTIVE_KEY });
    }
  }
  return next;
}
