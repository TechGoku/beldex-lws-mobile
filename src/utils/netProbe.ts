// Startup connectivity probe. Logs land in `adb logcat -s Capacitor/Console`
// on device, or the browser console on web, so API reachability problems are
// diagnosable without attaching a debugger.
//
// Two probes on purpose:
//  - `no-cors` fetch: resolves whenever the network path works (DNS + TCP +
//    TLS + HTTP), even if the server sends no CORS headers. If THIS fails,
//    the problem is network-level (DNS poisoning, TLS reset, timeout...).
//  - normal fetch: additionally requires CORS headers. If no-cors succeeds
//    but this fails, the server is reachable and the problem is CORS.
const PROTOCOL_PATTERN = /^https?:\/\//i;

export default async function probeServer(apiUrl: string, nettype: any): Promise<void> {
  console.log(`[NetProbe] config nettype=${nettype} apiUrl=${apiUrl}`);
  if (!apiUrl) {
    console.error("[NetProbe] apiUrl is empty - check .env SERVER_URL");
    return;
  }

  // normalizeApiUrl returns a protocol-less authority ("host/") on device
  const probeUrl = PROTOCOL_PATTERN.test(apiUrl) ? apiUrl : `https://${apiUrl}`;
  console.log(`[NetProbe] probing ${probeUrl}`);

  let t0 = Date.now();
  try {
    await fetch(probeUrl, { method: "GET", mode: "no-cors", cache: "no-store" });
    console.log(`[NetProbe] network path OK (no-cors fetch resolved in ${Date.now() - t0}ms)`);
  } catch (e: any) {
    console.error(
      `[NetProbe] NETWORK FAILURE after ${Date.now() - t0}ms: ${e?.message || e} - ` +
      "server unreachable at network level (DNS/TCP/TLS). CORS is NOT the cause: " +
      "a CORS-only problem cannot fail a no-cors fetch."
    );
    return;
  }

  t0 = Date.now();
  try {
    const res = await fetch(probeUrl, { method: "GET", cache: "no-store" });
    console.log(`[NetProbe] CORS-visible fetch: HTTP ${res.status} in ${Date.now() - t0}ms`);
  } catch (e: any) {
    console.error(
      `[NetProbe] CORS FAILURE after ${Date.now() - t0}ms: ${e?.message || e} - ` +
      "network path works but responses are blocked by CORS policy. " +
      "Fix: enable CapacitorHttp or add Access-Control-Allow-Origin on the server."
    );
  }
}
