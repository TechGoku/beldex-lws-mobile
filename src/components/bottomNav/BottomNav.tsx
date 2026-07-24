import React from "react";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CallMadeIcon from "@mui/icons-material/CallMade";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

export type WalletTab = "wallet" | "send" | "contacts" | "history";

interface BottomNavProps {
  value: WalletTab;
  onChange: (tab: WalletTab) => void;
}

// Fixed bottom tab bar for the mobile wallet layout. Rendered only on small
// screens (the desktop layout keeps the side-by-side panels).
export default function BottomNav({ value, onChange }: BottomNavProps) {
  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderRadius: 0,
        borderTop: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        // keep the bar clear of iOS home indicator / Android gesture area
        paddingBottom: "env(safe-area-inset-bottom)",
        background: (theme) => theme.palette.background.paper,
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue: WalletTab) => onChange(newValue)}
        sx={{
          background: "transparent",
          height: "64px",
          "& .MuiBottomNavigationAction-root": {
            color: (theme) => theme.palette.text.secondary,
            minWidth: "64px",
          },
          "& .Mui-selected, & .Mui-selected .MuiBottomNavigationAction-label": {
            color: (theme) => theme.palette.primary.main,
            fontWeight: 700,
          },
        }}
      >
        <BottomNavigationAction label="Wallet" value="wallet" icon={<AccountBalanceWalletOutlinedIcon />} />
        <BottomNavigationAction label="Send" value="send" icon={<CallMadeIcon />} />
        <BottomNavigationAction label="Contacts" value="contacts" icon={<ContactsOutlinedIcon />} />
        <BottomNavigationAction label="History" value="history" icon={<ReceiptLongOutlinedIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
