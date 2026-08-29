import { Preferences } from "@capacitor/preferences";

const STORAGE_KEY = "beldex_registered_tokens";

// A token this wallet registered. The id is the only field the user cannot
// reconstruct: it is hashed from the descriptor plus a random salt that the
// bridge generates and does not keep, so if the id is lost at the moment of
// registration there is no way to derive it again from what the user typed.
// That is why the record is written before anything else on the success path.
export interface RegisteredToken {
  tokenId: string;
  ticker: string;
  fullName: string;
  decimalPoint: number;
  // As the user entered them, already scaled for display. Kept alongside the
  // id so the list reads correctly before the chain has been consulted, and
  // still reads correctly on a server with no token endpoints at all.
  currentSupply: string;
  totalMaxSupply: string;
  // Which wallet registered it. Rows are filtered by this so switching wallets
  // does not show another account's tokens.
  walletAddress: string;
  txHash?: string;
  registeredAt: number;
}

// Backed by @capacitor/preferences, which persists to UserDefaults on iOS and
// SharedPreferences on Android - durable across app restarts, unlike WebView
// localStorage which the OS can evict under storage pressure. Same store the
// address book uses.
export async function loadRegisteredTokens(): Promise<RegisteredToken[]> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function persistRegisteredTokens(tokens: RegisteredToken[]): Promise<void> {
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(tokens) });
}

// Read-modify-write against the stored list rather than against redux. The
// success callback that calls this runs deep inside the C++ bridge's callback
// chain, where the store may not have rehydrated the list yet; going straight
// to Preferences means a registration can never be dropped because the UI had
// not got around to loading.
export async function appendRegisteredToken(entry: RegisteredToken): Promise<RegisteredToken[]> {
  const existing = await loadRegisteredTokens();
  if (existing.some((t) => t.tokenId === entry.tokenId)) return existing;
  const next = [entry, ...existing];
  await persistRegisteredTokens(next);
  return next;
}

export async function removeRegisteredToken(tokenId: string): Promise<RegisteredToken[]> {
  const next = (await loadRegisteredTokens()).filter((t) => t.tokenId !== tokenId);
  await persistRegisteredTokens(next);
  return next;
}
