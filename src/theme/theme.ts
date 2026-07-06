
import { createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
      primary:{
        main: "#00D030"
      },
      secondary: {
        main: "#444455",
        
      },
      info: {
        main: "#2879FB"
      },
      error: {
        main: "#E22B2B"
      }
    },
    typography: {
      fontFamily: 'Poppins',
      fontWeightLight: 300,
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