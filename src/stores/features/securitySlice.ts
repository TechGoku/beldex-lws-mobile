import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  AppLockState,
  loadAppLockState,
  disableAppLock as storageDisableAppLock,
  setBiometricEnabled as storageSetBiometricEnabled,
} from "../../services/appLockStorage";
import { getBiometryInfo } from "../../services/biometric";

export interface SecurityState {
  lockEnabled: boolean;
  hasPin: boolean;
  biometricEnabled: boolean;
  // Device capability (independent of the user's preference).
  biometryAvailable: boolean;
  biometryLabel: string;
  // Whether the lock screen is currently blocking the app.
  isLocked: boolean;
  loaded: boolean;
}

const initialState: SecurityState = {
  lockEnabled: false,
  hasPin: false,
  biometricEnabled: false,
  biometryAvailable: false,
  biometryLabel: "Biometrics",
  isLocked: false,
  loaded: false,
};

// Load persisted lock config + device biometry capability, and lock the app
// up-front if a lock is configured.
export const initSecurity = createAsyncThunk("security/init", async () => {
  const [lock, biometry] = await Promise.all([loadAppLockState(), getBiometryInfo()]);
  return { lock, biometry };
});

export const refreshSecurity = createAsyncThunk("security/refresh", async () => {
  const [lock, biometry] = await Promise.all([loadAppLockState(), getBiometryInfo()]);
  return { lock, biometry };
});

export const toggleBiometric = createAsyncThunk(
  "security/toggleBiometric",
  async (enabled: boolean) => {
    await storageSetBiometricEnabled(enabled);
    return enabled;
  }
);

export const disableLock = createAsyncThunk("security/disableLock", async () => {
  await storageDisableAppLock();
});

const securitySlice = createSlice({
  name: "security",
  initialState,
  reducers: {
    lockApp(state) {
      if (state.lockEnabled && state.hasPin) {
        state.isLocked = true;
      }
    },
    unlockApp(state) {
      state.isLocked = false;
    },
    // Called after a successful PIN setup so the UI reflects it immediately.
    pinConfigured(state) {
      state.lockEnabled = true;
      state.hasPin = true;
    },
  },
  extraReducers: (builder) => {
    const applyLoad = (
      state: SecurityState,
      action: PayloadAction<{ lock: AppLockState; biometry: { available: boolean; label: string } }>
    ) => {
      const { lock, biometry } = action.payload;
      state.lockEnabled = lock.lockEnabled;
      state.hasPin = lock.hasPin;
      state.biometricEnabled = lock.biometricEnabled && biometry.available;
      state.biometryAvailable = biometry.available;
      state.biometryLabel = biometry.label;
      state.loaded = true;
    };
    builder
      .addCase(initSecurity.fulfilled, (state, action) => {
        applyLoad(state, action);
        // Gate the app immediately on startup if a lock is set.
        state.isLocked = state.lockEnabled && state.hasPin;
      })
      .addCase(refreshSecurity.fulfilled, applyLoad)
      .addCase(toggleBiometric.fulfilled, (state, action) => {
        state.biometricEnabled = action.payload;
      })
      .addCase(disableLock.fulfilled, (state) => {
        state.lockEnabled = false;
        state.hasPin = false;
        state.biometricEnabled = false;
        state.isLocked = false;
      });
  },
});

export const { lockApp, unlockApp, pinConfigured } = securitySlice.actions;
export const securitySelector = (state: RootState) => state.securityReducer;
export default securitySlice.reducer;
