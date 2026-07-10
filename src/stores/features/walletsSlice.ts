import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  SavedWallet,
  WalletSeed,
  loadWallets,
  getActiveWalletId,
  setActiveWalletId,
  registerWallet,
  renameWallet as storageRename,
  deleteWallet as storageDelete,
} from "../../services/walletStore";
import { setSeedDetails, setUserLogout } from "./seedDetailSlice";

export type { SavedWallet };

export interface WalletsState {
  wallets: SavedWallet[];
  activeId: string | null;
  loaded: boolean;
  // True while the user is importing/creating an ADDITIONAL wallet from within
  // an already-logged-in session. Lets the login routes render instead of
  // redirecting back to the wallet.
  addingWallet: boolean;
}

const initialState: WalletsState = {
  wallets: [],
  activeId: null,
  loaded: false,
  addingWallet: false,
};

export const fetchWallets = createAsyncThunk("wallets/fetch", async () => {
  const [wallets, activeId] = await Promise.all([loadWallets(), getActiveWalletId()]);
  return { wallets, activeId };
});

// Save the currently-active wallet (from a login result) into the wallet list
// if it isn't there yet. Called after any successful login/create.
export const registerActiveWallet = createAsyncThunk(
  "wallets/register",
  async (seed: WalletSeed) => {
    const { wallets, active } = await registerWallet(seed);
    return { wallets, activeId: active.id };
  }
);

// Load a saved wallet's key material into the active session (seedDetails).
export const switchWallet = createAsyncThunk(
  "wallets/switch",
  async (id: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const wallet = state.walletsReducer.wallets.find((w) => w.id === id);
    if (!wallet) throw new Error("wallet not found");
    await setActiveWalletId(id);
    dispatch(
      setSeedDetails({
        address_string: wallet.address_string,
        sec_viewKey_string: wallet.sec_viewKey_string,
        pub_viewKey_string: wallet.pub_viewKey_string,
        sec_spendKey_string: wallet.sec_spendKey_string,
        pub_spendKey_string: wallet.pub_spendKey_string,
        mnemonic_string: wallet.mnemonic_string,
        sec_seed_string: wallet.sec_seed_string,
        mnemonic_language: wallet.mnemonic_language,
        isLogin: true,
      })
    );
    return id;
  }
);

export const renameWallet = createAsyncThunk(
  "wallets/rename",
  async ({ id, name }: { id: string; name: string }) => {
    const wallets = await storageRename(id, name);
    return wallets;
  }
);

export const deleteWallet = createAsyncThunk(
  "wallets/delete",
  async (id: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const wasActive = state.walletsReducer.activeId === id;
    const wallets = await storageDelete(id);
    const newActiveId = await getActiveWalletId();
    // If we removed the active wallet, either switch to the next one or log out.
    if (wasActive) {
      const next = wallets.find((w) => w.id === newActiveId);
      if (next) {
        dispatch(
          setSeedDetails({
            address_string: next.address_string,
            sec_viewKey_string: next.sec_viewKey_string,
            pub_viewKey_string: next.pub_viewKey_string,
            sec_spendKey_string: next.sec_spendKey_string,
            pub_spendKey_string: next.pub_spendKey_string,
            mnemonic_string: next.mnemonic_string,
            sec_seed_string: next.sec_seed_string,
            mnemonic_language: next.mnemonic_language,
            isLogin: true,
          })
        );
      } else {
        dispatch(setUserLogout());
      }
    }
    return { wallets, activeId: newActiveId };
  }
);

const walletsSlice = createSlice({
  name: "wallets",
  initialState,
  reducers: {
    startAddWallet(state) {
      state.addingWallet = true;
    },
    endAddWallet(state) {
      state.addingWallet = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.wallets = action.payload.wallets;
        state.activeId = action.payload.activeId;
        state.loaded = true;
      })
      .addCase(registerActiveWallet.fulfilled, (state, action) => {
        state.wallets = action.payload.wallets;
        state.activeId = action.payload.activeId;
        // A new wallet has been registered - the add flow is complete.
        state.addingWallet = false;
      })
      .addCase(switchWallet.fulfilled, (state, action) => {
        state.activeId = action.payload;
      })
      .addCase(renameWallet.fulfilled, (state, action) => {
        state.wallets = action.payload;
      })
      .addCase(deleteWallet.fulfilled, (state, action) => {
        state.wallets = action.payload.wallets;
        state.activeId = action.payload.activeId;
      });
  },
});

export const { startAddWallet, endAddWallet } = walletsSlice.actions;
export const walletsSelector = (state: RootState) => state.walletsReducer;
export default walletsSlice.reducer;
