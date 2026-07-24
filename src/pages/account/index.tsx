import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Input,
  Modal,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ToastMsg, { ToastMsgRef } from "../../components/snackbar/ToastMsg";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { walletsSelector, renameWallet } from "../../stores/features/walletsSlice";
import { securitySelector } from "../../stores/features/securitySlice";
import { authenticateBiometric } from "../../services/biometric";
import { copyToClipboard } from "../../services/clipboard";

// Full account page: wallet name + address always visible; the secret keys and
// recovery seed are hidden behind an explicit warning (and a biometric check
// when app lock is on). The front wallet screen only shows the address.
export default function AccountDetails() {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const toastRef = useRef<ToastMsgRef>(null);

  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const { wallets, activeId } = useAppSelector(walletsSelector);
  const security = useAppSelector(securitySelector);
  const activeWallet = wallets.find((w) => w.id === activeId);

  const [revealed, setRevealed] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const toast = (m: string, ok = true) => toastRef.current?.showAlert(m, ok ? "success" : "error");
  const copy = async (t: string) => {
    if (!t) return;
    const ok = await copyToClipboard(t);
    toast(ok ? "Copied" : "Couldn't copy", ok);
  };

  const startReveal = () => setWarnOpen(true);

  const confirmReveal = async () => {
    // If biometrics are enrolled and app-lock uses them, require a check
    // before exposing the seed.
    if (security.biometricEnabled && security.biometryAvailable) {
      const res = await authenticateBiometric("Confirm to view your secret keys");
      if (!res.success) {
        setWarnOpen(false);
        return;
      }
    }
    setRevealed(true);
    setWarnOpen(false);
  };

  const openRename = () => {
    setNameDraft(activeWallet?.name || "");
    setRenameOpen(true);
  };

  const saveRename = async () => {
    if (activeId && nameDraft.trim()) {
      await dispatch(renameWallet({ id: activeId, name: nameDraft.trim() }));
      toast("Wallet renamed");
    }
    setRenameOpen(false);
  };

  const cardSx = {
    background: theme.palette.mode === "dark" ? "#161616" : "#FFFFFF",
    borderRadius: "0px",
    padding: "16px 18px",
    mt: 2,
  };

  const secretSx = {
    color: theme.palette.text.secondary,
    wordBreak: "break-all" as const,
    fontSize: "0.85rem",
    mt: 0.5,
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 330 : 440,
    maxWidth: "92vw",
    bgcolor: theme.palette.background.paper,
    boxShadow: 24,
    p: 4,
    borderRadius: "0px",
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
            onClick={() => navigate(-1)}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>Back</Typography>
        </Box>

        <Box sx={{ maxWidth: 620, mx: "auto", mt: 3, px: isMobileMode ? 2 : 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.3rem" }}>Account Details</Typography>

          {/* Wallet name */}
          <Box sx={cardSx}>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
              Wallet Name
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                {activeWallet?.name || "This Wallet"}
              </Typography>
              <IconButton onClick={openRename} sx={{ color: theme.palette.primary.main }}>
                <EditIcon sx={{ fontSize: "1.2rem" }} />
              </IconButton>
            </Box>
          </Box>

          {/* Address */}
          <Box sx={cardSx}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                Address
              </Typography>
              <IconButton onClick={() => copy(walletDetails.address_string)} sx={{ color: theme.palette.primary.main }}>
                <ContentCopyIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Box>
            <Typography sx={secretSx}>{walletDetails.address_string}</Typography>
          </Box>

          {/* Secrets */}
          <Box sx={{ mt: 3 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <WarningAmberRoundedIcon sx={{ color: "#F5A623", fontSize: "1.3rem" }} />
              <Typography sx={{ fontWeight: 700 }}>Secret Keys & Recovery Seed</Typography>
            </Box>

            {!revealed ? (
              <Box
                sx={{
                  ...cardSx,
                  border: `1px solid ${theme.palette.mode === "dark" ? "#3A3A2A" : "#F0E0C0"}`,
                  textAlign: "center",
                }}
              >
                <VisibilityOffOutlinedIcon sx={{ fontSize: "2rem", color: "#F5A623" }} />
                <Typography sx={{ fontWeight: 600, mt: 1 }}>These are hidden for your safety</Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem", mt: 1 }}>
                  Anyone who sees your recovery seed or spend key can steal all your
                  funds. Never share them. Only reveal them somewhere private.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, borderRadius: "0px", }}
                  onClick={startReveal}
                >
                  Reveal Secrets
                </Button>
              </Box>
            ) : (
              <>
                {walletDetails.mnemonic_string && walletDetails.mnemonic_string !== "N/A" && (
                  <Box sx={cardSx}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography sx={{ fontWeight: 600 }}>Recovery Seed</Typography>
                      <IconButton onClick={() => copy(walletDetails.mnemonic_string)} sx={{ color: theme.palette.primary.main }}>
                        <ContentCopyIcon sx={{ fontSize: "1.1rem" }} />
                      </IconButton>
                    </Box>
                    <Typography sx={secretSx}>{walletDetails.mnemonic_string}</Typography>
                  </Box>
                )}
                <Box sx={cardSx}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontWeight: 600 }}>Secret View Key</Typography>
                    <IconButton onClick={() => copy(walletDetails.sec_viewKey_string)} sx={{ color: theme.palette.primary.main }}>
                      <ContentCopyIcon sx={{ fontSize: "1.1rem" }} />
                    </IconButton>
                  </Box>
                  <Typography sx={secretSx}>{walletDetails.sec_viewKey_string}</Typography>
                </Box>
                <Box sx={cardSx}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography sx={{ fontWeight: 600 }}>Secret Spend Key</Typography>
                    <IconButton onClick={() => copy(walletDetails.sec_spendKey_string)} sx={{ color: theme.palette.primary.main }}>
                      <ContentCopyIcon sx={{ fontSize: "1.1rem" }} />
                    </IconButton>
                  </Box>
                  <Typography sx={secretSx}>{walletDetails.sec_spendKey_string || "N/A"}</Typography>
                </Box>
                <Button
                  variant="text"
                  sx={{ mt: 1, color: theme.palette.text.secondary }}
                  onClick={() => setRevealed(false)}
                  startIcon={<VisibilityOffOutlinedIcon />}
                >
                  Hide secrets
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Warning confirm */}
      <Modal open={warnOpen} onClose={() => setWarnOpen(false)}>
        <Box sx={modalStyle}>
          <Box textAlign="center">
            <WarningAmberRoundedIcon sx={{ fontSize: "3rem", color: "#F5A623" }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", mt: 1 }}>Reveal secrets?</Typography>
            <Typography sx={{ color: theme.palette.text.secondary, mt: 1 }}>
              Make sure no one is watching your screen and you are not being
              recorded. These keys give full control of your funds.
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={3}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "0px", width: 130, color: theme.palette.text.primary }}
              onClick={() => setWarnOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: "0px", width: 130, }}
              onClick={confirmReveal}
            >
              Reveal
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Rename */}
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)}>
        <Box sx={modalStyle}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>Rename Wallet</Typography>
          <Input
            fullWidth
            disableUnderline
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            inputProps={{ maxLength: 30 }}
            sx={{
              mt: 2,
              height: 50,
              px: 2,
              borderRadius: "0px",
              backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
              color: theme.palette.text.primary,
            }}
          />
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={3}>
            <Button variant="contained" color="secondary" sx={{ borderRadius: "0px", width: 130, color: theme.palette.text.primary }} onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" sx={{ borderRadius: "0px", width: 130 }} onClick={saveRename}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <ToastMsg ref={toastRef} />
    </Box>
  );
}
