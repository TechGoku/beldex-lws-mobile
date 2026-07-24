import { ThemeOptions } from "@mui/material";

// Palette mirrors the Beldex wallet browser extension (panel.html tokens):
// near-black canvas (#0a0a0a) with flat #101010 panels, hairline #222222
// borders, the BDX logo green (#3ec745) / blue (#1574ad), dim gray text
// (#8a8a8a) and soft red (#ff5c5c). Everything is square-cornered — the
// extension's terminal look has border-radius: 0 across the board.
export const darkTheme: ThemeOptions = {
  shape: {
    borderRadius: 0
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#3ec745",
      light: "#101010",
      dark: "#2e9e38",
      contrastText: "#000"
    },
    info: {
      main: '#1574ad'
    },
    error: {
      main: '#ff5c5c'
    },
    warning: {
      main: '#f5a623'
    },
    secondary: {
      main: '#222222',
      light: '#EBEBEB',
      dark: '#8a8a8a'
    },
    success: {
      main: "#101010",
      light: "#161616"
    },
    text: {
      primary: '#f2f2f2',
      secondary: '#8a8a8a'
    },
    common: {
      black: '#8a8a8a',
      white: '#222222'
    },
    divider: '#222222',
    background: {
      paper: "#101010",
      default: "#0a0a0a"
    }
  },
  typography: {
    // Extension stack: Space Mono for body/numeric text, Michroma for headings.
    fontFamily: "'Space Mono', 'Poppins', 'Roboto', monospace",
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontFamily: "'Michroma', 'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "1px" },
    h2: { fontFamily: "'Michroma', 'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "1px" },
    h3: { fontFamily: "'Michroma', 'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "1px" },
    h4: { fontFamily: "'Michroma', 'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "1px" },
    h5: { fontFamily: "'Michroma', 'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "1px" },
    h6: { fontFamily: "'Michroma', 'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "1px" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 0,
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          boxShadow: 'none',
          '&:active': { transform: 'scale(0.98)' }
        },
        // Extension .btn-primary: solid white with black text; green on press.
        containedPrimary: {
          background: '#ffffff',
          color: '#000000',
          '&:hover': { background: '#3ec745', color: '#000000' },
          '&.Mui-disabled': {
            background: '#2E2E2E',
            color: '#8D8D8D'
          }
        },
        // Extension .btn-danger: transparent with a red hairline; fills on press.
        containedError: {
          background: 'transparent',
          color: '#ff5c5c',
          border: '1px solid #ff5c5c',
          '&:hover': { background: '#ff5c5c', color: '#000000' }
        },
        // Extension .btn-ghost: transparent with a hairline border.
        outlined: {
          borderColor: '#222222',
          color: '#f2f2f2',
          '&:hover': { borderColor: '#8a8a8a', background: 'transparent' }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: '#0d0d0d',
          '& fieldset': { borderColor: '#222222' },
          '&:hover fieldset': { borderColor: '#2a2a2a' },
          '&.Mui-focused fieldset': { borderColor: '#3ec745', borderWidth: '1px' }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: '1px solid #222222',
          backgroundImage: 'none'
        }
      }
    }
  }
}
