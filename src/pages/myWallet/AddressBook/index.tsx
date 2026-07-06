import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Input, Modal, useMediaQuery } from "@mui/material";
import { useTheme } from "@emotion/react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import BaseButton from "../../../components/button/BaseButton";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import {
  addressBookSelector,
  addSavedAddress,
  fetchSavedAddresses,
  removeSavedAddress,
  updateSavedAddress,
} from "../../../stores/features/addressBookSlice";
import { SavedAddress } from "../../../services/addressBookStorage";

interface AddressBookProps {
  // When provided, the address book acts as a picker: tapping a saved
  // address calls this instead of just displaying it.
  onSelect?: (entry: SavedAddress) => void;
}

export default function AddressBook({ onSelect }: AddressBookProps) {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const { addresses, loaded } = useAppSelector(addressBookSelector);
  const toastMsgRef = useRef<ToastMsgRef>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loaded) dispatch(fetchSavedAddresses());
  }, [loaded, dispatch]);

  const showToast = (message: string, success: boolean) => {
    toastMsgRef.current?.showAlert(message, success ? "success" : "error");
  };

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setAddress("");
    setPaymentId("");
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (entry: SavedAddress) => {
    setEditingId(entry.id);
    setLabel(entry.label);
    setAddress(entry.address);
    setPaymentId(entry.paymentId || "");
    setError("");
    setFormOpen(true);
  };

  const handleSave = async () => {
    const trimmedLabel = label.trim();
    const trimmedAddress = address.trim();

    if (!trimmedLabel) {
      setError("Please enter a label for this address");
      return;
    }
    if (trimmedAddress.length < 95 || trimmedAddress.length > 106) {
      setError("Invalid Beldex address");
      return;
    }
    const duplicate = addresses.find(
      (item) => item.address === trimmedAddress && item.id !== editingId
    );
    if (duplicate) {
      setError("This address is already saved");
      return;
    }

    if (editingId) {
      const existing = addresses.find((item) => item.id === editingId);
      await dispatch(
        updateSavedAddress({
          id: editingId,
          label: trimmedLabel,
          address: trimmedAddress,
          paymentId: paymentId.trim() || undefined,
          createdAt: existing ? existing.createdAt : Date.now(),
        })
      );
      showToast("Address updated", true);
    } else {
      await dispatch(
        addSavedAddress({
          label: trimmedLabel,
          address: trimmedAddress,
          paymentId: paymentId.trim() || undefined,
        })
      );
      showToast("Address saved", true);
    }
    setFormOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await dispatch(removeSavedAddress(id));
    showToast("Address removed", true);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied", true);
  };

  const truncateAddress = (value: string) =>
    value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;

  const formModalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 320 : 480,
    bgcolor: theme.palette.background.paper,
    boxShadow: 24,
    p: 4,
    borderRadius: "22px",
  };

  const inputSx = {
    width: "100%",
    height: "50px",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
    padding: "0 16px",
    borderRadius: "12px",
    marginTop: "8px",
    marginBottom: "16px",
  };

  return (
    <Box className="addressBook" sx={{ height: "100%" }}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          sx={{ fontWeight: 600, fontSize: "18px", color: theme.palette.text.primary }}
        >
          Saved Addresses
        </Typography>
        <IconButton onClick={openAddForm} sx={{ color: theme.palette.primary.main }}>
          <AddIcon />
        </IconButton>
      </Box>

      <Box mt={2}>
        {addresses.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            sx={{
              border: `2px solid ${theme.palette.mode === "dark" ? "#454556" : "#D7D7D7"}`,
              borderRadius: "8px",
              backgroundColor: theme.palette.mode === "dark" ? "#2E2E3C" : "#F8F8F8",
              padding: "30px 20px",
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>No saved addresses yet</Typography>
            <Typography mt={1} sx={{ color: "#82828D", fontSize: "12px", textAlign: "center" }}>
              Addresses you save are stored only on this device.
            </Typography>
          </Box>
        ) : (
          addresses.map((entry) => (
            <Box
              key={entry.id}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              pb={2}
              sx={{
                borderBottom: "0.5px solid #8787A8",
                cursor: onSelect ? "pointer" : "default",
              }}
              onClick={() => onSelect && onSelect(entry)}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                  {entry.label}
                </Typography>
                <Typography sx={{ color: "#8787A8", fontSize: "0.85rem" }}>
                  {truncateAddress(entry.address)}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="row" alignItems="center">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    copyText(entry.address);
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: "1.2rem", color: theme.palette.primary.main }} />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditForm(entry);
                  }}
                >
                  <EditIcon sx={{ fontSize: "1.2rem", color: "#8787A8" }} />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: "1.2rem", color: "#FC2727" }} />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Modal open={formOpen} onClose={() => setFormOpen(false)}>
        <Box sx={formModalStyle}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingId ? "Edit Address" : "Save New Address"}
            </Typography>
            <IconButton onClick={() => setFormOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography mt={2} sx={{ fontWeight: 600 }}>Label</Typography>
          <Input
            placeholder="e.g. Exchange, Friend, Savings"
            disableUnderline
            fullWidth
            sx={inputSx}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <Typography sx={{ fontWeight: 600 }}>Beldex Address</Typography>
          <Input
            placeholder="Beldex Address"
            disableUnderline
            multiline
            fullWidth
            sx={{ ...inputSx, height: "auto", minHeight: "70px", padding: "10px 16px" }}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Typography sx={{ fontWeight: 600 }}>Payment ID (optional)</Typography>
          <Input
            placeholder="Payment ID"
            disableUnderline
            fullWidth
            sx={inputSx}
            inputProps={{ maxLength: 16 }}
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
          />

          {error && (
            <Typography sx={{ color: "#FC2727", fontSize: "0.9rem", mb: 2 }}>{error}</Typography>
          )}

          <Box display="flex" flexDirection="row" justifyContent="center" mt={1}>
            <BaseButton
              variant="contained"
              color="secondary"
              label="Cancel"
              cbFunction={() => setFormOpen(false)}
            />
            <Box ml={2}>
              <BaseButton variant="contained" color="primary" label="Save" cbFunction={handleSave} />
            </Box>
          </Box>
        </Box>
      </Modal>

      <ToastMsg ref={toastMsgRef} />
    </Box>
  );
}
