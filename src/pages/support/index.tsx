import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import SupportIcon from "../../icons/SupportIcon";
import SupportIconWhite from "../../icons/SupportIconWhite";
import GitHupDark from "../../icons/GitHupDark";
import GitHupWhite from "../../icons/GitHupWhite";
import TelegramIcon from "../../icons/TelegramIcon";
import DiscordDark from "../../icons/DiscordDark";
import DiscordWhite from "../../icons/DiscordWhite";
const Support = () => {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const handleOpenNewTab = (url: any) => {
    // Replace 'your-link-here' with the desired URL

    window.open(url, '_blank');
  };

  const iconBoxStyle = {
    backgroundColor: theme.palette.mode === "dark" ? "#323243" : '#E5E5E5',
    width: "100px",
    height: "100px",
    borderRadius: "20px",
    textAlign: "center",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    cursor: 'pointer',
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? '#3F3F53' : '#FAFAFA'
    }
  }

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "25px",
      }}
    >
      <Box sx={{ height: "calc(100vh - 107px)", overflowY: "auto" }}>
        {/* <Typography
        sx={{
          color: theme.palette.text.primary,
          fontSize: "20px",
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
            fontSize: "20px",
            margin: isMobileMode ? 'unset' : "0px 40px 40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90%",
            flexDirection: "column",
          }}
        >
          <Box>
          {theme.palette.mode === "dark" ? (
            <SupportIcon sx={{ width:isMobileMode?'20rem':"23rem", height:isMobileMode?'20rem':"20rem"}} />
          ) : (
            <SupportIconWhite sx={{ width:isMobileMode?'20rem':"23rem", height:isMobileMode?'20rem':"20rem"}} />
          )}
          </Box>
          <Box mt={1} sx={{ display: "flex", width: isMobileMode ? "352px" : '425px', marginX: "auto", justifyContent: 'space-around' }}>
            <Box
              sx={iconBoxStyle}
              onClick={() => handleOpenNewTab('https://discord.com/invite/Hj4MAmA5gs')}
            >
              {theme.palette.mode === "dark" ? (
                <DiscordDark sx={{ width: "3rem", height: "3rem" }} />
              ) : (
                <DiscordWhite sx={{ width: "3rem", height: "3rem" }} />
              )}
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
              {theme.palette.mode === "dark" ? (
                <GitHupDark sx={{ width: "3rem", height: "3rem" }} />
              ) : (
                <GitHupWhite sx={{ width: "3rem", height: "3rem" }} />
              )}
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
          <Typography mt={2} sx={{color:'#19AD1C'}}><Typography component={'span'} sx={{color:(theme)=>theme.palette.text.primary, fontWeight:600,fontSize:'1.2rem'}}>E-mail </Typography>: support@beldex.io</Typography> */}
          {/* </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default Support;
