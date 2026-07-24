import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Modal, Typography, useTheme } from "@mui/material";
import PinPad, { PIN_LENGTH } from "../pinPad/PinPad";
import { verifyPin } from "../../services/appLockStorage";
import { authenticateBiometric } from "../../services/biometric";
import { useSelector } from "react-redux";
import { rf } from "../../utils/responsiveFont";

interface TxAuthGateProps {
  open: boolean;
  // Called exactly once per open: true = authenticated, false = canceled/failed.
  onResult: (ok: boolean) => void;
}

// Authentication gate shown right before a transaction is signed & broadcast.
// Reuses the app-lock credentials: biometrics when enabled (or when the device
// has them and no PIN is set), and the app-lock PIN otherwise. The send flow's
// authenticate_fn drives it, so the WASM pipeline pauses until this resolves.
export default function TxAuthGate({ open, onResult }: TxAuthGateProps) {
  const theme: any = useTheme();
  const security = useSelector((state: any) => state.securityReducer);
  const hasPin: boolean = !!security?.hasPin;
  const biometryAvailable: boolean = !!security?.biometryAvailable;
  // For confirming a spend, any enrolled biometric is acceptable even if the
  // user hasn't switched it on for app unlock — the device verifies identity.
  const canUseBiometric = biometryAvailable && (security?.biometricEnabled || !hasPin);

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!open) return;
    setPin("");
    setError(false);
    setChecking(false);
    setHint(hasPin ? "Enter your PIN to confirm" : "Verify to confirm sending");
  }, [open, hasPin]);

  const runBiometric = useCallback(async () => {
    const result = await authenticateBiometric("Confirm sending funds");
    if (result.success) {
      onResult(true);
    } else if (result.reason === "error") {
      setHint(
        hasPin
          ? "Biometric unavailable - enter your PIN"
          : "Biometric verification failed"
      );
    }
  }, [hasPin, onResult]);

  // Offer biometrics automatically when the gate opens.
  useEffect(() => {
    if (open && canUseBiometric) runBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Verify once a full PIN is entered.
  useEffect(() => {
    if (!open || !hasPin || pin.length !== PIN_LENGTH || checking) return;
    let cancelled = false;
    setChecking(true);
    verifyPin(pin).then((ok) => {
      if (cancelled) return;
      if (ok) {
        onResult(true);
      } else {
        setError(true);
        setHint("Incorrect PIN, try again");
        setTimeout(() => {
          setPin("");
          setError(false);
          setChecking(false);
        }, 600);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, open]);

  return (
    <Modal open={open} onClose={() => onResult(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 340,
          maxWidth: "92vw",
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "0px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Michroma', 'Poppins', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: rf(15),
            mb: 1,
          }}
        >
          Confirm transaction
        </Typography>
        <Typography
          sx={{
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
            fontSize: "0.85rem",
            mb: 3,
            textAlign: "center",
          }}
        >
          {hint}
        </Typography>

        {hasPin ? (
          <PinPad
            value={pin}
            onChange={setPin}
            error={error}
            disabled={checking && !error}
            onBiometric={canUseBiometric ? runBiometric : undefined}
          />
        ) : (
          <Button variant="contained" color="primary" fullWidth onClick={runBiometric}>
            Verify with biometrics
          </Button>
        )}

        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => onResult(false)}
        >
          Cancel
        </Button>
      </Box>
    </Modal>
  );
}
