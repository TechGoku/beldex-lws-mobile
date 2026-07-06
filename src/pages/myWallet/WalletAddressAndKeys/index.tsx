import React, { useState, useRef } from "react";

import "./styles.scss";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, useMediaQuery, Grid, IconButton } from "@mui/material";
import Typography from "@mui/material/Typography";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";

export default function WalletAddressAndKeys() {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));

  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const [seedVisible, setSeedVisible] = useState(false);
  const toastMsgRef = useRef<ToastMsgRef>(null);


  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    handleShowToastMsg();
  };

  const handleShowToastMsg = () => {
    if (toastMsgRef.current) {
      toastMsgRef.current.showAlert("Copied ", "success");
    }
  };

  return (
    <Box
      className="WalletAddressAndKeys"
      sx={{
        marginTop: "20px",
        padding:!seedVisible?"10px 20px" :"20px",
        borderRadius: "12px",
        backgroundColor:isMobileMode?(theme) => theme.palette.mode==="dark"?"#24242F":"#FCFCFC" :(theme) => theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          width: "100%",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems:'center',
          position: "relative",
          flexDirection: "row",
        }}
      >

        <Box className={!seedVisible ? "address-wrapper" : ""} onClick={() => setSeedVisible(!seedVisible)} sx={{ cursor: 'pointer' }}>
          <Typography
            sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '18px' }}
          >
            Address
          </Typography>
          <Typography
            className={
              !seedVisible ? "address-without-key" : "address-with-key"
            }
            sx={{
              color: (theme: any) => theme.palette.text.secondary,
              fontSize: '14px',
              marginTop: '4px'
            }}
          >
            {walletDetails.address_string}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="row" alignItems={"center"}>
          <IconButton onClick={() => copyText(walletDetails.address_string)}>
            <ContentCopyIcon
              className="copyIcon"
              sx={{ fontSize: "1.4rem", cursor: "pointer", color: theme.palette.primary.main }}
            ></ContentCopyIcon>
          </IconButton>
          <ArrowRightIcon
            sx={{ fill: "#8787A8", cursor: "pointer", fontSize: '2rem' }}
            className={seedVisible ? "rotate" : "rotateUp"}
            onClick={() => setSeedVisible(!seedVisible)}
          />
        </Box>
      </Box>

      <Box className={!seedVisible ? "d-none" : "d-block"}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          sx={{ width: "100%" }}
          mt={2}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Secret View Key
            </Typography>
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                wordBreak: "break-all",
                fontWeight: 400,
                width: "85%",
              }}
              mt={1}
            >
              {walletDetails.sec_viewKey_string}
            </Typography>
          </Box>
          <Box>
            <IconButton
              sx={{ marginRight: "20px" }}
              onClick={() => copyText(walletDetails.sec_viewKey_string)}
            >
              <ContentCopyIcon
                className="copyIcon"
                sx={{
                  fontSize: "1.4rem",

                  // cursor: "pointer",
                }}
              ></ContentCopyIcon>
            </IconButton>
          </Box>
        </Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          sx={{ width: "100%" }}
          mt={2}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Secret Spend Key
            </Typography>
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                wordBreak: "break-all",
                fontWeight: 400,
                width: "85%",
              }}
              mt={1}
            >
              {walletDetails.sec_spendKey_string}
            </Typography>
          </Box>
          <Box>
            <IconButton
              sx={{ marginRight: "20px" }}
              onClick={() => copyText(walletDetails.sec_spendKey_string)}
            >
              <ContentCopyIcon
                className="copyIcon"
                sx={{
                  fontSize: "1.4rem",
                }}
              ></ContentCopyIcon>
            </IconButton>
          </Box>
        </Box>

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          sx={{ width: "100%" }}
          mt={2}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Recovery Seed
            </Typography>
            <Typography
              sx={{
                color: (theme) => theme.palette.text.secondary,
                wordBreak: "break-word",
                fontWeight: 400,
                width: "85%",
              }}
              mt={1}
            >
              {walletDetails.mnemonic_string}
            </Typography>
          </Box>
          <Box>
          <IconButton
            sx={{ marginRight: "20px" }}
            onClick={() => copyText(walletDetails.mnemonic_string)}
          >

              <ContentCopyIcon
                className="copyIcon"
                sx={{
                  fontSize: "1.4rem",
                
                }}
              ></ContentCopyIcon>
            </IconButton>
          </Box>
        </Box>
      </Box>
      <ToastMsg ref={toastMsgRef} />
    </Box>
  );
}
