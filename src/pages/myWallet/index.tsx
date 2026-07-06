import { Box, useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState, useEffect } from "react";
import SendFund from "./SendFund";
import Balance from "./Balance";
import WalletAddressAndKeys from "./WalletAddressAndKeys";
import TransactionHistory from "./TransactionHistory";
import AddressBook from "./AddressBook";
import BottomNav, { WalletTab } from "../../components/bottomNav/BottomNav";
import userIdleTimerController from "../settings/AppTimeoutSlider/userIdleTimerController";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const MyWallet = () => {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("md"));
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  walletDetails.timer !== 1500 && userIdleTimerController();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WalletTab>("wallet");
  const [sendPrefill, setSendPrefill] = useState<{ address: string; paymentId?: string } | null>(null);

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

  // Mobile: bottom-tab layout - one full-height screen per tab instead of
  // stacking every panel into a single long scroll.
  if (isMobileMode) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          // keep content clear of the fixed bottom navigation bar
          paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        {activeTab === "wallet" && (
          <>
            <Balance />
            <WalletAddressAndKeys />
          </>
        )}

        {activeTab === "send" && (
          <Box
            sx={{
              background: theme.palette.success.main,
              borderRadius: "25px",
              padding: "20px 6px",
            }}
          >
            <SendFund
              prefill={sendPrefill}
              onPrefillConsumed={() => setSendPrefill(null)}
            />
          </Box>
        )}

        {activeTab === "contacts" && (
          <Box
            sx={{
              background: theme.palette.background.paper,
              borderRadius: "20px",
              padding: "16px",
            }}
          >
            <AddressBook
              onSelect={(entry) => {
                setSendPrefill({ address: entry.address, paymentId: entry.paymentId });
                setActiveTab("send");
              }}
            />
          </Box>
        )}

        {activeTab === "history" && <TransactionHistory />}

        <BottomNav value={activeTab} onChange={setActiveTab} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minWidth: "calc(100% - 250px)",
        background: theme.palette.background.paper,
        borderRadius: "25px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "20px",
          // minHeight: "100%",
          height: '100%',
          padding: "20px",
          overflow: 'hidden'
        }}
      >
        <Box sx={{
          width: "100%",
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}>
          <Balance />
          <WalletAddressAndKeys />
          <TransactionHistory />
        </Box>
        <Box
          sx={{
            width: "450px",
            minWidth: "450px",
            background: (theme) => theme.palette.success.main,
            borderRadius: "25px",
            padding: '30px 10px',
          }}
        >
          <SendFund />
        </Box>
      </Box>
    </Box>
  );
};

export default MyWallet;
