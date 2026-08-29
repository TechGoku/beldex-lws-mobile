import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { getApiUrl } from "./runtimeConfig";

// HF22 private tokens: chain-side lookups.
//
// A registration's token id is derived on the client, so the wallet knows it
// the instant the transaction is built - but knowing the id proves nothing
// about whether the network accepted it. Only the chain can say that, and
// these two calls are how the wallet asks.
//
// The daemon exposes get_token_info and get_token_list over its own JSON-RPC.
// The wallet never talks to a daemon; it talks to a light wallet server, so
// the LWS has to forward them. Where it does not yet, every call here fails
// with TokenLookupUnsupported and the UI falls back to showing what the wallet
// recorded locally, flagged as unverified - never a blank screen and never a
// claim the chain has not backed.

// Not `class TokenLookupUnsupported extends Error`. This project compiles to
// ES5, where a subclass of a built-in loses its prototype link: `instanceof`
// then returns false for every instance and callers silently take the wrong
// branch - which showed up as "the registration was never mined" on a server
// that simply has no token endpoints. A tagged plain Error plus an explicit
// guard behaves the same on every target.
export interface TokenLookupError extends Error {
  tokenLookupUnsupported: true;
}

export function unsupportedError(message = "This server does not support token lookups"): TokenLookupError {
  const e = new Error(message) as TokenLookupError;
  e.name = "TokenLookupUnsupported";
  e.tokenLookupUnsupported = true;
  return e;
}

export function isLookupUnsupported(e: unknown): e is TokenLookupError {
  return !!e && typeof e === "object" && (e as TokenLookupError).tokenLookupUnsupported === true;
}

export interface ChainTokenInfo {
  tokenId: string;
  ticker: string;
  fullName: string;
  owner: string;
  currentSupply: string;
  totalMaxSupply: string;
  decimalPoint: number;
  metaInfo?: string;
}

// Matches the ceiling in patchBeldexNetServiceUtils: a black-holed endpoint
// must not leave the token list spinning forever.
const REQUEST_TIMEOUT_MS = 15000;

function endpointUrl(path: string): string {
  return new URL(path, getApiUrl()).toString();
}

async function post(path: string, body: Record<string, unknown>): Promise<any> {
  const url = endpointUrl(path);

  const request = Capacitor.isNativePlatform()
    ? CapacitorHttp.post({
        url,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        data: body,
      }).then((res) => ({ status: res.status, data: res.data }))
    : fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      }).then(async (res) => ({ status: res.status, data: await res.json().catch(() => null) }));

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Token lookup timed out")), REQUEST_TIMEOUT_MS)
  );

  let res: { status: number; data: any };
  try {
    res = await Promise.race([request, timeout]);
  } catch (e: any) {
    // A transport failure is indistinguishable from an endpoint that is not
    // there, because a server without the route may simply drop the
    // connection. Both mean the same thing to the caller: no chain answer.
    throw unsupportedError(e?.message || "Could not reach the server");
  }

  if (res.status === 404 || res.status === 501) throw unsupportedError();
  if (res.status !== 200) {
    const serverMessage =
      res.data && typeof res.data === "object" ? res.data.Error || res.data.error : undefined;
    // 400 with a message is the server answering properly - a bad or unknown
    // token id - and must not be reported as an unsupported server.
    if (res.status === 400 && serverMessage) throw new Error(String(serverMessage));
    throw unsupportedError(serverMessage ? String(serverMessage) : `Server returned ${res.status}`);
  }

  // Some deployments will proxy the daemon verbatim, which nests the payload
  // under "result"; a native LWS endpoint would return it flat. Accept both so
  // the UI does not depend on which way the server was wired up.
  const payload = res.data && typeof res.data === "object" && res.data.result ? res.data.result : res.data;
  if (!payload || typeof payload !== "object") throw unsupportedError("Malformed response");
  return payload;
}

//! Holdings for one token, in that token's own atomic units.
export interface TokenBalance {
  tokenId: string;
  received: string;
  sent: string;
  locked: string;
  /*! Spendable total, recomputed from the outputs and their key images.

      Present whenever the wallet could verify for itself. Prefer it over
      received - sent - locked, which relies on the server's spend count and is
      wrong once any of the account's outputs has served as a ring decoy. */
  verified?: string;
}

// received - sent - locked, floored at zero. Returned as a decimal string
// because a token may declare 18 decimals, past what a double holds exactly.
export function spendableBalance(b: TokenBalance): string {
  if (b.verified !== undefined) return b.verified;
  const v = BigInt(b.received || "0") - BigInt(b.sent || "0") - BigInt(b.locked || "0");
  return (v > BigInt(0) ? v : BigInt(0)).toString();
}

export interface TokenState {
  tokenId: string;
  status: "confirmed" | "not_found" | "unknown";
  received: string;
  sent: string;
  locked: string;
  unlocked: string;
  ticker: string;
  fullName: string;
  owner: string;
  decimalPoint: number;
  currentSupply: string;
  totalMaxSupply: string;
}

