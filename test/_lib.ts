import * as undici from 'undici'
import * as lib from '../src/index.js'

// Test facade for the public API. Importing this module instead of ../src/index.js keeps the tests
// using the normal oauth4webapi call signatures while forcing every HTTP request through undici.
export * from '../src/index.js'

// Request helpers return the Response object created by undici.fetch. Export the matching
// constructor so tests can assert against the implementation they intentionally exercise.
export const Response = undici.Response as unknown as typeof globalThis.Response

// The runtime value is undici's Response. The cast is only a TypeScript boundary because undici's
// Response type and the DOM Response type differ structurally.
const customFetch: NonNullable<lib.HttpRequestOptions<string, unknown>[typeof lib.customFetch]> = (
  url,
  options,
) => undici.fetch(url, options as undici.RequestInit) as unknown as Promise<Response>

type Options = { [lib.customFetch]?: typeof customFetch }

function withCustomFetch<T extends object | undefined>(options: T): T & Options {
  return {
    ...options,
    [lib.customFetch]: (options as Options | undefined)?.[lib.customFetch] ?? customFetch,
  } as T & Options
}

// The public functions put their optional request options at different argument positions.
// Wrapping them here keeps individual tests from repeating [customFetch]: undici.fetch.
function defaultCustomFetch<Fn extends (...args: any[]) => any>(fn: Fn, optionsIndex: number): Fn {
  return ((...args: Parameters<Fn>): ReturnType<Fn> => {
    args[optionsIndex] = withCustomFetch(args[optionsIndex] as object | undefined)
    return fn(...args)
  }) as Fn
}

export const discoveryRequest = defaultCustomFetch(lib.discoveryRequest, 1)
export const pushedAuthorizationRequest = defaultCustomFetch(lib.pushedAuthorizationRequest, 4)
export const protectedResourceRequest = defaultCustomFetch(lib.protectedResourceRequest, 5)
export const userInfoRequest = defaultCustomFetch(lib.userInfoRequest, 3)
export const refreshTokenGrantRequest = defaultCustomFetch(lib.refreshTokenGrantRequest, 4)
export const validateApplicationLevelSignature = defaultCustomFetch(
  lib.validateApplicationLevelSignature,
  2,
)
export const authorizationCodeGrantRequest = defaultCustomFetch(
  lib.authorizationCodeGrantRequest,
  6,
)
export const clientCredentialsGrantRequest = defaultCustomFetch(
  lib.clientCredentialsGrantRequest,
  4,
)
export const genericTokenEndpointRequest = defaultCustomFetch(lib.genericTokenEndpointRequest, 5)
export const revocationRequest = defaultCustomFetch(lib.revocationRequest, 4)
export const introspectionRequest = defaultCustomFetch(lib.introspectionRequest, 4)
export const validateJwtAuthResponse = defaultCustomFetch(lib.validateJwtAuthResponse, 4)
export const validateDetachedSignatureResponse = defaultCustomFetch(
  lib.validateDetachedSignatureResponse,
  6,
)
export const validateCodeIdTokenResponse = defaultCustomFetch(lib.validateCodeIdTokenResponse, 6)
export const deviceAuthorizationRequest = defaultCustomFetch(lib.deviceAuthorizationRequest, 4)
export const deviceCodeGrantRequest = defaultCustomFetch(lib.deviceCodeGrantRequest, 4)
export const validateJwtAccessToken = defaultCustomFetch(lib.validateJwtAccessToken, 3)
export const backchannelAuthenticationRequest = defaultCustomFetch(
  lib.backchannelAuthenticationRequest,
  4,
)
export const backchannelAuthenticationGrantRequest = defaultCustomFetch(
  lib.backchannelAuthenticationGrantRequest,
  4,
)
export const dynamicClientRegistrationRequest = defaultCustomFetch(
  lib.dynamicClientRegistrationRequest,
  2,
)
export const resourceDiscoveryRequest = defaultCustomFetch(lib.resourceDiscoveryRequest, 1)
