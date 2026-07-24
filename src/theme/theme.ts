
import { createTheme } from '@mui/material';

const theme = createTheme({
    shape: {
      borderRadius: 0
    },
    palette: {
      primary:{
        main: "#3ec745"
      },
      secondary: {
        main: "#8a8a8a",

      },
      info: {
        main: "#1574ad"
      },
      error: {
        main: "#ff5c5c"
      }
    },
    typography: {
      fontFamily: "'Space Mono', 'Poppins', 'Roboto', monospace",
      fontWeightLight: 400,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold:'bold',

    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @font-face {
            font-family: 'Poppins';

          }
        `,
      },
    },

  });
export default theme;
