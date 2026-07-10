import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import LogoDark from "../../icons/LogoDark";
import LogoWhite from "../../icons/LogoWhite";

// Branded boot screen shown while the WASM crypto bridge loads. Continues the
// native splash visually so startup reads as one smooth sequence instead of a
// blank page with raw "Loading..." text.
export default function BootScreen() {
  const theme: any = useTheme();
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        background: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          animation: "bootPulse 1.6s ease-in-out infinite",
          "@keyframes bootPulse": {
            "0%, 100%": { transform: "scale(1)", opacity: 1 },
            "50%": { transform: "scale(0.92)", opacity: 0.75 },
          },
        }}
      >
        {theme.palette.mode === "dark" ? (
          <LogoDark sx={{ width: "4em", height: "4em" }} />
        ) : (
          <LogoWhite sx={{ width: "4em", height: "4em" }} />
        )}
      </Box>
      <CircularProgress size={22} thickness={4} sx={{ color: "#00D030" }} />
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem" }}>
        Preparing your wallet…
      </Typography>
    </Box>
  );
}
