import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Select,
  MenuItem,
  Modal,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import {
  getRawServerUrl,
  getNetType,
  saveServerConfig,
  resetServerConfig,
  getDefaults,
  isUsingCustomServer,
} from "../../../services/runtimeConfig";
import { setUserLogout } from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";

const NETWORKS = [
  { value: 0, label: "Mainnet" },
  { value: 1, label: "Testnet" },
  { value: 2, label: "Stagenet" },
];

export default function ServerConfig() {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const toastRef = useRef<ToastMsgRef>(null);

  const [url, setUrl] = useState("");
  const [nettype, setNettype] = useState(0);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<{ url: string; nettype: number } | null>(null);

  useEffect(() => {
    setUrl(getRawServerUrl());
    setNettype(getNetType());
  }, []);

  const toast = (msg: string, ok = true) => toastRef.current?.showAlert(msg, ok ? "success" : "error");

  const validate = (value: string): string => {
    const v = value.trim();
    if (!v) return "Server URL is required";
    const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      // eslint-disable-next-line no-new
      new URL(withProto);
      return "";
    } catch {
      return "Enter a valid URL";
    }
  };

  const requestSave = () => {
    const err = validate(url);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    // Switching server/network invalidates the logged-in wallet session, so
    // confirm before applying (the app reloads and returns to login).
    setPending({ url: url.trim(), nettype });
    setConfirmOpen(true);
  };

  const applySave = async () => {
    if (!pending) return;
    await saveServerConfig(pending.url, pending.nettype);
    dispatch(setUserLogout());
    setConfirmOpen(false);
    toast("Server updated - reloading");
    // Reload so startup rebuilds the wallet bridge/API client against the new
    // endpoint and network type.
    setTimeout(() => window.location.reload(), 600);
  };

  const handleReset = async () => {
    await resetServerConfig();
    const d = getDefaults();
    setUrl(d.serverUrl);
    setNettype(d.nettype);
    dispatch(setUserLogout());
    toast("Reset to default - reloading");
    setTimeout(() => window.location.reload(), 600);
  };

  const inputSx = {
    width: "100%",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
    padding: "0 16px",
    height: "52px",
    borderRadius: "12px",
    border: error ? "1px solid #FC2727" : "none",
    mt: 1,
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 320 : 440,
    bgcolor: theme.palette.background.paper,
    boxShadow: 24,
    p: 4,
    borderRadius: "22px",
  };

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "25px",
      }}
    >
      <Box sx={{ padding: isMobileMode ? "0" : "25px" }}>
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <OutboundIcon
            sx={{ transform: "rotate(225deg)", fontSize: "2rem", cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>
            Back
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 560, mx: "auto", mt: 4, px: isMobileMode ? 2 : 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", mb: 1 }}>
            Server / Node
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", mb: 3 }}>
            Connect the wallet to your own Beldex Light Wallet Service endpoint.
          </Typography>

          <Typography sx={{ fontWeight: 600 }}>LWS API URL</Typography>
          <Input
            placeholder="https://lwsapi.beldex.io"
            disableUnderline
            sx={inputSx}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
          />
          {error && (
            <Typography sx={{ color: "#FC2727", fontSize: "0.85rem", mt: 1 }}>{error}</Typography>
          )}

          <Typography sx={{ fontWeight: 600, mt: 3 }}>Network</Typography>
          <Select
            fullWidth
            disableUnderline
            variant="filled"
            IconComponent={KeyboardArrowDownIcon}
            value={nettype}
            onChange={(e) => setNettype(Number(e.target.value))}
            sx={{
              mt: 1,
              borderRadius: "12px",
              backgroundColor: theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
              color: theme.palette.text.primary,
              "& .MuiSelect-icon": { color: theme.palette.text.primary },
              "& .MuiFilledInput-input": { paddingTop: "16px" },
            }}
          >
            {NETWORKS.map((n) => (
              <MenuItem key={n.value} value={n.value}>
                {n.label}
              </MenuItem>
            ))}
          </Select>

          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem", mt: 2 }}>
            Default: {getDefaults().serverUrl || "(none)"} ·{" "}
            {NETWORKS.find((n) => n.value === getDefaults().nettype)?.label}
            {isUsingCustomServer() ? " · currently using a custom server" : ""}
          </Typography>

          <Box display="flex" gap={2} mt={4}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "10px", flex: 1, color: theme.palette.text.primary }}
              onClick={handleReset}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: "10px", flex: 1, color: "#fff" }}
              onClick={requestSave}
            >
              Save & Apply
            </Button>
          </Box>
        </Box>
      </Box>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box sx={modalStyle}>
          <Typography textAlign="center" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Switch Server?
          </Typography>
          <Typography textAlign="center" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            The wallet will log out and reconnect to the new endpoint. You'll need
            to sign in again.
          </Typography>
          <Box display="flex" justifyContent="center" mt={4} gap={2}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "10px", width: 140, color: theme.palette.text.primary }}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: "10px", width: 140, color: "#fff" }}
              onClick={applySave}
            >
              Switch
            </Button>
          </Box>
        </Box>
      </Modal>

      <ToastMsg ref={toastRef} />
    </Box>
  );
}
