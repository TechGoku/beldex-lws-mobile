import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useNavigate } from "react-router-dom";
import SignInWithKey from "../SignInWithKey";
import { useTheme } from "@emotion/react";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { useAppDispatch } from "../../../stores/hooks";
import { setSeedDetails } from "../../../stores/features/seedDetailSlice";
import { readClipboard } from "../../../services/clipboard";
import loadingIcon from "../../../icons/loading.gif";

export default function SignIn() {
  const theme: any = useTheme();
  const [showSignWithKey, setShowSignWithKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [userMnemonic, setUserMnemonic] = React.useState<string>("");
  const [showErrMsg, setShowErrMsg] = React.useState<boolean>(false);
  const [errMsg, setErrMsg] = React.useState<string>("");
  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);
  const dispatch = useAppDispatch();

  const signWithKey = (bool: boolean) => {
    setShowSignWithKey(bool);
    setUserMnemonic('');
  };

  const sendValidation = () => {
    setLoading(true);
    validatingMnemonic();
  }

  const validatingMnemonic = () => {
    if (
      userMnemonic === "" ||
      userMnemonic === null ||
      userMnemonic === undefined
    ) {
      setShowErrMsg(true);
      setErrMsg("All the fields are required");
    } else if (userMnemonic.split(" ").length < 25) {
      setShowErrMsg(true);
      setErrMsg("Please enter a 25 secret mnemonic.");
    } else {
      setShowErrMsg(false);
      setErrMsg("");
      validateComponentsForLogin();
    }
    //Invalid 25-word mnemonic
  };

  const validateComponentsForLogin = () => {
    try {
      setLoading(true)
      const validatingMnemonic =
        coreBridgeInstance.beldex_utils.seed_and_keys_from_mnemonic(
          userMnemonic,
          coreBridgeInstance.nettype
        );
      const loginValidate =
        coreBridgeInstance.beldex_utils.validate_components_for_login(
          validatingMnemonic.address_string,
          validatingMnemonic.sec_viewKey_string,
          validatingMnemonic.sec_spendKey_string || "", // expects string
          validatingMnemonic.sec_seed_string || "", // expects string
          coreBridgeInstance.nettype
        );
      validatingMnemonic.mnemonic_string = userMnemonic;
      validatingMnemonic.pub_spendKey_string =
        loginValidate.pub_spendKey_string;
      validatingMnemonic.pub_viewKey_string = loginValidate.pub_viewKey_string;
      validatingMnemonic.isLogin=true
      dispatch(setSeedDetails(validatingMnemonic));
      if (loginValidate.isValid === false) {
        setLoading(false)

        // actually don't think we're expecting this..
        console.log("Invalid input...");
        return;
      }
      const loginCB = (
        login__err: any,
        new_address: any,
        received__generated_locally: any,
        start_height: any
      ) => {
        console.log("---login__err-", login__err);
        if (login__err) {
          // already logged
          console.log("login__err:", login__err);
          return;
        }

        console.log("---new_address-", new_address);
        console.log(
          "---received__generated_locally-",
          received__generated_locally
        );
        console.log("---start_height-", start_height);
        setLoading(false)

        navigate("/mywallet");
      };
      coreBridgeInstance.hostedMoneroAPIClient.LogIn(
        validatingMnemonic.address_string,
        validatingMnemonic.sec_viewKey_string,
        false,
        loginCB
      );
    } catch (error) {
      let err = typeof error === "string" ? error : "" + error;
      if (err.includes("Invalid 25-word mnemonic")) {
        setShowErrMsg(true);
        setErrMsg("The phrase is Invalid!");
      }
      setLoading(false);
    }
  };

  const assignSeed = async () => {
    const recoverySeed = await readClipboard();
    setUserMnemonic(recoverySeed);
  }

  const Loader = () => (
    <>
      {loading && <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
          zIndex: 99,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <img src={loadingIcon} width={40} height={40} alt="Loading" />
        </Box>
      </Box>}
    </>
  )

  return (
    <Box
    className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "25px",
      }}
    >
    <>
      <Loader />
      {!showSignWithKey && (
        <Box
          className="SignIn"
          sx={{
            // display: "flex",
            // justifyContent: "center",
            // alignItems: "center",
            // width: "100%",
            padding: isMobileMode ? "25px 0" : "30px 45px",
            height: "calc(100vh - 110px)",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              // minWidth: "70%",
              // maxWidth: "95%",
              padding: isMobileMode ? "15px" : "20px 50px",
              backgroundColor: (theme) => theme.palette.primary.light,
              borderRadius: "20px",
            }}
          >
            <Typography
              textAlign="center"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: "bold",
                fontSize: "1.5rem",
              }}
            >
              Existing Wallet
            </Typography>
            <Typography mt={3} sx={{fontWeight: 700,fontSize:'1.1rem'}}>Recovery Seed</Typography>
            <Box mt={1} display="flex" flexDirection="row">
              <Input
                placeholder="Enter Recovery Seed from Existing wallet"
                disableUnderline={true}
                onChange={(event) => setUserMnemonic(event.target.value)}
                value={userMnemonic}
                multiline
                sx={{
                  width: "100%",
                  minHeight: "150px",
                  maxHeight: "200px",

                  color: (theme) => theme.palette.text.secondary,
                  backgroundColor: (theme) => theme.palette.secondary.main,
                  padding: "5px 20px",
                  borderRadius: "12px",
                  overflow: "auto",
                }}
              />
              <Box
                sx={{
                  backgroundColor: (theme) => theme.palette.secondary.main,
                  // boxShadow:"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50px",
                  marginTop: "50px",
                  marginLeft: "20px",
                  cursor: "pointer",
                }}
              >
                <IconButton onClick={assignSeed}>
                  <ContentPasteIcon
                    sx={{
                      backgroundColor: (theme: any) =>
                        theme.palette.secondary.main,
                      fill: "#1BB71F",
                      // boxShadow:
                      //   "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                    }}
                  />
                </IconButton>
              </Box>
            </Box>
            {showErrMsg && (
              <Typography
                sx={{ color: "#FF2424", fontWeight: 400, marginTop: "5px" }}
              >
                {errMsg}
              </Typography>
            )}
            <Typography mt={3} textAlign={"center"}>
              or Use the{" "}
              <Typography
                component={"span"}
                onClick={() => signWithKey(true)}
                sx={{
                  fontWeight: 500,
                  color: "#289AFB",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Address and Recovery Keys
              </Typography>
            </Typography>
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
                  borderRadius: isMobileMode ? "40px" : "10px",
                  fontWeight: 600,
                  height: "50px",
                  marginTop: "10px",
                }}
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={validatingMnemonic}
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
      )}
      {showSignWithKey && <SignInWithKey cbFunction={signWithKey} />}
    </>
    </Box>
  );
}
