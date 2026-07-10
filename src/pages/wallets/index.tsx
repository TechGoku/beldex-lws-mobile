import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Modal,
  Backdrop,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { useNavigate } from "react-router-dom";
import ToastMsg, { ToastMsgRef } from "../../components/snackbar/ToastMsg";
import { CoreBridgeInstanceContext } from "../../CoreBridgeInstanceContext";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import {
  walletsSelector,
  fetchWallets,
  switchWallet,
  deleteWallet,
  startAddWallet,
  SavedWallet,
} from "../../stores/features/walletsSlice";

// Manage & switch between saved wallets. Adding a wallet routes to the normal
// import/create flow, which auto-registers the new wallet on login.
export default function Wallets() {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const toastRef = useRef<ToastMsgRef>(null);
  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);

  const { wallets, activeId, loaded } = useAppSelector(walletsSelector);
  const [confirmDelete, setConfirmDelete] = useState<SavedWallet | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loaded) dispatch(fetchWallets());
  }, [loaded, dispatch]);

  const toast = (m: string, ok = true) => toastRef.current?.showAlert(m, ok ? "success" : "error");

  const handleSwitch = async (w: SavedWallet) => {
    if (w.id === activeId) {
      navigate("/mywallet");
      return;
    }
    setBusy(true);
    await dispatch(switchWallet(w.id));
    // Register the newly-active account with the LWS server so it starts
    // scanning, mirroring what the login flow does.
    try {
      coreBridgeInstance.hostedMoneroAPIClient?.LogIn(
        w.address_string,
        w.sec_viewKey_string,
        false,
        () => {}
      );
    } catch {
      /* non-fatal - balance polling will still fetch */
    }
    // Brief hold so the switch reads as a deliberate transition, and the LWS
    // login has a moment to register before the balance screen queries it.
    await new Promise((r) => setTimeout(r, 450));
    setBusy(false);
    navigate("/mywallet");
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await dispatch(deleteWallet(confirmDelete.id));
    const removedActive = confirmDelete.id === activeId;
    setConfirmDelete(null);
    toast("Wallet removed");
    if (removedActive) navigate("/mywallet");
  };

  const truncate = (v: string) => (v.length > 20 ? `${v.slice(0, 12)}…${v.slice(-8)}` : v);

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 320 : 420,
    bgcolor: theme.palette.background.paper,
    boxShadow: 24,
    p: 4,
    borderRadius: "22px",
  };

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "25px",
      }}
    >
      <Box sx={{ padding: isMobileMode ? "0" : "25px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <OutboundIcon
            sx={{ transform: "rotate(225deg)", fontSize: "2rem", cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>Back</Typography>
        </Box>

        <Box sx={{ maxWidth: 620, mx: "auto", mt: 3, px: isMobileMode ? 2 : 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography sx={{ fontWeight: 700, fontSize: "1.3rem" }}>Wallets</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ borderRadius: "10px", color: "#fff" }}
              onClick={() => {
                // Enter "add wallet" mode so the login screens are reachable
                // even though a wallet is already open.
                dispatch(startAddWallet());
                navigate("/");
              }}
            >
              Add
            </Button>
          </Box>

          <Box mt={2}>
            {wallets.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  border: `2px solid ${theme.palette.mode === "dark" ? "#454556" : "#D7D7D7"}`,
                  borderRadius: "12px",
                  p: 4,
                }}
              >
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: "2.5rem", color: "#8787A8" }} />
                <Typography sx={{ fontWeight: 600, mt: 1 }}>No wallets saved yet</Typography>
              </Box>
            ) : (
              wallets.map((w) => {
                const active = w.id === activeId;
                return (
                  <Box
                    key={w.id}
                    onClick={() => !busy && handleSwitch(w)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      mt: 1.5,
                      borderRadius: "16px",
                      cursor: "pointer",
                      background: active
                        ? theme.palette.mode === "dark" ? "#1E3A24" : "#E8F7EA"
                        : theme.palette.mode === "dark" ? "#24242F" : "#FCFCFC",
                      border: active ? "1.5px solid #00D030" : "1.5px solid transparent",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
                      <AccountBalanceWalletOutlinedIcon sx={{ color: active ? "#00D030" : "#8787A8" }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }}>{w.name}</Typography>
                        <Typography sx={{ color: "#8787A8", fontSize: "0.8rem" }}>
                          {truncate(w.address_string)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {active && <CheckCircleIcon sx={{ color: "#00D030", mr: 0.5 }} />}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(w);
                        }}
                      >
                        <DeleteOutlineIcon sx={{ color: "#FC2727", fontSize: "1.2rem" }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <Box sx={modalStyle}>
          <Typography textAlign="center" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Remove “{confirmDelete?.name}”?
          </Typography>
          <Typography textAlign="center" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            This only removes it from this device. Make sure you have its recovery
            seed saved — you'll need it to restore this wallet.
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} mt={3}>
            <Button variant="contained" color="secondary" sx={{ borderRadius: "10px", width: 130, color: theme.palette.text.primary }} onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="contained" color="error" sx={{ borderRadius: "10px", width: 130, color: "#fff" }} onClick={handleDelete}>
              Remove
            </Button>
          </Box>
        </Box>
      </Modal>

      <Backdrop open={busy} sx={{ zIndex: (t) => t.zIndex.modal + 5, color: "#00D030" }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <ToastMsg ref={toastRef} />
    </Box>
  );
}
