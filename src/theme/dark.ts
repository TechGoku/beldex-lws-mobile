import { ThemeOptions } from "@mui/material";

export const darkTheme: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#00C708",
      light: "#2B2B3C",
      dark: "#00AD07",
      contrastText: "#fff"
    },
    info: {
      main: '#2879FB'
    },
    error: {
      main: '#E22B2B'
    },
    secondary: {
      main: '#303045',
      light: '#D1D1D3',
      dark: '#7D7D9C'
    },
    success: {
      main: "#2B2B3C",
      light: "#303041"
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#AFAFBE'
    },
    common: {
      black: '#8787A8',
      white: '#32324A'
    },
    background: {
      paper: "#242433",
      // paper: "#1C1C26",
      default: "#1C1C26"
    }
  },
  typography: {
    fontFamily: 'Poppins',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 'bold',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize'
        }
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
            @font-face {
              font-family: 'Poppins';
              
            }
          `,
    },
  }
}