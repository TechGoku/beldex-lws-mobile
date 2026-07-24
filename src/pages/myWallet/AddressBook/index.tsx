import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, IconButton, Input, Modal, useMediaQuery } from "@mui/material";
import { useTheme } from "@emotion/react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import BaseButton from "../../../components/button/BaseButton";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { rf } from "../../../utils/responsiveFont";
import {
  addressBookSelector,
  addSavedAddress,
  fetchSavedAddresses,
  removeSavedAddress,
  updateSavedAddress,
} from "../../../stores/features/addressBookSlice";
import { SavedAddress } from "../../../services/addressBookStorage";
import { copyToClipboard } from "../../../services/clipboard";
import { looksLikeBnsName, resolveBnsWallet } from "../../../services/bns";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { getNetType } from "../../../services/runtimeConfig";

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

  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Quick filter over label / address / BNS name.
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleAddresses = query
    ? addresses.filter(
        (entry) =>
          entry.label.toLowerCase().includes(query) ||
          entry.address.toLowerCase().includes(query) ||
          (entry.bnsName ?? "").toLowerCase().includes(query)
      )
    : addresses;
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [error, setError] = useState("");
  // Live BNS resolution: typing a name in the address field resolves it via
  // the explorer, and saving stores the resolved wallet address.
  const [bnsResolved, setBnsResolved] = useState<{ name: string; address: string } | null>(null);
  const [bnsResolving, setBnsResolving] = useState(false);
  const [bnsError, setBnsError] = useState("");

  useEffect(() => {
    if (!loaded) dispatch(fetchSavedAddresses());
  }, [loaded, dispatch]);

  useEffect(() => {
    setBnsResolved(null);
    setBnsError("");
    const input = address.trim();
    if (!formOpen || !input || !looksLikeBnsName(input)) return;
    const t = setTimeout(async () => {
      setBnsResolving(true);
      try {
        const resolved = await resolveBnsWallet(input);
        if (resolved) {
          // sanity: the registry must return a valid Beldex address
          coreBridgeInstance.beldex_utils.decode_address(resolved, getNetType());
          setBnsResolved({ name: input.toLowerCase(), address: resolved });
          // A fresh contact named after its BNS name is the sensible default.
          setLabel((prev) => (prev.trim() ? prev : input.toLowerCase()));
        } else {
          setBnsError(`No wallet record for "${input}"`);
        }
      } catch (e: any) {
        setBnsError(`BNS lookup failed: ${e?.message ?? e}`);
      } finally {
        setBnsResolving(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [address, formOpen]);

  const showToast = (message: string, success: boolean) => {
    toastMsgRef.current?.showAlert(message, success ? "success" : "error");
  };

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setAddress("");
    setPaymentId("");
    setError("");
    setBnsResolved(null);
    setBnsError("");
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
    const rawInput = address.trim();
    const isBns = looksLikeBnsName(rawInput);

    if (!trimmedLabel) {
      setError("Please enter a label for this address");
      return;
    }
    if (isBns) {
      if (bnsResolving) {
        setError("Still resolving the BNS name — one moment…");
        return;
      }
      if (!bnsResolved) {
        setError(bnsError || "Could not resolve BNS name");
        return;
      }
    } else if (rawInput.length < 95 || rawInput.length > 106) {
      setError("Invalid Beldex address");
      return;
    }
    // A resolved BNS name stores its wallet address, not the name itself.
    const trimmedAddress = isBns && bnsResolved ? bnsResolved.address : rawInput;
    const bnsName = isBns && bnsResolved ? bnsResolved.name : undefined;

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
          // Keep the remembered name when the address wasn't changed; adopt
          // the new name when the user re-resolved one.
          bnsName:
            bnsName ??
            (existing && existing.address === trimmedAddress ? existing.bnsName : undefined),
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
          bnsName,
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

  const copyText = async (text: string) => {
    const ok = await copyToClipboard(text);
    showToast(ok ? "Copied" : "Couldn't copy", ok);
  };

  const truncateAddress = (value: string) =>
    value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;

  const formModalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 320 : 480,
    maxWidth: "92vw",
    maxHeight: "90vh",
    overflowY: "auto" as const,
    bgcolor: theme.palette.background.paper,
    boxShadow: 24,
    p: 4,
    borderRadius: "0px",
  };

  const inputSx = {
    width: "100%",
    height: "50px",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
    padding: "0 16px",
    borderRadius: "0px",
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
          sx={{ fontWeight: 600, fontSize: rf(18), color: theme.palette.text.primary }}
        >
          Saved Addresses
        </Typography>
        <IconButton onClick={openAddForm} sx={{ color: theme.palette.primary.main }}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Quick search across labels, addresses and BNS names */}
      {addresses.length > 0 && (
        <Box
          mt={1.5}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            padding: "6px 12px",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === "dark" ? "#0d0d0d" : "#fbfbfb",
          }}
        >
          <SearchIcon sx={{ fontSize: "1.1rem", color: theme.palette.text.secondary }} />
          <Input
            placeholder="Search contacts"
            disableUnderline
            fullWidth
            sx={{ fontSize: rf(14), color: theme.palette.text.primary }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      )}

      <Box mt={2}>
        {addresses.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            sx={{
              border: `2px solid ${theme.palette.mode === "dark" ? "#333333" : "#D7D7D7"}`,
              borderRadius: "0px",
              backgroundColor: theme.palette.mode === "dark" ? "#161616" : "#F8F8F8",
              padding: "30px 20px",
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>No saved addresses yet</Typography>
            <Typography mt={1} sx={{ color: "#777777", fontSize: rf(12), textAlign: "center" }}>
              Addresses you save are stored only on this device.
            </Typography>
          </Box>
        ) : visibleAddresses.length === 0 ? (
          <Typography
            mt={2}
            sx={{ color: theme.palette.text.secondary, fontSize: rf(13), textAlign: "center" }}
          >
            No contacts match "{search.trim()}"
          </Typography>
        ) : (
          visibleAddresses.map((entry) => (
            <Box
              key={entry.id}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              pb={2}
              sx={{
                borderBottom: "0.5px solid #8a8a8a",
                cursor: onSelect ? "pointer" : "default",
              }}
              onClick={() => onSelect && onSelect(entry)}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                  {entry.label}
                  {entry.bnsName && (
                    <Typography
                      component="span"
                      sx={{ color: theme.palette.primary.main, fontSize: "0.8rem", ml: 1 }}
                    >
                      BNS: {entry.bnsName}
                    </Typography>
                  )}
                </Typography>
                <Typography sx={{ color: "#8a8a8a", fontSize: "0.85rem" }}>
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
                  <EditIcon sx={{ fontSize: "1.2rem", color: "#8a8a8a" }} />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: "1.2rem", color: "#ff5c5c" }} />
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

          <Typography sx={{ fontWeight: 600 }}>Beldex Address or BNS name</Typography>
          <Input
            placeholder="Beldex Address or BNS name"
            disableUnderline
            multiline
            fullWidth
            sx={{ ...inputSx, height: "auto", minHeight: "70px", padding: "10px 16px" }}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {bnsResolving && (
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem", mt: -1, mb: 2 }}>
              Resolving name…
            </Typography>
          )}
          {bnsResolved && !bnsResolving && (
            <Typography
              sx={{
                color: theme.palette.primary.main,
                fontSize: "0.85rem",
                wordBreak: "break-all",
                mt: -1,
                mb: 2,
              }}
            >
              ✓ {bnsResolved.name} → {bnsResolved.address.slice(0, 10)}…{bnsResolved.address.slice(-10)}
            </Typography>
          )}
          {bnsError && !bnsResolving && (
            <Typography sx={{ color: "#f5a623", fontSize: "0.85rem", mt: -1, mb: 2 }}>
              {bnsError}
            </Typography>
          )}

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
            <Typography sx={{ color: "#ff5c5c", fontSize: "0.9rem", mb: 2 }}>{error}</Typography>
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
