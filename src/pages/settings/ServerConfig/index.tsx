import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Select,
  MenuItem,
  Modal,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import OutboundIcon from "@mui/icons-material/Outbound";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import ToastMsg, { ToastMsgRef } from "../../../components/snackbar/ToastMsg";
import {
  getRawServerUrl,
  getNetType,
  saveServerConfig,
  resetServerConfig,
  getDefaults,
  isUsingCustomServer,
  getRelayUrl,
  saveRelayUrl,
} from "../../../services/runtimeConfig";
import {
  ProxySettings,
  ProxyType,
  loadProxySettings,
  saveProxySettings,
  PROXY_PRESETS,
} from "../../../services/proxy";
import { testServerConnection, TestConnectionResult } from "../../../services/testConnection";
import BootScreen from "../../../components/bootScreen/BootScreen";
import { Capacitor } from "@capacitor/core";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import { setUserLogout } from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";

const NETWORKS = [
  { value: 0, label: "Mainnet" },
  { value: 1, label: "Testnet" },
  { value: 2, label: "Stagenet" },
];

export default function ServerConfig() {
  const theme: any = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  const toastRef = useRef<ToastMsgRef>(null);

  const [url, setUrl] = useState("");
  const [nettype, setNettype] = useState(0);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<{ url: string; nettype: number } | null>(null);
  // Connection test + reconnect overlay state.
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("8080");
  const [proxyType, setProxyType] = useState<ProxyType>("http");
  const [proxyPreset, setProxyPreset] = useState("custom");
  const [proxyError, setProxyError] = useState("");
  const [relayUrl, setRelayUrl] = useState("");

  // Whether the entered URL is plain HTTP (unencrypted) - drives an inline
  // warning so the user knows their address/view key would travel in clear.
  const isHttp = /^http:\/\//i.test(url.trim());

  // Which preset (if any) a host/port/type combination corresponds to, so the
  // dropdown reflects the *saved* proxy instead of snapping back to "Custom"
  // every time the settings screen is reopened or the app reloads.
  const matchPreset = (host: string, port: string, type: ProxyType): string => {
    const found = PROXY_PRESETS.find(
      (p) =>
        p.host === host.trim() &&
        String(p.port) === String(port).trim() &&
        p.type === type
    );
    return found ? found.id : "custom";
  };

  useEffect(() => {
    setUrl(getRawServerUrl());
    setNettype(getNetType());
    setRelayUrl(getRelayUrl());
    loadProxySettings().then((p: ProxySettings) => {
      setProxyEnabled(p.enabled);
      setProxyHost(p.host);
      setProxyPort(String(p.port));
      setProxyType(p.type);
      // Restore the preset selection from the persisted values.
      setProxyPreset(matchPreset(p.host, String(p.port), p.type));
    });
  }, []);

  const handleProxySave = async () => {
    const portNum = parseInt(proxyPort, 10);
    if (proxyEnabled) {
      if (!proxyHost.trim()) {
        setProxyError("Proxy host is required");
        return;
      }
      if (!Number.isFinite(portNum) || portNum < 1 || portNum > 65535) {
        setProxyError("Enter a valid port (1-65535)");
        return;
      }
    }
    setProxyError("");
    const applied = await saveProxySettings({
      enabled: proxyEnabled,
      host: proxyHost.trim(),
      port: Number.isFinite(portNum) ? portNum : 8080,
      type: proxyType,
    });
    if (proxyEnabled && !applied && Capacitor.isNativePlatform()) {
      toast("Proxy saved but could not be applied", false);
    } else {
      toast(proxyEnabled ? "Proxy enabled" : "Proxy disabled");
    }
  };

  const toast = (msg: string, ok = true) => toastRef.current?.showAlert(msg, ok ? "success" : "error");

  // Probe the endpoint (bounded by an 8s timeout) and surface the verdict,
  // so a wrong/non-LWS host is caught here instead of leaving the reloaded
  // dashboard silently stuck. Returns the result so callers can also gate on it.
  const runTest = async (): Promise<TestConnectionResult | null> => {
    const err = validate(url);
    if (err) {
      setError(err);
      return null;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testServerConnection(url.trim());
      setTestResult(result);
      return result;
    } finally {
      setTesting(false);
    }
  };

  const applyProxyPreset = (id: string) => {
    setProxyPreset(id);
    setProxyError("");
    const preset = PROXY_PRESETS.find((p) => p.id === id);
    if (preset) {
      setProxyHost(preset.host);
      setProxyPort(String(preset.port));
      setProxyType(preset.type);
    }
  };

  const validate = (value: string): string => {
    const v = value.trim();
    if (!v) return "Server URL is required";
    const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      // eslint-disable-next-line no-new
      new URL(withProto);
      return "";
    } catch {
      return "Enter a valid URL";
    }
  };

  const requestSave = () => {
    const err = validate(url);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    // Switching server/network invalidates the logged-in wallet session, so
    // confirm before applying (the app reloads and returns to login).
    setPending({ url: url.trim(), nettype });
    setConfirmOpen(true);
    // Auto-probe the endpoint while the confirm dialog is up, so the user sees
    // whether it's actually a live LWS before committing to the reload.
    runTest();
  };

  // Smooth transition: raise the branded overlay, then reload. The dark base
  // background + the post-reload BootScreen share this look, so a server switch
  // reads as one continuous "reconnecting" sequence instead of a blank flash.
  const reloadWithOverlay = () => {
    setReconnecting(true);
    setTimeout(() => window.location.reload(), 500);
  };

  const applySave = async () => {
    if (!pending) return;
    await saveServerConfig(pending.url, pending.nettype);
    dispatch(setUserLogout());
    setConfirmOpen(false);
    reloadWithOverlay();
  };

  const handleReset = async () => {
    await resetServerConfig();
    const d = getDefaults();
    setUrl(d.serverUrl);
    setNettype(d.nettype);
    dispatch(setUserLogout());
    reloadWithOverlay();
  };

  const inputSx = {
    width: "100%",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
    padding: "0 16px",
    height: "52px",
    borderRadius: "0px",
    border: error ? "1px solid #ff5c5c" : "none",
    mt: 1,
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobileMode ? 320 : 440,
    maxWidth: "92vw",
    bgcolor: theme.palette.background.paper,
    boxShadow: 24,
    p: 4,
    borderRadius: "0px",
  };

  // Full-screen branded overlay while the app tears down and reloads against
  // the new server - covers the logout/redirect flip and the reload gap.
  if (reconnecting) {
    return <BootScreen message="Reconnecting to server…" />;
  }

  return (
    <Box
      className="appWrapper"
      sx={{
        minWidth: isMobileMode ? "100%" : "calc(100% - 250px)",
        background: isMobileMode ? "unset" : theme.palette.background.paper,
        borderRadius: "0px",
      }}
    >
      <Box sx={{ padding: isMobileMode ? "0" : "25px" }}>
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <OutboundIcon
            sx={{ transform: "rotate(225deg)", fontSize: "2rem", cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography ml={1} sx={{ fontWeight: 600 }}>
            Back
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 560, mx: "auto", mt: 4, px: isMobileMode ? 2 : 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", mb: 1 }}>
            Server / Node
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", mb: 3 }}>
            Connect the wallet to your own Beldex Light Wallet Service endpoint.
          </Typography>

          <Typography sx={{ fontWeight: 600 }}>LWS API URL</Typography>
          <Input
            placeholder="https://lwsapi.beldex.io  ·  http://192.168.1.10:8080"
            disableUnderline
            sx={inputSx}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
              setTestResult(null);
            }}
          />
          {error && (
            <Typography sx={{ color: "#ff5c5c", fontSize: "0.85rem", mt: 1 }}>{error}</Typography>
          )}
          {isHttp && !error && (
            <Typography sx={{ color: theme.palette.warning.main, fontSize: "0.8rem", mt: 1 }}>
              ⚠ Plain HTTP — your address & view key travel unencrypted. Use only on a
              trusted LAN or over a proxy/Tor.
            </Typography>
          )}

          <Box display="flex" alignItems="center" gap={1.5} mt={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              onClick={runTest}
              disabled={testing}
              sx={{ borderRadius: "0px", textTransform: "none", minWidth: 150 }}
              startIcon={
                testing ? <CircularProgress size={16} sx={{ color: theme.palette.text.secondary }} /> : undefined
              }
            >
              {testing ? "Testing…" : "Test Connection"}
            </Button>
            {testResult && !testing && (
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: testResult.ok
                    ? theme.palette.primary.main
                    : testResult.kind === "inconclusive"
                    ? theme.palette.warning.main
                    : "#ff5c5c",
                  flex: "1 1 200px",
                  minWidth: 0,
                }}
              >
                {testResult.ok ? "✓ " : "✗ "}
                {testResult.message}
                {testResult.ok && testResult.latencyMs != null ? ` (${testResult.latencyMs} ms)` : ""}
              </Typography>
            )}
          </Box>

          {/* ---- Automatic fallback endpoint (for ISPs that block the LWS domain) ---- */}
          <Typography sx={{ fontWeight: 600, mt: 3 }}>Fallback server (auto)</Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.78rem", mt: 0.5 }}>
            If your ISP blocks the main Beldex server, the wallet automatically
            retries here — no extra app or setup. Defaults to Beldex's alternate
            domain (lwsapi.beldex.dev). Clear to disable, or set a self-hosted relay.
          </Typography>
          <Input
            placeholder="https://lwsapi.beldex.dev"
            disableUnderline
            sx={inputSx}
            value={relayUrl}
            onChange={(e) => setRelayUrl(e.target.value)}
          />
          <Button
            variant="outlined"
            sx={{ borderRadius: "0px", textTransform: "none", mt: 1.5 }}
            onClick={async () => {
              await saveRelayUrl(relayUrl.trim());
              toast(relayUrl.trim() ? "Fallback saved" : "Fallback cleared");
            }}
          >
            Save Fallback
          </Button>

          <Typography sx={{ fontWeight: 600, mt: 3 }}>Network</Typography>
          <Select
            fullWidth
            disableUnderline
            variant="filled"
            IconComponent={KeyboardArrowDownIcon}
            value={nettype}
            onChange={(e) => setNettype(Number(e.target.value))}
            sx={{
              mt: 1,
              borderRadius: "0px",
              backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
              color: theme.palette.text.primary,
              "& .MuiSelect-icon": { color: theme.palette.text.primary },
              "& .MuiFilledInput-input": { paddingTop: "16px" },
            }}
          >
            {NETWORKS.map((n) => (
              <MenuItem key={n.value} value={n.value}>
                {n.label}
              </MenuItem>
            ))}
          </Select>

          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem", mt: 2 }}>
            Default: {getDefaults().serverUrl || "(none)"} ·{" "}
            {NETWORKS.find((n) => n.value === getDefaults().nettype)?.label}
            {isUsingCustomServer() ? " · currently using a custom server" : ""}
          </Typography>

          <Box display="flex" gap={2} mt={4}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "0px", flex: 1, color: theme.palette.text.primary }}
              onClick={handleReset}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: "0px", flex: 1, }}
              onClick={requestSave}
            >
              Save & Apply
            </Button>
          </Box>

          {/* ---- Proxy ---- */}
          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop: `1px solid ${theme.palette.mode === "dark" ? "#222222" : "#E5E5E5"}`,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box sx={{ pr: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  Proxy
                </Typography>
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem" }}>
                  Route all traffic via HTTP, HTTPS or SOCKS5 (mobile app)
                </Typography>
              </Box>
              <Switch checked={proxyEnabled} onChange={(e) => setProxyEnabled(e.target.checked)} />
            </Box>

            {proxyEnabled && (
              <Box mt={2}>
                <Typography sx={{ fontWeight: 600 }}>Preset</Typography>
                <Select
                  fullWidth
                  disableUnderline
                  variant="filled"
                  IconComponent={KeyboardArrowDownIcon}
                  value={proxyPreset}
                  onChange={(e) => applyProxyPreset(String(e.target.value))}
                  sx={{
                    mt: 1,
                    mb: 1,
                    borderRadius: "0px",
                    backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
                    color: theme.palette.text.primary,
                    "& .MuiSelect-icon": { color: theme.palette.text.primary },
                    "& .MuiFilledInput-input": { paddingTop: "16px" },
                  }}
                >
                  <MenuItem value="custom">Custom (enter manually)</MenuItem>
                  {PROXY_PRESETS.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
                {PROXY_PRESETS.find((p) => p.id === proxyPreset) && (
                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.78rem", mb: 1 }}>
                    {PROXY_PRESETS.find((p) => p.id === proxyPreset)!.description}
                  </Typography>
                )}

                <Typography sx={{ fontWeight: 600 }}>Type</Typography>
                <Select
                  fullWidth
                  disableUnderline
                  variant="filled"
                  IconComponent={KeyboardArrowDownIcon}
                  value={proxyType}
                  onChange={(e) => {
                    setProxyType(e.target.value as ProxyType);
                    setProxyPreset("custom");
                  }}
                  sx={{
                    mt: 1,
                    mb: 1,
                    borderRadius: "0px",
                    backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#f4f4f4",
                    color: theme.palette.text.primary,
                    "& .MuiSelect-icon": { color: theme.palette.text.primary },
                    "& .MuiFilledInput-input": { paddingTop: "16px" },
                  }}
                >
                  <MenuItem value="http">HTTP (handles http & https)</MenuItem>
                  <MenuItem value="https">HTTPS (proxy over TLS)</MenuItem>
                  <MenuItem value="socks">SOCKS5 (route all traffic, VPN-like)</MenuItem>
                </Select>
                <Box display="flex" gap={2} sx={{ flexWrap: "wrap" }}>
                  <Box sx={{ flex: "2 1 200px", minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>Host</Typography>
                    <Input
                      placeholder="127.0.0.1 or proxy.example.com"
                      disableUnderline
                      fullWidth
                      sx={{ ...inputSx, mt: 1 }}
                      value={proxyHost}
                      onChange={(e) => {
                        setProxyHost(e.target.value);
                        setProxyError("");
                        setProxyPreset("custom");
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: "1 1 100px", minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>Port</Typography>
                    <Input
                      placeholder="8080"
                      disableUnderline
                      fullWidth
                      sx={{ ...inputSx, mt: 1 }}
                      value={proxyPort}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^\d*$/.test(v)) setProxyPort(v);
                        setProxyError("");
                        setProxyPreset("custom");
                      }}
                    />
                  </Box>
                </Box>
                {proxyError && (
                  <Typography sx={{ color: "#ff5c5c", fontSize: "0.85rem", mt: 1 }}>
                    {proxyError}
                  </Typography>
                )}
                <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.78rem", mt: 1.5 }}>
                  All wallet and in-app web traffic is routed through the proxy.
                  Use SOCKS5 to tunnel everything like a VPN. HTTP/HTTPS proxies
                  also carry both http and https requests.
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: "0px", mt: 2, width: "100%", }}
              onClick={handleProxySave}
            >
              {proxyEnabled ? "Save & Apply Proxy" : "Save Proxy Setting"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box sx={modalStyle}>
          <Typography textAlign="center" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
            Switch Server?
          </Typography>
          <Typography textAlign="center" sx={{ mt: 1, color: theme.palette.text.secondary }}>
            The wallet will log out and reconnect to the new endpoint. You'll need
            to sign in again.
          </Typography>

          {/* Live reachability check so the user doesn't switch onto a dead or
              non-LWS host and end up stuck on a never-loading dashboard. */}
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "center",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {testing ? (
              <>
                <CircularProgress size={16} sx={{ color: theme.palette.text.secondary }} />
                <Typography sx={{ fontSize: "0.85rem", color: theme.palette.text.secondary }}>
                  Testing connection…
                </Typography>
              </>
            ) : testResult ? (
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  textAlign: "center",
                  color: testResult.ok
                    ? theme.palette.primary.main
                    : testResult.kind === "inconclusive"
                    ? theme.palette.warning.main
                    : "#ff5c5c",
                }}
              >
                {testResult.ok ? "✓ " : "✗ "}
                {testResult.message}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: "0.85rem", color: theme.palette.text.secondary }}>
                Connection not tested yet.
              </Typography>
            )}
          </Box>

          <Box display="flex" justifyContent="center" flexWrap="wrap" mt={4} gap={2}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "0px", width: 140, color: theme.palette.text.primary }}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={testing}
              sx={{ borderRadius: "0px", width: 140, }}
              onClick={applySave}
            >
              {testResult && !testResult.ok ? "Switch anyway" : "Switch"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <ToastMsg ref={toastRef} />
    </Box>
  );
}
