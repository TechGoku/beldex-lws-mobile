import React, { useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import Registration from "./Registration";
// import coreBridgeInstance from '@bdxi/beldex-app-bridge';
import SignUp from './SignUp';
import DisplaySeed from './DisplaySeed';
import AuthSeed from "./AuthSeed";

const Home = () => {

  useEffect(() => { initialSetUp() }, []);
  const theme = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const initialSetUp = async () => {
    // const coreBridgeInstance = await require('@bdxi/beldex-app-bridge')({});
  }

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "25px",
      }}
    >
      <Registration />
    </Box>
  )
}

export default Home;