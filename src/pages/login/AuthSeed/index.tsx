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
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";

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
  const toastMsgRef = React.useRef<ToastMsgRef>(null);

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
      // Keep the original index alongside each word: seeds can repeat a word
      // within the first 7 (e.g. "noted" twice), and ToggleButtonGroup keyed
      // by bare word would toggle both duplicates as one value, making the
      // quiz impossible to pass.
      const seedButtonList: any = mnemonicSeed
        .split(" ")
        .slice(0, 7)
        .map((word: string, id: number) => ({ word, id }))
        .sort((a: any, b: any) => a.word.localeCompare(b.word));
      setToggleList(seedButtonList);
    }
  }, [mnemonicSeed]);

  // userMnemonic stores chip ids (original seed positions); resolve to words.
  const pickedWords = (ids: string[]) =>
    ids.map((id) => mnemonicSeed.split(" ")[Number(id)]);

  const verifyUserEnteredSeed = () => {
    const seedList = mnemonicSeed.split(" ").slice(0, 7);
    const picked = pickedWords(userMnemonic);
    const checkUserSeedValid =
      picked.length === seedList.length &&
      picked.every((val: string, index: number) => val === seedList[index]);
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
        setLoading(false)
        // actually don't think we're expecting this..
        console.log("Invalid input...");
        return;
      }
      // seedData.isLogin=true;
      const addLoginPropertyToSeedData = { ...seedData, isLogin: true };
      console.log("islogin loginvalid ::", addLoginPropertyToSeedData);
      dispatch(setSeedDetails(addLoginPropertyToSeedData));
      // Valid locally -> enter the wallet immediately; register with the LWS in
      // the background so a blocked/unreachable server can't strand the user on
      // a full-screen spinner. The dashboard syncs once reachable.
      setLoading(false)
      navigate("/mywallet");
      coreBridgeInstance.hostedMoneroAPIClient.LogIn(
        seedData.address_string,
        seedData.sec_viewKey_string,
        false,
        (login__err: any) => {
          if (login__err) console.log("login__err (background):", login__err);
        }
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
      borderRadius: "0px",
    }}
  >   
    <>  {loading && <Loader /> }  
    <Box
      className="AuthSeed"
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
            value={pickedWords(userMnemonic).join(" ")}
            disableUnderline={true}
            multiline
            sx={{
              width: "100%",
              height: "120px",
              color: (theme) => theme.palette.text.secondary,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#0d0d0d" : "#f4f4f4",
              padding: "0 20px",
              borderRadius: "0px",
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
                      theme.palette.mode === "dark" ? "#222222" : "#f2f2f2",
                    padding: "5px 10px",
                    borderRadius: "0px",
                    textTransform: "lowercase",
                    "&:hover": {
                      border: "none",
                      color: (theme) => theme.palette.text.secondary,
                      background: (theme) =>
                        theme.palette.mode === "dark" ? "#222222" : "#f2f2f2",
                    },
                    // Extension .word-chip.picked: dimmed with a dashed border,
                    // label stays readable.
                    "&.Mui-selected": {
                      "&:hover": {
                        color: (theme) => theme.palette.text.secondary,
                        backgroundColor: "transparent",
                      },
                      opacity: 0.35,
                      border: "1px dashed",
                      borderColor: (theme) => theme.palette.text.secondary,
                      color: (theme) => theme.palette.text.secondary,
                      backgroundColor: "transparent",
                    },
                  }}
                  key={index}
                  value={String(list.id)}
                >
                  {list.word}
                </ToggleButton>
              ))}
          </ToggleButtonGroup>
        </Box>
        {!hideTryAgainCont && (
          <Box>
            <Typography
              sx={{ color: "#ff5c5c", fontWeight: 400, textAlign: "center" }}
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
                  borderRadius: "0px",
                  height: "50px",
                  width: isMobileMode ? "48%" : "150px",
                  color: theme.palette.text.primary,
                  border:theme.palette.mode==='dark'? "2px solid #445":"0.5px solid #ACACAC",
                }}
                onClick={tryAgainUserMnemonic}
              >
                <AutorenewOutlinedIcon
                  sx={{ fill: "#1574ad", marginRight: "5px" }}
                />{" "}
                Try again
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={startOverUserMnemonic}
                sx={{
                  fontWeight: 600,
                  borderRadius: "0px",
                  height: "50px",
                  // width:isMobileMode?'48%' :'30%',
                  color: theme.palette.text.primary,
                  border:theme.palette.mode==='dark'? "2px solid #445":"0.5px solid #ACACAC",
                }}
              >
                <RefreshOutlinedIcon
                  sx={{ fill: "#2fa236", marginRight: "5px" }}
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
              disabled={userMnemonic.length < 7}
              onClick={verifyUserEnteredSeed}
              sx={{
                width: isMobileMode ? "70%" : "150px",
                borderRadius: "0px",
                fontWeight: 600,
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
    <ToastMsg ref={toastMsgRef} />
    </>
    </Box>
  );
}
