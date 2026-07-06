import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Select,
  MenuItem,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CallMadeIcon from "@mui/icons-material/CallMade";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { setTransactionhistory } from "../../../stores/features/seedDetailSlice";
import Modal from "@mui/material/Modal";
import SuccessTxnTickIconWhite from "../../../icons/SuccessTxnTickIconWhite";
import SuccessTxnTickIconDark from "../../../icons/SuccessTxnTickIconDark";
import { useAppDispatch } from "../../../stores/hooks";
import AddressBook from "../AddressBook";
import { addSavedAddress } from "../../../stores/features/addressBookSlice";
import { SavedAddress } from "../../../services/addressBookStorage";
import { getNetType } from "../../../services/runtimeConfig";
const JSBigInt = require("@bdxi/beldex-bigint").BigInteger;
const beldex_amount_format_utils = require("@bdxi/beldex-money-format");
const beldex_config = require("@bdxi/beldex-config");

interface SendFundProps {
  // Set by the mobile Contacts tab: picking a contact switches to the Send
  // tab with the address (and optional payment ID) prefilled.
  prefill?: { address: string; paymentId?: string } | null;
  onPrefillConsumed?: () => void;
}

const SendFund = ({ prefill, onPrefillConsumed }: SendFundProps = {}) => {
  const theme: any = useTheme();
  const coreBridgeInstance = React.useContext(CoreBridgeInstanceContext);
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const toastMsgRef = useRef<ToastMsgRef>(null);
  const netType: any = getNetType();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  // const [currency, setCurrency] = useState("AUD");
  const [priority, setPriority] = useState(5);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSweepTx, setIsSweepTx] = useState(false);
  const [paymentIdToggle, setPaymentIdToggle] = useState(false);
  const [manualPaymentId, setManualPaymentId] = useState("");
  const [estimtionFees, setEstimationFees] = useState("");
  const [registrationString, setRegistrationString] = useState("");
  const [registrationToggle, setRegistrationToggle] = useState(false);
  const isRegister = registrationToggle && registrationString.trim() !== "";
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
  const [txnStatus, setTxnStatus] = useState("");
  const [errAmount, setErrAmount] = useState("");
  const [errAddress, setErrAddress] = useState("");
  const [errRegistration, setErrRegistration] = useState("");

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [saveAddressOpen, setSaveAddressOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [saveLabelError, setSaveLabelError] = useState("");

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 352 : 552,
    bgcolor: "background.paper",
    // border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "22px",
  };

  const processStepMessageSuffix_byEnumVal: any = {
    0: "", // 'none'
    1: "", // "initiating send" - so we don't want a suffix
    2: "Fetching latest balance.",
    3: "Calculating fee.",
    4: "Fetching decoy outputs.",
    5: "Constructing transaction.", // may go back to .calculatingFee
    6: "Submitting transaction.",
  };

  const failureCodeMessage_byEnumVal: any = {
    0: "--", // message is provided - this should never get requested
    1: "Unable to load that wallet.",
    2: "Unable to log into that wallet.",
    3: "This wallet must first be imported.",
    4: "Please specify the recipient of this transfer.",
    5: "Couldn't resolve this OpenAlias address.",
    6: "Couldn't validate destination Beldex address.",
    7: "Please enter a valid payment ID.",
    8: "Couldn't construct integrated address with short payment ID.",
    9: "The amount you've entered is too low.",
    10: "Please enter a valid amount to send.",
    11: "--", // errInServerResponse_withMsg
    12: "--", // createTransactionCode_balancesProvided
    13: "--", // createTranasctionCode_noBalances
    14: "Unable to construct transaction after many attempts.",
    //
    99900: "Please contact support with code: 99900.", // codeFault_manualPaymentID_while_hasPickedAContact
    99901: "Please contact support with code: 99901.", // codeFault_unableToFindResolvedAddrOnOAContact
    99902: "Please contact support with code: 99902.", // codeFault_detectedPIDVisibleWhileManualInputVisible
    99903: "Please contact support with code: 99903.", // codeFault_invalidSecViewKey
    99904: "Please contact support with code: 99904.", // codeFault_invalidSecSpendKey
    99905: "Please contact support with code: 99905.", // codeFault_invalidPubSpendKey
  };

  const createTxErrCodeMessage_byEnumVal: any = {
    0: "No error",
    1: "No destinations provided",
    2: "Wrong number of mix outputs provided",
    3: "Not enough outputs for mixing",
    4: "Invalid secret keys",
    5: "Output amount overflow",
    6: "Input amount overflow",
    7: "Mix RCT outs missing commit",
    8: "Result fee not equal to given fee",
    9: "Invalid destination address",
    10: "Payment ID must be blank when using an integrated address",
    11: "Payment ID must be blank when using a subaddress",
    12: "Couldn't add nonce to tx extra",
    13: "Invalid pub key",
    14: "Invalid commit or mask on output rct",
    15: "Transaction not constructed",
    16: "Transaction too big",
    17: "Not yet implemented",
    18: "Couldn't decode address",
    19: "Invalid payment ID",
    20: "The amount you've entered is too low",
    21: "Can't get decrypted mask from 'rct' hex",
    90: "Spendable balance too low",
  };

  const registrationInputChange = (e: any) => {
    setErrRegistration("");
    setRegistrationString(e.target.value);
  };

  const generatePaymentId = () => {
    let paymentId = coreBridgeInstance.beldex_utils.new_payment_id();
    setManualPaymentId(paymentId);
  }

  const numberOnly = (e: any) => {
    const re = /^\d+\.?\d*$/;
    if (e === "" || re.test(e)) {
      setAmount(e);
    }
  }

  const addressValidation = async (address: any) => {
    try {
      const status = coreBridgeInstance.beldex_utils.decode_address(address, getNetType())
      console.log("status:", status)
      return;
    } catch (err) {
      console.log("errorr:", err)  // Invalid address
      console.log("Invalid address")
      handleShowToastMsg('Invalid address', false);
      //   return ToastUtils.pushToastError('invalidAddress', 'Invalid address');
    }
  }

  const addressInputChange = (e: any) => {
    const value = e.target.value;
    // Allow only alphanumeric characters
    const alphanumericRegex = /^[a-zA-Z0-9]*$/;
    if (alphanumericRegex.test(value)) {
      setToAddress(value);
    }
  };

  const paymentInputChange = (e: any) => {
    const value = e.target.value;
    // Allow only alphanumeric characters
    const alphanumericRegex = /^[a-zA-Z0-9]*$/;
    if (alphanumericRegex.test(value)) {
      setManualPaymentId(value)
    }
  };
  
  const handleShowToastMsg = (message: string, status: boolean) => {
    if (toastMsgRef.current) {
      toastMsgRef.current.showAlert(message, status ? 'success' : 'error');
    }
  };

  const handlePickSavedAddress = (entry: SavedAddress) => {
    setToAddress(entry.address);
    setErrAddress("");
    if (entry.paymentId) {
      setManualPaymentId(entry.paymentId);
      setPaymentIdToggle(true);
    }
    setAddressBookOpen(false);
  };

  const openSaveAddressPrompt = () => {
    if (!toAddress || toAddress.length < 95 || toAddress.length > 106) {
      handleShowToastMsg("Enter a valid address before saving it", false);
      return;
    }
    setSaveLabel("");
    setSaveLabelError("");
    setSaveAddressOpen(true);
  };

  const confirmSaveAddress = async () => {
    if (!saveLabel.trim()) {
      setSaveLabelError("Please enter a label for this address");
      return;
    }
    await dispatch(
      addSavedAddress({
        label: saveLabel.trim(),
        address: toAddress,
        paymentId: manualPaymentId || undefined,
      })
    );
    setSaveAddressOpen(false);
    handleShowToastMsg("Address saved for future use", true);
  };

  const sendFundFieldValidation = () => {
    // console.log("netConnetion()",netConnetion())
    // if (!window.globalOnlineStatus) {
    //    ToastUtils.pushToastError(
    //     'internetConnectionError',
    //     'Please check your internet connection'
    //   );
    //   return
    // }

    if (registrationToggle) {
      if (!registrationString.trim()) {
        setErrRegistration("Registration string is required");
        handleShowToastMsg("Please enter the registration string", false);
        return;
      }

      setErrRegistration("");
      handleOpen();
      setTxnStatus("confirmation");
      return;
    }

    if (!amount) {
      // setErrAmount('please enter the amount to send.');
      setErrAmount("Invalid Amount");

      return console.log("please enter the amount to send.");
    }
    if (Number(amount) == 0) {
      // return ToastUtils.pushToastError('zeroAmount', 'Amount must be greater than zero');
      // setErrAmount('Amount must be greater than zero')
      setErrAmount("Amount must be greater than zero");
      return;
    }
    if (Number(amount) > walletDetails.unlocked_balance) {
      // return ToastUtils.pushToastError('notEnoughBalance', 'Not enough unlocked balance');
      // setErrAmount('Not enough unlocked balance')
      setErrAmount("Not enough unlocked balance");
      handleShowToastMsg("Not enough unlocked balance", false);

      console.log("Not enough unlocked balance");
      return;
    }
    if (Number(amount) === walletDetails.unlocked_balance) {
      setIsSweepTx(true);
    }
    if (!toAddress) {
      setErrAddress("Invalid address");
      console.log("couldn't validate destination beldex address");
      return;
    }
    if (toAddress.length > 106 || toAddress.length < 95) {
      // return ToastUtils.pushToastError('invalidAddress', 'Invalid address');
      setErrAddress("Invalid address");

      console.log("Invalid address");
      return;
    }
    addressValidation(toAddress);
    if (Number(amount) == 0) {
      // return ToastUtils.pushToastError('zeroAmount', 'Amount must be greater than zero');
      console.log('Amount must be greater than zero');
      return;
    }
    setErrAmount("");
    setErrAddress("");
    setErrRegistration("");

    // let addressValidate = await wallet.validateAddres(address);
    // if (!addressValidate) {
    //   return ToastUtils.pushToastError('invalidAddress', 'Invalid address');
    // }
    handleOpen();
    setTxnStatus('confirmation')

  };
  const estimationNetworkFees = () => {
    const estimatedNetworkFee_JSBigInt = new JSBigInt(coreBridgeInstance.beldex_utils.estimated_tx_network_fee(
      null,
      priority,
      '666', '100000'
    ));
    return estimatedNetworkFee_JSBigInt;
  }

  const newEstimatedNetworkFeeDisplay = () => {
    const estimatedTotalFee_JSBigInt = estimationNetworkFees();
    const estimatedTotalFee = beldex_amount_format_utils.formatMoney(estimatedTotalFee_JSBigInt);
    const displayString = `+ ${estimatedTotalFee} BDX EST. FEE`;
    setEstimationFees(displayString);
    return;
  }

  const sendFundErrorhandle = (params: any) => {
    //
    handleClose()
    console.log("params params", params);
    const code = params.err_code;
    let errStr;
    if (code === 0 || typeof code === "undefined" || code === null) {
      // msgProvided
      errStr = params.err_msg;
    } else if (isNaN(code)) {
      errStr = "Unexpected NaN err code - please contact support";
    } else if (code === 11) {
      // errInServerResponse_withMsg
      errStr = params.err_msg;
    } else if (code === 12) {
      // createTransactionCode_balancesProvided
      if (params.createTx_errCode == 90) {
        // needMoreMoneyThanFound
        errStr = `Spendable balance too low. Have ${beldex_amount_format_utils.formatMoney(
          new JSBigInt("" + params.spendable_balance)
        )} ${beldex_config.coinSymbol
          }; need ${beldex_amount_format_utils.formatMoney(
            new JSBigInt("" + params.required_balance)
          )} ${beldex_config.coinSymbol}.`;
      } else {
        errStr = createTxErrCodeMessage_byEnumVal[params.createTx_errCode];
      }
    } else if (code === 13) {
      // createTranasctionCode_noBalances
      errStr = createTxErrCodeMessage_byEnumVal[params.createTx_errCode];
    } else {
      errStr = failureCodeMessage_byEnumVal[code];
    }
    handleShowToastMsg(errStr, false);
    clearStates();
    const err = new Error(errStr);
    console.error(err);
  }

  const intiate_transaction = async () => {
    let args: any = {
      registration_string: registrationString,
      isRegister: isRegister,
      fromWallet_didFailToInitialize: false,
      fromWallet_didFailToBoot: false,
      fromWallet_needsImport: false,
      requireAuthentication: true,
      destinations: [
        {
          to_address: toAddress,
          send_amount: amount,
        },
      ],
      hasPickedAContact: false,
      resolvedAddress_fieldIsVisible: false,
      manuallyEnteredPaymentID_fieldIsVisible: manualPaymentId ? true : false,
      resolvedPaymentID_fieldIsVisible: false,
      is_sweeping: isSweepTx,
      from_address_string: walletDetails.address_string,
      sec_viewKey_string: walletDetails.sec_viewKey_string,
      sec_spendKey_string: walletDetails.sec_spendKey_string,
      pub_spendKey_string: walletDetails.pub_spendKey_string,
      priority: priority,
      nettype: parseInt(netType),
      resolvedAddress: "",
      manuallyEnteredPaymentID: manualPaymentId,
      resolvedPaymentID: "",
    };

    args.willBeginSending_fn = () => {
      setTxnStatus('Fetching decoy outputs..')
    };
    args.authenticate_fn = (cb: any) => {
      function Initiate_VerifyUserAuthenticationForAction(
        customNavigationBarTitle_orNull: any, // String? -- null if you don't want one
        canceled_fn: any, // () -> Void
        entryAttempt_succeeded_fn: any // () -> Void
      ) {
        entryAttempt_succeeded_fn(); // rather than not implementing this in Lite mode, just going to return immediately - it's more convenient for app objects to be coded as if it exists
      }
      Initiate_VerifyUserAuthenticationForAction(
        "Authenticate",
        function () {
          cb(false);
        },
        function () {
          cb(true);
        }
      );
    };
    args.status_update_fn = (params: any) => {
      const raw_amount_string = amount;
      const statusUpdate_messageBase = isSweepTx
        ? "Sending wallet balance…"
        : `Sending ${raw_amount_string} BDX…`;
      const suffix = processStepMessageSuffix_byEnumVal[params.code]; // this is kept in JS rather than C++ to allow for localization via the same mechanism as the rest of the app
      // preSuccess_nonTerminal_statusUpdate_fn(`${statusUpdate_messageBase} ${suffix}`) // TODO: localize concatenation
      console.log("status_update_fn ::", statusUpdate_messageBase, suffix);
    };
    args.canceled_fn = () => {
      console.log("canceled_fn ");
      clearStates();
    };
    args.success_fn = (params: any) => {
      console.log("success_fn ::", params);
      setTxnStatus("success");
      //
      const total_sent__JSBigInt: any = BigInt("" + params.total_sent);
      const total_sent__atomicUnitString = total_sent__JSBigInt.toString();
      // const total_sent__floatString = monero_amount_format_utils.formatMoney(total_sent__JSBigInt)
      // const total_sent__float = parseFloat(total_sent__floatString)
      //
      const mockedTransaction = {
        hash: params.tx_hash,
        mixin: "" + params.mixin,
        coinbase: false,
        mempool: true,
        //
        isJustSentTransaction: true, // this is set back to false once the server reports the tx's existence
        timestamp: new Date(), // faking
        //
        unlock_time: 0,
        //
        // height: null, // mocking the initial value -not- to exist (rather than to erroneously be 0) so that isconfirmed -> false
        //
        total_sent: total_sent__JSBigInt,
        total_received: 0,
        //
        approx_float_amount: -1 * total_sent__atomicUnitString, // -1 cause it's outgoing
        // amount: new JSBigInt(sentAmount), // not really used (note if you uncomment, import JSBigInt)
        //
        payment_id: params.final_payment_id ? params.final_payment_id : "", // b/c `payment_id` may be nil of short pid was used to fabricate an integrated address
        //
        // info we can only preserve locally
        tx_fee: params.used_fee,
        tx_key: params.tx_key,
        target_address: params.target_address,
        isConfirmed: false
      };
      dispatch(setTransactionhistory(mockedTransaction));
      // fn(null, mockedTransaction, params.isXMRAddressIntegrated, params.integratedAddressPIDForDisplay)
      //
      // manually insert .. and subsequent fetches from the server will be
      // diffed against this, preserving the tx_fee, tx_key, target_address...
      // self._manuallyInsertTransactionRecord(mockedTransaction)
      clearStates();
    };
    args.error_fn = (params: any) => {
      sendFundErrorhandle(params)
    };
    args.get_unspent_outs_fn = (req_params: any, cb: any) => {
      coreBridgeInstance.hostedMoneroAPIClient.UnspentOuts(req_params, cb);
      console.log("get_unspent_outs_fn ::", req_params);
    };
    args.get_random_outs_fn = (req_params: any, cb: any) => {
      coreBridgeInstance.hostedMoneroAPIClient.RandomOuts(req_params, cb);
      console.log("get_random_outs_fn ::", req_params);
    };
    args.submit_raw_tx_fn = (req_params: any, cb: any) => {
      setTxnStatus('Submiting Transaction.')

      coreBridgeInstance.hostedMoneroAPIClient.SubmitRawTx(req_params, cb);
      console.log("submit_raw_tx_fn ::", req_params);
    };
    console.log("argsargs::", args);
    coreBridgeInstance.beldex_utils.async__send_funds(args);
  };


  const clearStates = () => {
    setPriority(5);
    setToAddress("");
    setAmount("");
    setIsSweepTx(false);
    setManualPaymentId("");
    setPaymentIdToggle(false);
    setRegistrationString("");
    setRegistrationToggle(false);
    setErrRegistration("");
  }

  const PaymentSuccessDialog = () => {
    return (
      <Box sx={style} >
        <Typography
          component={"h2"}
          variant="h6"
          sx={{ fontWeight: "700" }}
          textAlign={"center"}
        >
          {isRegister ? "Masternode registered!" : "Your BDX is on it's way.."}
        </Typography>

        <Box textAlign={"center"} mt={2}>

          {theme.palette.mode === 'dark' ? <SuccessTxnTickIconDark sx={{ width: '8rem', height: '8rem' }} /> : <SuccessTxnTickIconWhite sx={{ width: '8rem', height: '8rem' }} />}
        </Box>
        <Box textAlign={"center"} mt={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontWeight: 600,
              width: "150px",
              height: "45px",
              borderRadius: "10px",
              color: "white",
            }}
            onClick={() => { setTxnStatus(""), handleClose() }}
          >
            Ok
          </Button>
        </Box>
      </Box>
    )
  }


  useEffect(() => {
    newEstimatedNetworkFeeDisplay();
  }, []);

  useEffect(() => {
    if (prefill && prefill.address) {
      setToAddress(prefill.address);
      setErrAddress("");
      if (prefill.paymentId) {
        setManualPaymentId(prefill.paymentId);
        setPaymentIdToggle(true);
      }
      onPrefillConsumed && onPrefillConsumed();
    }
  }, [prefill]);

  return (
    <Box
      className="sendFund"
      sx={{
        padding: `0 ${isMobileMode ? '15px' : '20px'}`,
        height: "100%",
        marginTop: isMobileMode ? "10px" : 'unset',
        borderRadius: '20px',
        overflow: 'auto',
        background: (theme) => theme.palette.success.main,
        ".MuiSelect-iconFilled": { fill: "white", color: "white" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          backgroundColor: "transparent",
          borderRadius: "12px",
          border: (theme) => `2px solid ${theme.palette.mode === "dark" ? "#32324A" : "#D1D1D1"}`,
          padding: "7px",
          marginTop: isMobileMode ? "10px" : "20px",
          height: "60px", // Increased height to accommodate larger padding
          alignItems: "center",
        }}
      >
        <Button
          fullWidth
          sx={{
            height: "100%",
            borderRadius: "10px",
            backgroundColor: !registrationToggle ? (theme.palette.mode === "dark" ? "#32324A" : "#FFFFFF") : "transparent",
            color: !registrationToggle ? theme.palette.text.primary : "#8787A8",
            textTransform: "none",
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: !registrationToggle ? (theme.palette.mode === "dark" ? "#383854" : "#F9F9F9") : "transparent",
            },
            padding: '8px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => {
            setRegistrationToggle(false);
            setPriority(5);
          }}
        >
          Send BDX
        </Button>
        <Button
          fullWidth
          sx={{
            height: "100%",
            borderRadius: "10px",
            backgroundColor: registrationToggle ? (theme.palette.mode === "dark" ? "#32324A" : "#FFFFFF") : "transparent",
            color: registrationToggle ? theme.palette.text.primary : "#8787A8",
            textTransform: "none",
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: registrationToggle ? (theme.palette.mode === "dark" ? "#383854" : "#F9F9F9") : "transparent",
            },
            padding: '8px',
            whiteSpace: 'nowrap',
          }}
          onClick={() => {
            setRegistrationToggle(true);
            setPriority(1);
          }}
        >
          Register Masternode
        </Button>
      </Box>
      <Box
        mt={2}
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          mr={1}
          sx={{
            color: "#8787A8",
            fontSize: 14,
            fontWeight: 600,

            // fontFamily: "poppins-semibold",
          }}
        >
          Available Balance
        </Typography>
        {/* <InfoOutlinedIcon sx={{ color: "#8787A8", fontSize: 18 }} /> */}
      </Box>
      <Typography
        mr={1}
        textAlign="center"
        sx={{ fontSize: '1.2rem', fontWeight: 600 }}
      >
        {walletDetails.unlocked_balance}{" "}
        <span style={{ color: "#20D030" }}>BDX</span>
      </Typography>
      <Box mt={3} mb={3} sx={{ height: "0.2px", backgroundColor: "#8787A8" }} />
      {!registrationToggle ? (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              width: "72%",
            }}
          >
            <Typography
              mt={2}
              mb={1}
              sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
            >
              Amount
            </Typography>
            <Typography
              mt={2}
              sx={{ color: "#FC2727", fontWeight: 400, fontSize: "0.9rem" }}
            >
              {errAmount}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Box
              sx={{
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
                padding: "0 20px",
                width: "100%",
                color: "white",
                borderRadius: "12px",
                border: errAmount ? "1px solid #FC2727" : "none",
              }}
              display="flex"
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <Input
                placeholder="00.00"
                disableUnderline={true}
                sx={{
                  width: "100%",
                  height: "55px",
                  color: (theme) => theme.palette.text.secondary,
                }}
                value={amount}
                onChange={(event: any) => numberOnly(event.target.value)}
              />
            </Box>
            <Button
              color="info"
              variant="contained"
              onClick={() => setAmount(walletDetails.unlocked_balance)}
              sx={{
                marginLeft: "10px",
                width: "100px",
                height: "35px",
                borderRadius: "10px",
                fontWeight: 600,
                color: "white",
              }}
            >
              Max
            </Button>
          </Box>
          <Box display="flex" flexDirection="row" mb={2} mt={1}>
            <Typography
              mr={1}
              sx={{
                color: "#8787A8",
                fontSize: 14,
              }}
            >
              {estimtionFees}
            </Typography>
            {/* <InfoOutlinedIcon sx={{ color: "#8787A8", fontSize: 18 }} /> */}
          </Box>
        </>
      ) : (
        <Box display="flex" flexDirection="row" mb={2} mt={2}>
          <Typography
            mr={1}
            sx={{
              color: "#8787A8",
              fontSize: 14,
            }}
          >
            Registration uses the current transaction priority and estimated fee.
          </Typography>
        </Box>
      )}
      {!registrationToggle ? (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            sx={
              {
                // width: "72%",
              }
            }
          >
            <Typography
              component={"span"}
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              To
              {/* <InfoOutlinedIcon
                sx={{ color: "#8787A8", fontSize: 14, marginLeft: "6px" }}
              /> */}
            </Typography>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography
                sx={{ color: "#FC2727", fontWeight: 400, fontSize: "0.9rem" }}
              >
                {errAddress}
              </Typography>
              <IconButton
                onClick={openSaveAddressPrompt}
                title="Save this address"
                sx={{ padding: "4px", marginLeft: "4px" }}
              >
                <BookmarkAddOutlinedIcon sx={{ fontSize: "1.2rem", color: theme.palette.primary.main }} />
              </IconButton>
              <IconButton
                onClick={() => setAddressBookOpen(true)}
                title="Pick a saved address"
                sx={{ padding: "4px" }}
              >
                <ContactsOutlinedIcon sx={{ fontSize: "1.2rem", color: theme.palette.primary.main }} />
              </IconButton>
            </Box>
          </Box>

          <Input
            placeholder="Beldex Address"
            disableUnderline={true}
            multiline
            sx={{
              width: "100%",
              minHeight: '110px',
              maxHeight: "125px",
              color: theme.palette.text.primary,
              backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
              padding: "10px 20px",
              borderRadius: "12px",
              border: errAddress ? "1px solid #FC2727" : "none",
              overflow: "auto",
              marginTop: "10px",
            }}
            value={toAddress}
            onChange={(event: any) => addressInputChange(event)}
          />
          {paymentIdToggle ? (
            <>
              <Typography
                mt={2}
                mb={1}
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                }}
              >
                Enter Payment ID or
                <span
                  style={{
                    color: "#289AFB",
                    textDecoration: "underline",
                    marginLeft: "5px",
                  }}
                  onClick={() => generatePaymentId()}
                >
                  Generate One
                </span>
              </Typography>

              <Input
                placeholder="Enter the Payment ID"
                disableUnderline={true}
                value={manualPaymentId}
                inputProps={{ maxLength: 16 }}
                sx={{
                  width: "100%",
                  height: "55px",
                  color: theme.palette.text.primary,
                  backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
                  padding: "0 20px",
                  borderRadius: "12px",
                  overflow: "auto",
                }}
                onChange={(event: any) => paymentInputChange(event)}
              />
            </>
          ) : (
            <Typography
              mt={2}
              mb={1}
              sx={{
                color: "#289AFB",
                fontWeight: 400,
                fontSize: "1rem",
                textDecorationLine: "underline",
                cursor: "pointer",
              }}
              onClick={() => setPaymentIdToggle(true)}
            >
              + Add Payment ID
            </Typography>
          )}
        </>
      ) : (
        <>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Typography
              component={"span"}
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
              }}
            >
              Registration String
            </Typography>
            <Typography
              sx={{ color: "#FC2727", fontWeight: 400, fontSize: "0.9rem" }}
            >
              {errRegistration}
            </Typography>
          </Box>

          <Input
            placeholder="Enter the registration string"
            disableUnderline={true}
            multiline
            minRows={4}
            sx={{
              width: "100%",
              minHeight: "120px",
              color: theme.palette.text.primary,
              backgroundColor: (theme) => theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
              padding: "10px 20px",
              borderRadius: "12px",
              border: errRegistration ? "1px solid #FC2727" : "none",
              overflow: "auto",
              marginTop: "10px",
            }}
            value={registrationString}
            onChange={registrationInputChange}
          />
          <Typography
            mt={1}
            sx={{
              color: "#8787A8",
              fontSize: 14,
            }}
          >
            Paste the full master node registration string here. The send flow
            will submit it as a registration transaction.
          </Typography>
        </>
      )}
      <Box display="flex" flexDirection="row" alignItems="center" mt={2}>
        <Typography
          component={"span"}
          mr={"4px"}
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
          }}
        >
          Priority
        </Typography>
        {/* <InfoOutlinedIcon sx={{ color: "#8787A8", fontSize: 14 }} /> */}
        <Select
          sx={{
            color: theme.palette.text.primary,
            backgroundColor: (theme: any) => theme.palette.secondary.main,
            height: "35px",
            borderRadius: "10px",
            marginLeft: "25px",

            "& .MuiSelect-icon": {
              fill: theme.palette.text.primary,
              color: theme.palette.text.primary,
            },
          }}
          SelectDisplayProps={{
            style: {
              paddingTop: "10px",
              paddingBottom: "10px",
              backgroundColor: theme.palette.secondary.main,
              borderRadius: "10px",
              width: "77px",
            },
          }}
          variant="filled"
          disableUnderline
          IconComponent={KeyboardArrowDownIcon}
          inputProps={{
            MenuProps: {
              MenuListProps: {
                sx: {
                  color: theme.palette.text.primary,
                  backgroundColor: (theme: any) => theme.palette.secondary.main,
                },
              },
            },
          }}
          value={priority}
          defaultValue={priority}
          onChange={(event: any) => { setPriority(event.target.value), newEstimatedNetworkFeeDisplay() }}
        >
          <MenuItem value={5}>Flash</MenuItem>
          <MenuItem value={1}>Normal</MenuItem>
        </Select>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        mt={'35px'}
      >
        <Button
          variant="contained"
          color="secondary"
          sx={{
            fontWeight: 600,
            marginRight: "20px",
            width: "150px",
            height: "45px",
            borderRadius: isMobileMode ? '40px' : "10px",
            // color: "white",
            color: theme.palette.text.primary,
          }}
          onClick={clearStates}
        >
          <RefreshIcon sx={{ marginRight: '7px' }} /> Reset
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{
            fontWeight: 600,
            width: "150px",
            height: "45px",
            // borderRadius: "10px",
            borderRadius: isMobileMode ? '40px' : "10px",
            color: "white",

            // color: theme.palette.text.primary,
          }}
          onClick={() => sendFundFieldValidation()}
        >
          <CallMadeIcon sx={{ marginRight: '7px' }} />
          {registrationToggle ? "Register" : "Send"}
        </Button>
      </Box>

      {/* confirm payment modals */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {txnStatus !== "success" ?
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h5"
              component="h2"
              textAlign="center"
              sx={{ fontWeight: "700" }}
            >
              Confirm Sending
            </Typography>
            {isRegister ? (
              <>
                <Typography mt={1} sx={{ fontWeight: "400", fontSize: "1.1rem" }}>
                  Registration String :
                </Typography>
                <Typography
                  id="modal-modal-description"
                  sx={{ wordBreak: "break-all", fontWeight: "300" }}
                >
                  {registrationString}
                </Typography>
              </>
            ) : (
              <>
                <Typography mt={1} sx={{ fontWeight: "400", fontSize: "1.1rem" }}>
                  Address :
                </Typography>
                <Typography
                  id="modal-modal-description"
                  sx={{ wordBreak: "break-all", fontWeight: "300" }}
                >
                  {toAddress}
                </Typography>
                <Typography
                  mt={1}
                  sx={{ color: "#77778B", fontWeight: "400", fontSize: "1.1rem" }}
                >
                  Amount :{" "}
                  <Typography
                    component={"span"}
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {amount}
                  </Typography>
                </Typography>
              </>
            )}
            {txnStatus === 'confirmation' ?
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                mt={5}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    fontWeight: 600,
                    marginRight: "10px",
                    width: "150px",
                    height: "45px",
                    borderRadius: "10px",
                    color: theme.palette.text.primary,
                  }}
                  onClick={handleClose}
                >
                  cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    width: "150px",
                    height: "45px",
                    borderRadius: "10px",
                    color: '#fff',

                  }}
                  onClick={() => intiate_transaction()}
                >

                  Confirm
                </Button>
              </Box>
              :
              <Box mt={2} sx={{ backgroundColor: theme.palette.mode === 'dark' ? "#32324A" : '#fff', padding: '10px 20px', borderRadius: '10px' }}  >
                <Typography
                  sx={{ color: '#77778B', fontWeight: 400, fontSize: isMobileMode ? "0.8rem" : '1rem' }}
                >
                  Sending <span style={{ color: '#00AD07', fontWeight: '700', fontSize: '1.1rem' }}>{amount} BDX.. </span>{txnStatus}
                </Typography>
              </Box>
            }
          </Box>
          :
          <PaymentSuccessDialog />

        }


      </Modal>

      {/* saved address picker */}
      <Modal open={addressBookOpen} onClose={() => setAddressBookOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobileMode ? 320 : 480,
            maxHeight: "80vh",
            overflow: "auto",
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: "22px",
          }}
        >
          <AddressBook onSelect={handlePickSavedAddress} />
        </Box>
      </Modal>

      {/* save current address prompt */}
      <Modal open={saveAddressOpen} onClose={() => setSaveAddressOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobileMode ? 320 : 480,
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: "22px",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Save Address
          </Typography>
          <Typography mt={2} sx={{ fontWeight: 600 }}>Label</Typography>
          <Input
            placeholder="e.g. Exchange, Friend, Savings"
            disableUnderline
            fullWidth
            autoFocus
            sx={{
              width: "100%",
              height: "50px",
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.mode === "dark" ? "#1C1C26" : "#F2F2F2",
              padding: "0 16px",
              borderRadius: "12px",
              marginTop: "8px",
              marginBottom: "8px",
            }}
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
          />
          {saveLabelError && (
            <Typography sx={{ color: "#FC2727", fontSize: "0.9rem", mb: 1 }}>
              {saveLabelError}
            </Typography>
          )}
          <Typography sx={{ color: "#8787A8", fontSize: "0.8rem", wordBreak: "break-all" }}>
            {toAddress}
          </Typography>
          <Box display="flex" flexDirection="row" justifyContent="center" mt={3}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ fontWeight: 600, marginRight: "10px", width: "150px", height: "45px", borderRadius: "10px", color: theme.palette.text.primary }}
              onClick={() => setSaveAddressOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ fontWeight: 600, width: "150px", height: "45px", borderRadius: "10px", color: "#fff" }}
              onClick={confirmSaveAddress}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <ToastMsg ref={toastMsgRef} />

    </Box>
  );
};

export default SendFund;
