import React, { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  Input,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { useNavigate } from "react-router-dom";
import {
  seedDetailState,
  setSeedDetails,
} from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";
import Loader from "../../loader";

export default function SignInWithKey(props: any) {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const [userAddress, setUserAddress] = React.useState<any>("");
  const [userViewKey, setUserViewKey] = React.useState<any>("");
  const [userSpendKey, setUserSpendKey] = React.useState<any>("");
  const [showErrMsg, setShowErrMsg] = React.useState<boolean>(false);
  const [errMsg, setErrMsg] = React.useState<string>("");
  const [loading,setLoading]=useState<boolean>(false);

  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);
  const dispatch = useAppDispatch();

  const handleAlphanumericInputChange = (
    e: any,
    setUserCallback: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Regular expression to match only alphanumeric characters
    const alphanumericRegex = /^[a-zA-Z0-9]*$/;

    // Check if the input value matches the alphanumeric pattern
    if (alphanumericRegex.test(e.target.value)) {
      setUserCallback(e.target.value);
    }
    // If not, do nothing (or you can show an error message)
  };

  const validatingInputKeys = () => {
    if (
      userAddress === "" ||
      userAddress === null ||
      userAddress === undefined ||
      userViewKey === "" ||
      userViewKey === null ||
      userViewKey === undefined ||
      userSpendKey === "" ||
      userSpendKey === null ||
      userSpendKey === undefined
    ) {
      setShowErrMsg(true);
      setErrMsg("All the fields are required.");
    } else {
      setShowErrMsg(false);
      setErrMsg("");
      validateComponentsForLogin();
    }
  };

  const validateComponentsForLogin = () => {
    try {
      setLoading(true)
      const loginValidate =
        coreBridgeInstance.beldex_utils.validate_components_for_login(
          userAddress,
          userViewKey,
          userSpendKey || "", // expects string
          "", //seed expects string
          coreBridgeInstance.nettype
        );
      if (loginValidate.isValid === false) {
        setLoading(false)
        // actually don't think we're expecting this..
        console.log("Invalid input...");
        return;
      }
      const store = {
        address_string: userAddress,
        sec_viewKey_string: userViewKey,
        sec_spendKey_string: userSpendKey,
        mnemonic_string: "N/A",
        pub_spendKey_string: loginValidate.pub_spendKey_string,
        pub_viewKey_string: loginValidate.pub_viewKey_string,
        isLogin: true,
      };
      dispatch(setSeedDetails(store));
      setShowErrMsg(false);
      setErrMsg("");
      // Keys are valid locally, so enter the wallet immediately instead of
      // blocking on the LWS login call (which hangs on a blocked/unreachable
      // server and used to leave the user stuck on a full-screen spinner with
      // no way to reach Settings). The dashboard syncs once reachable.
      setLoading(false)
      navigate("/mywallet");
      // Fire-and-forget server registration.
      coreBridgeInstance.hostedMoneroAPIClient.LogIn(
        userAddress,
        userViewKey,
        false,
        (login__err: any) => {
          if (login__err) console.log("login__err (background):", login__err);
        }
      );
    } catch (error) {
      let Error = typeof error === "string" ? error : "" + error;
      setLoading(false)
      setShowErrMsg(true);
      setErrMsg(Error);
    }
  };

  const signInWithAddress = () => {
    props.cbFunction(false);
    setUserAddress("");
    setUserViewKey("");
    setUserSpendKey("");
  };

  return (
    <>
      
     {loading && <Loader /> } 
      <Box
        className="SignInWithKey"
        sx={{
          padding: isMobileMode ? "25px 0" : "30px 45px",
          height: "calc(100dvh - 110px)",
          overflow: "auto",
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
            sx={{
              color: theme.palette.text.primary,
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            Existing Wallet
          </Typography>
          <Typography mt={2} sx={{ fontWeight: 700 }}>
            Address 
            {/* <InfoOutlinedIcon sx={{ fontSize: "0.9rem" }} />{" "} */}
          </Typography>
          <Box mt={1}>
            <Input
              placeholder="Enter address"
              disableUnderline={true}
              onChange={(e) => handleAlphanumericInputChange(e, setUserAddress)}
              value={userAddress}
              multiline
              inputProps={{ maxLength: 120 }}
              sx={{
                width: "100%",
                minHeight: "70px",
                color: (theme) => theme.palette.text.secondary,
                backgroundColor: (theme) => theme.palette.secondary.main,
                padding: "10px 20px",
                borderRadius: "0px",
                overflow: "auto",
              }}
            />
          </Box>

          <Typography sx={{ fontWeight: 700 }} mt={2}>
            View Key 
            {/* <InfoOutlinedIcon sx={{ fontSize: "0.9rem" }} />{" "} */}
          </Typography>
          <Box mt={1} display="flex" flexDirection="row">
            <Input
              placeholder="Enter view Key"
              disableUnderline={true}
              multiline
              onChange={(e) => handleAlphanumericInputChange(e, setUserViewKey)}
              inputProps={{ maxLength: 70 }}
              value={userViewKey}
              sx={{
                width: "100%",
                minHeight: "70px",
                color: (theme) => theme.palette.text.secondary,
                backgroundColor: (theme) => theme.palette.secondary.main,
                padding: "10px 20px",
                borderRadius: "0px",
                overflow: "auto",
              }}
            />
          </Box>

          <Typography sx={{ fontWeight: 700 }} mt={2}>
            Spend Key 
            {/* <InfoOutlinedIcon sx={{ fontSize: "0.9rem" }} />{" "} */}
          </Typography>
          <Box mt={1} display="flex" flexDirection="row">
            <Input
              placeholder="Enter Spend Key"
              disableUnderline={true}
              multiline
              onChange={(e) =>
                handleAlphanumericInputChange(e, setUserSpendKey)
              }
              value={userSpendKey}
              inputProps={{ maxLength: 70 }}
              sx={{
                width: "100%",
                minHeight: "70px",
                color: (theme) => theme.palette.text.secondary,
                backgroundColor: (theme) => theme.palette.secondary.main,
                padding: "10px 20px",
                borderRadius: "0px",
                overflow: "auto",

                //   marginTop: "10px",
              }}
            />
          </Box>
          <Typography
            color={theme.palette.text.primary}
            mt={2}
            textAlign={"center"}
          >
            or Use the{" "}
            <Typography
              component={"span"}
              onClick={() => signInWithAddress()}
              sx={{
                fontWeight: 500,
                color: "#1574ad",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              or Use the Recovery Seed
            </Typography>
          </Typography>
          {showErrMsg && (
            <Typography
              sx={{ color: "#ff5c5c", fontWeight: 400, textAlign: "center" }}
              mt={1}
            >
              {errMsg}
            </Typography>
          )}
          <Box
            sx={{
              flexWrap: "wrap",
              columnGap: "10px",
              mt: 2,
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              sx={{
                width: isMobileMode ? "70%" : "150px",
                borderRadius: "0px",
                fontWeight: 600,
                height: "50px",
                marginTop: "10px",
              }}
              onClick={()=>signInWithAddress()}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontWeight: 600,
                height: "50px",
                width: isMobileMode ? "70%" : "150px",
                borderRadius: "0px",
                marginTop: "10px",
              }}
              onClick={validatingInputKeys}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
