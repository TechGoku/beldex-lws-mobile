import { useState } from "react";
import "./styles.scss";
import AppTimeoutSlider from "../AppTimeoutSlider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../stores/hooks";
import {
  initialState,
  setSeedDetails,
  setBalance,
  setIdleTimer,
  setUserLogout
} from "../../../stores/features/seedDetailSlice";

import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Modal,
  useMediaQuery,
} from "@mui/material";
import userIdleTimerController from "../AppTimeoutSlider/userIdleTimerController";
import { useSelector } from "react-redux";



export default function PreferenceSetting(props: any) {
  const theme: any = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  walletDetails.timer !== 1500 && userIdleTimerController();

  const style = {
    position:  "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width:isMobileMode?360: 505,
    bgcolor: "background.paper",
    // border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "22px",
  };
  // const [displayCurrency, setDisplayCurrency] = useState("USD");
  // const exchangeCurrencyList = {
  //   USD: "USD",
  //   AUD: "AUD",
  //   BRL: "BRL",
  //   CAD: "CAD",
  //   CHF: "CHF",
  //   CNY: "CNY",
  //   EUR: "EUR",
  //   GBP: "GBP",
  //   HKD: "HKD",
  //   INR: "INR",
  //   JPY: "JPY",
  //   KRW: "KRW",
  //   MXN: "MXN",
  //   NOK: "NOK",
  //   NZD: "NZD",
  //   SEK: "SEK",
  //   SGD: "SGD",
  //   TRY: "TRY",
  //   RUB: "RUB",
  //   ZAR: "ZAR",
  // };

  const logout = () => {
    dispatch(setUserLogout());
    // dispatch(setBalance(0));
    // dispatch(setIdleTimer(120))
    handleClose;
    navigate("/");

  };
  return (
    <Box
      className="PreferenceSetting"
      sx={{ background: theme.palette.success.main, width:isMobileMode?"100%":"70%", padding:isMobileMode? "20px":'60px' }}
    >
      <Typography
        component="h2"
        className="header"
        textAlign={"center"}
        fontSize={22}
        sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
      >
        Wallet Settings
      </Typography>

      <Typography
        mt={3}
        component="h4"
        className="header"
        sx={{ color: theme.palette.text.primary }}
      >
        App Timeout
      </Typography>
      <AppTimeoutSlider />

      <Box
        mt={3}
        display="flex"
        flexDirection="column"
        gap={1.5}
        alignItems="center"
      >
        <Typography
          component="span"
          className="link"
          onClick={() => navigate("/addressbook")}
          sx={{ color: theme.palette.text.primary, textDecoration: "underline", cursor: "pointer" }}
        >
          Manage Saved Addresses
        </Typography>
        <Typography
          component="span"
          className="link"
          onClick={() => navigate("/security")}
          sx={{ color: theme.palette.text.primary, textDecoration: "underline", cursor: "pointer" }}
        >
          Security (PIN & Biometrics)
        </Typography>
        <Typography
          component="span"
          className="link"
          onClick={() => navigate("/server")}
          sx={{ color: theme.palette.text.primary, textDecoration: "underline", cursor: "pointer" }}
        >
          Server / Node Settings
        </Typography>
      </Box>
      {/*
      <Box className="drop-down-wrapper" mt={3}>
        <Typography component="span" sx={{ color: theme.palette.text.primary }}>
          Display Currency
        </Typography>
        <Select
          disableUnderline
          SelectDisplayProps={{ style: { paddingTop: 0, paddingBottom: 0 } }}
          // className="currency-dropdown"
          IconComponent={KeyboardArrowDownIcon}
          sx={{
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.main,
            height: "35px",
            borderRadius: "10px",
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px;",
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
                  backgroundColor: theme.palette.secondary.main,
                  height: "300px",
                  overflow: "auto",
                },
              },
            },
          }}
          value={displayCurrency}
          defaultValue={displayCurrency}
          onChange={(event) => setDisplayCurrency(event.target.value)}
        >
          {Object.values(exchangeCurrencyList).map((item, key) => (
            <MenuItem key={key} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
   
      </Box> */}

      <Box
        className="info-wrapper"
        mt={4}
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
      >
        <Typography component="span">
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="icons8-info"
              d="M9.82123 0.713867C4.40893 0.713867 0 5.1228 0 10.5351C0 15.9474 4.40893 20.3563 9.82123 20.3563C15.2335 20.3563 19.6425 15.9474 19.6425 10.5351C19.6425 5.1228 15.2335 0.713867 9.82123 0.713867ZM9.82123 2.22483C14.419 2.22483 18.1315 5.9373 18.1315 10.5351C18.1315 15.1329 14.419 18.8454 9.82123 18.8454C5.22343 18.8454 1.51096 15.1329 1.51096 10.5351C1.51096 5.9373 5.22343 2.22483 9.82123 2.22483ZM9.06575 5.24674V6.7577H10.5767V5.24674H9.06575ZM9.06575 8.26866V15.8234H10.5767V8.26866H9.06575Z"
              fill={theme.palette.text.primary}
            />
          </svg>
        </Typography>
        <Typography
          component="span"
          className="link"
          onClick={()=>props.setIsPreference()}
          sx={{ color: theme.palette.text.primary }}
        >
          About Beldex Wallet
        </Typography>
      </Box>
      <Box className="logout-btn-wrapper" mt={3}>
        <Button
          variant="contained"
          color="secondary"
          sx={{
            fontWeight: 600,
            marginRight: "10px",
            width: "250px",
            height: "45px",
            borderRadius:isMobileMode?"40px": "10px",
            // color: "white",
            color: "#ff2424",
          }}
          onClick={handleOpen}
        >
          Logout
        </Button>
        {/* <Button className="logout-btn" color="secondary">Logout</Button> */}
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="modal-modal-title"
            textAlign="center"
            sx={{ fontWeight: "700", fontSize:isMobileMode?"1rem":"1.4rem" }}
          >
            Logout?
          </Typography>
          <Typography
            sx={{ mt: 1, fontWeight: 400, fontSize:isMobileMode?"0.8rem":"1.2rem" }}
            textAlign={"center"}
          >
            Are you sure you want to Logout from Wallet?
          </Typography>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            mt={3}
          >
            <Button
              variant="contained"
              color="secondary"
              sx={{
                fontWeight: 600,
                marginRight: "10px",
                width: "150px",
                height: "45px",
                borderRadius:isMobileMode?"40px":"10px",

                color: theme.palette.text.primary,
              }}
              onClick={handleClose}
            >
              cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{
                fontWeight: 600,
                width: "150px",
                height: "45px",
                borderRadius:isMobileMode?"40px":"10px",
                color: "white",
              }}
              onClick={() => logout()}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
