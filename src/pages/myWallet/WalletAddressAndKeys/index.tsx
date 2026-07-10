import React, { useRef } from "react";
import "./styles.scss";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, useMediaQuery, IconButton } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import { copyToClipboard } from "../../../services/clipboard";

// Front wallet screen: address only. Secret keys and the recovery seed live on
// the dedicated Account Details page (behind a warning), never on the home tab.
export default function WalletAddressAndKeys() {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const toastMsgRef = useRef<ToastMsgRef>(null);

  const copyText = async (text: string) => {
    const ok = await copyToClipboard(text);
    toastMsgRef.current?.showAlert(ok ? "Copied" : "Couldn't copy", ok ? "success" : "error");
  };

  return (
    <Box
      className="WalletAddressAndKeys"
      sx={{
        marginTop: "20px",
        padding: "16px 20px",
        borderRadius: "16px",
        backgroundColor: isMobileMode
          ? theme.palette.mode === "dark" ? "#24242F" : "#FCFCFC"
          : theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: "18px" }}>
            Address
          </Typography>
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "14px",
              marginTop: "4px",
              wordBreak: "break-all",
            }}
          >
            {walletDetails.address_string}
          </Typography>
        </Box>
        <IconButton onClick={() => copyText(walletDetails.address_string)} sx={{ flexShrink: 0 }}>
          <ContentCopyIcon sx={{ fontSize: "1.4rem", color: theme.palette.primary.main }} />
        </IconButton>
      </Box>

      {/* Link to full account details (keys + seed behind a warning) */}
      <Box
        onClick={() => navigate("/account")}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2,
          pt: 2,
          borderTop: `1px solid ${theme.palette.mode === "dark" ? "#32324A" : "#ECECEC"}`,
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
