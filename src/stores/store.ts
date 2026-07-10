import { configureStore } from "@reduxjs/toolkit";
import seedDetailReducer from './features/seedDetailSlice';
import addressBookReducer from './features/addressBookSlice';
import securityReducer from './features/securitySlice';
import walletsReducer from './features/walletsSlice';
import storage from "redux-persist/lib/storage";
// import { persistReducer } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";

import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    // Nothing sensitive goes through redux-persist (WebView localStorage is
    // plaintext). seedDetailReducer holds the active wallet's private keys, so
    // it is NOT persisted here - it is restored on startup from the encrypted
    // walletStore instead. The others are backed by their own native stores.
    blacklist: ['seedDetailReducer', 'addressBookReducer', 'securityReducer', 'walletsReducer']
}

const reducer = combineReducers({
    seedDetailReducer,
    addressBookReducer,
    securityReducer,
    walletsReducer
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
    reducer: persistedReducer,
    // reducer: reducer,

    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
