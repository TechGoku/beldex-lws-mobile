import { createTheme, CssBaseline, GlobalStyles, ThemeProvider, useMediaQuery } from "@mui/material";
import React, { createContext, useMemo, useState } from "react";
import { lightTheme } from "./light";
import { darkTheme } from "./dark";
/**
  TypeScript and React inconvenience:
  These functions are in here purely for types! 
  They will be overwritten - it's just that
  createContext must have an initial value.
  Providing a type that could be 'null | something' 
  and initiating it with *null* would be uncomfortable :)
*/
export const MUIWrapperContext = createContext({
  toggleColorMode: () => { },
});

export default function MUIWrapper({
  children }: {
    children: React.ReactNode;
  }) {
  const [mode, setMode] = useState("dark");
  const muiWrapperUtils = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  // const theme = useMemo(
  //   () => createTheme(mode === "light" ? lightTheme : darkTheme,{
  //     typography: {
  //       fontSize: 16, // Set the default font size
  //       // You can customize other typography options here
  //     },),
  //   [mode]
  // );
  const theme = useMemo(
    () =>
      createTheme(
        {
          ...(mode === "light" ? lightTheme : darkTheme),
          typography: {
            fontSize: 12,
          
          },
        },
        [mode]
      ),
    [mode]
  );

  return (
    <MUIWrapperContext.Provider value={muiWrapperUtils}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            "*::-webkit-scrollbar": {
              width: "5px",
            },
            "*::-webkit-scrollbar-track": {
              // "-webkit-box-shadow": "inset 0 0 5px grey",
              // boxShadow: "inset 0 0 5px grey",
              borderRadius: "10px",
              backgroundColor:
                theme.palette.mode == "dark"
                  ? theme.palette.background.default
                  : "#F2F2F2",
            },
            "*::-webkit-scrollbar-thumb": {
              background:
                theme.palette.mode == "dark" ? "#585870" : "#C7C7C7",
              borderRadius: "10px",
            },
            "*::-webkit-scrollbar-thumb:hover": {
              background:
                theme.palette.mode == "dark" ? "#585870" : "#C7C7C7",
            },
            "& .MuiButton-root": {
              textTransform: 'capitalize !important',

            },
            "& .MuiButton-containedPrimary:hover": {
              opacity: 0.7
            }
          }}
        />
        {children}
      </ThemeProvider>
    </MUIWrapperContext.Provider>
  );
}
