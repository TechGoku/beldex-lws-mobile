import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PinPad, { PIN_LENGTH } from "../../../components/pinPad/PinPad";
import { setPin as storageSetPin } from "../../../services/appLockStorage";

interface PinSetupProps {
  onDone: () => void;
  onCancel: () => void;
}

// Two-step PIN creation: enter, then confirm. Persists on match.
export default function PinSetup({ onDone, onCancel }: PinSetupProps) {
  const theme: any = useTheme();
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pin.length !== PIN_LENGTH || saving) return;

    if (step === "enter") {
      setFirstPin(pin);
      setPin("");
      setStep("confirm");
      return;
    }

    // confirm step
    if (pin === firstPin) {
      setSaving(true);
      storageSetPin(pin).then(() => onDone());
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
        setPin("");
        setFirstPin("");
        setStep("enter");
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: 340, sm: 420 },
        bgcolor: theme.palette.background.paper,
        boxShadow: 24,
        p: 4,
        borderRadius: "22px",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          {step === "enter" ? "Create a PIN" : "Confirm your PIN"}
        </Typography>
        <IconButton onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography
        textAlign="center"
        sx={{ color: error ? "#FC2727" : theme.palette.text.secondary, mb: 4 }}
      >
        {error
          ? "PINs did not match, start again"
          : step === "enter"
          ? `Choose a ${PIN_LENGTH}-digit PIN`
          : "Re-enter the same PIN"}
      </Typography>
      <PinPad value={pin} onChange={setPin} error={error} disabled={saving} />
    </Box>
  );
}
