import { ThemeOptions } from "@mui/material";

export const lightTheme: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#00C708",
            light: "#FCFCFC",
            dark: "#00AD07",
            contrastText: "#000",
        },
        info: {
            main: '#2879FB'
        },
        error: {
            main: '#E22B2B'
        },
        success: {
            main: "#FCFCFC",
            light: "#FCFCFC",
            dark:'#7D7D9C'

        }, 
        secondary: {
          main: "#F5F5F5",
          light:'#7F7F88',
          dark:'#7D7D9C'
          
        },
        text: {
            primary: '#222222',
            secondary: '#7F7F88'  //
        },
        common: {
            black: '#8787A8',
            white:'#F8F8F8'
        },
        background: {
            paper: "#F0F0F0",
            // paper: "#F2F2F2",
            default: "#F8F8F8"
            
        },
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