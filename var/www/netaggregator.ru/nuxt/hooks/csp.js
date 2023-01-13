import { randomBytes } from 'crypto'

/**
* @see https://github.com/nuxt/nuxt.js/issues/6811#issuecomment-637403583
*/
export function cspModule(/* config */)
{
    return {
        routeContext(context)
        {
            // Generate a 128 bit random nonce every request.
            // Inject nonce into vuex state before state is serialized into window.__NUXT__.
            context.state.nonce = randomBytes(16).toString('base64')
        },
        route(url, { cspScriptSrcHashes }, { nuxt: context })
        {
            // Add nonce to cspScriptSrcHashes. Nuxt will populate all entries in this array
            // to the csp header and meta tags as part of the script-src csp policy.
            cspScriptSrcHashes.push(`'nonce-${context.state.nonce}'`)
        }
    }
}
