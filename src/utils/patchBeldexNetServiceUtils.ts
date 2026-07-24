import { getRelayUrl } from "../services/runtimeConfig";

const netServiceUtils = require("@bdxi/beldex-net-service-utils");

let isPatched = false;
// Sticky for the session: once the relay has served a request successfully we
// keep using it, so only the first call pays the cost of the blocked primary.
let relayUsable = false;

// Hard ceiling on any single wallet API request. Without this a blocked or
// black-holed endpoint (e.g. an ISP that filters the LWS domain) leaves the
// balance/tx poll hanging indefinitely with no feedback. 15s is generous for
// a healthy LWS (real responses come back in ~2s) but bounds the failure.
const REQUEST_TIMEOUT_MS = 15000;

function joinAuthorityAndEndpoint(apiAddressAuthority: string, endpointPath: string) {
  return new URL(endpointPath, apiAddressAuthority).toString();
}

function buildRequestOptions(completeURL: string, jsonParameters: unknown) {
  return {
    method: "POST",
    url: completeURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    json: jsonParameters,
    useXDR: true,
    withCredentials: true,
    // Transport-level timeout (honoured by the `xhr` module directly). Backed
    // up by the JS guard below, since the CapacitorHttp XHR shim doesn't always
    // propagate `xhr.timeout`.
    timeout: REQUEST_TIMEOUT_MS,
  };
}

// Wrap the caller's callback so it fires at most once, and no later than
// REQUEST_TIMEOUT_MS. Whichever happens first — the real response or the
// timer — wins; the other is ignored. Transport-agnostic, so it covers both
// the CapacitorHttp-intercepted native path and any fallback.
function withTimeout(
  fn: (err?: Error | null, data?: unknown) => void,
  label: string
): (err?: Error | null, data?: unknown) => void {
  let settled = false;
  const timer = setTimeout(() => {
    if (settled) return;
    settled = true;
    console.error(`⏱️  request timed out after ${REQUEST_TIMEOUT_MS}ms: ${label}`);
    fn(new Error(`Connection timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)}s`), null);
  }, REQUEST_TIMEOUT_MS);
  return function guarded(err?: Error | null, data?: unknown) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    fn(err, data);
  };
}

function handleRequestResponse(fn: (err?: Error | null, data?: unknown) => void) {
  return function (
    completeURL: string,
    errOrProgressEvent: unknown,
    res: { statusCode?: number } | undefined,
    body: unknown
  ) {
    let err: Error | null = null;
    const statusCode = typeof res !== "undefined" ? res.statusCode ?? -1 : -1;

    if (statusCode === 0 || statusCode === -1) {
      err = new Error("Connection Failure");
    } else if (statusCode !== 200) {
      const bodyError =
        body && typeof body === "object" ? (body as { Error?: string }).Error : undefined;

      if (bodyError) {
        err = new Error(bodyError);
      } else {
        err = new Error(`Unknown ${statusCode} error`);
      }
    }

    if (err) {
      console.error("❌  " + err);
      fn(err, null);
      return;
    }

    if (typeof body === "string") {
      try {
        const json = JSON.parse(body);
        console.log("✅  " + completeURL + " " + statusCode);
        fn(null, json);
        return;
      } catch (parseError) {
        console.error(
          "❌  HostedMoneroAPIClient Error: Unable to parse json with exception:",
          parseError,
          "\nbody:",
          body
        );
        fn(parseError as Error, null);
        return;
      }
    }

    console.log("✅  " + completeURL + " " + statusCode);
    fn(null, body);
  };
}

export default function patchBeldexNetServiceUtils() {
  if (isPatched) {
    return;
  }

  const originalHTTPRequest = netServiceUtils.HTTPRequest;

  netServiceUtils.HTTPRequest = function patchedHTTPRequest(
    requestConformantModule: typeof originalHTTPRequest,
    apiAddressAuthority: string,
    endpointPath: string,
    finalParameters: unknown,
    fn: (err?: Error | null, data?: unknown) => void
  ) {
    // Fast-fail when the device reports no network at all (airplane mode / lost
    // Wi-Fi/data after the app was opened), so the UI flips to "no connection"
    // instantly instead of waiting out the full timeout on every poll.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      console.error("⚠️  offline — failing fast: " + endpointPath);
      fn(new Error("No internet connection"), null);
      return;
    }

    // The SDK's own HTTPRequest simply does 'https://' + authority + endpoint.
    // normalizeApiUrl yields a protocol-less authority for the default server,
    // which used to fall through to that SDK path - meaning the relay fallback
    // below never ran. Normalise here so EVERY request goes through our path
    // (timeout + relay failover), matching the SDK's https default exactly.
    const absoluteAuthority = /^https?:\/\//i.test(apiAddressAuthority)
      ? apiAddressAuthority
      : "https://" + apiAddressAuthority;

    {
      const primaryURL = joinAuthorityAndEndpoint(absoluteAuthority, endpointPath);
      const relayBase = getRelayUrl();
      const relayURL = relayBase ? joinAuthorityAndEndpoint(relayBase + "/", endpointPath) : "";

      // One attempt against a given URL, each with its own timeout budget.
      const attempt = (
        targetURL: string,
        done: (err?: Error | null, data?: unknown) => void
      ) => {
        const guarded = withTimeout(done, endpointPath);
        console.log("📡  " + targetURL);
        return requestConformantModule(
          buildRequestOptions(targetURL, finalParameters),
          function (errOrProgressEvent: unknown, res: { statusCode?: number } | undefined, body: unknown) {
            handleRequestResponse(guarded)(targetURL, errOrProgressEvent, res, body);
          }
        );
      };

      // Once the relay has proven to work this session, go straight to it so
      // only the first request pays the failed-primary cost.
      const firstURL = relayUsable && relayURL ? relayURL : primaryURL;

      return attempt(firstURL, function (err?: Error | null, data?: unknown) {
        const canFallBack = !!err && !!relayURL && firstURL !== relayURL;
        if (canFallBack) {
          // The primary LWS is unreachable (ISP block / DNS hijack / SNI reset).
          // Retry the same call through the relay, which reaches the LWS from
          // outside the ISP. No user action or extra app required.
          console.warn("↪️  primary LWS unreachable — retrying via relay: " + relayURL);
          relayUsable = true;
          attempt(relayURL, function (relayErr?: Error | null, relayData?: unknown) {
            if (relayErr) relayUsable = false; // relay failed too - retry primary next time
            fn(relayErr, relayData);
          });
          return;
        }
        fn(err, data);
      });
    }
  };

  isPatched = true;
}
