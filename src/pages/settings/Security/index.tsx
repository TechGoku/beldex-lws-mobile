import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  Modal,
  Button,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import PinOutlinedIcon from "@mui/icons-material/PinOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import PinSetup from "./PinSetup";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  securitySelector,
  initSecurity,
  refreshSecurity,
  toggleBiometric,
  disableLock,
  pinConfigured,
  setAutoLock,
} from "../../../stores/features/securitySlice";
import { authenticateBiometric } from "../../../services/biometric";

const AUTO_LOCK_OPTIONS = [
  { value: 0, label: "Only on exit" },
  { value: 30, label: "After 30 seconds" },
  { value: 60, label: "After 1 minute" },
  { value: 300, label: "After 5 minutes" },
  { value: 900, label: "After 15 minutes" },
];

export default function SecuritySettings() {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const security = useAppSelector(securitySelector);
  const toastRef = useRef<ToastMsgRef>(null);

  const [pinSetupOpen, setPinSetupOpen] = useState(false);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);

  useEffect(() => {
    if (!security.loaded) dispatch(initSecurity());
  }, [security.loaded, dispatch]);

  const toast = (msg: string, ok = true) => toastRef.current?.showAlert(msg, ok ? "success" : "error");

  const handleLockToggle = (checked: boolean) => {
    if (checked) {
      setPinSetupOpen(true);
    } else {
      setConfirmDisableOpen(true);
    }
  };

  const handlePinSetupDone = () => {
    setPinSetupOpen(false);
    dispatch(pinConfigured());
    dispatch(refreshSecurity());
    toast("App lock enabled");
  };

  const handleDisable = async () => {
    await dispatch(disableLock());
    setConfirmDisableOpen(false);
    toast("App lock disabled");
  };

  const handleBiometricToggle = async (checked: boolean) => {
    if (checked) {
      // Verify the user actually owns the biometric before enabling.
      const result = await authenticateBiometric("Confirm to enable biometric unlock");
      if (!result.success) {
        toast("Biometric not enabled", false);
        return;
      }
    }
    await dispatch(toggleBiometric(checked));
    toast(checked ? "Biometric unlock enabled" : "Biometric unlock disabled");
  };

  const rowSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 0",
    borderBottom: (t: any) => `1px solid ${t.palette.mode === "dark" ? "#32324A" : "#E5E5E5"}`,
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
            Security
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", mb: 3 }}>
            Protect access to your wallet with a PIN and biometrics.
          </Typography>

          {/* App lock */}
          <Box sx={rowSx}>
            <Box display="flex" alignItems="center" gap={2}>
              <PinOutlinedIcon sx={{ color: "#00D030" }} />
              <Box>
                <Typography sx={{ fontWeight: 600 }}>App Lock (PIN)</Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                  Require a 6-digit PIN to open the app
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={security.lockEnabled}
              onChange={(e) => handleLockToggle(e.target.checked)}
            />
          </Box>

          {/* Change PIN */}
          {security.lockEnabled && (
            <Box sx={rowSx}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Change PIN</Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                  Set a new 6-digit PIN
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                sx={{ borderRadius: "10px", color: theme.palette.text.primary }}
                onClick={() => setPinSetupOpen(true)}
              >
                Change
              </Button>
            </Box>
          )}

          {/* Biometric */}
          <Box sx={{ ...rowSx, opacity: security.lockEnabled && security.biometryAvailable ? 1 : 0.5 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <FingerprintIcon sx={{ color: "#00D030" }} />
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{security.biometryLabel} Unlock</Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                  {!security.biometryAvailable
                    ? "No biometrics enrolled on this device"
                    : !security.lockEnabled
                    ? "Enable App Lock first"
                    : `Unlock with ${security.biometryLabel}`}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={security.biometricEnabled}
              disabled={!security.lockEnabled || !security.biometryAvailable}
              onChange={(e) => handleBiometricToggle(e.target.checked)}
            />
          </Box>

          {/* Auto-lock timeout */}
          <Box sx={{ ...rowSx, opacity: security.lockEnabled ? 1 : 0.5, borderBottom: "none" }}>
            <Box display="flex" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
              <TimerOutlinedIcon sx={{ color: "#00D030" }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>Auto-Lock</Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                  Lock automatically when idle
                </Typography>
              </Box>
            </Box>
            <Select
              size="small"
              variant="standard"
              disableUnderline
              disabled={!security.lockEnabled}
              IconComponent={KeyboardArrowDownIcon}
              value={security.autoLockSeconds}
              onChange={(e) => dispatch(setAutoLock(Number(e.target.value)))}
              sx={{
                minWidth: 130,
                px: 1.5,
                py: 0.5,
                borderRadius: "10px",
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
                "& .MuiSelect-icon": { color: theme.palette.text.primary },
              }}
            >
              {AUTO_LOCK_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Box>

      {/* PIN setup / change */}
      <Modal open={pinSetupOpen} onClose={() => setPinSetupOpen(false)}>
        <>
          <PinSetup onDone={handlePinSetupDone} onCancel={() => setPinSetupOpen(false)} />
        </>
      </Modal>

      {/* Disable confirmation */}
      <Modal open={confirmDisableOpen} onClose={() => setConfirmDisableOpen(false)}>
        <Box sx={modalStyle}>
          <Typography textAlign="center" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Disable App Lock?
          </Typography>
          <Typography textAlign="center" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            Your PIN and biometric unlock will be removed.
          </Typography>
          <Box display="flex" justifyContent="center" mt={4} gap={2}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "10px", width: 140, color: theme.palette.text.primary }}
              onClick={() => setConfirmDisableOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ borderRadius: "10px", width: 140, color: "#fff" }}
              onClick={handleDisable}
            >
              Disable
            </Button>
          </Box>
        </Box>
      </Modal>

      <ToastMsg ref={toastRef} />
    </Box>
  );
}