export interface TokenStateReply {
  tokens: TokenState[];
  scannedHeight: number;
  blockchainHeight: number;
}

// Everything the token screens need, in one request.
//
// Holdings and identity come from different places - outputs this server
// scanned, and descriptors in the daemon's blockchain database - and rendering
// a single row needs both. Resolving them separately cost one request per token
// on top of the balance call, on a screen that refreshes; get_token_balances
// joins them server-side.
//
// `extraIds` asks about tokens the account does not hold. A registration that
// has been broadcast but not yet mined is exactly that case, and it is the
// moment its owner most wants a status.
export async function fetchTokenState(
  address: string,
  viewKey: string,
  extraIds: string[] = []
): Promise<TokenStateReply> {
  const p = await post("get_token_balances", {
    address,
    view_key: viewKey,
    token_ids: extraIds,
  });
  if (!Array.isArray(p.tokens)) throw unsupportedError();
  return {
    scannedHeight: Number(p.scanned_height ?? 0),
    blockchainHeight: Number(p.blockchain_height ?? 0),
    tokens: p.tokens.map((t: any) => ({
      tokenId: String(t.token_id ?? ""),
      status: t.status === "confirmed" || t.status === "not_found" ? t.status : "unknown",
      received: String(t.total_received ?? "0"),
      sent: String(t.total_sent ?? "0"),
      locked: String(t.locked_funds ?? "0"),
      unlocked: String(t.unlocked_balance ?? "0"),
      ticker: String(t.ticker ?? ""),
      fullName: String(t.full_name ?? ""),
      owner: String(t.owner ?? ""),
      decimalPoint: Number(t.decimal_point ?? 0),
      currentSupply: String(t.current_supply ?? "0"),
      totalMaxSupply: String(t.total_max_supply ?? "0"),
    })),
  };
}

export interface RawTokenOutput {
  tokenId: string;
  amount: string;
  txPubKey: string;
  index: number;
  spendKeyImages: string[];
}

/*! Every token output the account has ever received, unfiltered.

    Paired with verifiedTokenBalances() below. The server cannot compute a
    trustworthy balance on its own: it is view-only, so when one of our outputs
    appears as a decoy in someone else's ring it records a spend that never
    happened. On a live chain that is not rare - it is why a token can report
    more sent than it ever received and then vanish from the wallet at a
    balance of zero. */
export async function fetchAllTokenOutputs(
  address: string,
  viewKey: string
): Promise<RawTokenOutput[]> {
  const p = await post("get_unspent_outs", {
    address,
    view_key: viewKey,
    amount: "0",
    use_dust: true,
    dust_threshold: "0",
    mixin: 9,
    all_tokens: true,
  });
  const outs = Array.isArray(p.outputs) ? p.outputs : [];
  return outs
    .filter((o: any) => o.token_id)
    .map((o: any) => ({
      tokenId: String(o.token_id),
      amount: String(o.amount ?? "0"),
      txPubKey: String(o.tx_pub_key ?? ""),
      index: Number(o.index ?? 0),
      spendKeyImages: Array.isArray(o.spend_key_images)
        ? o.spend_key_images.map((k: any) => String(k))
        : [],
    }));
}

export interface WalletSpendKeys {
  secViewKey: string;
  pubSpendKey: string;
  secSpendKey: string;
}

/*! Sum what the account can actually spend, per token.

    An output counts unless its own key image appears among the spends the
    server attached to it. Only the real owner can derive that key image, which
    is precisely why this cannot be done on the server and is the same test the
    send path already applies when choosing inputs.

    `generateKeyImage` is the bridge's generate_key_image. It is given the
    output's tx public key and its index within that transaction, so a failure
    on one output must not discard the rest - an output whose key image cannot
    be derived is counted as unspent, which errs towards showing a balance the
    wallet has rather than hiding one it does. */
export function verifiedTokenBalances(
  outputs: RawTokenOutput[],
  keys: WalletSpendKeys,
  generateKeyImage: (txPub: string, viewSec: string, spendPub: string, spendSec: string, index: number) => string
): Record<string, string> {
  const totals: Record<string, bigint> = {};

  for (const out of outputs) {
    let spent = false;
    if (out.spendKeyImages.length && out.txPubKey) {
      try {
        const mine = generateKeyImage(
          out.txPubKey, keys.secViewKey, keys.pubSpendKey, keys.secSpendKey, out.index
        );
        spent = out.spendKeyImages.some((k) => k === mine);
      } catch {
        spent = false;
      }
    }
    if (spent) continue;
    totals[out.tokenId] = (totals[out.tokenId] || BigInt(0)) + BigInt(out.amount || "0");
  }

  const result: Record<string, string> = {};
  for (const id of Object.keys(totals)) result[id] = totals[id].toString();
  return result;
}
