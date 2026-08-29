import { useState } from "react";
import { rf } from "../../../utils/responsiveFont";
import "./styles.scss";
import { Box, IconButton, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EmptyTransactions from "../../../icons/EmptyTransactionsDark";
import { useTheme } from "@emotion/react";
import { useAppSelector } from "../../../stores/hooks";
import { tokensSelector } from "../../../stores/features/tokensSlice";
import { atomicToDisplay, groupDigits, shortenTokenId } from "../../../utils/tokenAmount";
import loadingIcon from "../../../icons/loading.gif";

export default function TransactionList(props: any) {
  const { chainInfo: tokenChainInfo } = useAppSelector(tokensSelector);
  const transactions = props?.transactions?.length ? props?.transactions : [];
  const beldex_amount_format_utils = require("@bdxi/beldex-money-format");
  const theme: any = useTheme();

  // Extension-style relative timestamps for the history rows.
  const timeAgo = (ts: any) => {
    if (!ts) return "";
    const s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  /* HF22: a transaction that moved a privacy token carries its amount in that
     token's own units, and its BDX figure is only the fee. Showing the BDX
     number for such a row reads as "0.0000" against a transfer that really
     moved 1,200 POP, so the token amount is shown instead, with its ticker. */
  const tokenLeg = (transaction: any) => {
    /* One transaction can move several tokens, so the server sends a leg per
       token. The row shows the largest by absolute value and says how many
       others there are; the detail view has the rest. Summing them would be
       meaningless — each is denominated in its own token. */
    const legs = Array.isArray(transaction?.token_legs) ? transaction.token_legs : [];
    const moved = legs
      .map((l: any) => {
        const net = BigInt(String(l.received || "0")) - BigInt(String(l.sent || "0"));
        const info = tokenChainInfo[l.token_id];
        return {
          net,
          magnitude: net < BigInt(0) ? -net : net,
          decimals: info ? info.decimalPoint : 0,
          ticker: info ? info.ticker : shortenTokenId(String(l.token_id), 6, 4),
        };
      })
      .filter((l: any) => l.magnitude !== BigInt(0));

    if (!moved.length) return null;
    moved.sort((a: any, b: any) => (a.magnitude === b.magnitude ? 0 : a.magnitude < b.magnitude ? 1 : -1));
    const top = moved[0];
    return {
      outgoing: top.net < BigInt(0),
      amount: atomicToDisplay(top.magnitude.toString(), top.decimals),
      ticker: top.ticker,
      extra: moved.length - 1,
    };
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
              borderRadius: "0px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
              zIndex: 1,
              // Never capture taps: even while the first load is in flight
              // (up to the request timeout on a blocked server) the header menu
              // and navigation must stay reachable.
              pointerEvents: "none",
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
        transactions.map((transaction: any, index: number) => {
          // Extension .tx row: bordered in/out arrow, hash + time-ago,
          // signed colored amount, ⓘ opens the details view.
          const token = tokenLeg(transaction);
          const outgoing = token
            ? token.outgoing
            : transaction.approx_float_amount < 0 ||
              transaction.hasOwnProperty("isJustSentTransaction");
          const pending =
            transaction.hasOwnProperty("isJustSentTransaction") ||
            !transaction.isConfirmed;
          const accent = outgoing ? "#ff5c5c" : "#3ec745";
          return (
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              key={index}
              sx={{
                padding: "9px 4px",
                borderBottom: `1px solid ${
                  theme.palette.mode === "dark" ? "#191919" : "#ececec"
                }`,
                cursor: "pointer",
                "&:last-child": { borderBottom: "none" },
              }}
              onClick={() => props.setTransactionDetails([transaction])}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  marginRight: "10px",
                  flex: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: rf(13),
                  border: `1px solid ${accent}`,
                  color: accent,
                }}
              >
                {outgoing ? "↑" : "↓"}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: rf(10),
                    color: theme.palette.text.secondary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={transaction.hash}
                >
                  {transaction.hash}
                </Typography>
                <Typography
                  sx={{
                    fontSize: rf(10),
                    color: pending ? "#f5a623" : theme.palette.text.secondary,
                  }}
                >
                  {pending ? "⏳ pending" : timeAgo(transaction.timestamp)}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: rf(13),
                  textAlign: "right",
                  flex: "none",
                  color: accent,
                  marginLeft: "8px",
                }}
              >
                {outgoing ? "−" : "+"}
                {token
                  ? `${groupDigits(token.amount)} ${token.ticker}${token.extra ? ` +${token.extra}` : ""}`
                  : decimalValidation(transaction)}
              </Typography>
              <IconButton
                size="small"
                title="Transaction details"
                sx={{
                  flex: "none",
                  marginLeft: "4px",
                  color: theme.palette.text.secondary,
                  padding: "2px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  props.setTransactionDetails([transaction]);
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: rf(16) }} />
              </IconButton>
            </Box>
          );
        })
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyItems="center"
          width="100%"
          sx={{ minHeight: { xs: 260, sm: 400 }, py: 3 }}
        >
          <Box
            display="flex"
            alignItems="center"
            alignContent="center"
            justifyContent="center"
            flexDirection="column"
            margin="auto"
            boxSizing="border-box"
            sx={{
              width: "100%",
              maxWidth: 360,
              minHeight: { xs: 220, sm: 300 },
              p: 3,
              border: `${theme.palette.mode == "dark"
                ? "2px solid #333333"
                : "2px solid #D7D7D7"
                }`,
              borderRadius: "0px",
              backgroundColor: theme.palette.mode == "dark" ? '#161616' : '#F8F8F8'
            }}
          >
            <Box>
              <EmptyTransactions sx={{ width: { xs: "72px", sm: "100px" }, height: { xs: "72px", sm: "100px" } }} />
            </Box>
            <Typography mt={0.8} sx={{ fontWeight: "600" }}>
              No Transactions yet!
            </Typography>
            <Typography mt={1} sx={{ color: "#777777", fontSize: rf(12) }}>
              After your first transaction,
            </Typography>
            <Typography sx={{ color: "#777777", fontSize: rf(12) }}>
              you will be able to view it here.,
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
