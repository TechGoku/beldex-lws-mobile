import React, { useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import "./styles.scss";
import OutboundIcon from "@mui/icons-material/Outbound";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTheme } from "@emotion/react";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
const beldex_amount_format_utils = require("@bdxi/beldex-money-format");

export default function TransactionDetails(props: any) {
  const theme: any = useTheme();
  const { transactionDetails, setTransactionDetails } = props;
  const toastMsgRef = useRef<ToastMsgRef>(null);

  let amount;
  let status;
  if (transactionDetails[0].hasOwnProperty('isJustSentTransaction')) {
    amount = beldex_amount_format_utils.formatMoney(
      transactionDetails[0].total_sent
    );
    status = 'Transaction in pool';
  } else {
    amount = beldex_amount_format_utils.formatMoney(
      transactionDetails[0].amount
    );
    status = transactionDetails[0].isConfirmed
      ? transactionDetails[0].approx_float_amount < 0
        ? "Sent"
        : "Received"
      : "Pending";
  }
  const dateString = (dateVal: any) => {
    const date = new Date(dateVal);
    return date
      .toLocaleDateString("en-US" /* for now */, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      })
      ;
  };
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // await new Wallet().Login();
    handleShowToastMsg();
  };

  const decimalValidation = (amount: string) => {
    // const actualAmount: any = beldex_amount_format_utils.formatMoney(amount);
    return Number(amount.replace("-", "")).toFixed(4);
  }

  const paymentIdZeroValidation = (payment_id: any) => {
    let index = 0;
    let zeroCount = 0;
    if (payment_id) {
      while (index < (payment_id.length).toString()) {
        if (payment_id.slice(index, index + 1) == "0") {
          zeroCount = zeroCount + 1;
        }
        index++;
      }
      if (zeroCount == 16) {
        return '';
      }
      return payment_id;
    }
  }

  const handleShowToastMsg = () => {
    if (toastMsgRef.current) {
      toastMsgRef.current.showAlert("Copied ", "success");
    }
  };
  return (
    <Box
      className="transactionDetails"
      
      // sx={{background:(theme) => theme.palette.success.main}}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="row" alignItems="center">
          <OutboundIcon
            sx={{
              transform: "rotate(225deg)",
              fontSize: "2rem",
              cursor: "pointer",
              "&:hover": { opacity: 0.8 },
            }}
            onClick={() => setTransactionDetails([])}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>
            Details
          </Typography>
        </Box>
        <Typography
          sx={{
            fontWeight: 600,
            // color: status === "Received" ? "#20D030" : "#FC2727",
            color: transactionDetails[0].approx_float_amount < 0 ? "#FC2727" : "#20D030",
            fontSize: "1.2rem",
          }}
        >
          {/* {transactionDetails[0].total_received/1e9} BDX */}
          {decimalValidation(amount)} BDX
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            color: (theme) => theme.palette.secondary.light,
          }}
        >
          {status}
        </Typography>
      </Box>

      <Box pl={1}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt={4}
        >
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "1.1rem",
            }}
          >
            Date
          </Typography>

          <Typography sx={{ fontSize: "1rem", fontWeight: 400 }}>
            {dateString(transactionDetails[0].timestamp)}
          </Typography>
        </Box>
        <Box mt={3} sx={{ height: "0.5px", backgroundColor: "#8787A8" }}></Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "1.1rem",
            }}
          >
            Total
          </Typography>

          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              // color: status === "Sent" ? "#FC2727" :status==='Pending'?"#FC2727": "#20D030",
              // color: status === "Received" ? "#20D030" : "#FC2727",
              color: transactionDetails[0].approx_float_amount < 0 ? "#FC2727" : "#20D030",
            }}
          >
            {/* {transactionDetails[0].total_received/1e9} BDX */}
            {decimalValidation(amount)} BDX
          </Typography>
        </Box>
        <Box mt={3} sx={{ height: "0.5px", backgroundColor: "#8787A8" }}></Box>

        {paymentIdZeroValidation(transactionDetails[0].payment_id) && <Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mt={3}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "1.1rem",
                }}
              >
                Payment ID
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: "14px",
                  color: "#7D7D9C",
                }}
              >
                {paymentIdZeroValidation(transactionDetails[0].payment_id)}
              </Typography>
            </Box>
            <IconButton onClick={() => copyText(transactionDetails[0].payment_id)} disabled={!transactionDetails[0].payment_id} >
              <ContentCopyIcon
                sx={{ fontSize: "1.4rem", fill: transactionDetails[0].payment_id ? "#20D030" : "#8787A8" }}
              ></ContentCopyIcon>
            </IconButton>
          </Box>
          <Box mt={3} sx={{ height: "0.5px", backgroundColor: "#8787A8" }}></Box>
        </Box>}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: "1.1rem",
              }}
            >
              Transaction ID
            </Typography>
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: "14px",
                color: (theme) => theme.palette.secondary.dark,
                width: "70%",
                wordBreak: "break-word",
              }}
            >
              {transactionDetails[0].hash}
            </Typography>
          </Box>
          <IconButton onClick={() => copyText(transactionDetails[0].hash)}>
            <ContentCopyIcon
              sx={{ fontSize: "1.4rem", fill: "#20D030", cursor: "pointer" }}
            ></ContentCopyIcon>
          </IconButton>
        </Box>
        <Box mt={3} sx={{ height: "0.5px", backgroundColor: "#8787A8" }}></Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
        >
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: "1.1rem",
            }}
          >
            Ring size
          </Typography>

          <Typography
            sx={{ fontSize: "1rem", fontWeight: 400, padding: "0.5rem" }}
          >
            10
          </Typography>
        </Box>
        {/* <Box mt={3} mb={2} sx={{ height: "0.5px" }}></Box> */}
      </Box>
      <ToastMsg ref={toastMsgRef} />
    </Box>
  );
}
