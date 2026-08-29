import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  RegisteredToken,
  appendRegisteredToken,
  loadRegisteredTokens,
  removeRegisteredToken,
} from "../../services/tokenStorage";
import {
  ChainTokenInfo,
  TokenBalance,
  WalletSpendKeys,
  fetchTokenState,
  fetchAllTokenOutputs,
  verifiedTokenBalances,
} from "../../services/tokenApi";

export type { RegisteredToken };

// Where a token stands according to the chain, as distinct from what the
// wallet remembers having sent.
//   pending   - registered locally, chain not yet consulted
//   confirmed - the daemon returned a descriptor for this id
//   missing   - the server answered, and has no such token: the registration
//               was built and broadcast but never mined
//   unknown   - the server cannot answer at all, so nothing can be concluded
export type TokenChainStatus = "pending" | "confirmed" | "missing" | "unknown";

export interface TokensState {
  tokens: RegisteredToken[];
  loaded: boolean;
  status: Record<string, TokenChainStatus>;
  chainInfo: Record<string, ChainTokenInfo>;
  refreshing: boolean;
  //! What the wallet actually holds, keyed by token id. Distinct from `tokens`,
  //! which is only what this device registered: a token can be received from
  //! someone else, and a registered token can be given away entirely.
  balances: Record<string, TokenBalance>;
  balancesLoaded: boolean;
  // null until a lookup has been attempted. false means this server has no
  // token endpoints, which the UI states plainly instead of showing every
  // token as failed.
  lookupSupported: boolean | null;
  lookupError: string;
}

export const initialState: TokensState = {
  tokens: [],
  loaded: false,
  status: {},
  chainInfo: {},
  balances: {},
  balancesLoaded: false,
  refreshing: false,
  lookupSupported: null,
  lookupError: "",
};

// How long a just-broadcast registration is given before its absence from the
// chain is reported as a failure. Blocks target 30s; 20 minutes is ~40 blocks,
// far longer than any healthy inclusion delay but short enough that a genuinely
// dropped registration does not sit mislabelled all day.
const UNMINED_GRACE_MS = 20 * 60 * 1000;

export const fetchRegisteredTokens = createAsyncThunk("tokens/fetch", async () =>
  loadRegisteredTokens()
);

export const recordRegisteredToken = createAsyncThunk(
  "tokens/record",
  async (entry: RegisteredToken) => appendRegisteredToken(entry)
);

export const forgetRegisteredToken = createAsyncThunk("tokens/forget", async (tokenId: string) =>
  removeRegisteredToken(tokenId)
);

// Ask the chain about every token this wallet registered. One call per token
// rather than a single list call: get_token_list is paginated over every token
// on the chain, so on a busy network the wallet's own handful could sit past
// the end of the first page.
/*! Everything the token screens need, in one request.

    Replaces a balances call followed by one descriptor lookup per token: that
    was N+1 requests on a screen that refreshes, and on a phone the tail of it
    was visible. get_token_balances joins the two server-side.

    Locally-registered tokens are passed along as `token_ids` so a registration
    still waiting for a block gets a status too - the account holds nothing for
    it yet, so it would otherwise be absent from a holdings-driven reply. */
export const refreshTokens = createAsyncThunk(
  "tokens/refresh",
  async (
    creds: {
      address: string;
      viewKey: string;
      /*! Spend keys and the bridge's key-image function.

          Supplied when available so balances can be verified rather than taken
          on trust; without them the server's figure is used, which is what a
          caller that has no bridge handy (or a locked wallet) falls back to. */
      spendKeys?: WalletSpendKeys;
      generateKeyImage?: (txPub: string, viewSec: string, spendPub: string, spendSec: string, index: number) => string;
    },
    { getState }
  ) => {
    const state = getState() as RootState;
    const known = state.tokensReducer.tokens.map((t) => t.tokenId);
    const reply = await fetchTokenState(creds.address, creds.viewKey, known);

    const balances: Record<string, TokenBalance> = {};
    const chainInfo: Record<string, ChainTokenInfo> = {};
    const status: Record<string, TokenChainStatus> = {};

    for (const t of reply.tokens) {
      balances[t.tokenId] = {
        tokenId: t.tokenId,
        received: t.received,
        sent: t.sent,
        locked: t.locked,
      };

      if (t.status === "confirmed") {
        chainInfo[t.tokenId] = {
          tokenId: t.tokenId,
          ticker: t.ticker,
          fullName: t.fullName,
          owner: t.owner,
          currentSupply: t.currentSupply,
          totalMaxSupply: t.totalMaxSupply,
          decimalPoint: t.decimalPoint,
        };
        status[t.tokenId] = "confirmed";
      } else if (t.status === "not_found") {
        // Absent from the chain. Whether that is bad news depends on age: a
        // registration broadcast a moment ago is simply waiting for a block,
        // and calling that "never mined" would be alarming and wrong.
        const entry = state.tokensReducer.tokens.find((x) => x.tokenId === t.tokenId);
        const age = entry ? Date.now() - entry.registeredAt : Number.MAX_SAFE_INTEGER;
        status[t.tokenId] = age < UNMINED_GRACE_MS ? "pending" : "missing";
      } else {
        // The server holds the balance but could not reach the daemon, so the
        // token cannot be described. Nothing can be concluded about it.
        status[t.tokenId] = "unknown";
      }
    }

    /* The server's total_sent counts every ring member it owns, decoys
       included, so a token can report more sent than it ever received and then
       disappear at a balance of zero. Recompute from the outputs themselves,
       keeping only those whose key image is not among the spends attached to
       them - a test only the owner can perform. */
    if (creds.spendKeys && creds.generateKeyImage) {
      try {
        const outs = await fetchAllTokenOutputs(creds.address, creds.viewKey);
        const verified = verifiedTokenBalances(outs, creds.spendKeys, creds.generateKeyImage);
        for (const id of Object.keys(balances)) {
          balances[id] = { ...balances[id], verified: verified[id] ?? "0" };
        }
        for (const id of Object.keys(verified)) {
          if (!balances[id]) {
            balances[id] = { tokenId: id, received: verified[id], sent: "0", locked: "0", verified: verified[id] };
          }
        }
      } catch {
        // Server too old to serve every token at once, or the request failed.
        // The unverified figures still render; they are only wrong once one of
        // the account's outputs has been used as a decoy.
      }
    }

    return { balances, chainInfo, status };
  }
);

const tokensSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    clearTokenState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegisteredTokens.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.loaded = true;
      })
      .addCase(recordRegisteredToken.fulfilled, (state, action) => {
        state.tokens = action.payload;
        state.loaded = true;
      })
      .addCase(forgetRegisteredToken.fulfilled, (state, action) => {
        state.tokens = action.payload;
      })
      .addCase(refreshTokens.pending, (state) => {
        state.refreshing = true;
        state.lookupError = "";
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.refreshing = false;
        state.balancesLoaded = true;
        state.lookupSupported = true;
        // Replaced wholesale, not merged: a token spent to zero and dropped by
        // the server must disappear here too, and a merge would strand it.
        state.balances = action.payload.balances;
        state.chainInfo = { ...state.chainInfo, ...action.payload.chainInfo };
        state.status = { ...state.status, ...action.payload.status };
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.refreshing = false;
        state.balancesLoaded = true;
        state.lookupSupported = false;
        state.lookupError = action.error.message || "Could not read token balances";
      });
  },
});

export const { clearTokenState } = tokensSlice.actions;
export default tokensSlice.reducer;

export const tokensSelector = (state: RootState) => state.tokensReducer;
