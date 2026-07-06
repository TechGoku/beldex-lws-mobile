import React, { Fragment } from "react";
import {
  List,
  AppBar,
  ListItemButton,
  Box,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  Paper,
  Grow,
  Popper,
  IconButton,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import InboxIcon from "@mui/icons-material/Inbox";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import useMediaQuery from "@mui/material/useMediaQuery";
import LogoDark from "../../icons/LogoDark";
import LogoWhite from "../../icons/LogoWhite";
import SettingIconDark from "../../icons/SettingIconDark";
import MoonDark from "../../icons/MoonDark";
import MenuDark from "../../icons/MenuDark";
import { ColorContext } from "../../ColorContext";
import { useSelector } from "react-redux";
import MyWallet from "../../icons/MyWallet";
import Privacy from "../../icons/Privacy";
import Term from "../../icons/Terms";
import Support from "../../icons/Support";
import { MUIWrapperContext } from "../../theme/MUIWrapper";
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
  appbar: {
    boxShadow: "none",
    background: (theme: any) => theme.palette.background.default,
    padding: "10px 30px 5px 30px",
    zIndex: (theme: any) => theme.zIndex.modal + 1,
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
      <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
        {titleValidator()}
      </Typography>
      <Box>
        {/* <BaseButton label="LOGOUT" variant='contained' cbFunction={() => navigate('/')} /> */}
        <IconButton
          sx={styles.menuIconContainer}
          onClick={() => navigate("/settings")}
        >
          {walletDetails.isLogin && (
            <SettingIconDark
              styles={{ fill:location==='/settings'?'#19AD1C' :(theme: any) => theme.palette.secondary.light }}
            />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

const MobileNavigation = () => {
  const [openMenu, setOpenMenu] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const muiUtils: any = React.useContext(MUIWrapperContext);
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const location = window.location.pathname;

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpenMenu(false);
    } else if (event.key === "Escape") {
      setOpenMenu(false);
    }
  }

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpenMenu(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(openMenu);
  React.useEffect(() => {
    if (prevOpen.current === true && openMenu === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = openMenu;
  }, [openMenu]);

  return (
    <React.Fragment>
      <Popper
        open={openMenu}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-start" ? "left top" : "left bottom",
            }}
          >
            <Paper
              sx={{
                // width: "100%",
                maxWidth: 200,
                padding: 2,
                background: (theme: any) => theme.palette.background.paper,
                borderRadius: "25px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <List onKeyDown={handleListKeyDown}>
                  <ListItemButton
                    sx={{
                      m: 0.5,
                      p: 2,
                      maxHeight: "60px",
                      "&.Mui-selected": {
                        // theme.palette.mode
                        background: (theme: any) => theme.palette.common.white,
                        borderRadius: "15px",
                        "&:hover": {
                          background: (theme: any) =>
                            theme.palette.common.white,
                        },
                      },
                    }}
                    onClick={() => {
                      setOpenMenu(false); navigate("/mywallet");
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: "40px" }}>
                      <MyWallet
                        sx={{
                          fill: (theme: any) => theme.palette.secondary.light,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
                        ".MuiListItemText-primary": {
                          fontWeight: "400",
                        },
                      }}
                      primary="Wallet"
                    />
                  </ListItemButton>
                  <ListItemButton
                    sx={{
                      m: 0.5,
                      p: 2,
                      maxHeight: "60px",
                      "&.Mui-selected": {
                        background: (theme: any) => theme.palette.common.white,
                        borderRadius: "15px",
                        "&:hover": {
                          background: (theme: any) =>
                            theme.palette.common.white,
                        },
                      },
                    }}
                    onClick={() => {
                      setOpenMenu(false); navigate("/privacy");
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: "40px" }}>
                      {/* <DraftsIcon
              sx={{ fill: selectedIndex === 1 ? "#00D030" : "#D1D1D3" }}
            /> */}
                      <Privacy
                        sx={{
                          fill: (theme: any) => theme.palette.secondary.light,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
                        ".MuiListItemText-primary": {
                          fontWeight: "400",
                        },
                      }}
                      primary="Privacy"
                    />
                  </ListItemButton>
                  <ListItemButton
                    sx={{
                      m: 0.5,
                      p: 2,
                      maxHeight: "60px",
                      "&.Mui-selected": {
                        background: (theme: any) => theme.palette.common.white,
                        borderRadius: "15px",
                        "&:hover": {
                          background: (theme: any) =>
                            theme.palette.common.white,
                        },
                      },
                    }}
                    onClick={() => {
                      setOpenMenu(false); navigate("/terms");
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: "40px" }}>
                      <Term
                        sx={{
                          fill: (theme: any) => theme.palette.secondary.light,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
                        ".MuiListItemText-primary": {
                          fontWeight: "400",
                        },
                      }}
                      primary="Terms"
                    />
                  </ListItemButton>
                  <ListItemButton
                    sx={{
                      m: 0.5,
                      p: 2,
                      maxHeight: "60px",
                      "&.Mui-selected": {
                        background: (theme: any) => theme.palette.common.white,
                        borderRadius: "15px",
                        "&:hover": {
                          background: (theme: any) =>
                            theme.palette.common.white,
                        },
                      },
                    }}
                    onClick={() => {setOpenMenu(false); navigate("/support")}}
                  >
                    <ListItemIcon sx={{ minWidth: "40px" }}>
                      <Support
                        sx={{
                          fill: (theme: any) => theme.palette.secondary.light,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
                        ".MuiListItemText-primary": {
                          fontWeight: "400",
                        },
                      }}
                      primary="Supports"
                    />
                  </ListItemButton>
                  {/* <ListItemButton
                    sx={{
                      m: 0.5,
                      p: 2,
                      maxHeight: "60px",
                      "&.Mui-selected": {
                        background: (theme: any) => theme.palette.common.white,
                        borderRadius: "15px",
                        "&:hover": {
                          background: (theme: any) =>
                            theme.palette.common.white,
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: "40px" }}>
                      <InboxIcon
                        sx={{
                          fill: (theme: any) => theme.palette.secondary.light,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
                        ".MuiListItemText-primary": {
                          fontWeight: "400",
                        },
                      }}
                      primary="Website"
                    />
                  </ListItemButton> */}
                </List>
                {/* <MenuList
                  autoFocusItem={openMenu}

                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>My account</MenuItem>
                  <MenuItem onClick={handleClose}>Logout</MenuItem>
                </MenuList> */}
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      <IconButton
        sx={styles.menuIconContainer}
        onClick={muiUtils.toggleColorMode}
      >
        <MoonDark
          styles={{
            width: "20px",
            height: "20px",
            fill: (theme: any) =>
              theme.palette.mode === "dark" ? "#D1D1D3" : "#818181",
          }}
        />
      </IconButton>
      {walletDetails.isLogin && (
        <IconButton onClick={() => navigate("/settings")}>
          <SettingIconDark
            styles={{
              width: "20px",
              height: "20px",
              fill:location==='/settings'?'#19AD1C' :(theme: any) => theme.palette.secondary.light

            }}
          />
        </IconButton>
      )}
      <IconButton
        ref={anchorRef}
        id="composition-button"
        aria-controls={openMenu ? "composition-menu" : undefined}
        aria-expanded={openMenu ? "true" : undefined}
        aria-haspopup="true"
        onClick={() => setOpenMenu(!openMenu)}
      >
        <MenuDark
          styles={{
            width: "22px",
            height: "20px",
            fill: (theme: any) =>
              theme.palette.mode === "dark" ? "#D1D1D3" : "#818181",
          }}
        />
      </IconButton>
    </React.Fragment>
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
              <LogoDark sx={{ width: "2.2em", height: "2.2em" }} />
            ) : (
              <LogoWhite sx={{ width: "2.2em", height: "2.2em" }} />
            )}
            <Box>
              <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>
                Beldex&nbsp;Wallet
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 400 }}>
                {process.env.WEB_VERSION}
              </Typography>
            </Box>
          </Box>
          {isMobileMode ? <MobileNavigation /> : <DesktopNavigation />}
        </Toolbar>
      </AppBar>
    </Fragment>
  );
};

export default Header;
