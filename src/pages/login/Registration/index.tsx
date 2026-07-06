import React, { useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import coinImg from "../../../icons/coin.png";
import HomeScreenDark from "../../../icons/Home_screen_dark.png";
import HomeScreenLight from "../../../icons/Home_screen_light.png";
import blueImg from "../../../icons/blue.png";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
const mnemonic_languages = require("@bdxi/beldex-locales");

export default function Registration() {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const istabletMode = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  return (
    <Box
      className="registration"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.success.main,
          width: isMobileMode ? "unset" : "79%",
          height: "100%",
          padding: "25px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          marginTop: "50px",
          borderRadius: "20px",
          position: "relative",
        }}
      >
        <Typography
          textAlign="center"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          Beldex Wallet
        </Typography>
        <Box>
          <Box
            sx={{
              width: isMobileMode ? "55px" : "9%",
              position: "absolute",
              left: isMobileMode ? "-15px" : "-35px",
              // width: "11%",
              minWidth: isMobileMode ? "unset" : "70px",
            }}
          >
            <img
              src={coinImg}
              style={{ width: "100%", height: "100%" }}
              alt="coin"
            />
          </Box>
        </Box>
        <Box sx={{ width: "87%", height: "auto", maxWidth: '900px' }} mt={5}>
          <img
            src={theme.palette.mode === 'dark' ? HomeScreenDark : HomeScreenLight}
            style={{ width: "100%", height: "100%" }}
            alt="display"
          />
          {/* <EmptyScreenImageDark styles={{ fontSize: "6rem" }} /> */}
        </Box>
        <Typography
          sx={{
            color: (theme) => theme.palette.text.secondary,
            fontWeight: 400,
            fontSize: isMobileMode ? "0.8rem" : "1rem",
            lineHeight: '2rem'
          }}
        >
          Welcome to Beldex Wallet! Let’s get started :)
        </Typography>

        <Box>
          <Box
            sx={{
              width: isMobileMode ? "44px" : "6%",
              position: "absolute",
              right: isMobileMode ? "-12px" : "-26px",
              bottom: "123px",
              minWidth: isMobileMode ? "unset" : "51px",
            }}
          >
            <img
              src={blueImg}
              style={{ width: "100%", height: "100%" }}
              alt="coin"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          <Button
            variant="contained"
            color="info"
            sx={{
              width: isMobileMode ? "100%" : "200px",
              borderRadius: isMobileMode ? "40px" : "10px",
              fontWeight: 600,
              color: "white",
              height: "50px",
              marginTop: '10px'
            }}
            onClick={() => navigate("/login")}
          >
            Use Existing Wallet
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontWeight: 600,
              // borderRadius: "10px",
              color: "white",
              height: "50px",
              marginLeft: isMobileMode || istabletMode ? "0" : "10px",
              marginTop: isMobileMode ? "10px" : '10px',
              width: isMobileMode ? "100%" : "200px",
              borderRadius: isMobileMode ? "40px" : "10px",
            }}
            onClick={() => navigate("/createNewWallet")}
          >
            Create New Wallet
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
