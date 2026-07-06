import { configureStore } from "@reduxjs/toolkit";
import seedDetailReducer from './features/seedDetailSlice';
import addressBookReducer from './features/addressBookSlice';
import securityReducer from './features/securitySlice';
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
    // addressBookReducer and securityReducer are backed by
    // @capacitor/preferences (native local storage), not redux-persist -
    // keep them out to avoid two copies / stale lock state.
    blacklist: ['addressBookReducer', 'securityReducer']
}

const reducer = combineReducers({
    seedDetailReducer,
    addressBookReducer,
    securityReducer
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
