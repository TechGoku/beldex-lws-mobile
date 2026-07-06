import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import LogoDark from "../../icons/LogoDark";
import LogoWhite from "../../icons/LogoWhite";
import PinPad, { PIN_LENGTH } from "../../components/pinPad/PinPad";
import { verifyPin } from "../../services/appLockStorage";
import { authenticateBiometric } from "../../services/biometric";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { securitySelector, unlockApp } from "../../stores/features/securitySlice";

// Full-screen gate shown whenever the app is locked. Unlock via PIN, or via
// biometrics if the user enabled them.
export default function LockScreen() {
  const theme: any = useTheme();
  const dispatch = useAppDispatch();
  const security = useAppSelector(securitySelector);
  const canUseBiometric = security.biometricEnabled && security.biometryAvailable;

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [hint, setHint] = useState("Enter your PIN");

  const runBiometric = useCallback(async () => {
    if (!canUseBiometric) return;
    const result = await authenticateBiometric("Unlock your wallet");
    if (result.success) {
      dispatch(unlockApp());
    } else if (result.reason === "error") {
      setHint("Biometric unavailable - enter your PIN");
    }
  }, [canUseBiometric, dispatch]);

  // Offer biometrics automatically on mount.
  useEffect(() => {
    runBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verify once a full PIN is entered.
  useEffect(() => {
    if (pin.length !== PIN_LENGTH || checking) return;
    let cancelled = false;
    setChecking(true);
    verifyPin(pin).then((ok) => {
      if (cancelled) return;
      if (ok) {
        dispatch(unlockApp());
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
  }, [pin]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (t) => t.zIndex.modal + 10,
        background: theme.palette.background.default,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
      }}
    >
      <Box sx={{ mb: 3 }}>
        {theme.palette.mode === "dark" ? (
          <LogoDark sx={{ width: "3.5em", height: "3.5em" }} />
        ) : (
          <LogoWhite sx={{ width: "3.5em", height: "3.5em" }} />
        )}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", mb: 1 }}>
        Wallet Locked
      </Typography>
      <Typography
        sx={{
          color: error ? "#FC2727" : theme.palette.text.secondary,
          mb: 5,
          fontSize: "0.95rem",
        }}
      >
        {hint}
      </Typography>

      <PinPad
        value={pin}
        onChange={setPin}
        error={error}
        disabled={checking && !error}
        onBiometric={canUseBiometric ? runBiometric : undefined}
      />
    </Box>
  );
}
