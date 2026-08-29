import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Typography, IconButton, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { rf } from "../../../utils/responsiveFont";
import {
  TokenChainStatus,
  fetchRegisteredTokens,
  forgetRegisteredToken,
  refreshTokens,
  tokensSelector,
} from "../../../stores/features/tokensSlice";
import { copyToClipboard } from "../../../services/clipboard";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { spendableBalance } from "../../../services/tokenApi";
import { atomicToDisplay, groupDigits, shortenTokenId } from "../../../utils/tokenAmount";

// HF22 private tokens the user registered from this wallet.
//
// A token id is derived from the descriptor plus a random salt, so it is not
// something the user chose and not something they can work out again later.
// The wallet is the only place it is written down. This screen is that record,
// and - where the server can answer - the confirmation that the registration
// actually reached the chain.

const STATUS_META: Record<
  TokenChainStatus,
  { label: string; color: string; icon: React.ReactNode; detail: string }
> = {
  confirmed: {
    label: "On chain",
    color: "#3ec745",
    icon: <CheckCircleIcon sx={{ fontSize: "1rem" }} />,
    detail: "The daemon returned this token's descriptor.",
  },
  pending: {
    label: "Pending",
    color: "#c7a13e",
    icon: <HourglassEmptyIcon sx={{ fontSize: "1rem" }} />,
    detail: "Broadcast from this wallet, waiting to be included in a block.",
  },
  missing: {
    label: "Not on chain",
    color: "#ff5c5c",
    icon: <ErrorOutlineIcon sx={{ fontSize: "1rem" }} />,
    detail: "The server has no such token. The registration was never mined.",
  },
  unknown: {
    label: "Unverified",
    color: "#8a8a8a",
    icon: <HelpOutlineIcon sx={{ fontSize: "1rem" }} />,
    detail: "This server cannot answer token queries, so nothing can be concluded.",
  },
};

