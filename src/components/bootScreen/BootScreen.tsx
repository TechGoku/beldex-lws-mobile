import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import LogoDark from "../../icons/LogoDark";
import LogoWhite from "../../icons/LogoWhite";

// Branded boot screen shown while the WASM crypto bridge loads. Continues the
// native splash visually so startup reads as one smooth sequence instead of a
// blank page with raw "Loading..." text.
//
// Also reused as a full-screen "Reconnecting…" overlay when the app is about to
// reload against a new server (pass `message`), so a server switch reads as one
// smooth branded transition rather than the WebView blanking out.
export default function BootScreen({ message }: { message?: string } = {}) {
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
      <CircularProgress size={22} thickness={4} sx={{ color: "#3ec745" }} />
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem" }}>
        {message ?? "Preparing your wallet…"}
      </Typography>
    </Box>
  );
}
