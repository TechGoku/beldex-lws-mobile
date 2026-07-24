import React, { useState } from "react";
import { rf } from "../../utils/responsiveFont";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import About from "../../pages/settings/About";
import { useAppDispatch } from "../../stores/hooks";
import { setUserLogout } from "../../stores/features/seedDetailSlice";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface DrawerItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  right?: React.ReactNode;
}

// Single navigation hub: the old hamburger dropdown (Wallet / Privacy /
// Terms / Support) and the Settings screen merged into one slide-in panel.
export default function SideDrawer({ open, onClose }: SideDrawerProps) {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isLogin = useSelector(
    (state: any) => state.seedDetailReducer.isLogin
  );

  const [showAbout, setShowAbout] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isDark = theme.palette.mode === "dark";

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const logout = () => {
    setLogoutOpen(false);
    onClose();
    dispatch(setUserLogout());
    navigate("/");
  };

  const sections: { label?: string; items: DrawerItem[] }[] = [
    ...(isLogin
      ? [
          {
            items: [
              {
                label: "My Wallet",
                icon: <HomeOutlinedIcon />,
                path: "/mywallet",
              },
            ],
          },
          {
            label: "Wallet",
            items: [
              {
                label: "Wallets",
                icon: <AccountBalanceWalletOutlinedIcon />,
                path: "/wallets",
              },
              {
                label: "Transactions",
                icon: <ReceiptLongOutlinedIcon />,
                path: "/transactions",
              },
              {
                label: "Account Details",
                icon: <PersonOutlineIcon />,
                path: "/account",
              },
              {
                label: "Saved Addresses",
                icon: <ContactsOutlinedIcon />,
                path: "/addressbook",
              },
            ],
          },
          {
            label: "Security",
            items: [
              {
                label: "App Lock",
                icon: <LockOutlinedIcon />,
                path: "/security",
              },
            ],
          },
        ]
      : []),
    // Server config stays reachable while logged out on purpose: users may
    // need to point at their own LWS endpoint before creating/importing a
    // wallet (the /server route is unguarded for the same reason).
    {
      label: "Network",
      items: [
        {
          label: "Server / Node & Proxy",
          icon: <DnsOutlinedIcon />,
          path: "/server",
        },
      ],
    },
    {
      label: "Info",
      items: [
        { label: "Privacy", icon: <PrivacyTipOutlinedIcon />, path: "/privacy" },
        { label: "Terms", icon: <DescriptionOutlinedIcon />, path: "/terms" },
        { label: "Support", icon: <SupportAgentOutlinedIcon />, path: "/support" },
      ],
    },
    {
      label: "App",
      items: [
        {
          label: "About Beldex Wallet",
          icon: <InfoOutlinedIcon />,
          action: () => setShowAbout(true),
        },
      ],
    },
  ];

  const rowSx = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 1.5,
    py: 1.4,
    cursor: "pointer",
    borderRadius: "0px",
    backgroundColor: active
      ? isDark
        ? "rgba(62, 199, 69, 0.12)"
        : "rgba(47, 162, 54, 0.12)"
      : "transparent",
    "&:active": {
      backgroundColor: isDark ? "#161616" : "#00000008",
    },
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (t: any) => t.zIndex.modal + 2 }}
      PaperProps={{
        sx: {
          width: 300,
          maxWidth: "85vw",
          borderRadius: 0,
          borderLeft: "1px solid",
          borderColor: "divider",
          background: theme.palette.background.default,
          paddingBottom: "env(safe-area-inset-bottom)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          Menu
        </Typography>
        <IconButton aria-label="Close menu" onClick={onClose} size="small">
          <CloseRoundedIcon
            sx={{ color: theme.palette.text.secondary, fontSize: rf(20) }}
          />
        </IconButton>
      </Box>

      <Box sx={{ overflowY: "auto", px: 1.5, pb: 2, flex: 1 }}>
        {sections.map((section, si) => (
          <Box key={section.label ?? si}>
            {section.label && (
              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  mt: 2,
                  mb: 0.5,
                  ml: 1,
                }}
              >
                {section.label}
              </Typography>
            )}
            <Box
              sx={{
                background: theme.palette.background.paper,
                borderRadius: "0px",
                p: 0.5,
                mt: section.label ? 0 : 1,
              }}
            >
              {section.items.map((item) => {
                const active = !!item.path && location.pathname === item.path;
                return (
                  <Box
                    key={item.label}
                    sx={rowSx(active)}
                    onClick={() =>
                      item.path ? go(item.path) : item.action?.()
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        color: active
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                        "& svg": { fontSize: rf(20) },
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: "0.9rem",
                        fontWeight: active ? 600 : 400,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {item.label}
                    </Typography>
                    {item.right !== undefined
                      ? item.right
                      : item.path && (
                          <ChevronRightIcon
                            sx={{ color: "#8a8a8a", fontSize: rf(18) }}
                          />
                        )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}

        {isLogin && (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<LogoutIcon />}
            sx={{
              mt: 3,
              height: 46,
              borderRadius: "0px",
              color: "#ff5c5c",
              fontWeight: 600,
            }}
            onClick={() => setLogoutOpen(true)}
          >
            Log out
          </Button>
        )}
      </Box>

      <Modal
        open={showAbout}
        onClose={() => setShowAbout(false)}
        sx={{ zIndex: (t: any) => t.zIndex.modal + 3 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(400px, 92vw)",
            outline: "none",
          }}
        >
          <About setIsPreference={() => setShowAbout(false)} />
        </Box>
      </Modal>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        sx={{ zIndex: (t: any) => t.zIndex.modal + 3 }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(320px, 92vw)",
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: "0px",
          }}
        >
          <Typography
            textAlign="center"
            sx={{ fontWeight: 700, fontSize: "1.2rem" }}
          >
            Log out?
          </Typography>
          <Typography
            textAlign="center"
            sx={{ mt: 1, color: theme.palette.text.secondary }}
          >
            This signs out of the active wallet. Your saved wallets stay on
            this device — you can switch back anytime.
          </Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={3}>
            <Button
              variant="contained"
              color="secondary"
              sx={{
                borderRadius: "0px",
                width: "min(110px, 40vw)",
                color: theme.palette.text.primary,
              }}
              onClick={() => setLogoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ borderRadius: "0px", width: "min(110px, 40vw)" }}
              onClick={logout}
            >
              Log out
            </Button>
          </Box>
        </Box>
      </Modal>
    </Drawer>
  );
}
