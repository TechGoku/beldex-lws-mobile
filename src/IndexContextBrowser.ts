
const HostedMoneroAPIClient = require('@bdxi/beldex-hosted-api')
import normalizeApiUrl from "./utils/normalizeApiUrl";
import patchBeldexNetServiceUtils from "./utils/patchBeldexNetServiceUtils";

patchBeldexNetServiceUtils();

function NewHydratedContext(initialContext: {} | null) {
    initialContext = initialContext || {}

    const context: any = initialContext != null ? initialContext : {}

    context.hostedMoneroAPIClient = new HostedMoneroAPIClient({
        appUserAgent_product: process.env.APP_NAME,
        appUserAgent_version: process.env.APP_VERSION,
        apiUrl: normalizeApiUrl(process.env.SERVER_URL),
        request_conformant_module: require('xhr')
    }, context)

    return context;
}

export default NewHydratedContext;
