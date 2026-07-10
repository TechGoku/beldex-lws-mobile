import React, { useEffect, useRef } from "react";
import { Box, GlobalStyles, PaletteMode, useMediaQuery, useTheme } from "@mui/material";
import NavBar from "./components/sideNavBar/NavBar";
import Header from "./components/header/Header";
import "./App.scss";
import { CoreBridgeInstanceContext } from "./CoreBridgeInstanceContext";
import RouteList from "./routers";
import MUIWrapper from "./theme/MUIWrapper";
import ToastMsg, { ToastMsgRef } from "./components/snackbar/ToastMsg";
import { useAppDispatch } from "./stores/hooks";
import patchBeldexNetServiceUtils from "./utils/patchBeldexNetServiceUtils";
import {
  setUserLogout,
  setSeedDetails
} from "./stores/features/seedDetailSlice";
import { fetchSavedAddresses } from "./stores/features/addressBookSlice";
import { fetchWallets } from "./stores/features/walletsSlice";
import { initSecurity, lockApp, securitySelector } from "./stores/features/securitySlice";
import { useAppSelector } from "./stores/hooks";
import { hideSplashScreen } from "./services/nativeShell";
import { loadRuntimeConfig, getApiUrl, getNetType } from "./services/runtimeConfig";
import { applyProxyFromStorage } from "./services/proxy";
import LockScreen from "./pages/lock";
import probeServer from "./utils/netProbe";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import BootScreen from "./components/bootScreen/BootScreen";
const mnemonic_languages = require("@bdxi/beldex-locales");
const appBridge = require("@bdxi/beldex-app-bridge");
const HostedMoneroAPIClient = require("@bdxi/beldex-hosted-api");
const BackgroundAPIResponseParser = require("@bdxi/beldex-response-parser-utils");

patchBeldexNetServiceUtils();

function App() {

  const [bdxUtils, setBDXUtils] = React.useState<any>({});
  const toastMsgRef = useRef<ToastMsgRef>(null);
  // Read from runtimeConfig (persisted override, else .env default) rather than
  // process.env directly, so the user's Server settings take effect at runtime.
  const config: any = {
    nettype: getNetType(), // critical setting 0 - MAINNET, 2 - STAGENET
    apiUrl: getApiUrl(),
    version: process.env.APP_VERSION,
    name: process.env.APP_NAME,
  };
  const dispatch = useAppDispatch();
  const security = useAppSelector(securitySelector);
  const beldex_utils: any = React.useMemo(
    () => ({
      set_Utils_data: (data: any) => {
        setBDXUtils(data);
      },

      beldex_utils: bdxUtils.beldex_utils,
      backgroundAPIResponseParser: bdxUtils.backgroundAPIResponseParser,
      hostedMoneroAPIClient: new HostedMoneroAPIClient(
        {
          appUserAgent_product: config.name,
          appUserAgent_version: config.version,
          apiUrl: config.apiUrl,
          request_conformant_module: require("xhr"),
        },
        bdxUtils
      ),
      // new BackgroundAPIResponseParser({
      //   coreBridge_instance: bdxUtils // the same as coreBridge_instance
      // }, config)
      ...config,
    }),
    [bdxUtils]
  );

  const getBridgeInstance = async () => {
    // let coreBridgeInstance = await appBridge({});
    const context: any = {};
    context.beldex_utils = await appBridge({});
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    context.backgroundAPIResponseParser = new BackgroundAPIResponseParser(
      {
        coreBridge_instance: context.beldex_utils, // the same as coreBridge_instance
      },
      context
    );
    beldex_utils.set_Utils_data(context);
    // WASM bridge is ready and the app is about to render - dismiss the native
    // splash so the user never sees a blank WebView while it boots.
    hideSplashScreen();
  };

  const handleShowToastMsg = () => {
    if (toastMsgRef.current) {
      toastMsgRef.current.showAlert("You are offline. Connect to the Internet.", "error");
    }
  };


  useEffect(() => {
    const alertUser = (e: any) => {
      dispatch(setUserLogout());
    };

    // Web: log out when the tab closes (shared/public computers).
    // Native: keep the session - the app is PIN/biometric gated instead, and
    // being logged out on every launch makes the mobile app unusable.
    if (!Capacitor.isNativePlatform()) {
      window.addEventListener("beforeunload", alertUser);
    }

    // Load persisted server config + lock state BEFORE building the WASM bridge
    // and API client, so both use the user's chosen endpoint/network.
    let removeStateListener: (() => void) | undefined;
    (async () => {
      await loadRuntimeConfig();
      // Apply the user's proxy (if configured) before any API traffic.
      await applyProxyFromStorage();
      dispatch(initSecurity());
      dispatch(fetchSavedAddresses());
      // Restore the previously-active wallet from ENCRYPTED storage (seed keys
      // are no longer kept in redux-persist's plaintext localStorage).
      try {
        const { wallets, activeId } = await dispatch(fetchWallets()).unwrap();
        const active = wallets.find((w: any) => w.id === activeId);
        if (active) {
          dispatch(
            setSeedDetails({
              address_string: active.address_string,
              sec_viewKey_string: active.sec_viewKey_string,
              pub_viewKey_string: active.pub_viewKey_string,
              sec_spendKey_string: active.sec_spendKey_string,
              pub_spendKey_string: active.pub_spendKey_string,
              mnemonic_string: active.mnemonic_string,
              sec_seed_string: active.sec_seed_string,
              mnemonic_language: active.mnemonic_language,
              isLogin: true,
            })
          );
        }
      } catch {
        /* no saved wallet - stay on the login screen */
      }
      await getBridgeInstance();
      // Startup connectivity diagnostic - dev builds only (avoids two extra
      // requests to the server root on every production launch).
      if (process.env.NODE_ENV !== "production") {
        probeServer(getApiUrl(), getNetType());
      }

      // Re-lock when the app is sent to the background, so returning to the
      // foreground requires the PIN/biometric again.
      const handle = await CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        if (!isActive) dispatch(lockApp());
      });
      removeStateListener = () => handle.remove();
    })();

    return () => {
      window.removeEventListener("beforeunload", alertUser);
      removeStateListener && removeStateListener();
    };
  }, []);


  useEffect(() => {
    const isOnLine = navigator.onLine
    if (!isOnLine) {
      handleShowToastMsg();
    }
  })

  const theme = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const isEmpty = Object.keys(bdxUtils).length === 0;

  // Show the lock screen as early as possible - even before the WASM bridge
  // finishes loading - so the wallet is never briefly visible when locked.
  if (security.loaded && security.isLocked) {
    return (
      <MUIWrapper>
        <LockScreen />
      </MUIWrapper>
    );
  }

  if (isEmpty) {
    return (
      <MUIWrapper>
        <BootScreen />
      </MUIWrapper>
    );
  }

  return (
    <CoreBridgeInstanceContext.Provider value={beldex_utils}>
      <MUIWrapper>
        <Box sx={{ height: isMobileMode ? "unset" : "100vh", padding: "20px" }}>
          <Header />
          <Box
            sx={{
              paddingTop: "65px",
              display: "flex",
              gap: "20px",
              height: "100%"
              // minHeight: "calc(100vh - 45px)",
            }}
          >
            <NavBar />
            <RouteList />
          </Box>
        </Box>
        <ToastMsg ref={toastMsgRef} />
      </MUIWrapper>
    </CoreBridgeInstanceContext.Provider>
  );
}

export default App;
