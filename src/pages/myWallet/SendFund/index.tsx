import React, { useRef, useState, useEffect } from "react";
import { rf } from "../../../utils/responsiveFont";
import {
  Box,
  Typography,
  Input,
  Button,
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
import { CoreBridgeInstanceContext } from "../../../CoreBridgeInstanceContext";
import { useTheme } from "@emotion/react";
import { useSelector } from "react-redux";
import { setTransactionhistory } from "../../../stores/features/seedDetailSlice";
import Modal from "@mui/material/Modal";
import SuccessTxnTickIconWhite from "../../../icons/SuccessTxnTickIconWhite";
import SuccessTxnTickIconDark from "../../../icons/SuccessTxnTickIconDark";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import AddressBook from "../AddressBook";
import { addSavedAddress } from "../../../stores/features/addressBookSlice";
import { SavedAddress } from "../../../services/addressBookStorage";
import { getNetType } from "../../../services/runtimeConfig";
import { looksLikeBnsName, resolveBnsWallet } from "../../../services/bns";
import TxAuthGate from "../../../components/txAuthGate/TxAuthGate";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";
import { copyToClipboard } from "../../../services/clipboard";
import { recordRegisteredToken, tokensSelector } from "../../../stores/features/tokensSlice";
import { spendableBalance } from "../../../services/tokenApi";
import { atomicToDisplay, groupDigits, shortenTokenId } from "../../../utils/tokenAmount";

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
  const navigate = useNavigate();

  // const [currency, setCurrency] = useState("AUD");
  const [priority, setPriority] = useState(5);
  const [toAddress, setToAddress] = useState("");
  // Live BNS resolution of the recipient field (ported from the extension):
  // typing a name like "myname.bdx" resolves it via the explorer and the send
  // goes to the resolved wallet address.
  const [bnsResolved, setBnsResolved] = useState<{ name: string; address: string } | null>(null);
  const [bnsResolving, setBnsResolving] = useState(false);
  const [bnsError, setBnsError] = useState("");
  const [amount, setAmount] = useState("");
  const [isSweepTx, setIsSweepTx] = useState(false);
  const [paymentIdToggle, setPaymentIdToggle] = useState(false);
  const [manualPaymentId, setManualPaymentId] = useState("");
  const [estimtionFees, setEstimationFees] = useState("");
  const [registrationString, setRegistrationString] = useState("");
  /* Which asset the Send tab is spending. "" is BDX; anything else is a
     privacy token id. It drives the unit everywhere below - the amount field,
     its validation, Max, the review dialog - because a token's scale is its
     own and has nothing to do with BDX's 9 decimals. The fee is always BDX
     regardless, so both units appear on the same screen. */
  const [sendAsset, setSendAsset] = useState("");
  const { balances: tokenBalances, chainInfo: tokenChainInfo } = useAppSelector(tokensSelector);

  const heldAssets = React.useMemo(() => {
    const list = Object.values(tokenBalances as any).map((b: any) => {
      const info = (tokenChainInfo as any)[b.tokenId];
      return {
        id: b.tokenId,
        ticker: info ? info.ticker : shortenTokenId(b.tokenId, 6, 4),
        decimals: info ? info.decimalPoint : 0,
        amount: atomicToDisplay(spendableBalance(b), info ? info.decimalPoint : 0),
      };
    });
    return list.filter((t: any) => t.amount !== "" && t.amount !== "0");
  }, [tokenBalances, tokenChainInfo]);

  const selectedAsset = heldAssets.find((t: any) => t.id === sendAsset);
  const isTokenSend = Boolean(selectedAsset);

  const [registrationToggle, setRegistrationToggle] = useState(false);
  const isRegister = registrationToggle && registrationString.trim() !== "";
  // HF22 private tokens. A third mode alongside "Send BDX" and "Register
  // Masternode": it registers a new token, which mints the initial supply to
  // this wallet and locks collateral rather than paying it away.
  const [tokenToggle, setTokenToggle] = useState(false);
  const [tokenTicker, setTokenTicker] = useState("");
  const [tokenFullName, setTokenFullName] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("8");
  const [tokenSupply, setTokenSupply] = useState("");
  const [tokenMaxSupply, setTokenMaxSupply] = useState("");
  const [errToken, setErrToken] = useState("");
  // Protocol constants (collateral, lock period, descriptor limits) come from
  // the bridge rather than being duplicated here, so they cannot drift out of
  // step with consensus. Null until the bridge answers.
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  // What the just-completed registration produced. Held as a whole record
  // rather than the bare id because the success dialog renders after
  // clearStates() has emptied the form, so it cannot read the ticker or supply
  // back off the inputs.
  const [registeredToken, setRegisteredToken] = useState<{
    tokenId: string;
    ticker: string;
    fullName: string;
    decimalPoint: number;
    currentSupply: string;
    totalMaxSupply: string;
  } | null>(null);
  // Ask the bridge once for the protocol's registration costs and limits.
  // Guarded because an older bridge build does not export this call; the form
  // then falls back to its built-in limits and simply cannot show the
  // collateral figure.
  React.useEffect(() => {
    try {
      // Call it as a method. Pulling the function off into a local and invoking
      // it bare leaves `this` undefined, and the bridge reads `this.Module` --
      // so every call threw and the form silently lost the collateral figure.
      const utils = coreBridgeInstance?.beldex_utils;
      if (utils && typeof utils.token_registration_info === "function") {
        const raw = utils.token_registration_info();
        setTokenInfo(typeof raw === "string" ? JSON.parse(raw) : raw);
      }
    } catch (e) {
      console.warn("token_registration_info unavailable:", e);
    }
  }, [coreBridgeInstance]);
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

  // PIN/biometric confirmation before signing: the WASM send pipeline pauses
  // in authenticate_fn until the gate reports back through this callback.
  const security = useSelector((state: any) => state.securityReducer);
  const [authOpen, setAuthOpen] = useState(false);
  const authCbRef = useRef<((ok: boolean) => void) | null>(null);
  const handleAuthResult = (ok: boolean) => {
    setAuthOpen(false);
    const cb = authCbRef.current;
    authCbRef.current = null;
    cb?.(ok);
  };

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 352 : 552,
    maxWidth: "92vw",
    maxHeight: "80vh",
    overflow: "auto",
    bgcolor: "background.paper",
    // border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "0px",
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

  // The address the transaction actually goes to: a resolved BNS wallet when
  // the user typed a name, otherwise the raw input (primary or integrated).
  const effectiveToAddress = () =>
    looksLikeBnsName(toAddress) && bnsResolved ? bnsResolved.address : toAddress.trim();

  // Debounced live resolution while the user types a BNS name.
  useEffect(() => {
    setBnsResolved(null);
    setBnsError("");
    const input = toAddress.trim();
    if (!input || !looksLikeBnsName(input)) return;
    const t = setTimeout(async () => {
      setBnsResolving(true);
      try {
        const addr = await resolveBnsWallet(input);
        if (addr) {
          // sanity: the registry must return a valid Beldex address
          coreBridgeInstance.beldex_utils.decode_address(addr, getNetType());
          setBnsResolved({ name: input.toLowerCase(), address: addr });
        } else {
          setBnsError(`No wallet record for "${input}"`);
        }
      } catch (e: any) {
        setBnsError(`BNS lookup failed: ${e?.message ?? e}`);
      } finally {
        setBnsResolving(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [toAddress]);

  const addressInputChange = (e: any) => {
    const value = e.target.value;
    // Addresses are alphanumeric; BNS names may also carry . - _
    const recipientRegex = /^[a-zA-Z0-9._-]*$/;
    if (recipientRegex.test(value)) {
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
    // A resolved BNS name saves its wallet address; raw input must look like
    // a primary (~95 char) or integrated (~106 char) address.
    const addr = effectiveToAddress();
    if (!addr || addr.length < 95 || addr.length > 106) {
      handleShowToastMsg("Enter a valid address before saving it", false);
      return;
    }
    setSaveLabel(looksLikeBnsName(toAddress) && bnsResolved ? bnsResolved.name : "");
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
        address: effectiveToAddress(),
        paymentId: manualPaymentId || undefined,
        bnsName: looksLikeBnsName(toAddress) && bnsResolved ? bnsResolved.name : undefined,
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

    if (tokenToggle) {
      const limits = tokenInfo || {};
      const maxTicker = Number(limits.max_ticker_length || 14);
      const maxName = Number(limits.max_full_name_length || 400);
      const maxDp = Number(limits.max_decimal_point || 18);
      if (!/^[A-Za-z0-9]{1,14}$/.test(tokenTicker.trim()) || tokenTicker.trim().length > maxTicker) {
        setErrToken(`Ticker must be 1-${maxTicker} letters or digits`);
        handleShowToastMsg(`Ticker must be 1-${maxTicker} letters or digits`, false);
        return;
      }
      if (tokenFullName.length > maxName) {
        setErrToken(`Name must be at most ${maxName} characters`);
        handleShowToastMsg(`Name must be at most ${maxName} characters`, false);
        return;
      }
      const dp = Number(tokenDecimals);
      if (!Number.isInteger(dp) || dp < 0 || dp > maxDp) {
        setErrToken(`Decimals must be a whole number between 0 and ${maxDp}`);
        handleShowToastMsg(`Decimals must be between 0 and ${maxDp}`, false);
        return;
      }
      if (!tokenMaxSupply.trim() || Number(tokenMaxSupply) <= 0) {
        setErrToken("Max supply is required");
        handleShowToastMsg("Max supply is required", false);
        return;
      }
      if (Number(tokenSupply || 0) > Number(tokenMaxSupply)) {
        setErrToken("Initial supply cannot exceed max supply");
        handleShowToastMsg("Initial supply cannot exceed max supply", false);
        return;
      }
      setErrToken("");
      handleOpen();
      setTxnStatus("confirmation");
      return;
    }

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
    /* Balance checks run against whichever asset is selected. For a token the
       comparison is against that token's balance in its own scale, and the
       ceiling is the whole balance: the fee is BDX and does not come out of
       it - unlike a BDX send, where the fee has to be left behind. */
    const assetBalance = isTokenSend
      ? Number(selectedAsset!.amount)
      : Number(walletDetails.unlocked_balance);
    const assetTicker = isTokenSend ? selectedAsset!.ticker : "BDX";

    if (Number(amount) > assetBalance) {
      setErrAmount(`Not enough unlocked ${assetTicker}`);
      handleShowToastMsg(`Not enough unlocked ${assetTicker}`, false);
      return;
    }
    // A token send is never a sweep: sweeping is a BDX notion, and the BDX side
    // of a token transfer only ever covers the fee.
    if (!isTokenSend && Number(amount) === Number(walletDetails.unlocked_balance)) {
      setIsSweepTx(true);
    }
    // Sending a token still costs BDX, and a wallet holding plenty of the token
    // but no coin is a confusing failure if it is not named.
    if (isTokenSend && Number(walletDetails.unlocked_balance) <= 0) {
      setErrAmount("No BDX to pay the network fee");
      handleShowToastMsg("Sending a token still needs BDX for the network fee", false);
      return;
    }
    if (!toAddress) {
      setErrAddress("Invalid address");
      console.log("couldn't validate destination beldex address");
      return;
    }
    if (looksLikeBnsName(toAddress)) {
      // BNS name: must have resolved to a wallet address before sending.
      if (bnsResolving) {
        handleShowToastMsg("Still resolving the BNS name — one moment…", false);
        return;
      }
      if (!bnsResolved) {
        setErrAddress(bnsError || "Could not resolve BNS name");
        handleShowToastMsg(bnsError || "Could not resolve BNS name", false);
        return;
      }
    } else if (toAddress.length > 106 || toAddress.length < 95) {
      // Raw address: primary (~95) or integrated/unique with payment ID (~106).
      // return ToastUtils.pushToastError('invalidAddress', 'Invalid address');
      setErrAddress("Invalid address");

      console.log("Invalid address");
      return;
    }
    addressValidation(effectiveToAddress());
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
    // Drop any previous registration result. The success modal can also be
    // dismissed by tapping the backdrop, which leaves this set; without the
    // reset the next ordinary send would show the last token's id.
    setRegisteredToken(null);
    let args: any = {
      registration_string: registrationString,
      isRegister: isRegister,
      // HF22: registering a token supplies no destinations -- they are derived
      // from the descriptor and all pay back to this wallet. The bridge
      // ignores both fields unless is_deploy_token is set, so an ordinary send
      // is unaffected.
      // HF22: naming a token switches the whole send to it. The amounts in
      // destinations are then in that token's units, while the fee stays BDX
      // and is drawn from native outputs.
      token_id: isTokenSend ? sendAsset : undefined,
      token_decimal_point: isTokenSend ? String(selectedAsset!.decimals) : undefined,
      is_deploy_token: tokenToggle,
      token_descriptor: tokenToggle
        ? {
            ticker: tokenTicker.trim(),
            full_name: tokenFullName.trim(),
            meta_info: "",
            decimal_point: tokenDecimals,
            total_max_supply: tokenMaxSupply,
            current_supply: tokenSupply || "0",
          }
        : undefined,
      fromWallet_didFailToInitialize: false,
      fromWallet_didFailToBoot: false,
      fromWallet_needsImport: false,
      requireAuthentication: true,
      destinations: [
        {
          to_address: effectiveToAddress(),
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
      // Gate the spend behind the app-lock credentials (PIN / biometrics).
      // Without any enrolled credential there is nothing to verify against,
      // so the flow proceeds (Settings → App Lock to set a PIN).
      if (!security?.hasPin && !security?.biometryAvailable) {
        cb(true);
        return;
      }
      authCbRef.current = cb;
      setAuthOpen(true);
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
      handleClose();
      clearStates();
    };
    args.success_fn = (params: any) => {
      console.log("success_fn ::", params);
      setTxnStatus("success");
      // HF22: a registration is the only place the token id appears. It is
      // hashed from the descriptor plus a salt the bridge generates and does
      // not keep, so it cannot be derived again from anything the user typed.
      // Write it to the token registry before touching anything else on this
      // path - if the app is killed a moment later, the id must already be on
      // disk or it is gone for good.
      if (params.token_id) {
        const record = {
          tokenId: String(params.token_id),
          ticker: tokenTicker.trim(),
          fullName: tokenFullName.trim(),
          decimalPoint: Number(tokenDecimals) || 0,
          currentSupply: (tokenSupply || "0").trim(),
          totalMaxSupply: tokenMaxSupply.trim(),
        };
        setRegisteredToken(record);
        dispatch(
          recordRegisteredToken({
            ...record,
            walletAddress: walletDetails.address_string,
            txHash: params.tx_hash ? String(params.tx_hash) : undefined,
            registeredAt: Date.now(),
          })
        );
      }
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
    };
    // NOTE: `args` contains the secret view/spend keys - never log it.
    coreBridgeInstance.beldex_utils.async__send_funds(args);
  };


  // Load a token descriptor from a JSON file, using the same schema the CLI's
  // deploy_new_token takes, so a spec written for the terminal works here
  // unchanged:
  //   { "ticker", "full_name", "decimal_point", "total_max_supply",
  //     "current_supply", "meta_info", "version", "owner" }
  //
  // The CLI stores supplies as atomic uint64 while this form works in
  // human-readable units (the bridge re-applies the scale), so they are
  // converted on the way in. `owner` is deliberately ignored: the bridge always
  // sets the owner to this wallet's spend key, and a file naming someone else
  // would silently produce a token this wallet could never mint from.
  const loadTokenDescriptorFile = (file: File) => {
    const reader = new FileReader();
    reader.onerror = () => {
      setErrToken("Could not read that file");
      handleShowToastMsg("Could not read that file", false);
    };
    reader.onload = () => {
      let spec: any;
      try {
        spec = JSON.parse(String(reader.result));
      } catch (e) {
        setErrToken("That file is not valid JSON");
        handleShowToastMsg("That file is not valid JSON", false);
        return;
      }
      if (typeof spec !== "object" || spec === null) {
        setErrToken("Token spec must be a JSON object");
        handleShowToastMsg("Token spec must be a JSON object", false);
        return;
      }
      const dp = spec.decimal_point !== undefined ? Number(spec.decimal_point) : 8;
      if (!Number.isInteger(dp) || dp < 0 || dp > 18) {
        setErrToken("decimal_point must be a whole number between 0 and 18");
        handleShowToastMsg("decimal_point must be between 0 and 18", false);
        return;
      }
      setTokenDecimals(String(dp));
      if (spec.ticker !== undefined) setTokenTicker(String(spec.ticker));
      if (spec.full_name !== undefined) setTokenFullName(String(spec.full_name));
      if (spec.total_max_supply !== undefined)
        setTokenMaxSupply(atomicToDisplay(spec.total_max_supply, dp));
      if (spec.current_supply !== undefined)
        setTokenSupply(atomicToDisplay(spec.current_supply, dp));
      if (spec.owner !== undefined) {
        handleShowToastMsg("Ignoring 'owner': the registering wallet is always the owner", true);
      }
      setErrToken("");
      handleShowToastMsg("Token spec loaded", true);
    };
    reader.readAsText(file);
  };

  const clearStates = () => {
    setPriority(5);
    setToAddress("");
    setBnsResolved(null);
    setBnsError("");
    setAmount("");
    setIsSweepTx(false);
    setSendAsset("");
    setManualPaymentId("");
    setPaymentIdToggle(false);
    setRegistrationString("");
    setRegistrationToggle(false);
    setErrRegistration("");
    setTokenToggle(false);
    setTokenTicker("");
    setTokenFullName("");
    setTokenDecimals("8");
    setTokenSupply("");
    setTokenMaxSupply("");
    setErrToken("");
  }

  const copyTokenId = async () => {
    if (!registeredToken) return;
    const ok = await copyToClipboard(registeredToken.tokenId);
    handleShowToastMsg(ok ? "Token id copied" : "Could not copy the token id", ok);
  };

  const dismissSuccess = () => {
    setTxnStatus("");
    setRegisteredToken(null);
    handleClose();
  };

  const PaymentSuccessDialog = () => {
    return (
      <Box sx={style} >
        <Typography
          component={"h2"}
          variant="h6"
          sx={{ fontWeight: "700" }}
          textAlign={"center"}
        >
          {registeredToken
            ? "Token registered!"
            : isRegister
              ? "Masternode registered!"
              : "Your BDX is on it's way.."}
        </Typography>

        <Box textAlign={"center"} mt={2}>

          {theme.palette.mode === 'dark' ? <SuccessTxnTickIconDark sx={{ width: '8rem', height: '8rem' }} /> : <SuccessTxnTickIconWhite sx={{ width: '8rem', height: '8rem' }} />}
        </Box>

        {/* The token id is generated during registration and is not derivable
            from anything the user entered. This dialog is the first and only
            moment it can be shown, so it is shown in full and made copyable
            here rather than summarised - and it is also written to My Tokens,
            which is what the "View" button opens. */}
        {registeredToken && (
          <Box
            mt={2}
            sx={{
              border: `1px solid ${theme.palette.mode === "dark" ? "#2A2A38" : "#EFEFEF"}`,
              background: theme.palette.mode === "dark" ? "#161616" : "#FAFAFA",
              p: 1.5,
            }}
          >
            <Typography sx={{ fontSize: rf(12), fontWeight: 600, textAlign: "center" }}>
              {registeredToken.ticker}
              {registeredToken.fullName ? ` · ${registeredToken.fullName}` : ""}
            </Typography>
            <Typography
              sx={{ fontSize: rf(11), color: theme.palette.text.secondary, textAlign: "center" }}
            >
              Initial supply {registeredToken.currentSupply || "0"} of {registeredToken.totalMaxSupply}
            </Typography>

            <Typography sx={{ fontSize: rf(10), color: theme.palette.text.secondary, mt: 1.5 }}>
              TOKEN ID
            </Typography>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <Typography
                sx={{
                  fontSize: rf(10),
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {registeredToken.tokenId}
              </Typography>
              <IconButton size="small" onClick={copyTokenId} aria-label="Copy token id">
                <ContentCopyIcon sx={{ fontSize: "1.1rem", color: "#3ec745" }} />
              </IconButton>
            </Box>

            <Typography sx={{ fontSize: rf(10), color: theme.palette.text.secondary, mt: 1 }}>
              Saved to My Tokens. It stays pending until the network mines the registration.
            </Typography>
          </Box>
        )}

        <Box textAlign={"center"} mt={2} sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          {registeredToken && (
            <Button
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600, width: "150px", height: "45px", borderRadius: "0px" }}
              onClick={() => { dismissSuccess(); navigate("/tokens"); }}
            >
              View
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontWeight: 600,
              width: "150px",
              height: "45px",
              borderRadius: "0px",
            }}
            onClick={dismissSuccess}
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
        padding: `0 ${isMobileMode ? '12px' : '20px'}`,
        // On mobile the parent (myWallet Send view) is the single scroll
        // container — this panel must flow naturally, otherwise the two nested
        // `overflow:auto` boxes produce a dual scrollbar. Desktop keeps its own
        // scroll since it sits in a fixed-height side column.
        height: isMobileMode ? "auto" : "100%",
        marginTop: 0,
        borderRadius: '0px',
        overflow: isMobileMode ? "visible" : "auto",
        background: (theme) => theme.palette.success.main,
      }}
    >
      <Box
        sx={{
          display: "flex",
          backgroundColor: "transparent",
          borderRadius: "0px",
          border: (theme) => `2px solid ${theme.palette.mode === "dark" ? "#222222" : "#D1D1D1"}`,
          padding: "4px",
          gap: "4px",
          marginTop: isMobileMode ? "6px" : "16px",
          height: { xs: 52, sm: 50 },
          alignItems: "stretch",
        }}
      >
        <Button
          fullWidth
          sx={{
            height: "100%",
            minWidth: 0,
            borderRadius: "0px",
            backgroundColor: !registrationToggle ? (theme.palette.mode === "dark" ? "#222222" : "#FFFFFF") : "transparent",
            color: !registrationToggle ? theme.palette.text.primary : "#8a8a8a",
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: rf(10), sm: rf(12) },
            lineHeight: 1.1,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: !registrationToggle ? (theme.palette.mode === "dark" ? "#2a2a2a" : "#F9F9F9") : "transparent",
            },
            padding: '4px',
            whiteSpace: 'normal',
          }}
          onClick={() => {
            setRegistrationToggle(false);
            setTokenToggle(false);
            setPriority(5);
          }}
        >
          Send BDX
        </Button>
        <Button
          fullWidth
          sx={{
            height: "100%",
            minWidth: 0,
            borderRadius: "0px",
            backgroundColor: registrationToggle ? (theme.palette.mode === "dark" ? "#222222" : "#FFFFFF") : "transparent",
            color: registrationToggle ? theme.palette.text.primary : "#8a8a8a",
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: rf(10), sm: rf(12) },
            lineHeight: 1.1,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: registrationToggle ? (theme.palette.mode === "dark" ? "#2a2a2a" : "#F9F9F9") : "transparent",
            },
            padding: '4px',
            whiteSpace: 'normal',
          }}
          onClick={() => {
            setRegistrationToggle(true);
            setTokenToggle(false);
            setPriority(1);
          }}
        >
          Register Masternode
        </Button>
        <Button
          fullWidth
          sx={{
            height: "100%",
            minWidth: 0,
            borderRadius: "0px",
            backgroundColor: tokenToggle ? (theme.palette.mode === "dark" ? "#222222" : "#FFFFFF") : "transparent",
            color: tokenToggle ? theme.palette.text.primary : "#8a8a8a",
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: rf(10), sm: rf(12) },
            lineHeight: 1.1,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: tokenToggle ? (theme.palette.mode === "dark" ? "#2a2a2a" : "#F9F9F9") : "transparent",
            },
            padding: '4px',
            whiteSpace: 'normal',
          }}
          onClick={() => {
            setRegistrationToggle(false);
            setTokenToggle(true);
            // Registration cannot use flash priority: flash sets its own burn,
            // which would overwrite the protocol's.
            setPriority(1);
          }}
        >
          Register Token
        </Button>
      </Box>
      {tokenToggle && (
        <Box mt={2} sx={{ width: "72%", mx: "auto" }}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              New token
            </Typography>
            {/* Same JSON spec the CLI's deploy_new_token takes, so a file
                written for the terminal can be used here as-is. */}
            <Button
              component="label"
              size="small"
              sx={{ textTransform: "none", color: theme.palette.text.secondary, fontSize: rf(11) }}
            >
              Load JSON file
              <input
                hidden
                type="file"
                accept="application/json,.json"
                onChange={(e: any) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) loadTokenDescriptorFile(f);
                  // Reset so picking the same file twice still fires onChange.
                  e.target.value = "";
                }}
              />
            </Button>
          </Box>
          {tokenInfo && (
            <Typography sx={{ color: "#8a8a8a", fontSize: rf(11), mb: 1 }}>
              Registering locks {(Number(tokenInfo.collateral_amount) / 1e9).toLocaleString()} BDX
              for {Number(tokenInfo.collateral_lock_blocks).toLocaleString()} blocks. The collateral
              is returned when the lock expires; the network fee is separate.
            </Typography>
          )}
          <Typography sx={{ color: "#8a8a8a", fontSize: rf(11), mt: 1 }}>Ticker</Typography>
          <Box sx={{ backgroundColor: theme.palette.mode === "dark" ? "#222222" : "#F9F9F9",
                     borderRadius: "8px", px: 1.5 }}>
            <Input placeholder={"e.g. DEMO"} disableUnderline={true}
              sx={{ width: "100%", height: "44px", color: (t: any) => t.palette.text.secondary }}
              value={tokenTicker} onChange={(e: any) => setTokenTicker(e.target.value)} />
          </Box>
          <Typography sx={{ color: "#8a8a8a", fontSize: rf(11), mt: 1 }}>Full name</Typography>
          <Box sx={{ backgroundColor: theme.palette.mode === "dark" ? "#222222" : "#F9F9F9",
                     borderRadius: "8px", px: 1.5 }}>
            <Input placeholder={"e.g. Demo Token"} disableUnderline={true}
              sx={{ width: "100%", height: "44px", color: (t: any) => t.palette.text.secondary }}
              value={tokenFullName} onChange={(e: any) => setTokenFullName(e.target.value)} />
          </Box>
          <Typography sx={{ color: "#8a8a8a", fontSize: rf(11), mt: 1 }}>Decimals</Typography>
          <Box sx={{ backgroundColor: theme.palette.mode === "dark" ? "#222222" : "#F9F9F9",
                     borderRadius: "8px", px: 1.5 }}>
            <Input placeholder={"8"} disableUnderline={true}
              sx={{ width: "100%", height: "44px", color: (t: any) => t.palette.text.secondary }}
              value={tokenDecimals} onChange={(e: any) => setTokenDecimals(e.target.value)} />
          </Box>
          <Typography sx={{ color: "#8a8a8a", fontSize: rf(11), mt: 1 }}>Initial supply</Typography>
          <Box sx={{ backgroundColor: theme.palette.mode === "dark" ? "#222222" : "#F9F9F9",
                     borderRadius: "8px", px: 1.5 }}>
            <Input placeholder={"0"} disableUnderline={true}
              sx={{ width: "100%", height: "44px", color: (t: any) => t.palette.text.secondary }}
              value={tokenSupply} onChange={(e: any) => setTokenSupply(e.target.value)} />
          </Box>
          <Typography sx={{ color: "#8a8a8a", fontSize: rf(11), mt: 1 }}>Max supply</Typography>
          <Box sx={{ backgroundColor: theme.palette.mode === "dark" ? "#222222" : "#F9F9F9",
                     borderRadius: "8px", px: 1.5 }}>
            <Input placeholder={"1000000"} disableUnderline={true}
              sx={{ width: "100%", height: "44px", color: (t: any) => t.palette.text.secondary }}
              value={tokenMaxSupply} onChange={(e: any) => setTokenMaxSupply(e.target.value)} />
          </Box>
          {errToken && (
            <Typography sx={{ color: "#ff5c5c", fontSize: rf(11) }}>{errToken}</Typography>
          )}
        </Box>
      )}
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
            color: "#8a8a8a",
            fontSize: rf(14),
            fontWeight: 600,

            // fontFamily: "poppins-semibold",
          }}
        >
          Available Balance
        </Typography>
        {/* <InfoOutlinedIcon sx={{ color: "#8a8a8a", fontSize: rf(18) }} /> */}
      </Box>
      <Typography
        mr={1}
        textAlign="center"
        sx={{ fontSize: '1.2rem', fontWeight: 600 }}
      >
        {isTokenSend ? groupDigits(selectedAsset!.amount) : walletDetails.unlocked_balance}{" "}
        <span style={{ color: "#3ec745" }}>
          {isTokenSend ? selectedAsset!.ticker : "BDX"}
        </span>
      </Typography>

      {/* Asset picker. Shown only once the wallet actually holds a token, so a
          BDX-only wallet sees the screen it always saw. */}
      {!registrationToggle && !tokenToggle && heldAssets.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ color: "#8a8a8a", fontSize: rf(12), mb: 0.75 }}>Asset</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {[{ id: "", ticker: "BDX", amount: walletDetails.unlocked_balance, decimals: 9 }, ...heldAssets].map(
              (a: any) => {
                const active = sendAsset === a.id;
                return (
                  <Box
                    key={a.id || "bdx"}
                    onClick={() => { setSendAsset(a.id); setAmount(""); setErrAmount(""); }}
                    sx={{
                      cursor: "pointer",
                      px: 1.5,
                      py: 0.75,
                      border: "1px solid",
                      borderColor: active ? "#3ec745" : (theme.palette.mode === "dark" ? "#2A2A38" : "#D1D1D1"),
                      backgroundColor: active
                        ? (theme.palette.mode === "dark" ? "#16281a" : "#EDF9EE")
                        : "transparent",
                      minWidth: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: rf(12), fontWeight: 700, color: active ? "#3ec745" : theme.palette.text.primary }}>
                      {a.ticker}
                    </Typography>
                    <Typography sx={{ fontSize: rf(10), color: "#8a8a8a" }}>
                      {a.id ? groupDigits(a.amount) : a.amount}
                    </Typography>
                  </Box>
                );
              }
            )}
          </Box>
          {isTokenSend && (
            <Typography sx={{ fontSize: rf(11), color: "#8a8a8a", mt: 0.75 }}>
              Amount is in {selectedAsset!.ticker}. The network fee is paid in BDX.
            </Typography>
          )}
        </Box>
      )}

      <Box mt={1.5} mb={1.5} sx={{ height: "0.2px", backgroundColor: "#8a8a8a" }} />
      {(!registrationToggle && !tokenToggle) ? (
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
              sx={{ color: "#ff5c5c", fontWeight: 400, fontSize: "0.9rem" }}
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
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
                padding: "0 20px",
                width: "100%",
                color: "white",
                borderRadius: "0px",
                border: errAmount ? "1px solid #ff5c5c" : "none",
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
                borderRadius: "0px",
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
                color: "#8a8a8a",
                fontSize: rf(14),
              }}
            >
              {estimtionFees}
            </Typography>
            {/* <InfoOutlinedIcon sx={{ color: "#8a8a8a", fontSize: rf(18) }} /> */}
          </Box>
        </>
      ) : (
        <Box display="flex" flexDirection="row" mb={2} mt={2}>
          <Typography
            mr={1}
            sx={{
              color: "#8a8a8a",
              fontSize: rf(14),
            }}
          >
            Registration uses the current transaction priority and estimated fee.
          </Typography>
        </Box>
      )}
      {(!registrationToggle && !tokenToggle) ? (
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
                sx={{ color: "#8a8a8a", fontSize: rf(14), marginLeft: "6px" }}
              /> */}
            </Typography>
            <Box display="flex" flexDirection="row" alignItems="center">
              <Typography
                sx={{ color: "#ff5c5c", fontWeight: 400, fontSize: "0.9rem" }}
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
            placeholder="Beldex Address or BNS name"
            disableUnderline={true}
            multiline
            sx={{
              width: "100%",
              minHeight: '110px',
              maxHeight: "125px",
              color: theme.palette.text.primary,
              backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
              padding: "10px 20px",
              borderRadius: "0px",
              border: errAddress ? "1px solid #ff5c5c" : "none",
              overflow: "auto",
              marginTop: "10px",
            }}
            value={toAddress}
            onChange={(event: any) => addressInputChange(event)}
          />
          {/* Live BNS resolution feedback, extension-style */}
          {bnsResolving && (
            <Typography mt={1} sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
              Resolving name…
            </Typography>
          )}
          {bnsResolved && !bnsResolving && (
            <Typography mt={1} sx={{ color: theme.palette.primary.main, fontSize: rf(12), wordBreak: "break-all" }}>
              ✓ {bnsResolved.name} → {bnsResolved.address.slice(0, 10)}…{bnsResolved.address.slice(-10)}
            </Typography>
          )}
          {bnsError && !bnsResolving && (
            <Typography mt={1} sx={{ color: "#f5a623", fontSize: rf(13) }}>
              {bnsError}
            </Typography>
          )}
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
                    color: "#1574ad",
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
                  backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
                  padding: "0 20px",
                  borderRadius: "0px",
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
                color: "#1574ad",
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
      ) : registrationToggle ? (
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
              sx={{ color: "#ff5c5c", fontWeight: 400, fontSize: "0.9rem" }}
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
              backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
              padding: "10px 20px",
              borderRadius: "0px",
              border: errRegistration ? "1px solid #ff5c5c" : "none",
              overflow: "auto",
              marginTop: "10px",
            }}
            value={registrationString}
            onChange={registrationInputChange}
          />
          <Typography
            mt={1}
            sx={{
              color: "#8a8a8a",
              fontSize: rf(14),
            }}
          >
            Paste the full master node registration string here. The send flow
            will submit it as a registration transaction.
          </Typography>
        </>
      ) : null}
      {/* Extension-style priority: a single ⚡ Flash checkbox (5 = flash,
          1 = normal per wallet2.h tx_priority). Masternode registration is
          always normal priority, so no control is shown on that tab. */}
      {!registrationToggle && !tokenToggle && (
        <Box
          component="label"
          display="flex"
          flexDirection="row"
          alignItems="center"
          mt={2}
          sx={{ cursor: "pointer", userSelect: "none", gap: "8px" }}
        >
          <Box
            component="input"
            type="checkbox"
            checked={priority === 5}
            onChange={(e: any) => {
              setPriority(e.target.checked ? 5 : 1);
              newEstimatedNetworkFeeDisplay();
            }}
            sx={{
              width: 16,
              height: 16,
              margin: 0,
              accentColor: theme.palette.primary.main,
            }}
          />
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(14) }}>
            ⚡ Flash — instant confirmation
          </Typography>
        </Box>
      )}
      <Box
        display="flex"
        flexDirection="row"
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
        gap="20px"
        mt={'35px'}
      >
        <Button
          variant="contained"
          color="secondary"
          sx={{
            fontWeight: 600,
            width: "min(150px, 42vw)",
            height: "45px",
            borderRadius: "0px",
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
            width: "min(150px, 42vw)",
            height: "45px",
            // borderRadius: "0px",
            borderRadius: "0px",

            // color: theme.palette.text.primary,
          }}
          onClick={() => sendFundFieldValidation()}
        >
          <CallMadeIcon sx={{ marginRight: '7px' }} />
          {registrationToggle || tokenToggle ? "Register" : "Send"}
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
            {/* Extension review modal: recipient in a green dashed box, detail
                rows, and the irreversibility warning before confirming. */}
            <Typography
              id="modal-modal-title"
              sx={{
                fontFamily: "'Michroma', 'Poppins', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: rf(17),
              }}
            >
              Review Transaction
            </Typography>
            {tokenToggle ? (
              <>
                <Typography mt={2} sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                  New token
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    padding: "12px",
                    border: `1px dashed ${theme.palette.primary.main}`,
                    backgroundColor: theme.palette.mode === "dark" ? "#0d0d0d" : "#fbfbfb",
                    fontSize: rf(12),
                  }}
                >
                  <Typography sx={{ color: theme.palette.primary.main, fontSize: rf(13), fontWeight: 600 }}>
                    {tokenTicker} — {tokenFullName || "(no name)"}
                  </Typography>
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(12), mt: 0.5 }}>
                    Initial supply: {tokenSupply || "0"} · Max supply: {tokenMaxSupply} · Decimals: {tokenDecimals}
                  </Typography>
                </Box>
                {tokenInfo && (
                  <Typography mt={2} sx={{ color: "#c62", fontSize: rf(12) }}>
                    This locks {(Number(tokenInfo.collateral_amount) / 1e9).toLocaleString()} BDX for{" "}
                    {Number(tokenInfo.collateral_lock_blocks).toLocaleString()} blocks, plus the network fee.
                    The collateral returns to this wallet when the lock expires.
                  </Typography>
                )}
              </>
            ) : isRegister ? (
              <>
                <Typography mt={2} sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                  Registration string
                </Typography>
                <Typography
                  id="modal-modal-description"
                  sx={{
                    mt: 1,
                    padding: "12px",
                    border: `1px dashed ${theme.palette.primary.main}`,
                    backgroundColor: theme.palette.mode === "dark" ? "#0d0d0d" : "#fbfbfb",
                    color: theme.palette.primary.main,
                    fontSize: rf(12),
                    lineHeight: 1.7,
                    wordBreak: "break-all",
                    maxHeight: "180px",
                    overflowY: "auto",
                  }}
                >
                  {registrationString}
                </Typography>
              </>
            ) : (
              <>
                {looksLikeBnsName(toAddress) && bnsResolved && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      mt: 2,
                    }}
                  >
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                      BNS name
                    </Typography>
                    <Typography sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: rf(14) }}>
                      {bnsResolved.name}
                    </Typography>
                  </Box>
                )}
                <Typography mt={2} sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                  {looksLikeBnsName(toAddress) && bnsResolved ? "Resolves to" : "Recipient"}
                </Typography>
                {/* full address, untruncated — this is exactly what receives the funds */}
                <Typography
                  id="modal-modal-description"
                  sx={{
                    mt: 1,
                    padding: "12px",
                    border: `1px dashed ${theme.palette.primary.main}`,
                    backgroundColor: theme.palette.mode === "dark" ? "#0d0d0d" : "#fbfbfb",
                    color: theme.palette.primary.main,
                    fontSize: rf(12),
                    lineHeight: 1.7,
                    wordBreak: "break-all",
                  }}
                >
                  {effectiveToAddress()}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    mt: 2,
                    pb: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                    Amount
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: rf(14) }}>
                    {amount} {isTokenSend ? selectedAsset!.ticker : "BDX"}
                  </Typography>
                </Box>
                {/* Two units on one screen, so the fee's is named explicitly. */}
                {isTokenSend && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mt: 1 }}>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                      Network fee
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                      paid in BDX
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    mt: 1.5,
                  }}
                >
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: rf(13) }}>
                    Priority
                  </Typography>
                  <Typography sx={{ fontSize: rf(14) }}>
                    {priority === 5 ? "⚡ Flash (instant)" : "Normal"}
                  </Typography>
                </Box>
              </>
            )}
            <Typography mt={2} sx={{ color: "#f5a623", fontSize: rf(12.5), lineHeight: 1.5 }}>
              ⚠ Transactions are irreversible. Verify the full recipient address
              before confirming.
            </Typography>
            {txnStatus === 'confirmation' ?
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                gap="10px"
                mt={3}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    fontWeight: 600,
                    height: "45px",
                  }}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    fontWeight: 600,
                    height: "45px",
                  }}
                  onClick={() => intiate_transaction()}
                >
                  Confirm send
                </Button>
              </Box>
              :
              <Box mt={2} sx={{ backgroundColor: theme.palette.mode === 'dark' ? "#222222" : '#fff', padding: '10px 20px', borderRadius: '0px' }}  >
                <Typography
                  sx={{ color: '#77778B', fontWeight: 400, fontSize: isMobileMode ? "0.8rem" : '1rem' }}
                >
                  Sending <span style={{ color: '#2e9e38', fontWeight: '700', fontSize: '1.1rem' }}>{amount} BDX.. </span>{txnStatus}
                </Typography>
              </Box>
            }
          </Box>
          :
          PaymentSuccessDialog()

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
            maxWidth: "92vw",
            maxHeight: "80vh",
            overflow: "auto",
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: "0px",
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
            maxWidth: "92vw",
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: "0px",
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
              backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
              padding: "0 16px",
              borderRadius: "0px",
              marginTop: "8px",
              marginBottom: "8px",
            }}
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
          />
          {saveLabelError && (
            <Typography sx={{ color: "#ff5c5c", fontSize: "0.9rem", mb: 1 }}>
              {saveLabelError}
            </Typography>
          )}
          <Typography sx={{ color: "#8a8a8a", fontSize: "0.8rem", wordBreak: "break-all" }}>
            {effectiveToAddress()}
          </Typography>
          <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="center" gap="10px" mt={3}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ fontWeight: 600, width: "min(150px, 42vw)", height: "45px", borderRadius: "0px", color: theme.palette.text.primary }}
              onClick={() => setSaveAddressOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ fontWeight: 600, width: "min(150px, 42vw)", height: "45px", borderRadius: "0px", }}
              onClick={confirmSaveAddress}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Modal>

      <TxAuthGate open={authOpen} onResult={handleAuthResult} />
      <ToastMsg ref={toastMsgRef} />

    </Box>
  );
};

export default SendFund;
