import React, { useState } from "react";
import { Box, Button, Typography, Checkbox, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import UncheckRectIcon from "../../../icons/uncheckRectIcon";
import CheckedCheckBox from "../../../icons/checkedCheckbox"
// import { useTheme } from "@emotion/react";

export default function SignUp() {
  const theme: any = useTheme();
  const [checkAgreeTerm, setAgreeTerm] = useState(false);
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const agreeTerm = (e: any) => {
    setAgreeTerm(e.target.checked)
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
      <Box
        className="SignUp"
        sx={{
          padding: isMobileMode ? "25px 0" : '30px 45px',
          height: 'calc(100vh - 110px)',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            padding: isMobileMode ? "15px" : "20px 50px",
            backgroundColor: (theme) => theme.palette.primary.light,
            borderRadius: "20px",
          }}
        >
          <Typography
            textAlign="center"
            sx={{ color: theme.palette.text.primary, fontWeight: "bold", fontSize: "1.5rem" }}
          >
            Create New Wallet
          </Typography>

          <Box
            mt={4}
            sx={{
              display: "flex",
            }}
          >
            <Box>
              <Typography
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#19AD1C",
                  borderRadius: "20px",
                  marginTop: "6px",
                  marginRight: "15px",
                }}
              ></Typography>
            </Box>
            <Box>
              <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 700 }}>Creating a Wallet</Typography>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 400 }}>
                Each Beldex wallet gets a unique word-sequence called a mnemonic.
              </Typography>
            </Box>
          </Box>

          <Box
            mt={2}
            sx={{
              display: "flex",
            }}
          >
            <Box>
              <Typography
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#19AD1C",
                  borderRadius: "20px",
                  marginTop: "6px",
                  marginRight: "15px",
                }}
              ></Typography>
            </Box>
            <Box>
              <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 700 }}>
                Write down your mnemonic
              </Typography>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 400 }}>
                It’s the only way to regain access, and it’s never sent to the
                server!
              </Typography>
            </Box>
          </Box>

          <Box
            mt={2}
            sx={{
              display: "flex",
            }}
          >
            <Box>
              <Typography
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#19AD1C",
                  borderRadius: "20px",
                  marginTop: "6px",
                  marginRight: "15px",
                }}
              ></Typography>
            </Box>
            <Box>
              <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 700 }}>
                Keep it secret and safe
              </Typography>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 400 }}>
                If you save it to an insecure location, copy, screenshot, or email
                it, it may be viewable by other apps.
              </Typography>
            </Box>
          </Box>

          <Box
            mt={2}
            sx={{
              display: "flex",
            }}
          >
            <Box>
              <Typography
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#19AD1C",
                  borderRadius: "20px",
                  marginTop: "6px",
                  marginRight: "15px",
                }}
              ></Typography>
            </Box>
            <Box>
              <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 700 }}>
                Use it like an actual wallet
              </Typography>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 400 }}>
                For large amounts and better privacy, make a cold-storage wallet
                or set your own server in Preferences.
              </Typography>
            </Box>
          </Box>

          <Box
            mt={2}
            sx={{
              display: "flex",
            }}
          >
            <Box>
              <Typography
                sx={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#19AD1C",
                  borderRadius: "20px",
                  marginTop: "6px",
                  marginRight: "15px",
                }}
              ></Typography>
            </Box>
            <Box>
              <Typography sx={{ color: (theme) => theme.palette.text.primary, fontWeight: 700 }}>
                Web browsers are insecure
              </Typography>
              <Typography sx={{ color: (theme) => theme.palette.text.secondary, fontWeight: 400 }}>
                The convenience of Beldex Wallet for web comes at a security cost.
              </Typography>
            </Box>
          </Box>
          <Box
            mt={3}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Checkbox
              sx={{
                borderColor: "red",
                "&.Mui-checked": {
                  color: "pink[600]",
                },
              }}
              inputProps={{
                "aria-label": "I Understand.",
              }}
              icon={<UncheckRectIcon styles={{ fontSize: '1.5rem' }} />}
              checkedIcon={<CheckedCheckBox styles={{ fontSize: '1.5rem' }} />}
              onClick={agreeTerm}
              value={checkAgreeTerm}
            />
            <Typography sx={{ color: theme.palette.text.primary }}>Yes, I Understand.</Typography>
          </Box>

          <Box
            sx={{ flexWrap: 'wrap', columnGap: "10px", mt: 2, display: "flex", justifyContent: "center", alignContent: "center" }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/')}
              sx={{
                width: isMobileMode ? "70%" : '150px',
                borderRadius: isMobileMode ? "40px" : "10px",
                fontWeight: 600,
                height: "50px",
                marginTop: "10px",
              }}
            >
              Cancel

            </Button>
            {/* {!isMobileMode &&<Box sx={{width:'50px',height:'20px'}}></Box>} */}
            <Button
              variant="contained"
              color="primary"
              disabled={!checkAgreeTerm}
              onClick={() => navigate('/displaySeed')}
              sx={{
                fontWeight: 600,
                color: "white",
                height: "50px",
                width: isMobileMode ? "70%" : "150px",
                borderRadius: isMobileMode ? "40px" : "10px",
                marginTop: "10px",
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
