import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import { useNavigate } from "react-router-dom";
import TransactionHistory from "./index";

// Full-page transaction history, reachable from the side drawer. The
// dashboard shows the same list inline; this page gives it the whole frame.
export default function TransactionsPage() {
  const navigate = useNavigate();
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "0px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          padding: isMobileMode ? "0" : "25px",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <OutboundIcon
            sx={{ transform: "rotate(225deg)", fontSize: "2rem", cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>
            Back
          </Typography>
        </Box>
        {/* fills the rest of the frame; the list scrolls internally.
            Export-CSV lives here (full-page view), not on the compact dashboard. */}
        <TransactionHistory showExport />
      </Box>
    </Box>
  );
}
