import React, { useEffect } from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme, SvgIcon } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { useSelector } from 'react-redux';
import { setBalance } from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";
const JSBigInt = require('@bdxi/beldex-bigint').BigInteger;
const beldex_amount_format_utils = require('@bdxi/beldex-money-format')
const pollingPeriodTimeInterval_s = 15;

export default function Balance() {
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
              return;
            }
            setLockedBalance(locked_balance);
            setTotalSent(total_sent);
            setTotalReceived(total_received);
            calculateBalances(total_sent, total_received, locked_balance)
          });
      }

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

  return (
    <Box className="balanceWrapper" sx={{
      background: (theme) => theme.palette.mode === 'dark' ? '#2B2B3C' : '#f5f5f5',
      borderRadius: '25px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      boxSizing: 'border-box'
    }}>
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
          fontSize: '18px',
          paddingLeft: '10px',
          fontFamily: 'Poppins'
        }}>Balance</Typography>
      </Box>

      <Box sx={{
        display: 'flex', alignItems: 'baseline', marginTop: '12px', marginBottom: '24px'
      }}>
        <Typography sx={{
          fontWeight: 600,
          fontSize: '1.5rem',
          color: (theme) => theme.palette.text.primary,
          lineHeight: 1
        }}>
          {totalBalance}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            color: (theme) => theme.palette.primary.main,
            marginLeft: '12px',
            lineHeight: 1
          }}
        >
          BDX
        </Typography>
      </Box>

      <Box sx={{
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1c1c26' : '#e0e0e0',
        borderRadius: '20px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2, md: 6 },
        flexWrap: 'wrap',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        fontSize:'bold'

      }}>
        {/* Unlocked Balance */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#00C708' }} />
          <Typography sx={{
            color: (theme) => theme.palette.text.secondary,
            fontSize: '15px',
            whiteSpace: 'nowrap',
            fontWeight: 'bold'
          }}>
            Unlocked Balance
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.text.primary,
            fontSize: '15px',
            fontWeight: 600,
            ml: 0.5
          }}>
            {unlockedBalance}
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.primary.main,
            fontSize: '15px',
            fontWeight: 600
          }}>
            BDX
          </Typography>
        </Box>

        {/* Locked Balance */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2879FB' }} />
          <Typography sx={{
            color: (theme) => theme.palette.text.secondary,
            fontSize: '15px',
            whiteSpace: 'nowrap',
            fontWeight: 'bold'
          }}>
            Locked Balance
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.text.primary,
            fontSize: '15px',
            fontWeight: 600,
            ml: 0.5
          }}>
            {lockedBalance ? beldex_amount_format_utils.formatMoney(new JSBigInt(lockedBalance)) : '0'}
          </Typography>
          <Typography sx={{
            color: (theme) => theme.palette.primary.main,
            fontSize: '15px',
            fontWeight: 600
          }}>
            BDX
          </Typography>
        </Box>
      </Box>
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
            sx={{ borderRadius: "5px" }}
          >
            <SendIcon
              sx={{
                color: "white",
                transform: "rotate(-48deg)",
                fontSize: 18,
              }}
            />
            Send
          </Button>
          <Button>
            <PowerSettingsNewIcon sx={{ fill: "#D1D1D3" }} />
          </Button>
        </Box>
      )} */}
    </Box>
  );
}
