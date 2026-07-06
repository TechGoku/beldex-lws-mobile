import React, { useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import PreferenceSetting from "./PreferenceSetting";
import OutboundIcon from "@mui/icons-material/Outbound";
import { useNavigate } from "react-router-dom";
import About from "./About";

const Settings = () => {
  const [isPreference, setIsPreference] = useState(true);
  const navigate = useNavigate();
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
    className="appWrapper"
    sx={{
      minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
      background: isMobileMode ? "unset" : theme.palette.background.paper,
      borderRadius: "25px",
    }}
  >
    <Box sx={{ padding:isMobileMode?"0":"25px" }}>
      <Box sx={{ display: "flex", flexDirection: 'row', alignItems: 'center' }}>
        <OutboundIcon
          sx={{
            transform: "rotate(225deg)",
            fontSize: "2rem",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
        />
        <Typography ml={1} sx={{ fontWeight: 600 }}>
          Back
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: "60px",
        }}
      >
        {isPreference ? <PreferenceSetting  setIsPreference={()=>setIsPreference(false)}/> : <About setIsPreference={()=>setIsPreference(true)} />}
      </Box>
      {/* <Typography  sx={{color: 'white',fontSize: '20px',textAlign: 'center',fontWeight: 500,margin: '40px'}}>Settings Page</Typography> */}
    </Box>
    </Box>
  );
};

export default Settings;
