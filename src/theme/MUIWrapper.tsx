import { createTheme, CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import React, { createContext, useEffect, useMemo } from "react";
import { darkTheme } from "./dark";
import { applyStatusBarStyle } from "../services/nativeShell";
/**
  Kept for API compatibility with the (few) components that still read this
  context. The app is dark-only, so toggleColorMode is intentionally a no-op.
*/
export const MUIWrapperContext = createContext({
  toggleColorMode: () => { },
});

export default function MUIWrapper({
  children }: {
    children: React.ReactNode;
  }) {
  // The app ships dark-only; the light theme was removed.
  useEffect(() => {
    applyStatusBarStyle(true);
  }, []);

  const muiWrapperUtils = useMemo(
    () => ({
      toggleColorMode: () => { },
    }),
    []
  );

  const theme = useMemo(() => {
    return createTheme({
      ...darkTheme,
      // Merge, don't replace: darkTheme.typography carries the extension font
      // stack (Space Mono body, Michroma headings).
      typography: {
        ...darkTheme.typography,
        // MUI default (14) rather than 12: components that don't opt into the
        // fluid rf() sizes (default Typography body, MenuItem, Chip, TextField
        // helper text) inherit this base, so 12 left them below the readable
        // baseline on high-DPI phones. Screens using rf() are unaffected.
        fontSize: 14,
      },
    });
  }, []);

  return (
    <MUIWrapperContext.Provider value={muiWrapperUtils}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            // The extension's dot-grid canvas (from beldex.io), dark tint.
            body: {
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1.5px)",
              backgroundSize: "26px 26px",
            },
            "*::-webkit-scrollbar": {
              width: "4px",
            },
            "*::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "*::-webkit-scrollbar-thumb": {
              background: "#2a2a2a",
            },
            "*::-webkit-scrollbar-thumb:hover": {
              background: "#2a2a2a",
            },
          }}
        />
        {children}
      </ThemeProvider>
    </MUIWrapperContext.Provider>
  );
}
