const netServiceUtils = require("@bdxi/beldex-net-service-utils");

let isPatched = false;

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
    if (/^https?:\/\//i.test(apiAddressAuthority)) {
      const completeURL = joinAuthorityAndEndpoint(apiAddressAuthority, endpointPath);
      console.log("📡  " + completeURL);

      return requestConformantModule(
        buildRequestOptions(completeURL, finalParameters),
        function (errOrProgressEvent: unknown, res: { statusCode?: number } | undefined, body: unknown) {
          handleRequestResponse(fn)(completeURL, errOrProgressEvent, res, body);
        }
      );
    }

    return originalHTTPRequest(
      requestConformantModule,
      apiAddressAuthority,
      endpointPath,
      finalParameters,
      fn
    );
  };

  isPatched = true;
}
