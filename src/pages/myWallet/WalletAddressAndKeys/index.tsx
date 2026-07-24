import React, { useEffect, useRef, useState } from "react";
import { rf } from "../../../utils/responsiveFont";
import "./styles.scss";
import QRCode from "qrcode";
import logoUrl from "../../../icons/beldex-logo.svg";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Button, Input, useMediaQuery, IconButton } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import { copyToClipboard } from "../../../services/clipboard";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { deriveShortPid, savePidLabel } from "../../../services/pidLabels";

// Some WASM bridge calls return a bare string, others a JSON envelope
// ({retVal}/{err_msg}) depending on the build — normalize to a plain string.
const unwrapBridgeString = (r: any): string => {
  if (typeof r === "string" && r.trim().startsWith("{")) {
    const parsed = JSON.parse(r);
    if (parsed.err_msg) throw new Error(parsed.err_msg);
    return parsed.retVal ?? r;
  }
  if (r && typeof r === "object") {
    if (r.err_msg) throw new Error(r.err_msg);
    return r.retVal;
  }
  return r;
};

// Front wallet screen: address only. Secret keys and the recovery seed live on
// the dedicated Account Details page (behind a warning), never on the home tab.
export default function WalletAddressAndKeys() {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);
  const toastMsgRef = useRef<ToastMsgRef>(null);

  // Unique receiving address (integrated address, ported from the extension):
  // primary address + short payment ID baked in. An optional label derives a
  // deterministic ID and is remembered locally so incoming payments show the
  // friendly name in transaction details.
  const [uniqueAddr, setUniqueAddr] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [label, setLabel] = useState("");
  const [activeLabel, setActiveLabel] = useState("");
  const [genErr, setGenErr] = useState("");

  const copyText = async (text: string) => {
    const ok = await copyToClipboard(text);
    toastMsgRef.current?.showAlert(ok ? "Copied" : "Couldn't copy", ok ? "success" : "error");
  };

  const generateUnique = async () => {
    setGenErr("");
    try {
      const utils = coreBridgeInstance.beldex_utils;
      const trimmed = label.trim();
      // custom string -> deterministic payment ID (SHA-256, first 8 bytes);
      // empty label -> random ID
      const pid = trimmed
        ? await deriveShortPid(trimmed)
        : unwrapBridgeString(utils.new_payment_id());
      const addr = unwrapBridgeString(
        utils.new__int_addr_from_addr_and_short_pid(
          walletDetails.address_string,
          pid,
          coreBridgeInstance.nettype
        )
      );
      if (trimmed) await savePidLabel(pid, trimmed);
      setUniqueAddr(addr);
      setPaymentId(pid);
      setActiveLabel(trimmed);
    } catch (e: any) {
      setGenErr(String(e?.message ?? e));
    }
  };

  const resetToPrimary = () => {
    setUniqueAddr("");
    setPaymentId("");
    setActiveLabel("");
    setGenErr("");
  };

  // QR of whichever address is shown (primary or unique), extension-style:
  // error correction H tolerates ~30% obstruction — required for the center logo.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shownAddress = uniqueAddr || walletDetails.address_string;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shownAddress) return;
    QRCode.toCanvas(canvas, shownAddress, {
      errorCorrectionLevel: "H",
      width: 170,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(() => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const logo = new Image();
        logo.onload = () => {
          const size = canvas.width * 0.22;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, size / 2 + 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.drawImage(logo, (canvas.width - size) / 2, (canvas.height - size) / 2, size, size);
        };
        logo.src = logoUrl;
      })
      .catch(() => {});
  }, [shownAddress]);

  const inputBg = theme.palette.mode === "dark" ? "#0d0d0d" : "#fbfbfb";
  const divider = theme.palette.mode === "dark" ? "#222222" : "#ECECEC";

  return (
    <Box
      className="WalletAddressAndKeys"
      sx={{
        marginTop: "20px",
        padding: "16px 20px",
        borderRadius: "0px",
        backgroundColor: isMobileMode
          ? theme.palette.mode === "dark" ? "#161616" : "#FFFFFF"
          : theme.palette.background.default,
      }}
    >
      {/* Extension .qr-box: QR of the shown address on a white pad. */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box
          sx={{
            backgroundColor: "#ffffff",
            padding: "10px",
            border: `1px solid ${theme.palette.divider}`,
            lineHeight: 0,
          }}
        >
          <canvas ref={canvasRef} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: rf(18) }}>
            {uniqueAddr ? "Unique address" : "Address"}
          </Typography>
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: rf(14),
              marginTop: "4px",
              wordBreak: "break-all",
            }}
          >
            {uniqueAddr || walletDetails.address_string}
          </Typography>
        </Box>
        <IconButton
          onClick={() => copyText(uniqueAddr || walletDetails.address_string)}
          sx={{ flexShrink: 0 }}
        >
          <ContentCopyIcon sx={{ fontSize: "1.4rem", color: theme.palette.primary.main }} />
        </IconButton>
      </Box>

      {/* Receive with label: generate a unique integrated address so each
          payer can be told apart in the transaction history. */}
      {!uniqueAddr ? (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${divider}` }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "stretch", flexWrap: "wrap" }}>
            <Input
              placeholder="Label (optional, e.g. invoice-42)"
              disableUnderline
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              sx={{
                flex: 1,
                minWidth: "160px",
                backgroundColor: inputBg,
                border: `1px solid ${divider}`,
                padding: "6px 12px",
                fontSize: rf(13),
              }}
            />
            <Button variant="outlined" onClick={generateUnique} sx={{ flexShrink: 0 }}>
              + Unique address
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${divider}` }}>
          {activeLabel && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                Label
              </Typography>
              <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: rf(13) }}>
                {activeLabel}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(13), flexShrink: 0 }}>
              Payment ID
            </Typography>
            <Typography
              sx={{
                color: theme.palette.text.primary,
                fontSize: rf(13),
                wordBreak: "break-all",
                textAlign: "right",
              }}
            >
              {paymentId}
            </Typography>
            <IconButton size="small" onClick={() => copyText(paymentId)} sx={{ flexShrink: 0 }}>
              <ContentCopyIcon sx={{ fontSize: "1rem", color: theme.palette.primary.main }} />
            </IconButton>
          </Box>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(11), mt: 1 }}>
            Funds sent here arrive in this wallet, tagged with the payment ID — hand a
            different one to each payer to tell them apart.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
            <Button variant="outlined" onClick={resetToPrimary} sx={{ flex: 1 }}>
              Primary
            </Button>
            {!activeLabel && (
              <Button variant="outlined" onClick={generateUnique} sx={{ flex: 1 }}>
                ↻ New
              </Button>
            )}
          </Box>
        </Box>
      )}
      {genErr && (
        <Typography sx={{ color: theme.palette.error.main, fontSize: rf(12), mt: 1 }}>
          {genErr}
        </Typography>
      )}

      {/* Link to full account details (keys + seed behind a warning) */}
      <Box
        onClick={() => navigate("/account")}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          pt: 2,
          borderTop: `1px solid ${divider}`,
          cursor: "pointer",
        }}
      >
        <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Account details & keys
        </Typography>
        <ChevronRightIcon sx={{ color: theme.palette.primary.main }} />
      </Box>

      <ToastMsg ref={toastMsgRef} />
    </Box>
  );
}
