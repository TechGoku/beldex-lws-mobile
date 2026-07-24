import React, { Fragment } from "react";
import { rf } from "../../utils/responsiveFont";
import {
  AppBar,
  Box,
  Typography,
  Toolbar,
  IconButton,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import LogoDark from "../../icons/LogoDark";
import LogoWhite from "../../icons/LogoWhite";
import SettingIconDark from "../../icons/SettingIconDark";
import MenuDark from "../../icons/MenuDark";
import { useSelector } from "react-redux";
import SideDrawer from "../sideDrawer/SideDrawer";
const styles = {
  logoContainer: {
    padding: 0,
    display: "flex",
    gap: 1,
    alignItems: "center",
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  menuIconContainer: {
    marginLeft: "auto",
  },
  // Right-side header actions (theme / settings / menu): evenly spaced
  // chip buttons so they read as controls, not floating glyphs. Shrinks on
  // very small phones so the wallet chip + 2 icon buttons + logo all fit
  // in a 320-360px viewport.
  actionBar: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: { xs: "6px", sm: "10px" },
  },
  actionBtn: {
    // 44px meets the 44x44pt/48x48dp minimum touch-target guideline -
    // the previous 34px on mobile was noticeably under it.
    width: { xs: 44, sm: 44 },
    height: { xs: 44, sm: 44 },
    borderRadius: "0px",
    border: "1px solid",
    borderColor: (theme: any) =>
      theme.palette.mode === "dark" ? "#222222" : "#dddddd",
    backgroundColor: (theme: any) => theme.palette.background.paper,
    "&:hover": {
      borderColor: (theme: any) => theme.palette.primary.main,
      backgroundColor: (theme: any) => theme.palette.background.paper,
    },
  },
  actionBtnActive: {
    borderColor: (theme: any) => theme.palette.primary.main,
    backgroundColor: (theme: any) =>
      theme.palette.mode === "dark"
        ? "rgba(62, 199, 69, 0.12)"
        : "rgba(47, 162, 54, 0.12)",
  },
  appbar: {
    boxShadow: "none",
    background: (theme: any) => theme.palette.background.default,
    // AppBar defaults to primary.contrastText (white), which vanishes on the
    // light background - always use the theme's text color instead.
    color: (theme: any) => theme.palette.text.primary,
    padding: { xs: "10px 12px 5px 12px", sm: "10px 30px 5px 30px" },
    // Standard appBar layer: modals/drawers (1200+) must cover the header.
    // (It used to sit at modal+1, which pinned it above every dialog.)
    zIndex: (theme: any) => theme.zIndex.appBar,
  },
};

const DesktopNavigation = () => {
  const navigate = useNavigate();
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const location = window.location.pathname;


  const titleValidator = () => {
    const defaultTitle = "Home";

    if (!walletDetails.isLogin && (location === '/mywallet' || location === '/')) {
      return defaultTitle;
    }

    switch (location) {
      // case "/":
      //   return "Home";
      case "/settings":
        return "Settings";
      case "/privacy":
        return "Privacy";
      case "/terms":
        return "Terms";
      case "/support":
        return "Support";
      default:
        return "Wallet";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        padding: "0 0 0 100px",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <Typography
        sx={{
          fontSize: rf(15),
          fontFamily: "'Michroma', 'Poppins', sans-serif",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {titleValidator()}
      </Typography>
      <Box>
        {/* <BaseButton label="LOGOUT" variant='contained' cbFunction={() => navigate('/')} /> */}
        {walletDetails.isLogin && (
          <IconButton
            aria-label="Settings"
            sx={{
              ...styles.actionBtn,
              ...(location === "/settings" ? styles.actionBtnActive : {}),
            }}
            onClick={() => navigate("/settings")}
          >
            <SettingIconDark
              styles={{
                width: "18px",
                height: "18px",
                fill: (theme: any) =>
                  location === "/settings"
                    ? theme.palette.primary.main
                    : theme.palette.mode === "dark"
                      ? "#EBEBEB"
                      : "#3a3a3a",
              }}
            />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

const MobileNavigation = () => {
  const [openMenu, setOpenMenu] = React.useState(false);
  const navigate = useNavigate();
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const { wallets, activeId } = useSelector((state: any) => state.walletsReducer);
  const activeName = wallets?.find((w: any) => w.id === activeId)?.name;

  return (
    <React.Fragment>
      <Box sx={styles.actionBar}>
        {/* Extension-style wallet chip: shows the active wallet, tap to switch */}
        {walletDetails.isLogin && activeName && (
          <Box
            component="button"
            onClick={() => navigate("/wallets")}
            sx={{
              // matches the 44px actionBtn touch target it sits beside
              height: { xs: 44, sm: 44 },
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: { xs: "0 8px", sm: "0 12px" },
              maxWidth: { xs: "76px", sm: "110px" },
              cursor: "pointer",
              background: "transparent",
              border: "1px solid",
              borderColor: (theme: any) =>
                theme.palette.mode === "dark" ? "#222222" : "#E4E4E4",
              color: (theme: any) => theme.palette.primary.main,
              fontFamily: "'Space Mono', monospace",
              fontSize: { xs: "11px", sm: "13px" },
              fontWeight: 700,
            }}
          >
            <Box
              component="span"
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {activeName}
            </Box>
            ▾
          </Box>
        )}
        <IconButton
          aria-label="Open menu"
          aria-expanded={openMenu ? "true" : undefined}
          aria-haspopup="true"
          sx={styles.actionBtn}
          onClick={() => setOpenMenu(true)}
        >
          <MenuDark
            styles={{
              width: "20px",
              height: "18px",
              fill: (theme: any) =>
                theme.palette.mode === "dark" ? "#EBEBEB" : "#3a3a3a",
            }}
          />
        </IconButton>
      </Box>
      <SideDrawer open={openMenu} onClose={() => setOpenMenu(false)} />
    </React.Fragment>
  );
};

// Chain sync status, moved out of the Balance card into the header so it reads
// as a global connection indicator. Data is polled by Balance and pushed to
// Redux (seedDetailSlice.setSyncState).
const SyncStatus = () => {
  const { scannedHeight = 0, chainHeight = 0, isLogin, connectionError = false } = useSelector(
    (state: any) => state.seedDetailReducer
  );
  if (!isLogin) return null;
  // Network trouble takes priority over the height readout — show it even at
  // height 0 (e.g. the endpoint is blocked and the very first poll timed out),
  // so a stalled wallet reads as "can't reach server" rather than empty.
  if (connectionError) {
    return (
      <Typography
        sx={{
          fontSize: { xs: rf(9.5), sm: rf(11) },
          fontWeight: 400,
          whiteSpace: "nowrap",
          lineHeight: 1.2,
          color: (theme: any) => theme.palette.error.main,
        }}
      >
        ⚠ No connection
      </Typography>
    );
  }
  if (scannedHeight <= 0) return null;
  const tip = Math.max(scannedHeight, chainHeight);
  const synced = scannedHeight >= tip;
  const pct = tip > 0 ? Math.min(100, (scannedHeight / tip) * 100) : 0;
  return (
    <Typography
      sx={{
        fontSize: { xs: rf(9.5), sm: rf(11) },
        fontWeight: 400,
        whiteSpace: "nowrap",
        lineHeight: 1.2,
        color: (theme: any) =>
          synced ? theme.palette.primary.main : theme.palette.warning.main,
      }}
    >
      {synced
        ? `● ${scannedHeight.toLocaleString()}`
        : `◌ ${scannedHeight.toLocaleString()} · ${pct.toFixed(1)}%`}
    </Typography>
  );
};

const Header = () => {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  return (
    <Fragment>
      <AppBar position="fixed" sx={styles.appbar} elevation={9}>
        <Toolbar disableGutters={true}>
          <Box sx={styles.logoContainer} onClick={() => navigate("/")}>
            {theme.palette.mode === "dark" ? (
              <LogoDark sx={{ width: { xs: "1.8em", sm: "2.2em" }, height: { xs: "1.8em", sm: "2.2em" } }} />
            ) : (
              <LogoWhite sx={{ width: { xs: "1.8em", sm: "2.2em" }, height: { xs: "1.8em", sm: "2.2em" } }} />
            )}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "11px", sm: "14px" },
                  fontFamily: "'Michroma', 'Poppins', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  whiteSpace: "nowrap",
                }}
              >
                {/* Extension brand: just "BELDEX" on mobile so the wallet
                    chip and actions fit on small screens */}
                {isMobileMode ? "Beldex" : <>Beldex&nbsp;Wallet</>}
              </Typography>
              <SyncStatus />
              {!isMobileMode && (
                <Typography sx={{ fontSize: rf(13), fontWeight: 400 }}>
                  {process.env.WEB_VERSION}
                </Typography>
              )}
            </Box>
          </Box>
          {isMobileMode ? <MobileNavigation /> : <DesktopNavigation />}
        </Toolbar>
      </AppBar>
    </Fragment>
  );
};

export default Header;
