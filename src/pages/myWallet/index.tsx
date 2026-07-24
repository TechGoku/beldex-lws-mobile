import { Box, Button, Fade, Typography, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect } from "react";
import SendFund from "./SendFund";
import Balance from "./Balance";
import WalletAddressAndKeys from "./WalletAddressAndKeys";
import TransactionHistory from "./TransactionHistory";
import PullToRefresh from "../../components/pullToRefresh/PullToRefresh";
import userIdleTimerController from "../settings/AppTimeoutSlider/userIdleTimerController";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../stores/hooks";
import { registerActiveWallet } from "../../stores/features/walletsSlice";
import { rf } from "../../utils/responsiveFont";

const MyWallet = () => {
  const theme: any = useTheme();
  // Matches the app shell's own mobile/desktop split (App.tsx, Header, NavBar
  // all switch at `sm`) so this page never renders mobile-style content next
  // to the desktop sidebar, or vice versa.
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  // Between sm and md (~600-899px, e.g. a tablet in portrait) there isn't
  // room for the desktop layout's fixed 450px SendFund column next to the
  // 225px NavBar - stack the panels instead of sitting them side by side.
  const isCompactDesktop = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const dispatch = useAppDispatch();
  // Auto-lock the app after inactivity (no-op unless a PIN is set).
  userIdleTimerController();

  const navigate = useNavigate();
  // Extension-style navigation: one dashboard with Send / Receive as
  // separate views instead of bottom tabs.
  const [view, setView] = useState<"home" | "send" | "receive">("home");
  const [sendPrefill, setSendPrefill] = useState<{ address: string; paymentId?: string } | null>(null);
  // Bumped by pull-to-refresh; Balance and TransactionHistory refetch on change.
  const [refreshSignal, setRefreshSignal] = useState(0);

  // Register the logged-in wallet into the saved-wallets list (no-op if it's
  // already there). Every login path lands here, so this is the single hook.
  useEffect(() => {
    if (walletDetails.isLogin && walletDetails.address_string) {
      dispatch(
        registerActiveWallet({
          address_string: walletDetails.address_string,
          sec_viewKey_string: walletDetails.sec_viewKey_string,
          pub_viewKey_string: walletDetails.pub_viewKey_string,
          sec_spendKey_string: walletDetails.sec_spendKey_string,
          pub_spendKey_string: walletDetails.pub_spendKey_string,
          mnemonic_string: walletDetails.mnemonic_string,
          sec_seed_string: walletDetails.sec_seed_string,
          mnemonic_language: walletDetails.mnemonic_language,
        })
      );
    }
  }, [walletDetails.address_string, walletDetails.isLogin]);

  useEffect(() => {
    const handlePopstate = (event: any) => {
      window.history.pushState(null, document.title, window.location.href);
    };

    // Attach the event listener
    window.addEventListener("popstate", handlePopstate);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("popstate", handlePopstate);
      // window.removeEventListener('unload', handleTabClose);
    };

    // The dependency array is empty to mimic componentDidMount
  }, []);

  // Mobile: extension-style layout — one dashboard (balance, Send/Receive
  // buttons, scrollable history) with Send and Receive as separate views.
  // Contacts live in the side drawer; there is no bottom tab bar.
  if (isMobileMode) {
    const backRow = (
      <Box
        onClick={() => setView("home")}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          mb: 1.5,
          width: "fit-content",
        }}
      >
        <ArrowBackIcon sx={{ fontSize: "1.2rem" }} />
        <Typography sx={{ fontWeight: 700 }}>Back</Typography>
      </Box>
    );

    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* key remounts the Fade per view so each switch animates in */}
        <Fade in key={view} timeout={250}>
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {view === "home" && (
              <PullToRefresh
                onRefresh={async () => {
                  setRefreshSignal((s) => s + 1);
                  // brief hold so the spinner registers even on fast fetches
                  await new Promise((r) => setTimeout(r, 700));
                }}
              >
                <Balance refreshSignal={refreshSignal} />
                {/* Extension home: ↑ Send / ↓ Receive primary buttons */}
                <Box sx={{ display: "flex", gap: "10px", mt: "12px" }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ height: "48px", fontSize: rf(15) }}
                    onClick={() => setView("send")}
                  >
                    ↑ Send
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ height: "48px", fontSize: rf(15) }}
                    onClick={() => setView("receive")}
                  >
                    ↓ Receive
                  </Button>
                </Box>
                {/* History gets the vertical space left; its list scrolls */}
                <TransactionHistory refreshSignal={refreshSignal} />
              </PullToRefresh>
            )}

            {view === "send" && (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  background: theme.palette.success.main,
                  borderRadius: "0px",
                  padding: "12px 4px",
                }}
              >
                <Box sx={{ px: "12px" }}>{backRow}</Box>
                <SendFund
                  prefill={sendPrefill}
                  onPrefillConsumed={() => setSendPrefill(null)}
                />
              </Box>
            )}

            {view === "receive" && (
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {backRow}
                <WalletAddressAndKeys />
              </Box>
            )}
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minWidth: "calc(100% - 250px)",
        background: theme.palette.background.paper,
        borderRadius: "0px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isCompactDesktop ? "column" : "row",
          gap: "20px",
          // minHeight: "100%",
          height: isCompactDesktop ? "auto" : "100%",
          minHeight: "100%",
          padding: "20px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Box sx={{
          width: "100%",
          display: 'flex',
          flexDirection: 'column',
          height: isCompactDesktop ? "auto" : "100%",
          overflow: isCompactDesktop ? "visible" : "hidden",
        }}>
          <Balance />
          <WalletAddressAndKeys />
          <TransactionHistory />
        </Box>
        <Box
          sx={{
            width: isCompactDesktop ? "100%" : "450px",
            minWidth: isCompactDesktop ? "auto" : "450px",
            background: (theme) => theme.palette.success.main,
            borderRadius: "0px",
            padding: '30px 10px',
            boxSizing: "border-box",
          }}
        >
          <SendFund />
        </Box>
      </Box>
    </Box>
  );
};

export default MyWallet;
