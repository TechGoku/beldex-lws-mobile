import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.beldex.lws.mobile',
  appName: 'Beldex Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0B0B0B',
    },
    // Route WebView fetch/XHR through the native HTTP stack. The LWS server
    // sends no CORS headers (the web build needs a dev proxy for the same
    // reason), and native requests are not subject to CORS at all.
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
