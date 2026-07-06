import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Input,
  Typography,
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { useLocation } from "react-router-dom";
import {
  seedDetailSelector,
  seedDetailState,
} from "../../../stores/features/seedDetailSlice";
import { useAppSelector } from "../../../stores/hooks";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { setSeedDetails } from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";
import Loader from "../../loader";

export default function AuthSeed() {
  const theme: any = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const [mnemonicSeed, setMnemonicSeed] = useState("");
  const [seedToggleList, setToggleList] = useState([]);
  const [loading,setLoading]=useState<boolean>(false);
  const navigate = useNavigate();
  const seedDetails: seedDetailState = useAppSelector(seedDetailSelector);
  const [userMnemonic, setUserMnemonic] = React.useState<any>(() => []);
  const [hideTryAgainCont, setHideTryAgainCont] = useState<boolean>(true);
  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);
  const dispatch = useAppDispatch();

  const handleSeedList = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[]
  ) => {
    setUserMnemonic(newFormats);
  };

  useEffect(() => {
    setMnemonicSeed(seedDetails.mnemonic_string);
  }, [seedDetails]);

  useEffect(() => {
    if (mnemonicSeed) {
      const seedButtonList: any = mnemonicSeed.split(" ").slice(0, 7).sort();
      setToggleList(seedButtonList);
    }
  }, [mnemonicSeed]);

  const verifyUserEnteredSeed = () => {
    const seedList = mnemonicSeed.split(" ").slice(0, 7);
    const checkUserSeedValid = userMnemonic.every(
      (val: string, index: number) => val === seedList[index]
    );
    setHideTryAgainCont(checkUserSeedValid);

    checkUserSeedValid && validateComponentsForLogin(seedDetails);
  };

  const validateComponentsForLogin = (seedData: any) => {
    try {
      setLoading(true)
      const loginValidate =
        coreBridgeInstance.beldex_utils.validate_components_for_login(
          seedData.address_string,
          seedData.sec_viewKey_string,
          seedData.sec_spendKey_string || "", // expects string
          seedData.sec_seed_string || "", // expects string
          coreBridgeInstance.nettype
        );
      if (loginValidate.isValid == false) {
        // actually don't think we're expecting this..
        console.log("Invalid input...");
        return;
      }
      // seedData.isLogin=true;
      const addLoginPropertyToSeedData = { ...seedData, isLogin: true };
      console.log("islogin loginvalid ::", addLoginPropertyToSeedData);
      dispatch(setSeedDetails(addLoginPropertyToSeedData));
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
        seedData.address_string,
        seedData.sec_viewKey_string,
        false,
        loginCB
      );
    } catch (error) {
      // error is are throwing
      let Error = typeof error === "string" ? error : "" + error;
      console.log("Error:", Error);
      setLoading(false)

    }
  };

  const tryAgainUserMnemonic = () => {
    setUserMnemonic([]);
    setHideTryAgainCont(true);
  };

  const startOverUserMnemonic = () => {
    navigate("/displaySeed");
  };

  return (
    <Box
    className="appWrapper"
    sx={{
      minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
      background: isMobileMode ? "unset" : theme.palette.background.paper,
      borderRadius: "25px",
    }}
  >   
    <>  {loading && <Loader /> }  
    <Box
      className="AuthSeed"
      sx={{
        padding: isMobileMode ? "25px 0" : "30px 45px",
        height: "calc(100vh - 110px)",
        overflow: "auto",
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
          sx={{
            color: theme.palette.text.primary,
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          Create New Wallet
        </Typography>
        <Typography sx={{ fontWeight: 600, textAlign: "center" }} mt={1}>
          Verify your seed
        </Typography>
        <Typography
          sx={{
            fontWeight: 300,
            textAlign: "center",
            color: (theme) => theme.palette.secondary.light,
          }}
        >
          Choose the first 7 words in the correct order
        </Typography>

        <Box mt={2}>
          <Input
            // placeholder="Enter Recovery Seed from Existing wallet"
            value={userMnemonic.join(" ")}
            disableUnderline={true}
            multiline
            sx={{
              width: "100%",
              height: "120px",
              color: (theme) => theme.palette.text.secondary,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#1F1F2E" : "#F5F5F5",
              padding: "0 20px",
              borderRadius: "12px",
              overflow: "auto",
            }}
          />
        </Box>
        
        <Box
          mt={1}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <ToggleButtonGroup
            color="primary"
            value={userMnemonic}
            // exclusive
            sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}
            onChange={handleSeedList}
            aria-label="Platform"
          >
            {seedToggleList.length > 0 &&
              seedToggleList.map((list: any, index: number) => (
                <ToggleButton
                  sx={{
                    margin: 0,
                    fontWeight: 400,
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    marginRight: "8px",
                    marginTop: "8px",
                    border: "none",
                    color: (theme) => theme.palette.text.secondary,
                    background: (theme) =>
                      theme.palette.mode === "dark" ? "#32324A" : "#f2f2f2",
                    padding: "5px 10px",
                    borderRadius: "20px !important",
                    textTransform: "lowercase",
                    "&:hover": {
                      border: "none",
                      color: (theme) => theme.palette.text.secondary,
                      background: (theme) =>
                        theme.palette.mode === "dark" ? "#32324A" : "#f2f2f2",
                    },
                    "&.Mui-selected": {
                      "&:hover": {
                        border: "none",
                        // color: "#B9B9CC",
                        // backgroundColor: 'transparent',
                        color: (theme) =>
                          theme.palette.mode === "dark" ? "#1F1F2E" : "#F5F5F5",
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "#1F1F2E" : "#F5F5F5",
                      },
                      // color: (theme) => theme.palette.secondary.main,
                      // backgroundColor: (theme) => theme.palette.secondary.main,
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "#1F1F2E" : "#F5F5F5",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "#1F1F2E" : "#F5F5F5",
                    },
                  }}
                  key={index}
                  value={list}
                >
                  {list}
                </ToggleButton>
              ))}
          </ToggleButtonGroup>
        </Box>
        {!hideTryAgainCont && (
          <Box>
            <Typography
              sx={{ color: "#FF2424", fontWeight: 400, textAlign: "center" }}
              mt={1}
            >
              That’s not right. You can try again or start over with a new
              mnemonic.
            </Typography>
            <Box
              mt={2}
              display="flex"
              justifyContent="center"
              sx={{ columnGap: "10px" }}
            >
              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  fontWeight: 600,
                  borderRadius: "30px",
                  height: "50px",
                  width: isMobileMode ? "48%" : "150px",
                  color: theme.palette.text.primary,
                  border:theme.palette.mode==='dark'? "2px solid #445":"0.5px solid #ACACAC",
                }}
                onClick={tryAgainUserMnemonic}
              >
                <AutorenewOutlinedIcon
                  sx={{ fill: "#289AFB", marginRight: "5px" }}
                />{" "}
                Try again
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={startOverUserMnemonic}
                sx={{
                  fontWeight: 600,
                  borderRadius: "30px",
                  height: "50px",
                  // width:isMobileMode?'48%' :'30%',
                  color: theme.palette.text.primary,
                  border:theme.palette.mode==='dark'? "2px solid #445":"0.5px solid #ACACAC",
                }}
              >
                <RefreshOutlinedIcon
                  sx={{ fill: "#19AD1C", marginRight: "5px" }}
                />
                Start Over
              </Button>
            </Box>
          </Box>
        )}
        {hideTryAgainCont && (
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
              onClick={() => navigate("/")}
              sx={{
                width: isMobileMode ? "70%" : "150px",
                borderRadius: isMobileMode ? "40px" : "10px",
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
              disabled={userMnemonic.length < 7}
              onClick={verifyUserEnteredSeed}
              sx={{
                width: isMobileMode ? "70%" : "150px",
                borderRadius: isMobileMode ? "40px" : "10px",
                fontWeight: 600,
                color: "#FFF",
                height: "50px",
                marginTop: "10px",
              }}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>
    </Box>
    </>
    </Box>
  );
}
