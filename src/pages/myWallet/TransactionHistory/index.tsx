import React, { useState, useEffect } from "react";
import "./styles.scss";
import { Box, Button, SvgIcon, Typography, useMediaQuery } from "@mui/material";
const extend = require("util")._extend;
const monero_txParsing_utils = require("@bdxi/beldex-tx-parsing-utils");
import TransactionList from "../TransactionList";
import CustomPagination from "../../../components/CustomPagination";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { useSelector } from "react-redux";
import TransactionDetails from "./../TransactionDetails";
import { useTheme } from "@emotion/react";
import { setTransactionhistory } from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";
const JSBigInt = require('@bdxi/beldex-bigint').BigInteger;
const beldex_amount_format_utils = require('@bdxi/beldex-money-format')
const pollingPeriodTimeInterval_s = 15;

export default function TransactionHistory() {
  const dispatch = useAppDispatch();
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const [page, setPage] = useState(1);
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);
  const [transactionHistory, setTransactionHistory] = React.useState<any>(
    () => [{ status: 'initiat' }]
  );
  const [transactionDetails, setTransactionDetails] = React.useState<any>(
    () => []
  );
  const [pagenatedTxnHistory, setPagenatedTxnHistory] = React.useState<any>(
    () => []
  );
  const New_StateCachedTransactions = (
    transactions: any,
    account_scanned_height: any,
    blockchain_height: number
  ) => {

    // this function is preferred for public access
    // as it caches the derivations of the above accessors.
    // these things could maybe be derived on reception from API instead of on each access

    const transaction = transactions || [];
    const stateCachedTransactions = []; // to finalize
    const transactions_length = transaction.length;
    for (let i = 0; i < transactions_length; i++) {
      // console.log("New_StateCachedTransactions ::",transaction[i])
      stateCachedTransactions.push(
        New_StateCachedTransaction(
          transaction[i],
          account_scanned_height,
          blockchain_height
        )
      );
    }
    // console.log("New_StateCachedTransactions 2::",stateCachedTransactions)

    //
    return stateCachedTransactions;
  }
  const New_StateCachedTransaction = (
    transaction: any,
    account_scanned_height: any,
    blockchain_height: number
  ) => {
    const shallowCopyOf_transaction = extend({}, transaction);
    shallowCopyOf_transaction.isConfirmed = IsTransactionConfirmed(
      transaction,
      account_scanned_height
    );
    shallowCopyOf_transaction.isUnlocked = IsTransactionUnlocked(
      transaction,
      blockchain_height
    );
    shallowCopyOf_transaction.lockedReason = TransactionLockedReason(
      transaction,
      blockchain_height
    );
    if (
      shallowCopyOf_transaction.isConfirmed &&
      shallowCopyOf_transaction.isFailed
    ) {
      // throw "Unexpected isFailed && isConfirmed"
    }
    //
    return shallowCopyOf_transaction;
  }

  const IsTransactionConfirmed = (tx: any, account_scanned_height: any) => {
    const blockchain_height = account_scanned_height;
    return monero_txParsing_utils.IsTransactionConfirmed(tx, blockchain_height);
  }

  const IsTransactionUnlocked = (tx: any, blockchain_height: number) => {
    return monero_txParsing_utils.IsTransactionUnlocked(tx, blockchain_height);
  }

  const TransactionLockedReason = (tx: any, blockchain_height: number) => {
    return monero_txParsing_utils.TransactionLockedReason(
      tx,
      blockchain_height
    );
  }

  const toSaveCsvFile = (contentString: any, fileName: any, ext: any, fn: any, fileFormat: any) => {
    const uriContent = fileFormat + contentString;
    const encodedUri = encodeURI(uriContent);
    const link = document.createElement('a');
    link.style.visibility = 'hidden';
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}.${ext}`);
    document.body.appendChild(link);
    link.click();
  }

  const exportTransactionsCSV = () => {
    if (transactionHistory.length === 0) {
      console.log("Transactions not yet!!!");
    }
    const headers = ['Date', 'Amount', 'Transaction-status', 'Transaction_id', 'Payment_id'];
    let csvContent = '';
    csvContent += headers.join(',') + '\r\n';
    transactionHistory.forEach(
      function (tx: any, i: any) {
        const received_JSBigInt = tx.total_received ? (typeof tx.total_received === 'string' ? new JSBigInt(tx.total_received) : tx.total_received) : new JSBigInt('0');
        const sent_JSBigInt = tx.total_sent ? (typeof tx.total_sent === 'string' ? new JSBigInt(tx.total_sent) : tx.total_sent) : new JSBigInt('0');
        const amountString = beldex_amount_format_utils.formatMoney(received_JSBigInt.subtract(sent_JSBigInt));
        const payment_id = `${tx.payment_id || ''}`
        const status = `${tx.isFailed ? 'REJECTED' : (tx.isConfirmed !== true || tx.isUnlocked !== true ? 'PENDING' : 'CONFIRMED')}`;
        const columns = [tx.timestamp.toISOString(), amountString, status, tx.hash, payment_id];
        csvContent += columns.join(',') + '\r\n';
      }
    )
    toSaveCsvFile(
      csvContent,
      'Beldex_wallet_transaction_history',
      'csv',
      function (err: any) {
        if (err) {
          const errString = err.message ? err.message : err.toString() ? err.toString() : '' + err;
          console.log("error:", errString);
        }
      },
      'data:text/csv;charset=utf-8,'
    )
  }


  const getWalletDetails = async () => {
    try {
      if (coreBridgeInstance.hostedMoneroAPIClient) {
        const requestHandle =
          coreBridgeInstance.hostedMoneroAPIClient.AddressTransactions_returningRequestHandle(
            walletDetails.address_string,
            walletDetails.sec_viewKey_string,
            walletDetails.pub_spendKey_string,
            walletDetails.sec_spendKey_string,
            function (
              err: any,
              account_scanned_height: any,
              account_scanned_block_height: any,
              account_scan_start_height: any,
              transaction_height: any,
              blockchain_height: any,
              transactions: any
            ) {
              if (err) { // already logged
                console.log("err:", err);
                return
              }
              let customizeTxn = New_StateCachedTransactions(
                transactions,
                account_scanned_height,
                blockchain_height
              );
              let newTransaction = walletDetails.transactionPoolHistory;
              if ((newTransaction != undefined && newTransaction != null) && (Object.keys(newTransaction).length !== 0 || newTransaction.length < 0)) {
                if (newTransaction.hash !== customizeTxn[0].hash) {
                  customizeTxn.unshift(walletDetails.transactionPoolHistory);
                }
              }
              setTransactionHistory(customizeTxn);
              isMobileMode && calcPageCount(customizeTxn);
            }
          );
      }
    } catch (err) {
      console.log("errr:", err);
    }
  };
  const calcPageCount = (customizeTxn: any) => {
    const len = customizeTxn?.length;
    const pagenatedArray = [];

    for (let start = 0; start < len; start += 5) {
      const slicedArray = customizeTxn.slice(start, start + 5);
      pagenatedArray.push(slicedArray);
    }
    // console.log('costomized::',pagenatedArray)
    setPagenatedTxnHistory(pagenatedArray);
  };

  useEffect(() => {
    getWalletDetails();
    const intervalTimeout = setInterval(function () {
      getWalletDetails();
    }, pollingPeriodTimeInterval_s * 1000 /* ms */);
    return () => {
      clearInterval(intervalTimeout);
    };
  }, []);

  return (
    <Box
      sx={{
        background: (theme) => theme.palette.success.light,
        padding: "20px",
        borderRadius: "20px",
        // height: isMobileMode ? "592px" : '545px',
        // height:'67%'
        flex: isMobileMode ? "unset" : 1,
        minHeight: 0,
        height: isMobileMode ? "unset" : "auto",
      }}
      mt={2}
    >


      {transactionDetails.length > 0 ? (
        <TransactionDetails
          transactionDetails={transactionDetails}
          setTransactionDetails={(val: any) => setTransactionDetails(val)}
        />
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "18px",
                color: (theme) => theme.palette.text.primary,
              }}
            >
              Transactions
            </Typography>
            {transactionHistory.length !== 0 && <Button>
              <SvgIcon
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  id="icons8-csv"
                  d="M2.24445 0.582031C1.24557 0.582031 0.422852 1.36926 0.422852 2.32505V7.55409H1.63725V2.32505C1.63725 1.99798 1.90264 1.74404 2.24445 1.74404H7.70925V5.23007H11.3524V7.55409H12.5668V4.40849L8.56787 0.582031H2.24445ZM8.92365 2.56562L10.4938 4.06806H8.92365V2.56562ZM2.24445 8.7161C1.24557 8.7161 0.422852 9.50333 0.422852 10.4591V11.6211V12.7831C0.422852 13.7389 1.24557 14.5262 2.24445 14.5262C3.24333 14.5262 4.06605 13.7389 4.06605 12.7831H2.85165C2.85165 13.1102 2.58627 13.3641 2.24445 13.3641C1.90264 13.3641 1.63725 13.1102 1.63725 12.7831V11.6211V10.4591C1.63725 10.132 1.90264 9.87811 2.24445 9.87811C2.58627 9.87811 2.85165 10.132 2.85165 10.4591H4.06605C4.06605 9.50333 3.24333 8.7161 2.24445 8.7161ZM7.10205 8.7161C6.38555 8.7161 5.96647 8.99319 5.74059 9.22675C5.24148 9.74152 5.27918 10.4266 5.28282 10.4591C5.28282 11.398 6.17478 11.8215 6.82691 12.1318C7.34425 12.377 7.70925 12.5668 7.70925 12.7922C7.70925 12.7945 7.69756 13.0757 7.53848 13.2302C7.50326 13.2639 7.40201 13.3641 7.10205 13.3641H5.39193C5.46479 13.5861 5.58124 13.8323 5.80226 14.0473C6.02693 14.2657 6.43534 14.5262 7.10205 14.5262C7.76875 14.5262 8.17833 14.2646 8.40421 14.045C8.92154 13.5419 8.92249 12.8505 8.92128 12.7831C8.92128 11.8303 8.02232 11.4026 7.36533 11.0901C6.85649 10.8484 6.49844 10.661 6.49722 10.4228C6.49722 10.4205 6.48669 10.1595 6.63242 10.0143C6.72229 9.92481 6.88103 9.87811 7.10205 9.87811H8.81929C8.61527 9.29362 8.093 8.7161 7.10205 8.7161ZM10.1381 8.7161L11.3524 14.5262H12.5668L13.7812 8.7161H12.5668L11.9596 12.0569L11.3524 8.7161H10.1381Z"
                  fill="#20D030"
                  stroke="#20D030"
                  strokeWidth="0.5"
                />
              </SvgIcon>
              <Typography
                ml={1}
                sx={{
                  fontWeight: 600,
                  color: (theme) => theme.palette.text.primary,
                }}
                onClick={() => exportTransactionsCSV()}
              >
                Export CSV
              </Typography>
            </Button>}
          </Box>
          <Box mt={2}
            sx={{
              height: isMobileMode ? '75%' : "87%",
              overflowY: "auto",
              padding: "0 10px",
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: (theme: any) => theme.palette.mode === 'dark' ? '#585870' : '#D1D1D1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
            }}
          >
            <TransactionList
              transactions={
                isMobileMode && pagenatedTxnHistory.length > 0
                  ? pagenatedTxnHistory[page - 1]
                  : transactionHistory
              }
              setTransactionDetails={(val: any) => setTransactionDetails(val)}
            />
          </Box>
          {isMobileMode && transactionHistory.length > 0 && (
            <CustomPagination
              pagenatedTxnHistory={pagenatedTxnHistory}
              page={page}
              setPage={(val: any) => setPage(val)}
            />
          )}
        </>
      )}
    </Box>
  );
}
