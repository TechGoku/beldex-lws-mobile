import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme, SvgIcon } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Preferences } from "@capacitor/preferences";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import { copyToClipboard } from "../../../services/clipboard";

import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { useSelector } from 'react-redux';
import { setBalance, setSyncState, setConnectionError } from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";
import { getBdxPriceUsdt } from "../../../services/price";
import { rf } from "../../../utils/responsiveFont";

// Same tier as the theme preference: a UI flag, not key material.
const HIDE_BALANCE_KEY = "beldex_hide_balance";
// Whether the Unlocked/Locked breakdown panel is shown (user-toggleable).
const SHOW_BREAKDOWN_KEY = "beldex_show_breakdown";
const JSBigInt = require('@bdxi/beldex-bigint').BigInteger;
const beldex_amount_format_utils = require('@bdxi/beldex-money-format')
const pollingPeriodTimeInterval_s = 15;

export default function Balance({ refreshSignal }: { refreshSignal?: number } = {}) {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext)
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  // const balance = useSelector((state: any) =>console.log('balance ::',state.seedDetailReducer) );

  const [lockedBalance, setLockedBalance] = React.useState<any>(() => '');
  const [totalBalance, setTotalBalance] = React.useState<any>(() => '');
  const [unlockedBalance, setUnlockedBalance] = React.useState<any>(() => '');
  const [totalSent, setTotalSent] = React.useState<any>(() => '');
  const [totalReceived, setTotalReceived] = React.useState<any>(() => '');
  // Extension dashboard extras: fiat estimate, hideable balance. (Chain sync
  // progress is dispatched to Redux and rendered in the app Header.)
  const [price, setPrice] = React.useState<number | null>(null);
  const [hideBalance, setHideBalance] = React.useState(false);
  // Unlocked/Locked breakdown panel is shown by default; user can hide it.
  const [showBreakdown, setShowBreakdown] = React.useState(true);

  useEffect(() => {
    (async () => {
      const { value } = await Preferences.get({ key: HIDE_BALANCE_KEY });
      if (value === "1") setHideBalance(true);
      const { value: bd } = await Preferences.get({ key: SHOW_BREAKDOWN_KEY });
      if (bd === "0") setShowBreakdown(false);
    })();
  }, []);

  const toggleHideBalance = () => {
    setHideBalance((prev) => {
      Preferences.set({ key: HIDE_BALANCE_KEY, value: prev ? "0" : "1" });
      return !prev;
    });
  };

  const toggleBreakdown = () => {
    setShowBreakdown((prev) => {
      Preferences.set({ key: SHOW_BREAKDOWN_KEY, value: prev ? "0" : "1" });
      return !prev;
    });
  };

  const mask = (v: string) => (hideBalance ? "••••••" : v);

  const toastMsgRef = useRef<ToastMsgRef>(null);

  const getWalletDetails = async () => {
    try {
      if (coreBridgeInstance.hostedMoneroAPIClient) {
        coreBridgeInstance.hostedMoneroAPIClient.AddressInfo_returningRequestHandle(
          walletDetails.address_string,
          walletDetails.sec_viewKey_string,
          walletDetails.pub_spendKey_string,
          walletDetails.sec_spendKey_string
          , function (
            err: any,
            total_received: any,
            locked_balance: any,
            total_sent: any,
            spent_outputs: any,
            account_scanned_tx_height: any,
            account_scanned_block_height: any,
            account_scan_start_height: any,
            transaction_height: any,
            blockchain_height: any,
            ratesBySymbol: any) {
            if (err) { // already logged
              console.log("err:", err);
              // Surface the failure (timeout / unreachable / blocked endpoint)
              // in the header instead of silently stalling on stale data.
              dispatch(setConnectionError(true));
              return;
            }
            // A good response clears any prior connection-trouble banner.
            dispatch(setConnectionError(false));
            setLockedBalance(locked_balance);
            setTotalSent(total_sent);
            setTotalReceived(total_received);
            dispatch(setSyncState({
              scannedHeight: Number(account_scanned_block_height) || 0,
              chainHeight: Number(blockchain_height) || 0,
            }));
            calculateBalances(total_sent, total_received, locked_balance)
          });
      }
      getBdxPriceUsdt().then((p) => p !== null && setPrice(p)); // 60s-cached; fire-and-forget

      const Balance_JSBigInt = (totalsent: any, totalReceived: any) => {
        let total_received = totalReceived
        let total_sent = totalsent
        if (typeof total_received === 'undefined') {
          total_received = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
        }
        if (typeof total_sent === 'undefined') {
          total_sent = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
        }
        const balance_JSBigInt = total_received.subtract(total_sent)
        if (balance_JSBigInt.compare(0) < 0) {
          return new JSBigInt(0)
        }
        return balance_JSBigInt
      }

      const calculateBalances = (total_sent: any, total_received: any, locked_balance: any) => {
        let totalBalanceJSBigInt = Balance_JSBigInt(total_sent, total_received);
        let lockedBalanceJSBigInt = typeof locked_balance === 'undefined' ? new JSBigInt(0) : new JSBigInt(locked_balance);
        let unlockedBalanceJSBigInt = totalBalanceJSBigInt.subtract(lockedBalanceJSBigInt);
        if (unlockedBalanceJSBigInt.compare(0) < 0) {
          unlockedBalanceJSBigInt = new JSBigInt(0);
        }
        const totalBalanceFormatted = beldex_amount_format_utils.formatMoney(totalBalanceJSBigInt);
        const unlockedBalanceFormatted = beldex_amount_format_utils.formatMoney(unlockedBalanceJSBigInt);
        setTotalBalance(totalBalanceFormatted);
        setUnlockedBalance(unlockedBalanceFormatted);
        dispatch(setBalance(unlockedBalanceFormatted));
      }

    } catch (err) {
      console.log("errr:", err)
    }

  }

  useEffect(() => {
    getWalletDetails();
    const intervalTimeout = setInterval(function () {
      getWalletDetails();
    }, pollingPeriodTimeInterval_s * 1000 /* ms */)
    return () => {
      clearInterval(intervalTimeout)
    }
  }, []);

  // Pull-to-refresh on the dashboard bumps this counter.
  useEffect(() => {
    if (refreshSignal) getWalletDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  return (
    <Box className="balanceWrapper" sx={{
      background: (theme) => theme.palette.background.paper,
      borderRadius: '0px',
      // Tighter on small phones so the card's inner content keeps its width
      // (the sync line no longer wraps at ~320px) and the dashboard reads less
      // boxed-in; full padding again from the sm breakpoint up.
      padding: { xs: '18px', sm: '24px' },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SvgIcon
            height="14"
            viewBox="0 0 22.706 22.706"
            sx={{ width: '16px', height: '16px', fill: (theme) => theme.palette.text.secondary }}
          >
            <path d="M20.566,5.676H4.032a2.128,2.128,0,0,1-2.018-.957L19.867,2.838v-.7A2.139,2.139,0,0,0,17.728,0L2.14,2.9C.843,3.134,0,3.858,0,5.037V20.566a2.139,2.139,0,0,0,2.14,2.14H20.566a2.139,2.139,0,0,0,2.14-2.14V7.816A2.139,2.139,0,0,0,20.566,5.676ZM18.921,16.083a1.892,1.892,0,1,1,1.892-1.892A1.891,1.891,0,0,1,18.921,16.083Z" />
          </SvgIcon>
          <Typography sx={{
            fontWeight: 400,
            color: (theme) => theme.palette.text.secondary,
            fontSize: rf(18),
            paddingLeft: '10px'
          }}>Balance</Typography>
        </Box>
        {/* Toggle the Unlocked/Locked breakdown panel on/off (persisted). */}
        <Box
          component="button"
          onClick={toggleBreakdown}
          aria-expanded={showBreakdown}
          aria-label={showBreakdown ? "Hide balance breakdown" : "Show balance breakdown"}
          sx={{
            cursor: 'pointer',
            background: 'transparent',
            fontFamily: "'Space Mono', monospace",
            fontSize: rf(11),
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            border: '1px solid',
            borderColor: (theme) => theme.palette.divider,
            color: (theme) => theme.palette.text.secondary,
            whiteSpace: 'nowrap',
          }}
        >
          {showBreakdown ? 'Hide' : 'Details'}
          <Box component="span" sx={{ fontSize: rf(9) }}>{showBreakdown ? '▲' : '▼'}</Box>
        </Box>
      </Box>

      <Box sx={{
        display: 'flex', alignItems: 'baseline', marginTop: '12px',
        flexWrap: 'wrap', maxWidth: '100%'
      }}>
        <Typography sx={{
          fontWeight: 600,
          fontSize: { xs: '1.3rem', sm: '1.5rem' },
          color: (theme) => theme.palette.text.primary,
          lineHeight: 1.2,
          wordBreak: 'break-all',
          minWidth: 0
        }}>
          {mask(totalBalance || '0')}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            color: (theme) => theme.palette.primary.main,
            marginLeft: '12px',
            lineHeight: 1.2
          }}
        >
          BDX
        </Typography>
        <IconButton
          size="small"
          onClick={toggleHideBalance}
          title={hideBalance ? 'Show balance' : 'Hide balance'}
          sx={{ marginLeft: '6px', color: (theme) => theme.palette.text.secondary }}
        >
          {hideBalance
            ? <VisibilityOffOutlinedIcon sx={{ fontSize: '1.1rem' }} />
            : <VisibilityOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
        </IconButton>
      </Box>

      {/* Fiat estimate via CoinGecko (60s-cached) */}
      {price !== null && (
        <Typography sx={{
          marginBottom: '8px',
          fontSize: rf(12),
          color: (theme) => theme.palette.text.secondary,
        }}>
          ≈{" "}
          <Typography component="span" sx={{ fontSize: rf(12), fontWeight: 700, color: (theme) => theme.palette.text.primary }}>
            {mask(((parseFloat(totalBalance) || 0) * price).toFixed(2))} USDT
          </Typography>
          {" "}· 1 BDX = {price.toFixed(4)} USDT
        </Typography>
      )}
      {showBreakdown && (<>
      <Box sx={{ marginBottom: '16px' }} />

      <Box sx={{
        backgroundColor: (theme) => theme.palette.background.default,
        borderRadius: '0px',
        padding: { xs: '14px 16px', sm: '16px 20px' },
        display: 'flex',
        // Stack the two balance rows on phones so long amounts never collide;
        // side by side again from md up.
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        gap: { xs: 1.5, md: 6 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Unlocked Balance */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box sx={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3ec745' }} />
          <Typography sx={{
            color: (theme) => theme.palette.text.secondary,
            fontSize: rf(14),
            fontWeight: 'bold',
            flexShrink: 0,
          }}>
            Unlocked
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.text.primary,
            fontSize: rf(14),
            fontWeight: 600,
            ml: 'auto',
            minWidth: 0,
            wordBreak: 'break-all',
            textAlign: 'right',
          }}>
            {mask(unlockedBalance || '0')}
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.primary.main,
            fontSize: rf(14),
            fontWeight: 600,
            flexShrink: 0,
          }}>
            BDX
          </Typography>
        </Box>

        {/* Locked Balance */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box sx={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1574ad' }} />
          <Typography sx={{
            color: (theme) => theme.palette.text.secondary,
            fontSize: rf(14),
            fontWeight: 'bold',
            flexShrink: 0,
          }}>
            Locked
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.text.primary,
            fontSize: rf(14),
            fontWeight: 600,
            ml: 'auto',
            minWidth: 0,
            wordBreak: 'break-all',
            textAlign: 'right',
          }}>
            {mask(lockedBalance ? beldex_amount_format_utils.formatMoney(new JSBigInt(lockedBalance)) : '0')}
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.primary.main,
            fontSize: rf(14),
            fontWeight: 600,
            flexShrink: 0,
          }}>
            BDX
          </Typography>
        </Box>
      </Box>
      </>)}

      {/* {isMobileMode && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            color="info"
            variant="contained"
            sx={{ borderRadius: "0px" }}
          >
            <SendIcon
              sx={{
                color: "white",
                transform: "rotate(-48deg)",
                fontSize: rf(18),
              }}
            />
            Send
          </Button>
          <Button>
            <PowerSettingsNewIcon sx={{ fill: "#EBEBEB" }} />
          </Button>
        </Box>
      )} */}
    </Box>
  );
}
