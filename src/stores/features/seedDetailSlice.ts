import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface SeedDictionary {
    [key: string]: string;
}

export interface seedDetailState {
    loading?: boolean;
    sec_seed_string: string;
    mnemonic_string: string;
    mnemonic_language: string;
    address_string: string;
    sec_viewKey_string: string;
    pub_viewKey_string: string;
    sec_spendKey_string: string;
    pub_spendKey_string: string;
    isWalletCreated?: boolean;
    unlocked_balance?: number;
    timer?: number;
    isLogin?: boolean,
    transactionPoolHistory?: Array<any>;

}

export const initialState: seedDetailState = {
    sec_seed_string: '',
    mnemonic_string: '',
    address_string: '',
    mnemonic_language: '',
    sec_viewKey_string: '',
    pub_viewKey_string: '',
    sec_spendKey_string: '',
    pub_spendKey_string: '',
    isWalletCreated: false,
    loading: false,
    unlocked_balance: 0,
    isLogin: false,
    timer: 120,
    transactionPoolHistory: []
}

const seedDetailSlice = createSlice({
    name: 'seedDetails',
    initialState,
    reducers: {
        toggleLoading(state: any, action: any) {
            state.loading = action.payload
        },
        setSeedDetails(state, action) {
            state.address_string = action.payload.address_string;
            state.mnemonic_language = action.payload.mnemonic_language;
            state.mnemonic_string = action.payload.mnemonic_string;
            state.pub_spendKey_string = action.payload.pub_spendKey_string;
            state.pub_viewKey_string = action.payload.pub_viewKey_string;
            state.sec_seed_string = action.payload.sec_seed_string;
            state.sec_spendKey_string = action.payload.sec_spendKey_string;
            state.sec_viewKey_string = action.payload.sec_viewKey_string;
            state.isLogin = action.payload.isLogin;
        },
        setUserLogout(){
         return initialState   
        },
        setBalance(state, action) {
            state.unlocked_balance = action.payload
        },
        setIdleTimer(state, action) {
            state.timer = action.payload
        },
        setTransactionhistory(state, action) {
            state.transactionPoolHistory = action.payload;
        }
    }
})

export const { setSeedDetails, toggleLoading, setBalance, setIdleTimer, setTransactionhistory ,setUserLogout} = seedDetailSlice.actions;
export const seedDetailSelector = (state: RootState) => state.seedDetailReducer;

export default seedDetailSlice.reducer;