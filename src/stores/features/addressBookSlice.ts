import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  SavedAddress,
  loadAddresses,
  persistAddresses,
} from "../../services/addressBookStorage";

export type { SavedAddress };

export interface AddressBookState {
  addresses: SavedAddress[];
  loaded: boolean;
}

export const initialState: AddressBookState = {
  addresses: [],
  loaded: false,
};

export const fetchSavedAddresses = createAsyncThunk(
  "addressBook/fetch",
  async () => loadAddresses()
);

export const addSavedAddress = createAsyncThunk(
  "addressBook/add",
  async (entry: { label: string; address: string; paymentId?: string }, { getState }) => {
    const state = getState() as RootState;
    const newEntry: SavedAddress = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
    };
    const next = [...state.addressBookReducer.addresses, newEntry];
    await persistAddresses(next);
    return next;
  }
);

export const updateSavedAddress = createAsyncThunk(
  "addressBook/update",
  async (entry: SavedAddress, { getState }) => {
    const state = getState() as RootState;
    const next = state.addressBookReducer.addresses.map((item) =>
      item.id === entry.id ? entry : item
    );
    await persistAddresses(next);
    return next;
  }
);

export const removeSavedAddress = createAsyncThunk(
  "addressBook/remove",
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const next = state.addressBookReducer.addresses.filter((item) => item.id !== id);
    await persistAddresses(next);
    return next;
  }
);

const addressBookSlice = createSlice({
  name: "addressBook",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.loaded = true;
      })
      .addCase(addSavedAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      .addCase(updateSavedAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      .addCase(removeSavedAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
      });
  },
});

export const addressBookSelector = (state: RootState) => state.addressBookReducer;
export default addressBookSlice.reducer;