export default function Tokens() {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const toastMsgRef = useRef<ToastMsgRef>(null);
  const coreBridge = React.useContext(CoreBridgeInstanceContext);

  const { tokens, loaded, status, chainInfo, balances, refreshing, lookupSupported, lookupError } =
    useAppSelector(tokensSelector);
  const walletDetails = useAppSelector((state: any) => state.seedDetailReducer);
  const walletAddress = walletDetails.address_string;

  const reload = React.useCallback(() => {
    if (walletAddress && walletDetails.sec_viewKey_string) {
      dispatch(
        refreshTokens({
          address: walletAddress,
          viewKey: walletDetails.sec_viewKey_string,
          spendKeys: {
            secViewKey: walletDetails.sec_viewKey_string,
            pubSpendKey: walletDetails.pub_spendKey_string,
            secSpendKey: walletDetails.sec_spendKey_string,
          },
          generateKeyImage: (txPub: string, viewSec: string, spendPub: string, spendSec: string, index: number) =>
            coreBridge.beldex_utils.generate_key_image(txPub, viewSec, spendPub, spendSec, index),
        })
      );
    }
  }, [dispatch, walletAddress, walletDetails, coreBridge]);

  const [expanded, setExpanded] = useState<string>("");

  useEffect(() => {
    if (!loaded) dispatch(fetchRegisteredTokens());
  }, [loaded, dispatch]);

  /* Rows come from two places, because neither alone is the whole picture.

     The server knows what this account HOLDS - including a token someone else
     registered and sent here, which the local registry has never heard of. The
     local registry knows what this device REGISTERED - including a registration
     still waiting for a block, which the account does not hold yet, and which is
     precisely when the user most wants to see it.

     Held rows win on conflict: the chain outranks a local note. */
  const registeredHere = useMemo(
    () => tokens.filter((t) => !walletAddress || !t.walletAddress || t.walletAddress === walletAddress),
    [tokens, walletAddress]
  );

  const rows = useMemo(() => {
    const held = Object.keys(balances);
    const heldSet = new Set(held);
    const fromChain = held.map((id) => ({
      tokenId: id,
      local: registeredHere.find((t) => t.tokenId === id),
    }));
    const localOnly = registeredHere
      .filter((t) => !heldSet.has(t.tokenId))
      .map((t) => ({ tokenId: t.tokenId, local: t }));
    return [...fromChain, ...localOnly];
  }, [balances, registeredHere]);

  // Ask the chain once the list is in hand, so a token that has since been
  // mined stops reading as pending without the user having to press anything.
  const askedRef = useRef(false);
  useEffect(() => {
    if (loaded && !askedRef.current) {
      askedRef.current = true;
      reload();
    }
  }, [loaded, reload]);

  const notify = (message: string, ok = true) =>
    toastMsgRef.current?.showAlert(message, ok ? "success" : "error");

  const copy = async (label: string, value: string) => {
    const ok = await copyToClipboard(value);
    notify(ok ? `${label} copied` : `Could not copy ${label.toLowerCase()}`, ok);
  };

  const forget = async (tokenId: string, ticker: string) => {
    await dispatch(forgetRegisteredToken(tokenId));
    notify(`Removed ${ticker} from this list`);
  };

  const cardSx = {
    background: theme.palette.mode === "dark" ? "#161616" : "#FFFFFF",
    borderRadius: "0px",
    overflow: "hidden",
    mt: 1.5,
  };

  const labelSx = { color: theme.palette.text.secondary, fontSize: rf(11) };
  const valueSx = { fontSize: rf(12), fontWeight: 600, wordBreak: "break-all" as const };

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Box sx={{ textAlign: "right", minWidth: 0 }}>
        {typeof value === "string" ? <Typography sx={valueSx}>{value}</Typography> : value}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 620, mx: "auto", px: isMobileMode ? 2 : 0, pb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontWeight: 700, fontSize: rf(18) }}>My Tokens</Typography>
        <IconButton
          size="small"
          disabled={refreshing}
          onClick={reload}
          aria-label="Refresh token status"
        >
          {refreshing ? <CircularProgress size={18} /> : <RefreshIcon sx={{ color: "#3ec745" }} />}
        </IconButton>
      </Box>

      <Typography sx={{ ...labelSx, mt: 0.5 }}>
        Privacy tokens this wallet holds, plus any registration still waiting for a block. A token
        id is generated at registration and cannot be recovered from the ticker or supply, so keep
        a copy of it.
      </Typography>

      {lookupSupported === false && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            border: "1px solid #c7a13e",
            background: theme.palette.mode === "dark" ? "#241f0e" : "#fdf6e3",
          }}
        >
          <Typography sx={{ fontSize: rf(11), color: theme.palette.text.primary }}>
            This server does not answer token queries, so the entries below are shown from this
            device's own record and have not been checked against the chain.
            {lookupError ? ` (${lookupError})` : ""}
          </Typography>
        </Box>
      )}

      {!loaded ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size={26} />
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 6, color: theme.palette.text.secondary }}>
          <TokenOutlinedIcon sx={{ fontSize: "3rem", opacity: 0.4 }} />
          <Typography sx={{ mt: 1, fontSize: rf(13) }}>No tokens yet</Typography>
          <Typography sx={{ mt: 0.5, fontSize: rf(11) }}>
            Register one from the Send screen's Token tab, or receive one.
          </Typography>
        </Box>
      ) : (
        rows.map(({ tokenId, local }) => {
          const token = local;
          const state: TokenChainStatus = status[tokenId] || "pending";
          const meta = STATUS_META[state];
          const info = chainInfo[tokenId];
          const held = balances[tokenId];
          const isOpen = expanded === tokenId;

          // Prefer what the chain says over what the wallet recorded: the two
          // agree for a plain registration, but a later mint or burn moves the
          // supply, and the chain is the one that is right.
          const decimals = info ? info.decimalPoint : token ? token.decimalPoint : 0;
          const describable = Boolean(info);
          const supply = info
            ? atomicToDisplay(info.currentSupply, decimals)
            : token ? token.currentSupply : "";
          const maxSupply = info
            ? atomicToDisplay(info.totalMaxSupply, decimals)
            : token ? token.totalMaxSupply : "";

          /* The headline number is what this wallet can spend, not the token's
             total supply. They coincide the moment a token is registered - the
             whole initial supply is minted to the registrant - and diverge the
             first time any of it moves, which is exactly when showing supply
             would mislead. */
          const balance = held
            ? atomicToDisplay(spendableBalance(held), decimals)
            : null;
          const lockedAmount = held && held.locked !== "0"
            ? atomicToDisplay(held.locked, decimals)
            : null;
          const ticker = (info ? info.ticker : token ? token.ticker : "") || "";
          const name = (info ? info.fullName : token ? token.fullName : "") || ticker;

          return (
            <Box key={tokenId} sx={cardSx}>
              <Box
                onClick={() => setExpanded(isOpen ? "" : tokenId)}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.75, cursor: "pointer" }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: theme.palette.mode === "dark" ? "#26263A" : "#F1F1F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: rf(12),
                  }}
                >
                  {(ticker || "?").slice(0, 4).toUpperCase()}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: rf(13) }}>
                    {name || "Unnamed token"}
                  </Typography>
                  <Typography sx={{ ...labelSx, fontFamily: "monospace" }}>
                    {shortenTokenId(tokenId)}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: rf(12) }}>
                    {balance !== null ? groupDigits(balance) : "—"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      justifyContent: "flex-end",
                      color: meta.color,
                    }}
                  >
                    {meta.icon}
                    <Typography sx={{ fontSize: rf(10), color: meta.color }}>{meta.label}</Typography>
                  </Box>
                </Box>
              </Box>

              {isOpen && (
                <Box
                  sx={{
                    px: 2,
                    pb: 2,
                    borderTop: `1px solid ${theme.palette.mode === "dark" ? "#2A2A38" : "#EFEFEF"}`,
                    pt: 1.5,
                  }}
                >
                  <Typography sx={{ ...labelSx, mb: 1, color: meta.color }}>{meta.detail}</Typography>

                  {!describable && (
                    <Typography sx={{ ...labelSx, mb: 1 }}>
                      The server could not describe this token, so the amount below is in its
                      raw atomic units and its name and scale are unknown.
                    </Typography>
                  )}

                  {balance !== null && (
                    <Field label="Your balance" value={groupDigits(balance)} />
                  )}
                  {lockedAmount && <Field label="Of which locked" value={groupDigits(lockedAmount)} />}
                  {ticker && <Field label="Ticker" value={ticker} />}
                  <Field label="Decimals" value={describable ? String(decimals) : "unknown"} />
                  {supply && <Field label="Total supply" value={groupDigits(supply)} />}
                  {maxSupply && <Field label="Max supply" value={groupDigits(maxSupply)} />}
                  {info?.owner && (
                    <Field
                      label="Owner key"
                      value={
                        <Typography sx={{ ...valueSx, fontFamily: "monospace" }}>
                          {shortenTokenId(info.owner)}
                        </Typography>
                      }
                    />
                  )}
                  {token && (
                    <Field
                      label="Registered here"
                      value={new Date(token.registeredAt).toLocaleString()}
                    />
                  )}

                  <Typography sx={{ ...labelSx, mt: 1.5 }}>Token id</Typography>
                  <Typography sx={{ ...valueSx, fontFamily: "monospace", fontSize: rf(11) }}>
                    {tokenId}
                  </Typography>

                  {/* Labelled, because two bare copy icons side by side give
                      no way to tell the token id from the transaction hash. */}
                  <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                    <Button
                      size="small"
                      startIcon={<ContentCopyIcon sx={{ fontSize: "1rem" }} />}
                      onClick={() => copy("Token id", tokenId)}
                      sx={{ color: "#3ec745", fontSize: rf(11), textTransform: "none", minWidth: 0 }}
                    >
                      Copy id
                    </Button>
                    {token?.txHash && (
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon sx={{ fontSize: "1rem" }} />}
                        onClick={() => copy("Transaction hash", token.txHash as string)}
                        sx={{ color: theme.palette.text.secondary, fontSize: rf(11), textTransform: "none", minWidth: 0 }}
                      >
                        Copy tx
                      </Button>
                    )}
                    <Box sx={{ flex: 1 }} />
                    {/* Only offered for a purely local record. A held token is
                        reported by the server, so "removing" it would put the row
                        straight back on the next refresh. */}
                    {token && !held && (
                      <IconButton
                        size="small"
                        onClick={() => forget(tokenId, ticker)}
                        aria-label="Remove from this list"
                      >
                        <DeleteOutlineIcon sx={{ fontSize: "1.1rem", color: "#ff5c5c" }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })
      )}

      <ToastMsg ref={toastMsgRef} />
    </Box>
  );
}
