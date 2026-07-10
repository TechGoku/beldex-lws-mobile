package io.beldex.lws.mobile;

import androidx.webkit.ProxyConfig;
import androidx.webkit.ProxyController;
import androidx.webkit.WebViewFeature;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Routes the app's network traffic through a user-configured HTTP proxy.
 *
 * Two layers are covered:
 *  - JVM system properties: picked up by HttpURLConnection, which is what
 *    the CapacitorHttp plugin uses for the wallet's API calls.
 *  - WebView ProxyController (androidx.webkit): covers any request made by
 *    the WebView's own network stack. Local app assets are unaffected -
 *    they are served through Capacitor's asset interceptor, not the network.
 */
@CapacitorPlugin(name = "AppProxy")
public class AppProxyPlugin extends Plugin {

    @PluginMethod
    public void set(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        String host = call.getString("host", "");
        Integer port = call.getInt("port", 0);
        // "http" (default), "https" (proxy reached over TLS) or "socks" (SOCKS5).
        String type = call.getString("type", "http");
        if (type == null) type = "http";
        type = type.toLowerCase();

        try {
            clearAll();
            if (enabled && host != null && !host.isEmpty() && port != null && port > 0) {
                String portStr = String.valueOf(port);

                if (type.equals("socks")) {
                    // SOCKS routes ALL TCP traffic (VPN-like) for the JVM stack.
                    System.setProperty("socksProxyHost", host);
                    System.setProperty("socksProxyPort", portStr);
                } else {
                    // HTTP/HTTPS proxy handles both http:// and https:// targets
                    // (https via CONNECT tunneling).
                    System.setProperty("http.proxyHost", host);
                    System.setProperty("http.proxyPort", portStr);
                    System.setProperty("https.proxyHost", host);
                    System.setProperty("https.proxyPort", portStr);
                }

                if (WebViewFeature.isFeatureSupported(WebViewFeature.PROXY_OVERRIDE)) {
                    // A scheme-qualified rule ("socks://h:p", "https://h:p") or a
                    // bare "h:p" (http) routes every WebView request through the
                    // proxy - no direct bypass, so nothing leaks around it.
                    String rule = type.equals("http") ? host + ":" + port : type + "://" + host + ":" + port;
                    ProxyConfig cfg = new ProxyConfig.Builder()
                            .addProxyRule(rule)
                            .build();
                    ProxyController.getInstance()
                            .setProxyOverride(cfg, Runnable::run, () -> { });
                }
            } else if (WebViewFeature.isFeatureSupported(WebViewFeature.PROXY_OVERRIDE)) {
                ProxyController.getInstance()
                        .clearProxyOverride(Runnable::run, () -> { });
            }
            JSObject ret = new JSObject();
            ret.put("applied", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to apply proxy: " + e.getMessage());
        }
    }

    private void clearAll() {
        System.clearProperty("http.proxyHost");
        System.clearProperty("http.proxyPort");
        System.clearProperty("https.proxyHost");
        System.clearProperty("https.proxyPort");
        System.clearProperty("socksProxyHost");
        System.clearProperty("socksProxyPort");
    }
}
