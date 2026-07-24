import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import SupportIcon from "../../icons/SupportIcon";
import GitHupDark from "../../icons/GitHupDark";
import TelegramIcon from "../../icons/TelegramIcon";
import DiscordDark from "../../icons/DiscordDark";
import { rf } from "../../utils/responsiveFont";
const Support = () => {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const handleOpenNewTab = (url: any) => {
    // Replace 'your-link-here' with the desired URL

    window.open(url, '_blank');
  };

  const iconBoxStyle = {
    // Blend with the app's dot-grid background instead of sitting inside a flat
    // grey card. A subtle hover wash keeps the tap affordance.
    backgroundColor: "transparent",
    width: { xs: "78px", sm: "100px" },
    height: { xs: "78px", sm: "100px" },
    borderRadius: "12px",
    textAlign: "center",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 0.75,
    cursor: 'pointer',
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)"
    }
  }

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "0px",
      }}
    >
      <Box sx={{ height: "calc(100dvh - 107px)", overflowY: "auto" }}>
        {/* <Typography
        sx={{
          color: theme.palette.text.primary,
          fontSize: rf(20),
          fontWeight: 700,
          margin:isMobileMode?"40px 40px 0": "40px 40px 25px",
          textAlign:'center'
        }}
      >
        Support
      </Typography> */}
        <Box
          sx={{
            color: theme.palette.text.primary,
            fontSize: rf(20),
            margin: isMobileMode ? 'unset' : "0px 40px 40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90%",
            flexDirection: "column",
          }}
        >
          <Box>
            <SupportIcon sx={{ width:isMobileMode?'clamp(140px, 50vw, 220px)':"23rem", height:isMobileMode?'clamp(140px, 50vw, 220px)':"20rem"}} />
          </Box>
          <Box mt={1} sx={{ display: "flex", width: isMobileMode ? "100%" : '425px', maxWidth: isMobileMode ? "340px" : "425px", marginX: "auto", justifyContent: 'space-around', gap: 1 }}>
            <Box
              sx={iconBoxStyle}
              onClick={() => handleOpenNewTab('https://discord.com/invite/Hj4MAmA5gs')}
            >
              <DiscordDark sx={{ width: "3rem", height: "3rem" }} />
              <Typography sx={{ textAlign: "center" }}>Discord</Typography>
            </Box>
            <Box
              sx={iconBoxStyle}

              onClick={() => handleOpenNewTab('https://t.me/official_beldex')}

            >
              <TelegramIcon sx={{ width: "3rem", height: "3rem" }} />

              <Typography sx={{ textAlign: "center" }}>Telegram</Typography>
            </Box>
            <Box
              sx={iconBoxStyle}

              onClick={() => handleOpenNewTab('https://github.com/Beldex-Coin/beldex-lws-frontend')}

            >
              <GitHupDark sx={{ width: "3rem", height: "3rem" }} />
              <Typography sx={{ textAlign: "center" }}>Github</Typography>
            </Box>
          </Box>

          {/* <Box sx={{width:isMobileMode ?"unset":'50%'}}> */}
          {/* <Typography mt={3} sx={{fontWeight:700,fontSize:'1.8rem'}}>
            Reach out to our support team via the following channels.
          </Typography>{" "}
          <Typography  sx={{fontWeight:700,fontSize:'1.8rem'}}>
            Our admins will never contact you first!
          </Typography>
          <Typography mt={5}>
           <Typography component={'span'} sx={{fontWeight:600,fontSize:'1.2rem'}}>Discord </Typography>:  https://discord.com/invite/Hj4MAmA5gs
          </Typography>
          <Typography mt={2}> <Typography component={'span'} sx={{fontWeight:600,fontSize:'1.2rem'}}>Telegram </Typography> : https://t.me/official_beldex</Typography>
          <Typography mt={2} sx={{color:'#2fa236'}}><Typography component={'span'} sx={{color:(theme)=>theme.palette.text.primary, fontWeight:600,fontSize:'1.2rem'}}>E-mail </Typography>: support@beldex.io</Typography> */}
          {/* </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default Support;
