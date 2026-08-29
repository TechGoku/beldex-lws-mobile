import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import About from "./About";
import { useAppDispatch } from "../../stores/hooks";
import { setUserLogout } from "../../stores/features/seedDetailSlice";

interface RowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  right?: React.ReactNode;
}

const Settings = () => {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));

  const [showAbout, setShowAbout] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const logout = () => {
    dispatch(setUserLogout());
    setLogoutOpen(false);
    navigate("/");
  };

  const Row = ({ icon, title, subtitle, onClick, right }: RowProps) => (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 1.75,
        cursor: onClick ? "pointer" : "default",
        "&:not(:last-of-type)": {
          borderBottom: `1px solid ${theme.palette.mode === "dark" ? "#2A2A38" : "#EFEFEF"}`,
        },
        "&:active": onClick
          ? { backgroundColor: theme.palette.mode === "dark" ? "#26263400" : "#00000008" }
          : {},
      }}
    >
      <Box sx={{ color: "#3ec745", display: "flex" }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {right !== undefined ? right : onClick && <ChevronRightIcon sx={{ color: "#8a8a8a" }} />}
    </Box>
  );

  const sectionSx = {
    background: theme.palette.mode === "dark" ? "#161616" : "#FFFFFF",
    borderRadius: "0px",
    overflow: "hidden",
    mt: 1.5,
  };

  const sectionLabelSx = {
    color: theme.palette.text.secondary,
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    mt: 3,
    ml: 1,
  };

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "0px",
      }}
    >
      <Box sx={{ padding: isMobileMode ? "0" : "25px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <OutboundIcon
            sx={{ transform: "rotate(225deg)", fontSize: "2rem", cursor: "pointer" }}
            onClick={() => (showAbout ? setShowAbout(false) : navigate(-1))}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>Back</Typography>
        </Box>

        {showAbout ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <About setIsPreference={() => setShowAbout(false)} />
          </Box>
        ) : (
          <Box sx={{ maxWidth: 620, mx: "auto", mt: 2, px: isMobileMode ? 2 : 0, pb: 4 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>Settings</Typography>

            <Typography sx={sectionLabelSx}>Wallet</Typography>
            <Box sx={sectionSx}>
              <Row
                icon={<AccountBalanceWalletOutlinedIcon />}
                title="Wallets"
                subtitle="Switch or manage saved wallets"
                onClick={() => navigate("/wallets")}
              />
              <Row
                icon={<PersonOutlineIcon />}
                title="Account Details"
                subtitle="Name, address, keys & recovery seed"
                onClick={() => navigate("/account")}
              />
              <Row
                icon={<ContactsOutlinedIcon />}
                title="Saved Addresses"
                subtitle="Your address book"
                onClick={() => navigate("/addressbook")}
              />
              <Row
                icon={<TokenOutlinedIcon />}
                title="My Tokens"
                subtitle="Tokens you registered, and their ids"
                onClick={() => navigate("/tokens")}
              />
            </Box>

            <Typography sx={sectionLabelSx}>Security</Typography>
            <Box sx={sectionSx}>
              <Row
                icon={<LockOutlinedIcon />}
                title="App Lock"
                subtitle="PIN, biometrics & auto-lock"
                onClick={() => navigate("/security")}
              />
            </Box>

            <Typography sx={sectionLabelSx}>Network</Typography>
            <Box sx={sectionSx}>
              <Row
                icon={<DnsOutlinedIcon />}
                title="Server / Node & Proxy"
                subtitle="Custom LWS endpoint and proxy"
                onClick={() => navigate("/server")}
              />
            </Box>

            <Typography sx={sectionLabelSx}>App</Typography>
            <Box sx={sectionSx}>
              <Row
                icon={<InfoOutlinedIcon />}
                title="About Beldex Wallet"
                subtitle={`Version ${process.env.APP_VERSION || ""}`}
                onClick={() => setShowAbout(true)}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<LogoutIcon />}
              sx={{
                mt: 4,
                height: 50,
                borderRadius: "0px",
                color: "#ff5c5c",
                fontWeight: 600,
              }}
              onClick={() => setLogoutOpen(true)}
            >
              Log out
            </Button>
          </Box>
        )}
      </Box>

      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobileMode ? 320 : 440,
            maxWidth: "92vw",
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: "0px",
          }}
        >
          <Typography textAlign="center" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Log out?
          </Typography>
          <Typography textAlign="center" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            This signs out of the active wallet. Your saved wallets stay on this
            device — you can switch back anytime.
          </Typography>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={3}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "0px", width: 130, color: theme.palette.text.primary }}
              onClick={() => setLogoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ borderRadius: "0px", width: 130 }}
              onClick={logout}
            >
              Log out
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Settings;
