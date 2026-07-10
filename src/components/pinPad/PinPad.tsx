import React from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import FingerprintIcon from "@mui/icons-material/Fingerprint";

export const PIN_LENGTH = 6;

interface PinPadProps {
  value: string;
  onChange: (next: string) => void;
  // Shows a biometric key in the bottom-left when provided.
  onBiometric?: () => void;
  // Shakes / recolors the dots to indicate a wrong entry.
  error?: boolean;
  disabled?: boolean;
}

// Numeric keypad + progress dots, reused by the lock screen and PIN setup.
export default function PinPad({ value, onChange, onBiometric, error, disabled }: PinPadProps) {
  const press = (digit: string) => {
    if (disabled) return;
    if (value.length >= PIN_LENGTH) return;
    onChange(value + digit);
  };

  const backspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <Box sx={{ width: "100%", maxWidth: 320, mx: "auto" }}>
      {/* progress dots */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 5,
          animation: error ? "pinShake 0.4s" : "none",
          "@keyframes pinShake": {
            "0%, 100%": { transform: "translateX(0)" },
            "25%": { transform: "translateX(-8px)" },
            "75%": { transform: "translateX(8px)" },
          },
        }}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          const filled = i < value.length;
          return (
            <Box
              key={i}
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                transition: "all 0.15s",
                backgroundColor: error
                  ? "#FC2727"
                  : filled
                  ? "#00D030"
                  : "transparent",
                border: (theme) =>
                  `2px solid ${error ? "#FC2727" : filled ? "#00D030" : theme.palette.text.secondary}`,
              }}
            />
          );
        })}
      </Box>

      {/* keypad */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {keys.map((k) => (
          <PadButton key={k} onClick={() => press(k)} disabled={disabled}>
            {k}
          </PadButton>
        ))}

        {/* bottom-left: biometric or blank */}
        {onBiometric ? (
          <PadButton onClick={onBiometric} disabled={disabled} variant="icon">
            <FingerprintIcon sx={{ fontSize: 30, color: "#00D030" }} />
          </PadButton>
        ) : (
          <Box />
        )}

        <PadButton onClick={() => press("0")} disabled={disabled}>
          0
        </PadButton>

        <PadButton onClick={backspace} disabled={disabled} variant="icon">
          <BackspaceOutlinedIcon sx={{ fontSize: 26 }} />
        </PadButton>
      </Box>
    </Box>
  );
}

interface PadButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "digit" | "icon";
}

function PadButton({ children, onClick, disabled, variant = "digit" }: PadButtonProps) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      centerRipple
      sx={{
        height: 72,
        borderRadius: "50%",
        opacity: disabled ? 0.4 : 1,
        // Material ripple gives real touch feedback; keep a subtle pressed
        // tint as well so it reads even on slow devices.
        "&:active": {
          backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#32324A" : "#E8E8E8"),
        },
        "& .MuiTouchRipple-child": {
          backgroundColor: "#00D030",
        },
      }}
    >
      <Typography sx={{ fontSize: 28, fontWeight: 500, color: "text.primary" }}>
        {children}
      </Typography>
    </ButtonBase>
  );
}
