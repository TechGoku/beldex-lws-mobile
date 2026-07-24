import { useTheme } from "@emotion/react";

import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Link,
  useMediaQuery,
} from "@mui/material";
// import Logo from "../../../icons/Logo.svg";
import LogoDark from "../../../icons/LogoDark";
import LogoWhite from "../../../icons/LogoWhite";

export default function About(props: any) {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Box
      className="About"
      sx={{
        background: theme.palette.success.main,
        width: isMobileMode ? "100%" : "70%",
        padding: isMobileMode ? "20px" : "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: "0px",
      }}
    >
      <Typography
        component="h2"
        className="header"
        textAlign={"center"}
        mb={4}
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 700,
          fontSize: isMobileMode ? "1.15rem" : "1.375rem",
        }}
      >
        About Beldex Wallet
      </Typography>
      {theme.palette.mode === "dark" ? (
        <LogoDark
          sx={{
            width: isMobileMode ? "3em" : "4em",
            height: isMobileMode ? "3em" : "4em",
          }}
        />
      ) : (
        <LogoWhite
          sx={{
            width: isMobileMode ? "3em" : "4em",
            height: isMobileMode ? "3em" : "4em",
          }}
        />
      )}

      <Typography
        component="h2"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 700,
          fontSize: isMobileMode ? "1.15rem" : "1.375rem",
        }}
      >
        Beldex Wallet
      </Typography>
      <Typography
        sx={{
          color: theme.palette.text.secondary,
          fontSize: "0.75rem",
        }}
      >
        {process.env.WEB_VERSION}
      </Typography>

      <Typography
        mt={4}
        sx={{
          color: theme.palette.text.secondary,
          fontSize: "1.1rem",
          textDecoration: "underline",
          cursor: "pointer",
          fontWeight: 400,
        }}
      >
        <Link
          href="https://github.com/Beldex-Coin/beldex-lws-frontend"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: theme.palette.text.secondary }}
        >
          View on GitHub
        </Link>
      </Typography>
      <Box className="logout-btn-wrapper" mt={3}>
        <Button
          variant="contained"
          color="secondary"
          sx={{
            fontWeight: 600,
            // marginRight: "10px",
            // width caps at the design size but shrinks to fit narrow (<=320px)
            // screens so the CTA never overflows its container.
            width: "100%",
            maxWidth: "250px",
            height: "45px",
            borderRadius: "0px",
          }}
          onClick={() => props.setIsPreference()}
        >
          Close
        </Button>
        {/* <Button className="logout-btn" color="secondary">Logout</Button> */}
      </Box>
    </Box>
  );
}
