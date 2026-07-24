import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useAppDispatch } from "../../../stores/hooks";
import { setSeedDetails } from "../../../stores/features/seedDetailSlice";
import { useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { rf } from "../../../utils/responsiveFont";
import { useTheme } from "@emotion/react";
import { useAppSelector } from "../../../stores/hooks";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { seedDetailSelector, seedDetailState } from "../../../stores/features/seedDetailSlice";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import Loader from "../../loader";
import { getNetType } from "../../../services/runtimeConfig";
import { copyToClipboard } from "../../../services/clipboard";
const mnemonic_languages = require('@bdxi/beldex-locales');

export default function DisplaySeed() {
  const theme: any = useTheme();
  // const seedDetails: seedDetailState = useAppSelector(seedDetailSelector);
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const toastMsgRef = useRef<ToastMsgRef>(null);

  const [language, setLanguage] = useState("English");
  const [isCopied, setIsCopied] = useState(false);
  const [secretKeys, setSecretKeys] = React.useState<any>(() => []);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);
  useEffect(() => {
    // setLoading(true)
    if (coreBridgeInstance.beldex_utils.newly_created_wallet) {
      let compatibleLocaleCode = mnemonic_languages.compatibleCodeFromLocale(window.navigator.language)
      const recSeed = coreBridgeInstance.beldex_utils.newly_created_wallet(compatibleLocaleCode, getNetType())
      recSeed.isLogin = false;
      setSecretKeys(recSeed);
    }
  }, [coreBridgeInstance.beldex_utils])

  const copyText = async (text: string) => {
    await copyToClipboard(text);
    setIsCopied(true)
    handleShowToastMsg();
  };

  const handleShowToastMsg = () => {
    if (toastMsgRef.current) {
      toastMsgRef.current.showAlert("Copied ", "success");
    }
  };
  const next = () => {
    dispatch(setSeedDetails(secretKeys));
    navigate('/authSeed')

  }
  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "0px",
      }}
    >     {/* {loading && <Loader /> }  */}
      <Box
        className="DisplaySeed"
        sx={{
          padding: isMobileMode ? "25px 0" : '30px 45px',
          height: 'calc(100dvh - 110px)',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            padding: isMobileMode ? "15px" : "20px 50px",
            backgroundColor: (theme) => theme.palette.primary.light,
            borderRadius: "0px",
          }}
        >
          <Typography
            textAlign="center"
            sx={{ color: theme.palette.text.primary, fontWeight: "bold", fontSize: "1.2rem" }}
          >
            Create New Wallet
          </Typography>
          <Typography sx={{ fontWeight: 600, textAlign: "center" }} mt={2}>
            Note down your Recovery Seed!
          </Typography>
          <Typography
            sx={{ fontWeight: 300, textAlign: "center", color: (theme) => theme.palette.secondary.light }}
          >
            You'll confirm this sequence on the next screen.
          </Typography>

          <Box mt={4} display="flex" flexDirection="row">
            <Typography
              sx={{
                width: "100%",
                // Extension .seed: green mono text in a green dashed box.
                color: (theme) => theme.palette.primary.main,
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0d0d0d" : "#fbfbfb",
                border: (theme) => `1px dashed ${theme.palette.primary.main}`,
                wordSpacing: "4px",
                padding: isMobileMode ? "20px" : "20px 25px",
                borderRadius: "0px",
                lineHeight: 1.75,
                overflow: "auto",
                fontWeight: 400,
                display: "flex",
                alignItems: "center",
                fontSize: isMobileMode ? rf(11) : "1rem",
              }}
            >{secretKeys?.mnemonic_string}</Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => copyText(secretKeys?.mnemonic_string)}
                disabled={!secretKeys?.mnemonic_string}
                sx={{
                  // Extension .btn-icon: green glyph on a hairline border.
                  backgroundColor: "transparent",
                  border: (theme: any) => `1px solid ${theme.palette.divider}`,
                  color: (theme: any) => theme.palette.primary.main,
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "0px",

                  marginLeft: isMobileMode ? "8px" : "20px",
                  cursor: "pointer",
                }}
              >
                <ContentCopyIcon
                  sx={{
                    fill: "currentColor",
                    fontSize: "1rem",
                  }}
                />
              </IconButton>
            </Box>
          </Box>

          <Typography
            sx={{ fontWeight: 400, fontSize: isMobileMode ? rf(12) : "1rem" }}
            mt={3}
          >
            <Typography component="span" sx={{ color: "#ff5c5c" }} mr={1}>
              Note :
            </Typography>
            This is the way to use the access your wallet if you switch devices,
            use another Beldex wallet app, or lose your data.
          </Typography>

          <Box className="drop-down-wrapper" mt={3} textAlign="center">
            <Typography component="span" sx={{ color: theme.palette.text.secondary, }}>
              Language
            </Typography>
            <Select
              disableUnderline
              SelectDisplayProps={{
                style: {
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  // backgroundColor: "#222222",
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.secondary.main,
                  borderRadius: "0px",
                  fontWeight: 400,
                },
              }}
              // className="currency-dropdown"
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                color: theme.palette.text.primary,
                backgroundColor: (theme: any) => theme.palette.secondary.main,
                borderRadius: "0px",
                marginLeft: "10px",
                marginTop: "16px",
                "& .MuiSelect-icon": {
                  fill: theme.palette.text.primary,
                  color: theme.palette.text.primary,
                },
              }}
              variant="filled"
              inputProps={{
                MenuProps: {
                  MenuListProps: {
                    sx: {
                      color: theme.palette.text.primary,
                      backgroundColor: (theme: any) => theme.palette.secondary.main,
                      // height: "300px",
                      // overflow: "auto",
                    },
                  },
                },
              }}
              value={language}
              defaultValue={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <MenuItem value={"English"}>English</MenuItem>
              <MenuItem value={"Russian"}>Russian</MenuItem>
            </Select>
          </Box>
          <Box
            sx={{ flexWrap: 'wrap', columnGap: "10px", mt: 2, display: "flex", justifyContent: "center", alignContent: "center" }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/createNewWallet')}
              sx={{
                width: isMobileMode ? "70%" : '150px',
                borderRadius: "0px",
                fontWeight: 600,
                height: "50px",
                marginTop: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!isCopied}
              onClick={() => next()}
              sx={{
                width: isMobileMode ? "70%" : '150px',
                borderRadius: "0px",
                fontWeight: 600,
                height: "50px",
                marginTop: "10px",
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
        <ToastMsg ref={toastMsgRef} />
      </Box>
    </Box>
  );
}