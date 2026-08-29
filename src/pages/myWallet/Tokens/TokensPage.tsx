import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import { useNavigate } from "react-router-dom";
import Tokens from "./index";

export default function TokensPage() {
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
      }}
    >
      <Box sx={{ padding: isMobileMode ? "0" : "25px" }}>
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <OutboundIcon
            sx={{ transform: "rotate(225deg)", fontSize: "2rem", cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>
            Back
          </Typography>
        </Box>
        <Box sx={{ width: "100%", marginTop: "30px" }}>
          <Tokens />
        </Box>
      </Box>
    </Box>
  );
}
