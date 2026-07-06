import { useState } from "react";
import "./styles.scss";
import { Box, Button, SvgIcon, Typography } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import EmptyTransactions from "../../../icons/EmptyTransactionsDark";
import { useTheme } from "@emotion/react";
import loadingIcon from "../../../icons/loading.gif";

export default function TransactionList(props: any) {
  const transactions = props?.transactions?.length ? props?.transactions : [];
  const beldex_amount_format_utils = require("@bdxi/beldex-money-format");
  const theme: any = useTheme();

  const dateString = (dateVal: any) => {
    const date = new Date(dateVal);
    return date.toLocaleDateString("en-US" /* for now */, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const decimalValidation = (transaction: any) => {
    if (transaction.hasOwnProperty('isJustSentTransaction')) {
      const actualAmount: any = beldex_amount_format_utils.formatMoney(transaction.total_sent);
      return Number(actualAmount.replace("-", "")).toFixed(4);
    }
    const actualAmount: any = beldex_amount_format_utils.formatMoney(transaction.amount);
    return Number(actualAmount.replace("-", "")).toFixed(4);
  };

  const paymentIdZeroValidation = (payment_id: any) => {
    let index = 0;
    let zeroCount = 0;
    if (payment_id) {
      while (index < payment_id.length.toString()) {
        if (payment_id.slice(index, index + 1) == "0") {
          zeroCount = zeroCount + 1;
        }
        index++;
      }
      if (zeroCount == 16) {
        return "";
      }
      return payment_id;
    }
    return "";
  };

  return (
    <Box className="transactionList">
      {transactions[0]?.status === "initiat" ? (
        <div>
          {/* {true?<div> */}

          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              // padding: "20px",
              borderRadius: "5px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
              zIndex: (theme: any) => theme.zIndex.modal + 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <img src={loadingIcon} width={40} height={40} alt="Loading" />
            </Box>
          </Box>
        </div>
      ) : transactions.length ? (
        transactions.map((transaction: any, index: number) => (
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            pb={2}
            key={index}
            sx={{
              borderBottom: "0.5px solid #8787A8",
            }}
            onClick={() => props.setTransactionDetails([transaction])}
          >
            <Box>
              <Typography
                sx={{
                  color:
                    transaction.approx_float_amount < 0 ? "#FC2727" : "#20D030",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                {decimalValidation(transaction)} BDX
                {/* {transaction.total_received/1e9} BDX */}
              </Typography>
              <Typography sx={{ color: "#D1D1D3", fontSize: "0.8rem" }}>
                {paymentIdZeroValidation(transaction.payment_id)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Box mr={2}>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  {dateString(transaction.timestamp)}
                </Typography>
                <Typography
                  textAlign={"end"}
                  sx={{ color: "#8787A8", fontSize: "14px" }}
                >
                  {transaction.hasOwnProperty('isJustSentTransaction') ? "Transaction in pool" :
                    transaction.isConfirmed ? "Confirmed" : "Pending"}
                </Typography>
              </Box>
              <ArrowRightIcon sx={{ fill: "#8787A8", fontSize: "2rem" }} />
            </Box>
          </Box>
        ))
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyItems="center"
          width="100%"
          height="400px"
        >
          <Box
            display="flex"
            alignItems="center"
            alignContent="center"
            justifyContent="center"
            flexDirection="column"
            width="400px"
            height="300px"
            margin="auto"
            sx={{
              border: `${theme.palette.mode == "dark"
                ? "2px solid #454556"
                : "2px solid #D7D7D7"
                }`,
              borderRadius: "8px",
              backgroundColor: theme.palette.mode == "dark" ? '#2E2E3C' : '#F8F8F8'
            }}
          >
            <Box>
              <EmptyTransactions sx={{ width: "100px", height: "100px" }} />
            </Box>
            <Typography mt={0.8} sx={{ fontWeight: "600" }}>
              No Transactions yet!
            </Typography>
            <Typography mt={1} sx={{ color: "#82828D", fontSize: "12px" }}>
              After your first transaction,
            </Typography>
            <Typography sx={{ color: "#82828D", fontSize: "12px" }}>
              you will be able to view it here.,
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
