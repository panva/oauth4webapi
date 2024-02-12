let USER_AGENT: string
// @ts-ignore
if (typeof navigator === 'undefined' || !navigator.userAgent?.startsWith?.('Mozilla/5.0 ')) {
  const NAME = 'oauth4webapi'
  const VERSION = 'v2.10.3'
  USER_AGENT = `${NAME}/${VERSION}`
}

/**
 * JSON Object
 */
export type JsonObject = { [Key in string]?: JsonValue }
/**
 * JSON Array
 */
export type JsonArray = JsonValue[]
/**
 * JSON Primitives
 */
export type JsonPrimitive = string | number | boolean | null
/**
 * JSON Values
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

type Constructor<T extends {} = {}> = new (...args: any[]) => T

function looseInstanceOf<T extends {}>(input: unknown, expected: Constructor<T>): input is T {
  if (input == null) {
    return false
  }

  try {
    return (
      input instanceof expected ||
      Object.getPrototypeOf(input)[Symbol.toStringTag] === expected.prototype[Symbol.toStringTag]
    )
  } catch {
    return false
  }
}

/**
 * Interface to pass an asymmetric private key and, optionally, its associated JWK Key ID to be
 * added as a `kid` JOSE Header Parameter.
 */
export interface PrivateKey {
  /**
   * An asymmetric private CryptoKey.
   *
   * Its algorithm must be compatible with a supported {@link JWSAlgorithm JWS `alg` Algorithm}.
   */
  key: CryptoKey

  /**
   * JWK Key ID to add to JOSE headers when this key is used. When not provided no `kid` (JWK Key
   * ID) will be added to the JOSE Header.
   */
  kid?: string
}

/**
 * Supported Client Authentication Methods.
 *
 * - **`client_secret_basic`** (default) uses the HTTP `Basic` authentication scheme to send
 *   {@link Client.client_id `client_id`} and {@link Client.client_secret `client_secret`} in an
 *   `Authorization` HTTP Header.
 * - **`client_secret_post`** uses the HTTP request body to send {@link Client.client_id `client_id`}
 *   and {@link Client.client_secret `client_secret`} as `application/x-www-form-urlencoded` body
 *   parameters.
 * - **`private_key_jwt`** uses the HTTP request body to send {@link Client.client_id `client_id`},
 *   `client_assertion_type`, and `client_assertion` as `application/x-www-form-urlencoded` body
 *   parameters. The `client_assertion` is signed using a private key supplied as an
 *   {@link AuthenticatedRequestOptions.clientPrivateKey options parameter}.
 * - **`none`** (public client) uses the HTTP request body to send only
 *   {@link Client.client_id `client_id`} as `application/x-www-form-urlencoded` body parameter.
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 */
export type ClientAuthenticationMethod =
  | 'client_secret_basic'
  | 'client_secret_post'
  | 'private_key_jwt'
  | 'none'

/**
 * Supported JWS `alg` Algorithm identifiers.
 *
 * @example
 *
 * CryptoKey algorithm for the `PS256`, `PS384`, or `PS512` JWS Algorithm Identifiers
 *
 * ```ts
 * interface PS256 extends RsaHashedKeyAlgorithm {
 *   name: 'RSA-PSS'
 *   hash: 'SHA-256'
 * }
 *
 * interface PS384 extends RsaHashedKeyAlgorithm {
 *   name: 'RSA-PSS'
 *   hash: 'SHA-384'
 * }
 *
 * interface PS512 extends RsaHashedKeyAlgorithm {
 *   name: 'RSA-PSS'
 *   hash: 'SHA-512'
 * }
 * ```
 *
 * @example
 *
 * CryptoKey algorithm for the `ES256`, `ES384`, or `ES512` JWS Algorithm Identifiers
 *
 * ```ts
 * interface ES256 extends EcKeyAlgorithm {
 *   name: 'ECDSA'
 *   namedCurve: 'P-256'
 * }
 *
 * interface ES384 extends EcKeyAlgorithm {
 *   name: 'ECDSA'
 *   namedCurve: 'P-384'
 * }
 *
 * interface ES512 extends EcKeyAlgorithm {
 *   name: 'ECDSA'
 *   namedCurve: 'P-521'
 * }
 * ```
 *
 * @example
 *
 * CryptoKey algorithm for the `RS256`, `RS384`, or `RS512` JWS Algorithm Identifiers
 *
 * ```ts
 * interface RS256 extends RsaHashedKeyAlgorithm {
 *   name: 'RSASSA-PKCS1-v1_5'
 *   hash: 'SHA-256'
 * }
 *
 * interface RS384 extends RsaHashedKeyAlgorithm {
 *   name: 'RSASSA-PKCS1-v1_5'
 *   hash: 'SHA-384'
 * }
 *
 * interface RS512 extends RsaHashedKeyAlgorithm {
 *   name: 'RSASSA-PKCS1-v1_5'
 *   hash: 'SHA-512'
 * }
 * ```
 *
 * @example
 *
 * CryptoKey algorithm for the `EdDSA` JWS Algorithm Identifier (Experimental)
 *
 * Runtime support for this algorithm is limited, it depends on the [Secure Curves in the Web
 * Cryptography API](https://wicg.github.io/webcrypto-secure-curves/) proposal which is yet to be
 * widely adopted. If the proposal changes this implementation will follow up with a minor release.
 *
 * ```ts
 * interface EdDSA extends KeyAlgorithm {
 *   name: 'Ed25519' | 'Ed448'
 * }
 * ```
 */
export type JWSAlgorithm =
  // widely used
  | 'PS256'
  | 'ES256'
  | 'RS256'
  | 'EdDSA'
  // less used
  | 'ES384'
  | 'PS384'
  | 'RS384'
  | 'ES512'
  | 'PS512'
  | 'RS512'

interface JWK {
  readonly kty?: string
  readonly kid?: string
  readonly alg?: string
  readonly use?: string
  readonly key_ops?: string[]
  readonly e?: string
  readonly n?: string
  readonly crv?: string
  readonly x?: string
  readonly y?: string

  readonly [parameter: string]: JsonValue | undefined
}

export const clockSkew = Symbol()
export const clockTolerance = Symbol()

/**
 * When configured on an interface that extends {@link HttpRequestOptions}, that's every `options`
 * parameter for functions that trigger HTTP Requests, this replaces the use of global fetch. As a
 * fetch replacement the arguments and expected return are the same as fetch.
 *
 * In theory any module that claims to be compatible with the Fetch API can be used but your mileage
 * may vary. No workarounds to allow use of non-conform {@link Response}s will be considered.
 *
 * If you only need to update the {@link Request} properties you do not need to use a Fetch API
 * module, just change what you need and pass it to globalThis.fetch just like this module would
 * normally do.
 *
 * Its intended use cases are:
 *
 * - {@link Request}/{@link Response} tracing and logging
 * - Custom caching strategies for responses of Authorization Server Metadata and JSON Web Key Set
 *   (JWKS) endpoints
 * - Changing the {@link Request} properties like headers, body, credentials, mode before it is passed
 *   to fetch
 *
 * Known caveats:
 *
 * - Expect Type-related issues when passing the inputs through to fetch-like modules, they hardly
 *   ever get their typings inline with actual fetch, you should `@ts-expect-error` them.
 * - Returning self-constructed {@link Response} instances prohibits AS/RS-signalled DPoP Nonce
 *   caching.
 *
 * @example
 *
 * Using [sindresorhus/ky](https://github.com/sindresorhus/ky) for retries and its hooks feature for
 * logging outgoing requests and their responses.
 *
 * ```js
 * import ky from 'ky'
 * import * as oauth from 'oauth4webapi'
 *
 * // example use
 * await oauth.discoveryRequest(new URL('https://as.example.com'), {
 *   [oauth.customFetch]: (...args) =>
 *     ky(args[0], {
 *       ...args[1],
 *       hooks: {
 *         beforeRequest: [
 *           (request) => {
 *             logRequest(request)
 *           },
 *         ],
 *         beforeRetry: [
 *           ({ request, error, retryCount }) => {
 *             logRetry(request, error, retryCount)
 *           },
 *         ],
 *         afterResponse: [
 *           (request, _, response) => {
 *             logResponse(request, response)
 *           },
 *         ],
 *       },
 *     }),
 * })
 * ```
 *
 * @example
 *
 * Using [nodejs/undici](https://github.com/nodejs/undici) to mock responses in tests.
 *
 * ```js
 * import * as undici from 'undici'
 * import * as oauth from 'oauth4webapi'
 *
 * const mockAgent = new undici.MockAgent()
 * mockAgent.disableNetConnect()
 * undici.setGlobalDispatcher(mockAgent)
 *
 * // continue as per undici documentation
 * // https://github.com/nodejs/undici/blob/v6.2.1/docs/api/MockAgent.md#example---basic-mocked-request
 *
 * // example use
 * await oauth.discoveryRequest(new URL('https://as.example.com'), {
 *   [oauth.customFetch]: undici.fetch,
 * })
 * ```
 */
export const customFetch = Symbol()

/**
 * When combined with {@link customFetch} (to use a Fetch API implementation that supports client
 * certificates) this can be used to target FAPI 2.0 profiles that utilize Mutual-TLS for either
 * client authentication or sender constraining. FAPI 1.0 Advanced profiles that use PAR and JARM
 * can also be targetted.
 *
 * When configured on an interface that extends {@link UseMTLSAliasOptions} this makes the client
 * prioritize an endpoint URL present in
 * {@link AuthorizationServer.mtls_endpoint_aliases `as.mtls_endpoint_aliases`}.
 *
 * @example
 *
 * (Node.js) Using [nodejs/undici](https://github.com/nodejs/undici) for Mutual-TLS Client
 * Authentication and Certificate-Bound Access Tokens support.
 *
 * ```js
 * import * as undici from 'undici'
 * import * as oauth from 'oauth4webapi'
 *
 * const response = await oauth.pushedAuthorizationRequest(as, client, params, {
 *   [oauth.useMtlsAlias]: true,
 *   [oauth.customFetch]: (...args) => {
 *     return undici.fetch(args[0], {
 *       ...args[1],
 *       dispatcher: new undici.Agent({
 *         connect: {
 *           key: clientKey,
 *           cert: clientCertificate,
 *         },
 *       }),
 *     })
 *   },
 * })
 * ```
 *
 * @example
 *
 * (Deno) Using Deno.createHttpClient API for Mutual-TLS Client Authentication and Certificate-Bound
 * Access Tokens support. This is currently (Jan 2023) locked behind the --unstable command line
 * flag.
 *
 * ```js
 * import * as oauth from 'oauth4webapi'
 *
 * const agent = Deno.createHttpClient({
 *   certChain: clientCertificate,
 *   privateKey: clientKey,
 * })
 *
 * const response = await oauth.pushedAuthorizationRequest(as, client, params, {
 *   [oauth.useMtlsAlias]: true,
 *   [oauth.customFetch]: (...args) => {
 *     return fetch(args[0], {
 *       ...args[1],
 *       client: agent,
 *     })
 *   },
 * })
 * ```
 *
 * @see [RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens](https://www.rfc-editor.org/rfc/rfc8705.html)
 */
export const useMtlsAlias = Symbol()

/**
 * Authorization Server Metadata
 *
 * @see [IANA OAuth Authorization Server Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#authorization-server-metadata)
 */
export interface AuthorizationServer {
  /**
   * Authorization server's Issuer Identifier URL.
   */
  readonly issuer: string
  /**
   * URL of the authorization server's authorization endpoint.
   */
  readonly authorization_endpoint?: string
  /**
   * URL of the authorization server's token endpoint.
   */
  readonly token_endpoint?: string
  /**
   * URL of the authorization server's JWK Set document.
   */
  readonly jwks_uri?: string
  /**
   * URL of the authorization server's Dynamic Client Registration Endpoint.
   */
  readonly registration_endpoint?: string
  /**
   * JSON array containing a list of the `scope` values that this authorization server supports.
   */
  readonly scopes_supported?: string[]
  /**
   * JSON array containing a list of the `response_type` values that this authorization server
   * supports.
   */
  readonly response_types_supported?: string[]
  /**
   * JSON array containing a list of the `response_mode` values that this authorization server
   * supports.
   */
  readonly response_modes_supported?: string[]
  /**
   * JSON array containing a list of the `grant_type` values that this authorization server
   * supports.
   */
  readonly grant_types_supported?: string[]
  /**
   * JSON array containing a list of client authentication methods supported by this token endpoint.
   */
  readonly token_endpoint_auth_methods_supported?: string[]
  /**
   * JSON array containing a list of the JWS signing algorithms supported by the token endpoint for
   * the signature on the JWT used to authenticate the client at the token endpoint.
   */
  readonly token_endpoint_auth_signing_alg_values_supported?: string[]
  /**
   * URL of a page containing human-readable information that developers might want or need to know
   * when using the authorization server.
   */
  readonly service_documentation?: string
  /**
   * Languages and scripts supported for the user interface, represented as a JSON array of language
   * tag values from RFC 5646.
   */
  readonly ui_locales_supported?: string[]
  /**
   * URL that the authorization server provides to the person registering the client to read about
   * the authorization server's requirements on how the client can use the data provided by the
   * authorization server.
   */
  readonly op_policy_uri?: string
  /**
   * URL that the authorization server provides to the person registering the client to read about
   * the authorization server's terms of service.
   */
  readonly op_tos_uri?: string
  /**
   * URL of the authorization server's revocation endpoint.
   */
  readonly revocation_endpoint?: string
  /**
   * JSON array containing a list of client authentication methods supported by this revocation
   * endpoint.
   */
  readonly revocation_endpoint_auth_methods_supported?: string[]
  /**
   * JSON array containing a list of the JWS signing algorithms supported by the revocation endpoint
   * for the signature on the JWT used to authenticate the client at the revocation endpoint.
   */
  readonly revocation_endpoint_auth_signing_alg_values_supported?: string[]
  /**
   * URL of the authorization server's introspection endpoint.
   */
  readonly introspection_endpoint?: string
  /**
   * JSON array containing a list of client authentication methods supported by this introspection
   * endpoint.
   */
  readonly introspection_endpoint_auth_methods_supported?: string[]
  /**
   * JSON array containing a list of the JWS signing algorithms supported by the introspection
   * endpoint for the signature on the JWT used to authenticate the client at the introspection
   * endpoint.
   */
  readonly introspection_endpoint_auth_signing_alg_values_supported?: string[]
  /**
   * PKCE code challenge methods supported by this authorization server.
   */
  readonly code_challenge_methods_supported?: string[]
  /**
   * Signed JWT containing metadata values about the authorization server as claims.
   */
  readonly signed_metadata?: string
  /**
   * URL of the authorization server's device authorization endpoint.
   */
  readonly device_authorization_endpoint?: string
  /**
   * Indicates authorization server support for mutual-TLS client certificate-bound access tokens.
   */
  readonly tls_client_certificate_bound_access_tokens?: boolean
  /**
   * JSON object containing alternative authorization server endpoints, which a client intending to
   * do mutual TLS will use in preference to the conventional endpoints.
   */
  readonly mtls_endpoint_aliases?: MTLSEndpointAliases
  /**
   * URL of the authorization server's UserInfo Endpoint.
   */
  readonly userinfo_endpoint?: string
  /**
   * JSON array containing a list of the Authentication Context Class References that this
   * authorization server supports.
   */
  readonly acr_values_supported?: string[]
  /**
   * JSON array containing a list of the Subject Identifier types that this authorization server
   * supports.
   */
  readonly subject_types_supported?: string[]
  /**
   * JSON array containing a list of the JWS `alg` values supported by the authorization server for
   * the ID Token.
   */
  readonly id_token_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `alg` values supported by the authorization server for
   * the ID Token.
   */
  readonly id_token_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `enc` values supported by the authorization server for
   * the ID Token.
   */
  readonly id_token_encryption_enc_values_supported?: string[]
  /**
   * JSON array containing a list of the JWS `alg` values supported by the UserInfo Endpoint.
   */
  readonly userinfo_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `alg` values supported by the UserInfo Endpoint.
   */
  readonly userinfo_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `enc` values supported by the UserInfo Endpoint.
   */
  readonly userinfo_encryption_enc_values_supported?: string[]
  /**
   * JSON array containing a list of the JWS `alg` values supported by the authorization server for
   * Request Objects.
   */
  readonly request_object_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `alg` values supported by the authorization server for
   * Request Objects.
   */
  readonly request_object_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `enc` values supported by the authorization server for
   * Request Objects.
   */
  readonly request_object_encryption_enc_values_supported?: string[]
  /**
   * JSON array containing a list of the `display` parameter values that the authorization server
   * supports.
   */
  readonly display_values_supported?: string[]
  /**
   * JSON array containing a list of the Claim Types that the authorization server supports.
   */
  readonly claim_types_supported?: string[]
  /**
   * JSON array containing a list of the Claim Names of the Claims that the authorization server MAY
   * be able to supply values for.
   */
  readonly claims_supported?: string[]
  /**
   * Languages and scripts supported for values in Claims being returned, represented as a JSON
   * array of RFC 5646 language tag values.
   */
  readonly claims_locales_supported?: string[]
  /**
   * Boolean value specifying whether the authorization server supports use of the `claims`
   * parameter.
   */
  readonly claims_parameter_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports use of the `request`
   * parameter.
   */
  readonly request_parameter_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports use of the `request_uri`
   * parameter.
   */
  readonly request_uri_parameter_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server requires any `request_uri` values
   * used to be pre-registered.
   */
  readonly require_request_uri_registration?: boolean
  /**
   * Indicates where authorization request needs to be protected as Request Object and provided
   * through either `request` or `request_uri` parameter.
   */
  readonly require_signed_request_object?: boolean
  /**
   * URL of the authorization server's pushed authorization request endpoint.
   */
  readonly pushed_authorization_request_endpoint?: string
  /**
   * Indicates whether the authorization server accepts authorization requests only via PAR.
   */
  readonly require_pushed_authorization_requests?: boolean
  /**
   * JSON array containing a list of algorithms supported by the authorization server for
   * introspection response signing.
   */
  readonly introspection_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization server for
   * introspection response content key encryption (`alg` value).
   */
  readonly introspection_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization server for
   * introspection response content encryption (`enc` value).
   */
  readonly introspection_encryption_enc_values_supported?: string[]
  /**
   * Boolean value indicating whether the authorization server provides the `iss` parameter in the
   * authorization response.
   */
  readonly authorization_response_iss_parameter_supported?: boolean
  /**
   * JSON array containing a list of algorithms supported by the authorization server for
   * introspection response signing.
   */
  readonly authorization_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization server for
   * introspection response encryption (`alg` value).
   */
  readonly authorization_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization server for
   * introspection response encryption (`enc` value).
   */
  readonly authorization_encryption_enc_values_supported?: string[]
  /**
   * CIBA Backchannel Authentication Endpoint.
   */
  readonly backchannel_authentication_endpoint?: string
  /**
   * JSON array containing a list of the JWS signing algorithms supported for validation of signed
   * CIBA authentication requests.
   */
  readonly backchannel_authentication_request_signing_alg_values_supported?: string[]
  /**
   * Supported CIBA authentication result delivery modes.
   */
  readonly backchannel_token_delivery_modes_supported?: string[]
  /**
   * Indicates whether the authorization server supports the use of the CIBA `user_code` parameter.
   */
  readonly backchannel_user_code_parameter_supported?: boolean
  /**
   * URL of an authorization server iframe that supports cross-origin communications for session
   * state information with the RP Client, using the HTML5 postMessage API.
   */
  readonly check_session_iframe?: string
  /**
   * JSON array containing a list of the JWS algorithms supported for DPoP proof JWTs.
   */
  readonly dpop_signing_alg_values_supported?: string[]
  /**
   * URL at the authorization server to which an RP can perform a redirect to request that the
   * End-User be logged out at the authorization server.
   */
  readonly end_session_endpoint?: string
  /**
   * Boolean value specifying whether the authorization server can pass `iss` (issuer) and `sid`
   * (session ID) query parameters to identify the RP session with the authorization server when the
   * `frontchannel_logout_uri` is used.
   */
  readonly frontchannel_logout_session_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports HTTP-based logout.
   */
  readonly frontchannel_logout_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server can pass a `sid` (session ID) Claim
   * in the Logout Token to identify the RP session with the OP.
   */
  readonly backchannel_logout_session_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports back-channel logout.
   */
  readonly backchannel_logout_supported?: boolean

  readonly [metadata: string]: JsonValue | undefined
}

export interface MTLSEndpointAliases
  extends Pick<
    AuthorizationServer,
    | 'token_endpoint'
    | 'revocation_endpoint'
    | 'introspection_endpoint'
    | 'device_authorization_endpoint'
    | 'userinfo_endpoint'
    | 'pushed_authorization_request_endpoint'
  > {
  readonly [metadata: string]: JsonValue | undefined
}

/**
 * Recognized Client Metadata that have an effect on the exposed functionality.
 *
 * @see [IANA OAuth Client Registration Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#client-metadata)
 */
export interface Client {
  /**
   * Client identifier.
   */
  client_id: string
  /**
   * Client secret.
   */
  client_secret?: string
  /**
   * Client {@link ClientAuthenticationMethod authentication method} for the client's authenticated
   * requests. Default is `client_secret_basic`.
   */
  token_endpoint_auth_method?: ClientAuthenticationMethod
  /**
   * JWS `alg` algorithm required for signing the ID Token issued to this Client. When not
   * configured the default is to allow only algorithms listed in
   * {@link AuthorizationServer.id_token_signing_alg_values_supported `as.id_token_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  id_token_signed_response_alg?: string
  /**
   * JWS `alg` algorithm required for signing authorization responses. When not configured the
   * default is to allow only {@link JWSAlgorithm supported algorithms} listed in
   * {@link AuthorizationServer.authorization_signing_alg_values_supported `as.authorization_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  authorization_signed_response_alg?: JWSAlgorithm
  /**
   * Boolean value specifying whether the {@link IDToken.auth_time `auth_time`} Claim in the ID Token
   * is REQUIRED. Default is `false`.
   */
  require_auth_time?: boolean
  /**
   * JWS `alg` algorithm REQUIRED for signing UserInfo Responses. When not configured the default is
   * to allow only algorithms listed in
   * {@link AuthorizationServer.userinfo_signing_alg_values_supported `as.userinfo_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  userinfo_signed_response_alg?: string
  /**
   * JWS `alg` algorithm REQUIRED for signed introspection responses. When not configured the
   * default is to allow only algorithms listed in
   * {@link AuthorizationServer.introspection_signing_alg_values_supported `as.introspection_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  introspection_signed_response_alg?: string
  /**
   * Default Maximum Authentication Age.
   */
  default_max_age?: number

  /**
   * Use to adjust the client's assumed current time. Positive and negative finite values
   * representing seconds are allowed. Default is `0` (Date.now() + 0 seconds is used).
   *
   * @example
   *
   * When the client's local clock is mistakenly 1 hour in the past
   *
   * ```ts
   * const client: oauth.Client = {
   *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
   *   // ... other metadata
   *   [oauth.clockSkew]: +(60 * 60),
   * }
   * ```
   *
   * @example
   *
   * When the client's local clock is mistakenly 1 hour in the future
   *
   * ```ts
   * const client: oauth.Client = {
   *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
   *   // ... other metadata
   *   [oauth.clockSkew]: -(60 * 60),
   * }
   * ```
   */
  [clockSkew]?: number

  /**
   * Use to set allowed client's clock tolerance when checking DateTime JWT Claims. Only positive
   * finite values representing seconds are allowed. Default is `30` (30 seconds).
   *
   * @example
   *
   * Tolerate 30 seconds clock skew when validating JWT claims like exp or nbf.
   *
   * ```ts
   * const client: oauth.Client = {
   *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
   *   // ... other metadata
   *   [oauth.clockTolerance]: 30,
   * }
   * ```
   */
  [clockTolerance]?: number

  [metadata: string]: JsonValue | undefined
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function buf(input: string): Uint8Array
function buf(input: Uint8Array): string
function buf(input: string | Uint8Array) {
  if (typeof input === 'string') {
    return encoder.encode(input)
  }

  return decoder.decode(input)
}

const CHUNK_SIZE = 0x8000
function encodeBase64Url(input: Uint8Array | ArrayBuffer) {
  if (input instanceof ArrayBuffer) {
    input = new Uint8Array(input)
  }

  const arr = []
  for (let i = 0; i < input.byteLength; i += CHUNK_SIZE) {
    // @ts-expect-error
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)))
  }
  return btoa(arr.join('')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function decodeBase64Url(input: string) {
  try {
    const binary = atob(input.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  } catch (cause) {
    throw new OPE('The input to be decoded is not correctly encoded.', { cause })
  }
}

function b64u(input: string): Uint8Array
function b64u(input: Uint8Array | ArrayBuffer): string
function b64u(input: string | Uint8Array | ArrayBuffer) {
  if (typeof input === 'string') {
    return decodeBase64Url(input)
  }

  return encodeBase64Url(input)
}

/**
 * Simple LRU
 */
class LRU<T1, T2> {
  cache = new Map<T1, T2>()
  _cache = new Map<T1, T2>()
  maxSize: number

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  get(key: T1) {
    let v = this.cache.get(key)
    if (v) {
      return v
    }

    if ((v = this._cache.get(key))) {
      this.update(key, v)
      return v
    }

    return undefined
  }

  has(key: T1) {
    return this.cache.has(key) || this._cache.has(key)
  }

  set(key: T1, value: T2) {
    if (this.cache.has(key)) {
      this.cache.set(key, value)
    } else {
      this.update(key, value)
    }
    return this
  }

  delete(key: T1) {
    if (this.cache.has(key)) {
      return this.cache.delete(key)
    }
    if (this._cache.has(key)) {
      return this._cache.delete(key)
    }
    return false
  }

  update(key: T1, value: T2) {
    this.cache.set(key, value)
    if (this.cache.size >= this.maxSize) {
      this._cache = this.cache
      this.cache = new Map()
    }
  }
}

/**
 * @group Errors
 */
export class UnsupportedOperationError extends Error {
  constructor(message?: string) {
    super(message ?? 'operation not supported')
    this.name = this.constructor.name
    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

/**
 * @group Errors
 */
export class OperationProcessingError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = this.constructor.name
    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

const OPE = OperationProcessingError

const dpopNonces: LRU<string, string> = new LRU(100)

function isCryptoKey(key: unknown): key is CryptoKey {
  return key instanceof CryptoKey
}

function isPrivateKey(key: unknown): key is CryptoKey {
  return isCryptoKey(key) && key.type === 'private'
}

function isPublicKey(key: unknown): key is CryptoKey {
  return isCryptoKey(key) && key.type === 'public'
}

const SUPPORTED_JWS_ALGS: JWSAlgorithm[] = [
  'PS256',
  'ES256',
  'RS256',
  'PS384',
  'ES384',
  'RS384',
  'PS512',
  'ES512',
  'RS512',
  'EdDSA',
]

export interface HttpRequestOptions {
  /**
   * An AbortSignal instance, or a factory returning one, to abort the HTTP Request(s) triggered by
   * this function's invocation.
   *
   * @example
   *
   * A 5000ms timeout AbortSignal for every request
   *
   * ```js
   * const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
   * ```
   */
  signal?: (() => AbortSignal) | AbortSignal

  /**
   * Headers to additionally send with the HTTP Request(s) triggered by this function's invocation.
   */
  headers?: [string, string][] | Record<string, string> | Headers

  /**
   * See {@link customFetch}.
   */
  [customFetch]?: typeof fetch
}

export interface DiscoveryRequestOptions extends HttpRequestOptions {
  /**
   * The issuer transformation algorithm to use.
   */
  algorithm?: 'oidc' | 'oauth2'
}

function processDpopNonce(response: Response) {
  try {
    const nonce = response.headers.get('dpop-nonce')
    if (nonce) {
      dpopNonces.set(new URL(response.url).origin, nonce)
    }
  } catch {}
  return response
}

function normalizeTyp(value: string) {
  return value.toLowerCase().replace(/^application\//, '')
}

function isJsonObject<T = JsonObject>(input: unknown): input is T {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return false
  }

  return true
}

function prepareHeaders(input?: [string, string][] | Record<string, string> | Headers): Headers {
  if (looseInstanceOf(input, Headers)) {
    input = Object.fromEntries(input.entries())
  }
  const headers = new Headers(input)

  if (USER_AGENT && !headers.has('user-agent')) {
    headers.set('user-agent', USER_AGENT)
  }
  if (headers.has('authorization')) {
    throw new TypeError('"options.headers" must not include the "authorization" header name')
  }
  if (headers.has('dpop')) {
    throw new TypeError('"options.headers" must not include the "dpop" header name')
  }
  return headers
}

function signal(value: Exclude<HttpRequestOptions['signal'], undefined>): AbortSignal {
  if (typeof value === 'function') {
    value = value()
  }

  if (!(value instanceof AbortSignal)) {
    throw new TypeError('"options.signal" must return or be an instance of AbortSignal')
  }

  return value
}

/**
 * Performs an authorization server metadata discovery using one of two
 * {@link DiscoveryRequestOptions.algorithm transformation algorithms} applied to the
 * `issuerIdentifier` argument.
 *
 * - `oidc` (default) as defined by OpenID Connect Discovery 1.0.
 * - `oauth2` as defined by RFC 8414.
 *
 * @param issuerIdentifier Issuer Identifier to resolve the well-known discovery URI for.
 *
 * @group Authorization Server Metadata
 * @group OpenID Connect (OIDC) Discovery
 *
 * @see [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)
 * @see [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)
 */
export async function discoveryRequest(
  issuerIdentifier: URL,
  options?: DiscoveryRequestOptions,
): Promise<Response> {
  if (!(issuerIdentifier instanceof URL)) {
    throw new TypeError('"issuerIdentifier" must be an instance of URL')
  }

  if (issuerIdentifier.protocol !== 'https:' && issuerIdentifier.protocol !== 'http:') {
    throw new TypeError('"issuer.protocol" must be "https:" or "http:"')
  }

  const url = new URL(issuerIdentifier.href)

  switch (options?.algorithm) {
    case undefined: // Fall through
    case 'oidc':
      url.pathname = `${url.pathname}/.well-known/openid-configuration`.replace('//', '/')
      break
    case 'oauth2':
      if (url.pathname === '/') {
        url.pathname = '.well-known/oauth-authorization-server'
      } else {
        url.pathname = `.well-known/oauth-authorization-server/${url.pathname}`.replace('//', '/')
      }
      break
    default:
      throw new TypeError('"options.algorithm" must be "oidc" (default), or "oauth2"')
  }

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  return (options?.[customFetch] || fetch)(url.href, {
    headers: Object.fromEntries(headers.entries()),
    method: 'GET',
    redirect: 'manual',
    signal: options?.signal ? signal(options.signal) : null,
  }).then(processDpopNonce)
}

function validateString(input: unknown): input is string {
  return typeof input === 'string' && input.length !== 0
}

/**
 * Validates Response instance to be one coming from the authorization server's well-known discovery
 * endpoint.
 *
 * @param expectedIssuerIdentifier Expected Issuer Identifier value.
 * @param response Resolved value from {@link discoveryRequest}.
 *
 * @returns Resolves with the discovered Authorization Server Metadata.
 *
 * @group Authorization Server Metadata
 * @group OpenID Connect (OIDC) Discovery
 *
 * @see [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)
 * @see [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)
 */
export async function processDiscoveryResponse(
  expectedIssuerIdentifier: URL,
  response: Response,
): Promise<AuthorizationServer> {
  if (!(expectedIssuerIdentifier instanceof URL)) {
    throw new TypeError('"expectedIssuer" must be an instance of URL')
  }

  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    throw new OPE('"response" is not a conform Authorization Server Metadata response')
  }

  assertReadableResponse(response)
  let json: JsonValue
  try {
    json = await response.json()
  } catch (cause) {
    throw new OPE('failed to parse "response" body as JSON', { cause })
  }

  if (!isJsonObject<AuthorizationServer>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (!validateString(json.issuer)) {
    throw new OPE('"response" body "issuer" property must be a non-empty string')
  }

  if (new URL(json.issuer).href !== expectedIssuerIdentifier.href) {
    throw new OPE('"response" body "issuer" does not match "expectedIssuer"')
  }

  return json
}

/**
 * Generates 32 random bytes and encodes them using base64url.
 */
function randomBytes() {
  return b64u(crypto.getRandomValues(new Uint8Array(32)))
}

/**
 * Generate random `code_verifier` value.
 *
 * @group Utilities
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group Proof Key for Code Exchange (PKCE)
 *
 * @see [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
 */
export function generateRandomCodeVerifier() {
  return randomBytes()
}

/**
 * Generate random `state` value.
 *
 * @group Utilities
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.1)
 */
export function generateRandomState() {
  return randomBytes()
}

/**
 * Generate random `nonce` value.
 *
 * @group Utilities
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
 */
export function generateRandomNonce() {
  return randomBytes()
}

/**
 * Calculates the PKCE `code_verifier` value to send with an authorization request using the S256
 * PKCE Code Challenge Method transformation.
 *
 * @param codeVerifier `code_verifier` value generated e.g. from {@link generateRandomCodeVerifier}.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group Proof Key for Code Exchange (PKCE)
 *
 * @see [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
 */
export async function calculatePKCECodeChallenge(codeVerifier: string) {
  if (!validateString(codeVerifier)) {
    throw new TypeError('"codeVerifier" must be a non-empty string')
  }

  return b64u(await crypto.subtle.digest('SHA-256', buf(codeVerifier)))
}

interface NormalizedKeyInput {
  key?: CryptoKey
  kid?: string
}

function getKeyAndKid(input: CryptoKey | PrivateKey | undefined): NormalizedKeyInput {
  if (input instanceof CryptoKey) {
    return { key: input }
  }

  if (!(input?.key instanceof CryptoKey)) {
    return {}
  }

  if (input.kid !== undefined && !validateString(input.kid)) {
    throw new TypeError('"kid" must be a non-empty string')
  }

  return { key: input.key, kid: input.kid }
}

export interface DPoPOptions extends CryptoKeyPair {
  /**
   * Private CryptoKey instance to sign the DPoP Proof JWT with.
   *
   * Its algorithm must be compatible with a supported {@link JWSAlgorithm JWS `alg` Algorithm}.
   */
  privateKey: CryptoKey

  /**
   * The public key corresponding to {@link DPoPOptions.privateKey}.
   */
  publicKey: CryptoKey

  /**
   * Server-Provided Nonce to use in the request. This option serves as an override in case the
   * self-correcting mechanism does not work with a particular server. Previously received nonces
   * will be used automatically.
   */
  nonce?: string
}

export interface DPoPRequestOptions {
  /**
   * DPoP-related options.
   */
  DPoP?: DPoPOptions
}

export interface UseMTLSAliasOptions {
  /**
   * See {@link useMtlsAlias}.
   */
  [useMtlsAlias]?: boolean
}

export interface AuthenticatedRequestOptions extends UseMTLSAliasOptions {
  /**
   * Private key to use for `private_key_jwt`
   * {@link ClientAuthenticationMethod client authentication}. Its algorithm must be compatible with
   * a supported {@link JWSAlgorithm JWS `alg` Algorithm}.
   */
  clientPrivateKey?: CryptoKey | PrivateKey
}

export interface PushedAuthorizationRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions,
    DPoPRequestOptions {}

/**
 * The client identifier is encoded using the `application/x-www-form-urlencoded` encoding algorithm
 * per Appendix B, and the encoded value is used as the username; the client password is encoded
 * using the same algorithm and used as the password.
 */
function formUrlEncode(token: string) {
  // TODO: in v3.x additionally encode the `- _ . ! ~ * ' ( )` characters
  // https://github.com/panva/oauth4webapi/commit/f926175cdf6caa467029a57e76375054fff7c57b
  return encodeURIComponent(token).replace(/%20/g, '+')
}

/**
 * Formats client_id and client_secret as an HTTP Basic Authentication header as per the OAuth 2.0
 * specified in RFC6749.
 */
function clientSecretBasic(clientId: string, clientSecret: string) {
  const username = formUrlEncode(clientId)
  const password = formUrlEncode(clientSecret)
  const credentials = btoa(`${username}:${password}`)
  return `Basic ${credentials}`
}

/**
 * Determines an RSASSA-PSS algorithm identifier from CryptoKey instance properties.
 */
function psAlg(key: CryptoKey): JWSAlgorithm {
  switch ((<RsaHashedKeyAlgorithm>key.algorithm).hash.name) {
    case 'SHA-256':
      return 'PS256'
    case 'SHA-384':
      return 'PS384'
    case 'SHA-512':
      return 'PS512'
    default:
      throw new UnsupportedOperationError('unsupported RsaHashedKeyAlgorithm hash name')
  }
}

/**
 * Determines an RSASSA-PKCS1-v1_5 algorithm identifier from CryptoKey instance properties.
 */
function rsAlg(key: CryptoKey): JWSAlgorithm {
  switch ((<RsaHashedKeyAlgorithm>key.algorithm).hash.name) {
    case 'SHA-256':
      return 'RS256'
    case 'SHA-384':
      return 'RS384'
    case 'SHA-512':
      return 'RS512'
    default:
      throw new UnsupportedOperationError('unsupported RsaHashedKeyAlgorithm hash name')
  }
}

/**
 * Determines an ECDSA algorithm identifier from CryptoKey instance properties.
 */
function esAlg(key: CryptoKey): JWSAlgorithm {
  switch ((<EcKeyAlgorithm>key.algorithm).namedCurve) {
    case 'P-256':
      return 'ES256'
    case 'P-384':
      return 'ES384'
    case 'P-521':
      return 'ES512'
    default:
      throw new UnsupportedOperationError('unsupported EcKeyAlgorithm namedCurve')
  }
}

/**
 * Determines a supported JWS `alg` identifier from CryptoKey instance properties.
 */
function keyToJws(key: CryptoKey) {
  switch (key.algorithm.name) {
    case 'RSA-PSS':
      return psAlg(key)
    case 'RSASSA-PKCS1-v1_5':
      return rsAlg(key)
    case 'ECDSA':
      return esAlg(key)
    case 'Ed25519': // Fall through
    case 'Ed448':
      return 'EdDSA'
    default:
      throw new UnsupportedOperationError('unsupported CryptoKey algorithm name')
  }
}

function getClockSkew(client?: Pick<Client, typeof clockSkew>) {
  const skew = client?.[clockSkew]

  return typeof skew === 'number' && Number.isFinite(skew) ? skew : 0
}

function getClockTolerance(client?: Pick<Client, typeof clockTolerance>) {
  const tolerance = client?.[clockTolerance]

  return typeof tolerance === 'number' && Number.isFinite(tolerance) && Math.sign(tolerance) !== -1
    ? tolerance
    : 30
}

/**
 * Returns the current unix timestamp in seconds.
 */
function epochTime() {
  return Math.floor(Date.now() / 1000)
}

function clientAssertion(as: AuthorizationServer, client: Client) {
  const now = epochTime() + getClockSkew(client)
  return {
    jti: randomBytes(),
    aud: [as.issuer, as.token_endpoint],
    exp: now + 60,
    iat: now,
    nbf: now,
    iss: client.client_id,
    sub: client.client_id,
  }
}

/**
 * Generates a unique client assertion to be used in `private_key_jwt` authenticated requests.
 */
async function privateKeyJwt(
  as: AuthorizationServer,
  client: Client,
  key: CryptoKey,
  kid?: string,
) {
  return jwt(
    {
      alg: keyToJws(key),
      kid,
    },
    clientAssertion(as, client),
    key,
  )
}

function assertAs(as: AuthorizationServer): as is AuthorizationServer {
  if (typeof as !== 'object' || as === null) {
    throw new TypeError('"as" must be an object')
  }

  if (!validateString(as.issuer)) {
    throw new TypeError('"as.issuer" property must be a non-empty string')
  }
  return true
}

function assertClient(client: Client): client is Client {
  if (typeof client !== 'object' || client === null) {
    throw new TypeError('"client" must be an object')
  }

  if (!validateString(client.client_id)) {
    throw new TypeError('"client.client_id" property must be a non-empty string')
  }
  return true
}

function assertClientSecret(clientSecret: unknown) {
  if (!validateString(clientSecret)) {
    throw new TypeError('"client.client_secret" property must be a non-empty string')
  }
  return clientSecret
}

function assertNoClientPrivateKey(clientAuthMethod: string, clientPrivateKey: unknown) {
  if (clientPrivateKey !== undefined) {
    throw new TypeError(
      `"options.clientPrivateKey" property must not be provided when ${clientAuthMethod} client authentication method is used.`,
    )
  }
}

function assertNoClientSecret(clientAuthMethod: string, clientSecret: unknown) {
  if (clientSecret !== undefined) {
    throw new TypeError(
      `"client.client_secret" property must not be provided when ${clientAuthMethod} client authentication method is used.`,
    )
  }
}

/**
 * Applies supported client authentication to an URLSearchParams instance representing the request
 * body and/or a Headers instance to be sent with an authenticated request.
 */
async function clientAuthentication(
  as: AuthorizationServer,
  client: Client,
  body: URLSearchParams,
  headers: Headers,
  clientPrivateKey?: CryptoKey | PrivateKey,
) {
  body.delete('client_secret')
  body.delete('client_assertion_type')
  body.delete('client_assertion')
  switch (client.token_endpoint_auth_method) {
    case undefined: // Fall through
    case 'client_secret_basic': {
      assertNoClientPrivateKey('client_secret_basic', clientPrivateKey)
      headers.set(
        'authorization',
        clientSecretBasic(client.client_id, assertClientSecret(client.client_secret)),
      )
      break
    }
    case 'client_secret_post': {
      assertNoClientPrivateKey('client_secret_post', clientPrivateKey)
      body.set('client_id', client.client_id)
      body.set('client_secret', assertClientSecret(client.client_secret))
      break
    }
    case 'private_key_jwt': {
      assertNoClientSecret('private_key_jwt', client.client_secret)
      if (clientPrivateKey === undefined) {
        throw new TypeError(
          '"options.clientPrivateKey" must be provided when "client.token_endpoint_auth_method" is "private_key_jwt"',
        )
      }
      const { key, kid } = getKeyAndKid(clientPrivateKey)
      if (!isPrivateKey(key)) {
        throw new TypeError('"options.clientPrivateKey.key" must be a private CryptoKey')
      }
      body.set('client_id', client.client_id)
      body.set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer')
      body.set('client_assertion', await privateKeyJwt(as, client, key, kid))
      break
    }
    // @ts-expect-error
    case 'tls_client_auth':
    // @ts-expect-error
    case 'self_signed_tls_client_auth':
    case 'none': {
      assertNoClientSecret(client.token_endpoint_auth_method, client.client_secret)
      assertNoClientPrivateKey(client.token_endpoint_auth_method, clientPrivateKey)
      body.set('client_id', client.client_id)
      break
    }
    default:
      throw new UnsupportedOperationError('unsupported client token_endpoint_auth_method')
  }
}

/**
 * Minimal JWT sign() implementation.
 */
async function jwt(
  header: CompactJWSHeaderParameters,
  claimsSet: Record<string, unknown>,
  key: CryptoKey,
) {
  if (!key.usages.includes('sign')) {
    throw new TypeError(
      'CryptoKey instances used for signing assertions must include "sign" in their "usages"',
    )
  }
  const input = `${b64u(buf(JSON.stringify(header)))}.${b64u(buf(JSON.stringify(claimsSet)))}`
  const signature = b64u(await crypto.subtle.sign(keyToSubtle(key), key, buf(input)))
  return `${input}.${signature}`
}

/**
 * Generates a signed JWT-Secured Authorization Request (JAR).
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param privateKey Private key to sign the Request Object with.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group JWT-Secured Authorization Request (JAR)
 *
 * @see [RFC 9101 - The OAuth 2.0 Authorization Framework: JWT-Secured Authorization Request (JAR)](https://www.rfc-editor.org/rfc/rfc9101.html#name-request-object-2)
 */
export async function issueRequestObject(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | Record<string, string> | string[][],
  privateKey: CryptoKey | PrivateKey,
) {
  assertAs(as)
  assertClient(client)

  parameters = new URLSearchParams(parameters)

  const { key, kid } = getKeyAndKid(privateKey)
  if (!isPrivateKey(key)) {
    throw new TypeError('"privateKey.key" must be a private CryptoKey')
  }

  parameters.set('client_id', client.client_id)

  const now = epochTime() + getClockSkew(client)
  const claims: Record<string, unknown> = {
    ...Object.fromEntries(parameters.entries()),
    jti: randomBytes(),
    aud: as.issuer,
    exp: now + 60,
    iat: now,
    nbf: now,
    iss: client.client_id,
  }

  let resource: string[]
  if (
    parameters.has('resource') &&
    (resource = parameters.getAll('resource')) &&
    resource.length > 1
  ) {
    claims.resource = resource
  }

  {
    let value = parameters.get('max_age')
    if (value !== null) {
      claims.max_age = parseInt(value, 10)

      if (!Number.isFinite(claims.max_age)) {
        throw new OPE('"max_age" parameter must be a number')
      }
    }
  }

  {
    let value = parameters.get('claims')
    if (value !== null) {
      try {
        claims.claims = JSON.parse(value)
      } catch (cause) {
        throw new OPE('failed to parse the "claims" parameter as JSON', { cause })
      }

      if (!isJsonObject(claims.claims)) {
        throw new OPE('"claims" parameter must be a JSON with a top level object')
      }
    }
  }

  {
    let value = parameters.get('authorization_details')
    if (value !== null) {
      try {
        claims.authorization_details = JSON.parse(value)
      } catch (cause) {
        throw new OPE('failed to parse the "authorization_details" parameter as JSON', { cause })
      }

      if (!Array.isArray(claims.authorization_details)) {
        throw new OPE('"authorization_details" parameter must be a JSON with a top level array')
      }
    }
  }

  return jwt(
    {
      alg: keyToJws(key),
      typ: 'oauth-authz-req+jwt',
      kid,
    },
    claims,
    key,
  )
}

/**
 * Generates a unique DPoP Proof JWT
 */
async function dpopProofJwt(
  headers: Headers,
  options: DPoPOptions,
  url: URL,
  htm: string,
  clockSkew: number,
  accessToken?: string,
) {
  const { privateKey, publicKey, nonce = dpopNonces.get(url.origin) } = options

  if (!isPrivateKey(privateKey)) {
    throw new TypeError('"DPoP.privateKey" must be a private CryptoKey')
  }

  if (!isPublicKey(publicKey)) {
    throw new TypeError('"DPoP.publicKey" must be a public CryptoKey')
  }

  if (nonce !== undefined && !validateString(nonce)) {
    throw new TypeError('"DPoP.nonce" must be a non-empty string or undefined')
  }

  if (!publicKey.extractable) {
    throw new TypeError('"DPoP.publicKey.extractable" must be true')
  }

  const now = epochTime() + clockSkew
  const proof = await jwt(
    {
      alg: keyToJws(privateKey),
      typ: 'dpop+jwt',
      jwk: await publicJwk(publicKey),
    },
    {
      iat: now,
      jti: randomBytes(),
      htm,
      nonce,
      htu: `${url.origin}${url.pathname}`,
      ath: accessToken ? b64u(await crypto.subtle.digest('SHA-256', buf(accessToken))) : undefined,
    },
    privateKey,
  )

  headers.set('dpop', proof)
}

let jwkCache: WeakMap<CryptoKey, JWK>

async function getSetPublicJwkCache(key: CryptoKey) {
  const { kty, e, n, x, y, crv } = await crypto.subtle.exportKey('jwk', key)
  const jwk = { kty, e, n, x, y, crv }
  jwkCache.set(key, jwk)
  return jwk
}

/**
 * Exports an asymmetric crypto key as bare JWK
 */
async function publicJwk(key: CryptoKey) {
  jwkCache ||= new WeakMap()
  return jwkCache.get(key) || getSetPublicJwkCache(key)
}

function validateEndpoint(
  value: unknown,
  endpoint: keyof AuthorizationServer,
  options?: UseMTLSAliasOptions,
) {
  if (typeof value !== 'string') {
    if (options?.[useMtlsAlias]) {
      throw new TypeError(`"as.mtls_endpoint_aliases.${endpoint}" must be a string`)
    }

    throw new TypeError(`"as.${endpoint}" must be a string`)
  }

  return new URL(value)
}

function resolveEndpoint(
  as: AuthorizationServer,
  endpoint: keyof AuthorizationServer,
  options?: UseMTLSAliasOptions,
) {
  if (options?.[useMtlsAlias] && as.mtls_endpoint_aliases && endpoint in as.mtls_endpoint_aliases) {
    return validateEndpoint(as.mtls_endpoint_aliases[endpoint], endpoint, options)
  }

  return validateEndpoint(as[endpoint], endpoint)
}

/**
 * Performs a Pushed Authorization Request at the
 * {@link AuthorizationServer.pushed_authorization_request_endpoint `as.pushed_authorization_request_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Authorization Request parameters.
 *
 * @group Pushed Authorization Requests (PAR)
 *
 * @see [RFC 9126 - OAuth 2.0 Pushed Authorization Requests (PAR)](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-with-pushed-authorizat)
 */
export async function pushedAuthorizationRequest(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: PushedAuthorizationRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  const url = resolveEndpoint(as, 'pushed_authorization_request_endpoint', options)

  const body = new URLSearchParams(parameters)
  body.set('client_id', client.client_id)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  if (options?.DPoP !== undefined) {
    await dpopProofJwt(headers, options.DPoP, url, 'POST', getClockSkew(client))
  }

  return authenticatedRequest(as, client, 'POST', url, body, headers, options)
}

export interface PushedAuthorizationResponse {
  readonly request_uri: string
  readonly expires_in: number

  readonly [parameter: string]: JsonValue | undefined
}

export interface OAuth2Error {
  readonly error: string
  readonly error_description?: string
  readonly error_uri?: string
  readonly algs?: string
  readonly scope?: string

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * A helper function used to determine if a response processing function returned an OAuth2Error.
 *
 * @group Utilities
 * @group Client Credentials Grant
 * @group Device Authorization Grant
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group Token Introspection
 * @group Token Revocation
 * @group Refreshing an Access Token
 * @group Pushed Authorization Requests (PAR)
 */
export function isOAuth2Error(
  input?:
    | TokenEndpointResponse
    | OAuth2TokenEndpointResponse
    | OpenIDTokenEndpointResponse
    | ClientCredentialsGrantResponse
    | DeviceAuthorizationResponse
    | IntrospectionResponse
    | OAuth2Error
    | PushedAuthorizationResponse
    | URLSearchParams
    | UserInfoResponse,
): input is OAuth2Error {
  const value = <unknown>input
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    return false
  }

  // @ts-expect-error
  return value.error !== undefined
}

export interface WWWAuthenticateChallengeParameters {
  readonly realm?: string
  readonly error?: string
  readonly error_description?: string
  readonly error_uri?: string
  readonly algs?: string
  readonly scope?: string

  /**
   * NOTE: because the parameter names are case insensitive they are always returned lowercased
   */
  readonly [parameter: Lowercase<string>]: string | undefined
}

export interface WWWAuthenticateChallenge {
  /**
   * NOTE: because the value is case insensitive it is always returned lowercased
   */
  readonly scheme: Lowercase<string>
  readonly parameters: WWWAuthenticateChallengeParameters
}

function unquote(value: string) {
  if (value.length >= 2 && value[0] === '"' && value[value.length - 1] === '"') {
    return value.slice(1, -1)
  }

  return value
}

const SPLIT_REGEXP = /((?:,|, )?[0-9a-zA-Z!#$%&'*+-.^_`|~]+=)/
const SCHEMES_REGEXP = /(?:^|, ?)([0-9a-zA-Z!#$%&'*+\-.^_`|~]+)(?=$|[ ,])/g

function wwwAuth(scheme: string, params: string): WWWAuthenticateChallenge {
  const arr = params.split(SPLIT_REGEXP).slice(1)
  if (!arr.length) {
    return { scheme: <Lowercase<string>>scheme.toLowerCase(), parameters: {} }
  }
  arr[arr.length - 1] = arr[arr.length - 1].replace(/,$/, '')
  const parameters: WWWAuthenticateChallenge['parameters'] = {}
  for (let i = 1; i < arr.length; i += 2) {
    const idx = i
    if (arr[idx][0] === '"') {
      while (arr[idx].slice(-1) !== '"' && ++i < arr.length) {
        arr[idx] += arr[i]
      }
    }
    const key = <Lowercase<string>>arr[idx - 1].replace(/^(?:, ?)|=$/g, '').toLowerCase()
    // @ts-expect-error
    parameters[key] = unquote(arr[idx])
  }

  return {
    scheme: <Lowercase<string>>scheme.toLowerCase(),
    parameters,
  }
}

/**
 * Parses the `WWW-Authenticate` HTTP Header from a Response instance.
 *
 * @returns Array of {@link WWWAuthenticateChallenge} objects. Their order from the response is
 *   preserved. `undefined` when there wasn't a `WWW-Authenticate` HTTP Header returned.
 *
 * @group Accessing Protected Resources
 * @group Utilities
 * @group Client Credentials Grant
 * @group Device Authorization Grant
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group Token Introspection
 * @group Token Revocation
 * @group Refreshing an Access Token
 * @group Pushed Authorization Requests (PAR)
 */
export function parseWwwAuthenticateChallenges(
  response: Response,
): WWWAuthenticateChallenge[] | undefined {
  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  const header = response.headers.get('www-authenticate')
  if (header === null) {
    return undefined
  }

  const result: [string, number][] = []
  for (const { 1: scheme, index } of header.matchAll(SCHEMES_REGEXP)) {
    result.push([scheme, index!])
  }

  if (!result.length) {
    return undefined
  }

  const challenges = result.map(([scheme, indexOf], i, others) => {
    const next = others[i + 1]
    let parameters: string
    if (next) {
      parameters = header.slice(indexOf, next[1])
    } else {
      parameters = header.slice(indexOf)
    }
    return wwwAuth(scheme, parameters)
  })

  return challenges
}

/**
 * Validates Response instance to be one coming from the
 * {@link AuthorizationServer.pushed_authorization_request_endpoint `as.pushed_authorization_request_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link pushedAuthorizationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Pushed Authorization Requests (PAR)
 *
 * @see [RFC 9126 - OAuth 2.0 Pushed Authorization Requests (PAR)](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)
 */
export async function processPushedAuthorizationResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<PushedAuthorizationResponse | OAuth2Error> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 201) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Pushed Authorization Request Endpoint response')
  }

  assertReadableResponse(response)
  let json: JsonValue
  try {
    json = await response.json()
  } catch (cause) {
    throw new OPE('failed to parse "response" body as JSON', { cause })
  }

  if (!isJsonObject<PushedAuthorizationResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (!validateString(json.request_uri)) {
    throw new OPE('"response" body "request_uri" property must be a non-empty string')
  }

  if (typeof json.expires_in !== 'number' || json.expires_in <= 0) {
    throw new OPE('"response" body "expires_in" property must be a positive number')
  }

  return json
}

export interface ProtectedResourceRequestOptions
  extends Omit<HttpRequestOptions, 'headers'>,
    DPoPRequestOptions {
  /**
   * Use to adjust the client's assumed current time. Positive and negative finite values
   * representing seconds are allowed. Default is `0` (Date.now() + 0 seconds is used).
   *
   * This option only affects the request if the {@link ProtectedResourceRequestOptions.DPoP DPoP}
   * option is also used.
   */
  [clockSkew]?: number
}

/**
 * Performs a protected resource request at an arbitrary URL.
 *
 * Authorization Header is used to transmit the Access Token value.
 *
 * @param accessToken The Access Token for the request.
 * @param method The HTTP method for the request.
 * @param url Target URL for the request.
 * @param headers Headers for the request.
 * @param body Request body compatible with the Fetch API and the request's method.
 *
 * @group Accessing Protected Resources
 *
 * @see [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-protected-resource-access)
 */
export async function protectedResourceRequest(
  accessToken: string,
  method: string,
  url: URL,
  headers?: Headers,
  body?:
    | ReadableStream
    | Blob
    | ArrayBufferView
    | ArrayBuffer
    | FormData
    | URLSearchParams
    | string
    | null,
  options?: ProtectedResourceRequestOptions,
): Promise<Response> {
  if (!validateString(accessToken)) {
    throw new TypeError('"accessToken" must be a non-empty string')
  }

  if (!(url instanceof URL)) {
    throw new TypeError('"url" must be an instance of URL')
  }

  headers = prepareHeaders(headers)

  if (options?.DPoP === undefined) {
    headers.set('authorization', `Bearer ${accessToken}`)
  } else {
    await dpopProofJwt(
      headers,
      options.DPoP,
      url,
      'GET',
      getClockSkew({ [clockSkew]: options?.[clockSkew] }),
      accessToken,
    )
    headers.set('authorization', `DPoP ${accessToken}`)
  }

  return (options?.[customFetch] || fetch)(url.href, {
    body,
    headers: Object.fromEntries(headers.entries()),
    method,
    redirect: 'manual',
    signal: options?.signal ? signal(options.signal) : null,
  }).then(processDpopNonce)
}

export interface UserInfoRequestOptions
  extends HttpRequestOptions,
    DPoPRequestOptions,
    UseMTLSAliasOptions {}

/**
 * Performs a UserInfo Request at the
 * {@link AuthorizationServer.userinfo_endpoint `as.userinfo_endpoint`}.
 *
 * Authorization Header is used to transmit the Access Token value.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param accessToken Access Token value.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group OpenID Connect (OIDC) UserInfo
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-protected-resource-access)
 */
export async function userInfoRequest(
  as: AuthorizationServer,
  client: Client,
  accessToken: string,
  options?: UserInfoRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  const url = resolveEndpoint(as, 'userinfo_endpoint', options)

  const headers = prepareHeaders(options?.headers)
  if (client.userinfo_signed_response_alg) {
    headers.set('accept', 'application/jwt')
  } else {
    headers.set('accept', 'application/json')
    headers.append('accept', 'application/jwt')
  }

  return protectedResourceRequest(accessToken, 'GET', url, headers, null, {
    ...options,
    [clockSkew]: getClockSkew(client),
  })
}

export interface UserInfoAddress {
  readonly formatted?: string
  readonly street_address?: string
  readonly locality?: string
  readonly region?: string
  readonly postal_code?: string
  readonly country?: string

  readonly [claim: string]: JsonValue | undefined
}

export interface UserInfoResponse {
  readonly sub: string
  readonly name?: string
  readonly given_name?: string
  readonly family_name?: string
  readonly middle_name?: string
  readonly nickname?: string
  readonly preferred_username?: string
  readonly profile?: string
  readonly picture?: string
  readonly website?: string
  readonly email?: string
  readonly email_verified?: boolean
  readonly gender?: string
  readonly birthdate?: string
  readonly zoneinfo?: string
  readonly locale?: string
  readonly phone_number?: string
  readonly updated_at?: number
  readonly address?: UserInfoAddress

  readonly [claim: string]: JsonValue | undefined
}

let jwksCache: WeakMap<AuthorizationServer, JWKSCache>
interface JWKSCache {
  jwks: JsonWebKeySet
  iat: number
  age: number
}

async function getPublicSigKeyFromIssuerJwksUri(
  as: AuthorizationServer,
  options: HttpRequestOptions | undefined,
  header: CompactJWSHeaderParameters,
): Promise<CryptoKey> {
  const { alg, kid } = header
  checkSupportedJwsAlg(alg)

  let jwks: JsonWebKeySet
  let age: number
  jwksCache ||= new WeakMap()
  if (jwksCache.has(as)) {
    ;({ jwks, age } = jwksCache.get(as)!)
    if (age >= 300) {
      // force a re-fetch every 5 minutes
      jwksCache.delete(as)
      return getPublicSigKeyFromIssuerJwksUri(as, options, header)
    }
  } else {
    jwks = await jwksRequest(as, options).then(processJwksResponse)
    age = 0
    jwksCache.set(as, {
      jwks,
      iat: epochTime(),
      get age() {
        return epochTime() - this.iat
      },
    })
  }

  let kty: string
  switch (alg.slice(0, 2)) {
    case 'RS': // Fall through
    case 'PS':
      kty = 'RSA'
      break
    case 'ES':
      kty = 'EC'
      break
    case 'Ed':
      kty = 'OKP'
      break
    default:
      throw new UnsupportedOperationError()
  }

  const candidates = jwks.keys.filter((jwk) => {
    // filter keys based on the mapping of signature algorithms to Key Type
    if (jwk.kty !== kty) {
      return false
    }

    // filter keys based on the JWK Key ID in the header
    if (kid !== undefined && kid !== jwk.kid) {
      return false
    }

    // filter keys based on the key's declared Algorithm
    if (jwk.alg !== undefined && alg !== jwk.alg) {
      return false
    }

    // filter keys based on the key's declared Public Key Use
    if (jwk.use !== undefined && jwk.use !== 'sig') {
      return false
    }

    // filter keys based on the key's declared Key Operations
    if (jwk.key_ops?.includes('verify') === false) {
      return false
    }

    // filter keys based on alg-specific key requirements
    switch (true) {
      case alg === 'ES256' && jwk.crv !== 'P-256': // Fall through
      case alg === 'ES384' && jwk.crv !== 'P-384': // Fall through
      case alg === 'ES512' && jwk.crv !== 'P-521': // Fall through
      case alg === 'EdDSA' && !(jwk.crv === 'Ed25519' || jwk.crv === 'Ed448'):
        return false
    }

    return true
  })

  const { 0: jwk, length } = candidates

  if (!length) {
    if (age >= 60) {
      // allow re-fetch if cache is at least 1 minute old
      jwksCache.delete(as)
      return getPublicSigKeyFromIssuerJwksUri(as, options, header)
    }
    throw new OPE('error when selecting a JWT verification key, no applicable keys found')
  }

  if (length !== 1) {
    throw new OPE(
      'error when selecting a JWT verification key, multiple applicable keys found, a "kid" JWT Header Parameter is required',
    )
  }

  const key = await importJwk(alg, jwk)
  if (key.type !== 'public') {
    throw new OPE('jwks_uri must only contain public keys')
  }

  return key
}

/**
 * DANGER ZONE
 *
 * Use this as a value to {@link processUserInfoResponse} `expectedSubject` parameter to skip the
 * `sub` claim value check.
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse)
 */
export const skipSubjectCheck = Symbol()

function getContentType(response: Response) {
  return response.headers.get('content-type')?.split(';')[0]
}

/**
 * Validates Response instance to be one coming from the
 * {@link AuthorizationServer.userinfo_endpoint `as.userinfo_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param expectedSubject Expected `sub` claim value. In response to OpenID Connect authentication
 *   requests, the expected subject is the one from the ID Token claims retrieved from
 *   {@link getValidatedIdTokenClaims}.
 * @param response Resolved value from {@link userInfoRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group OpenID Connect (OIDC) UserInfo
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
 */
export async function processUserInfoResponse(
  as: AuthorizationServer,
  client: Client,
  expectedSubject: string | typeof skipSubjectCheck,
  response: Response,
): Promise<UserInfoResponse> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    throw new OPE('"response" is not a conform UserInfo Endpoint response')
  }

  let json: JsonValue
  if (getContentType(response) === 'application/jwt') {
    assertReadableResponse(response)
    const { claims } = await validateJwt(
      await response.text(),
      checkSigningAlgorithm.bind(
        undefined,
        client.userinfo_signed_response_alg,
        as.userinfo_signing_alg_values_supported,
      ),
      noSignatureCheck,
      getClockSkew(client),
      getClockTolerance(client),
    )
      .then(validateOptionalAudience.bind(undefined, client.client_id))
      .then(validateOptionalIssuer.bind(undefined, as.issuer))

    json = <JsonValue>claims
  } else {
    if (client.userinfo_signed_response_alg) {
      throw new OPE('JWT UserInfo Response expected')
    }

    assertReadableResponse(response)
    try {
      json = await response.json()
    } catch (cause) {
      throw new OPE('failed to parse "response" body as JSON', { cause })
    }
  }

  if (!isJsonObject<UserInfoResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (!validateString(json.sub)) {
    throw new OPE('"response" body "sub" property must be a non-empty string')
  }

  switch (expectedSubject) {
    case skipSubjectCheck:
      break
    default:
      if (!validateString(expectedSubject)) {
        throw new OPE('"expectedSubject" must be a non-empty string')
      }
      if (json.sub !== expectedSubject) {
        throw new OPE('unexpected "response" body "sub" value')
      }
  }

  return json
}

async function authenticatedRequest(
  as: AuthorizationServer,
  client: Client,
  method: string,
  url: URL,
  body: URLSearchParams,
  headers: Headers,
  options?: Omit<HttpRequestOptions, 'headers'> & AuthenticatedRequestOptions,
) {
  await clientAuthentication(as, client, body, headers, options?.clientPrivateKey)
  headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')

  return (options?.[customFetch] || fetch)(url.href, {
    body,
    headers: Object.fromEntries(headers.entries()),
    method,
    redirect: 'manual',
    signal: options?.signal ? signal(options.signal) : null,
  }).then(processDpopNonce)
}

export interface TokenEndpointRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions,
    DPoPRequestOptions {
  /**
   * Any additional parameters to send. This cannot override existing parameter values.
   */
  additionalParameters?: URLSearchParams | Record<string, string> | string[][]
}

async function tokenEndpointRequest(
  as: AuthorizationServer,
  client: Client,
  grantType: string,
  parameters: URLSearchParams,
  options?: Omit<TokenEndpointRequestOptions, 'additionalParameters'>,
): Promise<Response> {
  const url = resolveEndpoint(as, 'token_endpoint', options)

  parameters.set('grant_type', grantType)
  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  if (options?.DPoP !== undefined) {
    await dpopProofJwt(headers, options.DPoP, url, 'POST', getClockSkew(client))
  }

  return authenticatedRequest(as, client, 'POST', url, parameters, headers, options)
}

/**
 * Performs a Refresh Token Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param refreshToken Refresh Token value.
 *
 * @group Refreshing an Access Token
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-6)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function refreshTokenGrantRequest(
  as: AuthorizationServer,
  client: Client,
  refreshToken: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  if (!validateString(refreshToken)) {
    throw new TypeError('"refreshToken" must be a non-empty string')
  }

  const parameters = new URLSearchParams(options?.additionalParameters)
  parameters.set('refresh_token', refreshToken)
  return tokenEndpointRequest(as, client, 'refresh_token', parameters, options)
}

const idTokenClaims = new WeakMap<TokenEndpointResponse, IDToken>()

/**
 * Returns ID Token claims validated during {@link processAuthorizationCodeOpenIDResponse}.
 *
 * @param ref Value previously resolved from {@link processAuthorizationCodeOpenIDResponse}.
 *
 * @returns JWT Claims Set from an ID Token.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 */
export function getValidatedIdTokenClaims(ref: OpenIDTokenEndpointResponse): IDToken

/**
 * Returns ID Token claims validated during {@link processRefreshTokenResponse} or
 * {@link processDeviceCodeResponse}.
 *
 * @param ref Value previously resolved from {@link processRefreshTokenResponse} or
 *   {@link processDeviceCodeResponse}.
 *
 * @returns JWT Claims Set from an ID Token, or undefined if there is no ID Token in `ref`.
 */
export function getValidatedIdTokenClaims(ref: TokenEndpointResponse): IDToken | undefined
export function getValidatedIdTokenClaims(
  ref: OpenIDTokenEndpointResponse | TokenEndpointResponse,
): IDToken | undefined {
  if (!ref.id_token) {
    return undefined
  }

  const claims = idTokenClaims.get(ref)
  if (!claims) {
    throw new TypeError(
      '"ref" was already garbage collected or did not resolve from the proper sources',
    )
  }

  return claims
}

async function processGenericAccessTokenResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  ignoreIdToken = false,
  ignoreRefreshToken = false,
): Promise<TokenEndpointResponse | OAuth2Error> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Token Endpoint response')
  }

  assertReadableResponse(response)
  let json: JsonValue
  try {
    json = await response.json()
  } catch (cause) {
    throw new OPE('failed to parse "response" body as JSON', { cause })
  }

  if (!isJsonObject<TokenEndpointResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (!validateString(json.access_token)) {
    throw new OPE('"response" body "access_token" property must be a non-empty string')
  }

  if (!validateString(json.token_type)) {
    throw new OPE('"response" body "token_type" property must be a non-empty string')
  }

  // @ts-expect-error
  json.token_type = json.token_type.toLowerCase()

  if (json.token_type !== 'dpop' && json.token_type !== 'bearer') {
    throw new UnsupportedOperationError('unsupported `token_type` value')
  }

  if (
    json.expires_in !== undefined &&
    (typeof json.expires_in !== 'number' || json.expires_in <= 0)
  ) {
    throw new OPE('"response" body "expires_in" property must be a positive number')
  }

  if (
    !ignoreRefreshToken &&
    json.refresh_token !== undefined &&
    !validateString(json.refresh_token)
  ) {
    throw new OPE('"response" body "refresh_token" property must be a non-empty string')
  }

  if (json.scope !== undefined && typeof json.scope !== 'string') {
    throw new OPE('"response" body "scope" property must be a string')
  }

  if (!ignoreIdToken) {
    if (json.id_token !== undefined && !validateString(json.id_token)) {
      throw new OPE('"response" body "id_token" property must be a non-empty string')
    }

    if (json.id_token) {
      const { claims } = await validateJwt(
        json.id_token,
        checkSigningAlgorithm.bind(
          undefined,
          client.id_token_signed_response_alg,
          as.id_token_signing_alg_values_supported,
        ),
        noSignatureCheck,
        getClockSkew(client),
        getClockTolerance(client),
      )
        .then(validatePresence.bind(undefined, ['aud', 'exp', 'iat', 'iss', 'sub']))
        .then(validateIssuer.bind(undefined, as.issuer))
        .then(validateAudience.bind(undefined, client.client_id))

      if (Array.isArray(claims.aud) && claims.aud.length !== 1 && claims.azp !== client.client_id) {
        throw new OPE('unexpected ID Token "azp" (authorized party) claim value')
      }

      if (client.require_auth_time && typeof claims.auth_time !== 'number') {
        throw new OPE('unexpected ID Token "auth_time" (authentication time) claim value')
      }

      idTokenClaims.set(json, <IDToken>claims)
    }
  }

  return json
}

/**
 * Validates Refresh Token Grant Response instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link refreshTokenGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Refreshing an Access Token
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-6)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens)
 */
export async function processRefreshTokenResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<TokenEndpointResponse | OAuth2Error> {
  return processGenericAccessTokenResponse(as, client, response)
}

function validateOptionalAudience(
  expected: string,
  result: Awaited<ReturnType<typeof validateJwt>>,
) {
  if (result.claims.aud !== undefined) {
    return validateAudience(expected, result)
  }
  return result
}

function validateAudience(expected: string, result: Awaited<ReturnType<typeof validateJwt>>) {
  if (Array.isArray(result.claims.aud)) {
    if (!result.claims.aud.includes(expected)) {
      throw new OPE('unexpected JWT "aud" (audience) claim value')
    }
  } else if (result.claims.aud !== expected) {
    throw new OPE('unexpected JWT "aud" (audience) claim value')
  }

  return result
}

function validateOptionalIssuer(expected: string, result: Awaited<ReturnType<typeof validateJwt>>) {
  if (result.claims.iss !== undefined) {
    return validateIssuer(expected, result)
  }
  return result
}

function validateIssuer(expected: string, result: Awaited<ReturnType<typeof validateJwt>>) {
  if (result.claims.iss !== expected) {
    throw new OPE('unexpected JWT "iss" (issuer) claim value')
  }
  return result
}

const branded = new WeakSet<URLSearchParams>()
function brand(searchParams: URLSearchParams) {
  branded.add(searchParams)
  return searchParams
}

/**
 * Performs an Authorization Code grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param callbackParameters Parameters obtained from the callback to redirect_uri, this is returned
 *   from {@link validateAuthResponse}, or {@link validateJwtAuthResponse}.
 * @param redirectUri `redirect_uri` value used in the authorization request.
 * @param codeVerifier PKCE `code_verifier` to send to the token endpoint.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)
 * @see [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function authorizationCodeGrantRequest(
  as: AuthorizationServer,
  client: Client,
  callbackParameters: URLSearchParams,
  redirectUri: string,
  codeVerifier: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  if (!branded.has(callbackParameters)) {
    throw new TypeError(
      '"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()',
    )
  }

  if (!validateString(redirectUri)) {
    throw new TypeError('"redirectUri" must be a non-empty string')
  }

  if (!validateString(codeVerifier)) {
    throw new TypeError('"codeVerifier" must be a non-empty string')
  }

  const code = getURLSearchParameter(callbackParameters, 'code')
  if (!code) {
    throw new OPE('no authorization code in "callbackParameters"')
  }

  const parameters = new URLSearchParams(options?.additionalParameters)
  parameters.set('redirect_uri', redirectUri)
  parameters.set('code_verifier', codeVerifier)
  parameters.set('code', code)

  return tokenEndpointRequest(as, client, 'authorization_code', parameters, options)
}

interface JWTPayload {
  readonly iss?: string
  readonly sub?: string
  readonly aud?: string | string[]
  readonly jti?: string
  readonly nbf?: number
  readonly exp?: number
  readonly iat?: number
  readonly cnf?: ConfirmationClaims

  readonly [claim: string]: JsonValue | undefined
}

export interface IDToken extends JWTPayload {
  readonly iss: string
  readonly sub: string
  readonly aud: string | string[]
  readonly iat: number
  readonly exp: number
  readonly nonce?: string
  readonly auth_time?: number
  readonly azp?: string

  readonly [claim: string]: JsonValue | undefined
}

interface CompactJWSHeaderParameters {
  alg: JWSAlgorithm
  kid?: string
  typ?: string
  crit?: string[]
  jwk?: JWK
}

interface ParsedJWT {
  header: CompactJWSHeaderParameters
  claims: JWTPayload
  signature: Uint8Array
}

const jwtClaimNames = {
  aud: 'audience',
  c_hash: 'code hash',
  client_id: 'client id',
  exp: 'expiration time',
  iat: 'issued at',
  iss: 'issuer',
  jti: 'jwt id',
  nonce: 'nonce',
  s_hash: 'state hash',
  sub: 'subject',
  ath: 'access token hash',
  htm: 'http method',
  htu: 'http uri',
  cnf: 'confirmation',
}

function validatePresence(
  required: (keyof typeof jwtClaimNames)[],
  result: Awaited<ReturnType<typeof validateJwt>>,
) {
  for (const claim of required) {
    if (result.claims[claim] === undefined) {
      throw new OPE(`JWT "${claim}" (${jwtClaimNames[claim]}) claim missing`)
    }
  }
  return result
}

export interface AuthorizationDetails {
  readonly type: string
  readonly locations?: string[]
  readonly actions?: string[]
  readonly datatypes?: string[]
  readonly privileges?: string[]
  readonly identifier?: string

  readonly [parameter: string]: JsonValue | undefined
}

export interface TokenEndpointResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly id_token?: string
  readonly refresh_token?: string
  readonly scope?: string
  readonly authorization_details?: AuthorizationDetails[]
  /**
   * NOTE: because the value is case insensitive it is always returned lowercased
   */
  readonly token_type: 'bearer' | 'dpop' | Lowercase<string>

  readonly [parameter: string]: JsonValue | undefined
}

export interface OpenIDTokenEndpointResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly id_token: string
  readonly refresh_token?: string
  readonly scope?: string
  readonly authorization_details?: AuthorizationDetails[]
  /**
   * NOTE: because the value is case insensitive it is always returned lowercased
   */
  readonly token_type: 'bearer' | 'dpop' | Lowercase<string>

  readonly [parameter: string]: JsonValue | undefined
}

export interface OAuth2TokenEndpointResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly id_token?: undefined
  readonly refresh_token?: string
  readonly scope?: string
  readonly authorization_details?: AuthorizationDetails[]
  /**
   * NOTE: because the value is case insensitive it is always returned lowercased
   */
  readonly token_type: 'bearer' | 'dpop' | Lowercase<string>

  readonly [parameter: string]: JsonValue | undefined
}

export interface ClientCredentialsGrantResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly scope?: string
  readonly authorization_details?: AuthorizationDetails[]
  /**
   * NOTE: because the value is case insensitive it is always returned lowercased
   */
  readonly token_type: 'bearer' | 'dpop' | Lowercase<string>

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * Use this as a value to {@link processAuthorizationCodeOpenIDResponse} `expectedNonce` parameter to
 * indicate no `nonce` ID Token claim value is expected, i.e. no `nonce` parameter value was sent
 * with the authorization request.
 */
export const expectNoNonce = Symbol()

/**
 * Use this as a value to {@link processAuthorizationCodeOpenIDResponse} `maxAge` parameter to
 * indicate no `auth_time` ID Token claim value check should be performed.
 */
export const skipAuthTimeCheck = Symbol()

/**
 * (OpenID Connect only) Validates Authorization Code Grant Response instance to be one coming from
 * the {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link authorizationCodeGrantRequest}.
 * @param expectedNonce Expected ID Token `nonce` claim value. Default is {@link expectNoNonce}.
 * @param maxAge ID Token {@link IDToken.auth_time `auth_time`} claim value will be checked to be
 *   present and conform to the `maxAge` value. Use of this option is required if you sent a
 *   `max_age` parameter in an authorization request. Default is
 *   {@link Client.default_max_age `client.default_max_age`} and falls back to
 *   {@link skipAuthTimeCheck}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)
 */
export async function processAuthorizationCodeOpenIDResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  expectedNonce?: string | typeof expectNoNonce,
  maxAge?: number | typeof skipAuthTimeCheck,
): Promise<OpenIDTokenEndpointResponse | OAuth2Error> {
  const result = await processGenericAccessTokenResponse(as, client, response)

  if (isOAuth2Error(result)) {
    return result
  }

  if (!validateString(result.id_token)) {
    throw new OPE('"response" body "id_token" property must be a non-empty string')
  }

  maxAge ??= client.default_max_age ?? skipAuthTimeCheck
  const claims = getValidatedIdTokenClaims(result)!
  if (
    (client.require_auth_time || maxAge !== skipAuthTimeCheck) &&
    claims.auth_time === undefined
  ) {
    throw new OPE('ID Token "auth_time" (authentication time) claim missing')
  }

  if (maxAge !== skipAuthTimeCheck) {
    if (typeof maxAge !== 'number' || maxAge < 0) {
      throw new TypeError('"options.max_age" must be a non-negative number')
    }

    const now = epochTime() + getClockSkew(client)
    const tolerance = getClockTolerance(client)
    if (claims.auth_time! + maxAge < now - tolerance) {
      throw new OPE('too much time has elapsed since the last End-User authentication')
    }
  }

  switch (expectedNonce) {
    case undefined:
    case expectNoNonce:
      if (claims.nonce !== undefined) {
        throw new OPE('unexpected ID Token "nonce" claim value')
      }
      break
    default:
      if (!validateString(expectedNonce)) {
        throw new TypeError('"expectedNonce" must be a non-empty string')
      }
      if (claims.nonce === undefined) {
        throw new OPE('ID Token "nonce" claim missing')
      }
      if (claims.nonce !== expectedNonce) {
        throw new OPE('unexpected ID Token "nonce" claim value')
      }
  }

  return <OpenIDTokenEndpointResponse>result
}

/**
 * (OAuth 2.0 without OpenID Connect only) Validates Authorization Code Grant Response instance to
 * be one coming from the {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link authorizationCodeGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Authorization Code Grant
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 */
export async function processAuthorizationCodeOAuth2Response(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<OAuth2TokenEndpointResponse | OAuth2Error> {
  const result = await processGenericAccessTokenResponse(as, client, response, true)

  if (isOAuth2Error(result)) {
    return result
  }

  if (result.id_token !== undefined) {
    if (typeof result.id_token === 'string' && result.id_token.length) {
      throw new OPE(
        'Unexpected ID Token returned, use processAuthorizationCodeOpenIDResponse() for OpenID Connect callback processing',
      )
    }
    // @ts-expect-error
    delete result.id_token
  }

  return <OAuth2TokenEndpointResponse>result
}

function checkJwtType(expected: string, result: Awaited<ReturnType<typeof validateJwt>>) {
  if (typeof result.header.typ !== 'string' || normalizeTyp(result.header.typ) !== expected) {
    throw new OPE('unexpected JWT "typ" header parameter value')
  }

  return result
}

export interface ClientCredentialsGrantRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions,
    DPoPRequestOptions {}

/**
 * Performs a Client Credentials Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 *
 * @group Client Credentials Grant
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function clientCredentialsGrantRequest(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: ClientCredentialsGrantRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  return tokenEndpointRequest(
    as,
    client,
    'client_credentials',
    new URLSearchParams(parameters),
    options,
  )
}

/**
 * Validates Client Credentials Grant Response instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link clientCredentialsGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Client Credentials Grant
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)
 */
export async function processClientCredentialsResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<ClientCredentialsGrantResponse | OAuth2Error> {
  const result = await processGenericAccessTokenResponse(as, client, response, true, true)

  if (isOAuth2Error(result)) {
    return result
  }

  return <ClientCredentialsGrantResponse>result
}

export interface RevocationRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions {
  /**
   * Any additional parameters to send. This cannot override existing parameter values.
   */
  additionalParameters?: URLSearchParams | Record<string, string> | string[][]
}

/**
 * Performs a Revocation Request at the
 * {@link AuthorizationServer.revocation_endpoint `as.revocation_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param token Token to revoke. You can provide the `token_type_hint` parameter via
 *   {@link RevocationRequestOptions.additionalParameters options}.
 *
 * @group Token Revocation
 *
 * @see [RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
 */
export async function revocationRequest(
  as: AuthorizationServer,
  client: Client,
  token: string,
  options?: RevocationRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  if (!validateString(token)) {
    throw new TypeError('"token" must be a non-empty string')
  }

  const url = resolveEndpoint(as, 'revocation_endpoint', options)

  const body = new URLSearchParams(options?.additionalParameters)
  body.set('token', token)

  const headers = prepareHeaders(options?.headers)
  headers.delete('accept')

  return authenticatedRequest(as, client, 'POST', url, body, headers, options)
}

/**
 * Validates Response instance to be one coming from the
 * {@link AuthorizationServer.revocation_endpoint `as.revocation_endpoint`}.
 *
 * @param response Resolved value from {@link revocationRequest}.
 *
 * @returns Resolves with `undefined` when the request was successful, or an object representing an
 *   OAuth 2.0 protocol style error.
 *
 * @group Token Revocation
 *
 * @see [RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
 */
export async function processRevocationResponse(
  response: Response,
): Promise<undefined | OAuth2Error> {
  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Revocation Endpoint response')
  }

  return undefined
}

export interface IntrospectionRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions {
  /**
   * Any additional parameters to send. This cannot override existing parameter values.
   */
  additionalParameters?: URLSearchParams | Record<string, string> | string[][]
  /**
   * Request a JWT Response from the
   * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}. Default is
   *
   * - True when
   *   {@link Client.introspection_signed_response_alg `client.introspection_signed_response_alg`} is
   *   set
   * - False otherwise
   */
  requestJwtResponse?: boolean
}

function assertReadableResponse(response: Response) {
  if (response.bodyUsed) {
    throw new TypeError('"response" body has been used already')
  }
}

/**
 * Performs an Introspection Request at the
 * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param token Token to introspect. You can provide the `token_type_hint` parameter via
 *   {@link IntrospectionRequestOptions.additionalParameters options}.
 *
 * @group Token Introspection
 *
 * @see [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 * @see [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-4)
 */
export async function introspectionRequest(
  as: AuthorizationServer,
  client: Client,
  token: string,
  options?: IntrospectionRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  if (!validateString(token)) {
    throw new TypeError('"token" must be a non-empty string')
  }

  const url = resolveEndpoint(as, 'introspection_endpoint', options)

  const body = new URLSearchParams(options?.additionalParameters)
  body.set('token', token)
  const headers = prepareHeaders(options?.headers)
  if (options?.requestJwtResponse ?? client.introspection_signed_response_alg) {
    headers.set('accept', 'application/token-introspection+jwt')
  } else {
    headers.set('accept', 'application/json')
  }

  return authenticatedRequest(as, client, 'POST', url, body, headers, options)
}

export interface ConfirmationClaims {
  readonly 'x5t#S256'?: string
  readonly jkt?: string

  readonly [claim: string]: JsonValue | undefined
}

export interface IntrospectionResponse {
  readonly active: boolean
  readonly client_id?: string
  readonly exp?: number
  readonly iat?: number
  readonly sid?: string
  readonly iss?: string
  readonly jti?: string
  readonly username?: string
  readonly aud?: string | string[]
  readonly scope?: string
  readonly sub?: string
  readonly nbf?: number
  readonly token_type?: string
  readonly cnf?: ConfirmationClaims
  readonly authorization_details?: AuthorizationDetails[]

  readonly [claim: string]: JsonValue | undefined
}

/**
 * Validates Response instance to be one coming from the
 * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link introspectionRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Token Introspection
 *
 * @see [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 * @see [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-5)
 */
export async function processIntrospectionResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<IntrospectionResponse | OAuth2Error> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Introspection Endpoint response')
  }

  let json: JsonValue
  if (getContentType(response) === 'application/token-introspection+jwt') {
    assertReadableResponse(response)
    const { claims } = await validateJwt(
      await response.text(),
      checkSigningAlgorithm.bind(
        undefined,
        client.introspection_signed_response_alg,
        as.introspection_signing_alg_values_supported,
      ),
      noSignatureCheck,
      getClockSkew(client),
      getClockTolerance(client),
    )
      .then(checkJwtType.bind(undefined, 'token-introspection+jwt'))
      .then(validatePresence.bind(undefined, ['aud', 'iat', 'iss']))
      .then(validateIssuer.bind(undefined, as.issuer))
      .then(validateAudience.bind(undefined, client.client_id))

    json = <JsonValue>claims.token_introspection
    if (!isJsonObject(json)) {
      throw new OPE('JWT "token_introspection" claim must be a JSON object')
    }
  } else {
    assertReadableResponse(response)
    try {
      json = await response.json()
    } catch (cause) {
      throw new OPE('failed to parse "response" body as JSON', { cause })
    }
    if (!isJsonObject(json)) {
      throw new OPE('"response" body must be a top level object')
    }
  }

  if (typeof json.active !== 'boolean') {
    throw new OPE('"response" body "active" property must be a boolean')
  }

  return <IntrospectionResponse>json
}

async function jwksRequest(
  as: AuthorizationServer,
  options?: HttpRequestOptions,
): Promise<Response> {
  assertAs(as)

  const url = resolveEndpoint(as, 'jwks_uri')

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')
  headers.append('accept', 'application/jwk-set+json')

  return (options?.[customFetch] || fetch)(url.href, {
    headers: Object.fromEntries(headers.entries()),
    method: 'GET',
    redirect: 'manual',
    signal: options?.signal ? signal(options.signal) : null,
  }).then(processDpopNonce)
}

interface JsonWebKeySet {
  readonly keys: JWK[]
}

async function processJwksResponse(response: Response): Promise<JsonWebKeySet> {
  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    throw new OPE('"response" is not a conform JSON Web Key Set response')
  }

  assertReadableResponse(response)
  let json: JsonValue
  try {
    json = await response.json()
  } catch (cause) {
    throw new OPE('failed to parse "response" body as JSON', { cause })
  }

  if (!isJsonObject<JsonWebKeySet>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (!Array.isArray(json.keys)) {
    throw new OPE('"response" body "keys" property must be an array')
  }

  if (!Array.prototype.every.call(json.keys, isJsonObject)) {
    throw new OPE('"response" body "keys" property members must be JWK formatted objects')
  }

  return json
}

async function handleOAuthBodyError(response: Response): Promise<OAuth2Error | undefined> {
  if (response.status > 399 && response.status < 500) {
    assertReadableResponse(response)
    try {
      const json: JsonValue = await response.json()
      if (isJsonObject(json) && typeof json.error === 'string' && json.error.length) {
        if (json.error_description !== undefined && typeof json.error_description !== 'string') {
          delete json.error_description
        }
        if (json.error_uri !== undefined && typeof json.error_uri !== 'string') {
          delete json.error_uri
        }
        if (json.algs !== undefined && typeof json.algs !== 'string') {
          delete json.algs
        }
        if (json.scope !== undefined && typeof json.scope !== 'string') {
          delete json.scope
        }
        return <OAuth2Error>json
      }
    } catch {}
  }
  return undefined
}

function checkSupportedJwsAlg(alg: unknown) {
  if (!SUPPORTED_JWS_ALGS.includes(<any>alg)) {
    throw new UnsupportedOperationError('unsupported JWS "alg" identifier')
  }
  return <JWSAlgorithm>alg
}

function checkRsaKeyAlgorithm(algorithm: RsaHashedKeyAlgorithm) {
  if (typeof algorithm.modulusLength !== 'number' || algorithm.modulusLength < 2048) {
    throw new OPE(`${algorithm.name} modulusLength must be at least 2048 bits`)
  }
}

function ecdsaHashName(namedCurve: string) {
  switch (namedCurve) {
    case 'P-256':
      return 'SHA-256'
    case 'P-384':
      return 'SHA-384'
    case 'P-521':
      return 'SHA-512'
    default:
      throw new UnsupportedOperationError()
  }
}

function keyToSubtle(key: CryptoKey): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
  switch (key.algorithm.name) {
    case 'ECDSA':
      return <EcdsaParams>{
        name: key.algorithm.name,
        hash: ecdsaHashName((<EcKeyAlgorithm>key.algorithm).namedCurve),
      }
    case 'RSA-PSS': {
      checkRsaKeyAlgorithm(<RsaHashedKeyAlgorithm>key.algorithm)
      switch ((<RsaHashedKeyAlgorithm>key.algorithm).hash.name) {
        case 'SHA-256': // Fall through
        case 'SHA-384': // Fall through
        case 'SHA-512':
          return <RsaPssParams>{
            name: key.algorithm.name,
            saltLength:
              parseInt((<RsaHashedKeyAlgorithm>key.algorithm).hash.name.slice(-3), 10) >> 3,
          }
        default:
          throw new UnsupportedOperationError()
      }
    }
    case 'RSASSA-PKCS1-v1_5':
      checkRsaKeyAlgorithm(<RsaHashedKeyAlgorithm>key.algorithm)
      return key.algorithm.name
    case 'Ed448': // Fall through
    case 'Ed25519':
      return key.algorithm.name
  }
  throw new UnsupportedOperationError()
}

const noSignatureCheck = Symbol()

/**
 * Minimal JWT validation implementation.
 */
async function validateJwt(
  jws: string,
  checkAlg: (h: CompactJWSHeaderParameters) => void,
  getKey: ((h: CompactJWSHeaderParameters) => Promise<CryptoKey>) | typeof noSignatureCheck,
  clockSkew: number,
  clockTolerance: number,
): Promise<ParsedJWT & { key?: CryptoKey }> {
  const { 0: protectedHeader, 1: payload, 2: encodedSignature, length } = jws.split('.')
  if (length === 5) {
    throw new UnsupportedOperationError('JWE structure JWTs are not supported')
  }
  if (length !== 3) {
    throw new OPE('Invalid JWT')
  }

  let header: JsonValue
  try {
    header = JSON.parse(buf(b64u(protectedHeader)))
  } catch (cause) {
    throw new OPE('failed to parse JWT Header body as base64url encoded JSON', { cause })
  }

  if (!isJsonObject<CompactJWSHeaderParameters>(header)) {
    throw new OPE('JWT Header must be a top level object')
  }

  checkAlg(header)
  if (header.crit !== undefined) {
    throw new OPE('unexpected JWT "crit" header parameter')
  }

  const signature = b64u(encodedSignature)
  let key!: CryptoKey
  if (getKey !== noSignatureCheck) {
    key = await getKey(header)
    const input = `${protectedHeader}.${payload}`
    const verified = await crypto.subtle.verify(keyToSubtle(key), key, signature, buf(input))
    if (!verified) {
      throw new OPE('JWT signature verification failed')
    }
  }

  let claims: JsonValue
  try {
    claims = JSON.parse(buf(b64u(payload)))
  } catch (cause) {
    throw new OPE('failed to parse JWT Payload body as base64url encoded JSON', { cause })
  }

  if (!isJsonObject<JWTPayload>(claims)) {
    throw new OPE('JWT Payload must be a top level object')
  }

  const now = epochTime() + clockSkew

  if (claims.exp !== undefined) {
    if (typeof claims.exp !== 'number') {
      throw new OPE('unexpected JWT "exp" (expiration time) claim type')
    }

    if (claims.exp <= now - clockTolerance) {
      throw new OPE('unexpected JWT "exp" (expiration time) claim value, timestamp is <= now()')
    }
  }

  if (claims.iat !== undefined) {
    if (typeof claims.iat !== 'number') {
      throw new OPE('unexpected JWT "iat" (issued at) claim type')
    }
  }

  if (claims.iss !== undefined) {
    if (typeof claims.iss !== 'string') {
      throw new OPE('unexpected JWT "iss" (issuer) claim type')
    }
  }

  if (claims.nbf !== undefined) {
    if (typeof claims.nbf !== 'number') {
      throw new OPE('unexpected JWT "nbf" (not before) claim type')
    }
    if (claims.nbf > now + clockTolerance) {
      throw new OPE('unexpected JWT "nbf" (not before) claim value, timestamp is > now()')
    }
  }

  if (claims.aud !== undefined) {
    if (typeof claims.aud !== 'string' && !Array.isArray(claims.aud)) {
      throw new OPE('unexpected JWT "aud" (audience) claim type')
    }
  }

  return { header, claims, signature, key }
}

/**
 * Same as {@link validateAuthResponse} but for signed JARM responses.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters JARM authorization response.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 *
 * @returns Validated Authorization Response parameters or Authorization Error Response.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)
 *
 * @see [JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)](https://openid.net/specs/openid-financial-api-jarm.html)
 */
export async function validateJwtAuthResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL,
  expectedState?: string | typeof expectNoState | typeof skipStateCheck,
  options?: HttpRequestOptions,
): Promise<URLSearchParams | OAuth2Error> {
  assertAs(as)
  assertClient(client)

  if (parameters instanceof URL) {
    parameters = parameters.searchParams
  }

  if (!(parameters instanceof URLSearchParams)) {
    throw new TypeError('"parameters" must be an instance of URLSearchParams, or URL')
  }

  const response = getURLSearchParameter(parameters, 'response')
  if (!response) {
    throw new OPE('"parameters" does not contain a JARM response')
  }

  if (typeof as.jwks_uri !== 'string') {
    throw new TypeError('"as.jwks_uri" must be a string')
  }

  const { claims } = await validateJwt(
    response,
    checkSigningAlgorithm.bind(
      undefined,
      client.authorization_signed_response_alg,
      as.authorization_signing_alg_values_supported,
    ),
    getPublicSigKeyFromIssuerJwksUri.bind(undefined, as, options),
    getClockSkew(client),
    getClockTolerance(client),
  )
    .then(validatePresence.bind(undefined, ['aud', 'exp', 'iss']))
    .then(validateIssuer.bind(undefined, as.issuer))
    .then(validateAudience.bind(undefined, client.client_id))

  const result = new URLSearchParams()
  for (const [key, value] of Object.entries(claims)) {
    // filters out timestamps
    if (typeof value === 'string' && key !== 'aud') {
      result.set(key, value)
    }
  }

  return validateAuthResponse(as, client, result, expectedState)
}

async function idTokenHash(alg: JWSAlgorithm, data: string, key: CryptoKey) {
  let algorithm: string
  switch (alg) {
    case 'RS256': // Fall through
    case 'PS256': // Fall through
    case 'ES256':
      algorithm = 'SHA-256'
      break
    case 'RS384': // Fall through
    case 'PS384': // Fall through
    case 'ES384':
      algorithm = 'SHA-384'
      break
    case 'RS512': // Fall through
    case 'PS512': // Fall through
    case 'ES512':
      algorithm = 'SHA-512'
      break
    case 'EdDSA':
      if (key.algorithm.name === 'Ed25519') {
        algorithm = 'SHA-512'
        break
      }
      throw new UnsupportedOperationError()
    default:
      throw new UnsupportedOperationError()
  }

  const digest = await crypto.subtle.digest(algorithm, buf(data))
  return b64u(digest.slice(0, digest.byteLength / 2))
}

async function idTokenHashMatches(data: string, actual: string, alg: JWSAlgorithm, key: CryptoKey) {
  const expected = await idTokenHash(alg, data, key)
  return actual === expected
}

/**
 * Same as {@link validateAuthResponse} but for FAPI 1.0 Advanced Detached Signature authorization
 * responses.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Authorization Response parameters as URLSearchParams or an instance of URL with
 *   parameters in a fragment/hash.
 * @param expectedNonce Expected ID Token `nonce` claim value.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 * @param maxAge ID Token {@link IDToken.auth_time `auth_time`} claim value will be checked to be
 *   present and conform to the `maxAge` value. Use of this option is required if you sent a
 *   `max_age` parameter in an authorization request. Default is
 *   {@link Client.default_max_age `client.default_max_age`} and falls back to
 *   {@link skipAuthTimeCheck}.
 *
 * @returns Validated Authorization Response parameters or Authorization Error Response.
 *
 * @group FAPI 1.0 Advanced
 *
 * @see [Financial-grade API Security Profile 1.0 - Part 2: Advanced](https://openid.net/specs/openid-financial-api-part-2-1_0.html#id-token-as-detached-signature)
 */
export async function validateDetachedSignatureResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL,
  expectedNonce: string,
  expectedState?: string | typeof expectNoState,
  maxAge?: number | typeof skipAuthTimeCheck,
  options?: HttpRequestOptions,
): Promise<URLSearchParams | OAuth2Error> {
  assertAs(as)
  assertClient(client)

  if (parameters instanceof URL) {
    if (!parameters.hash.length) {
      throw new TypeError(
        '"parameters" as an instance of URL must contain a hash (fragment) with the Authorization Response parameters',
      )
    }
    parameters = new URLSearchParams(parameters.hash.slice(1))
  }

  if (!(parameters instanceof URLSearchParams)) {
    throw new TypeError('"parameters" must be an instance of URLSearchParams')
  }

  parameters = new URLSearchParams(parameters)

  const id_token = getURLSearchParameter(parameters, 'id_token')
  parameters.delete('id_token')

  switch (expectedState) {
    case undefined:
    case expectNoState:
      break
    default:
      if (!validateString(expectedState)) {
        throw new TypeError('"expectedState" must be a non-empty string')
      }
  }

  const result = validateAuthResponse(
    {
      ...as,
      authorization_response_iss_parameter_supported: false,
    },
    client,
    parameters,
    expectedState,
  )

  if (isOAuth2Error(result)) {
    return result
  }

  if (!id_token) {
    throw new OPE('"parameters" does not contain an ID Token')
  }
  const code = getURLSearchParameter(parameters, 'code')
  if (!code) {
    throw new OPE('"parameters" does not contain an Authorization Code')
  }

  if (typeof as.jwks_uri !== 'string') {
    throw new TypeError('"as.jwks_uri" must be a string')
  }

  const requiredClaims: (keyof typeof jwtClaimNames)[] = [
    'aud',
    'exp',
    'iat',
    'iss',
    'sub',
    'nonce',
    'c_hash',
  ]

  if (typeof expectedState === 'string') {
    requiredClaims.push('s_hash')
  }

  const { claims, header, key } = await validateJwt(
    id_token,
    checkSigningAlgorithm.bind(
      undefined,
      client.id_token_signed_response_alg,
      as.id_token_signing_alg_values_supported,
    ),
    getPublicSigKeyFromIssuerJwksUri.bind(undefined, as, options),
    getClockSkew(client),
    getClockTolerance(client),
  )
    .then(validatePresence.bind(undefined, requiredClaims))
    .then(validateIssuer.bind(undefined, as.issuer))
    .then(validateAudience.bind(undefined, client.client_id))

  const clockSkew = getClockSkew(client)
  const now = epochTime() + clockSkew
  if (claims.iat! < now - 3600) {
    throw new OPE('unexpected JWT "iat" (issued at) claim value, it is too far in the past')
  }

  if (
    typeof claims.c_hash !== 'string' ||
    (await idTokenHashMatches(code, claims.c_hash, header.alg, key!)) !== true
  ) {
    throw new OPE('invalid ID Token "c_hash" (code hash) claim value')
  }

  if (claims.s_hash !== undefined && typeof expectedState !== 'string') {
    throw new OPE('could not verify ID Token "s_hash" (state hash) claim value')
  }

  if (
    typeof expectedState === 'string' &&
    (typeof claims.s_hash !== 'string' ||
      (await idTokenHashMatches(expectedState, claims.s_hash, header.alg, key!)) !== true)
  ) {
    throw new OPE('invalid ID Token "s_hash" (state hash) claim value')
  }

  if (client.require_auth_time !== undefined && typeof claims.auth_time !== 'number') {
    throw new OPE('unexpected ID Token "auth_time" (authentication time) claim value')
  }

  maxAge ??= client.default_max_age ?? skipAuthTimeCheck
  if (
    (client.require_auth_time || maxAge !== skipAuthTimeCheck) &&
    claims.auth_time === undefined
  ) {
    throw new OPE('ID Token "auth_time" (authentication time) claim missing')
  }

  if (maxAge !== skipAuthTimeCheck) {
    if (typeof maxAge !== 'number' || maxAge < 0) {
      throw new TypeError('"options.max_age" must be a non-negative number')
    }

    const now = epochTime() + getClockSkew(client)
    const tolerance = getClockTolerance(client)
    if ((<IDToken>claims).auth_time! + maxAge < now - tolerance) {
      throw new OPE('too much time has elapsed since the last End-User authentication')
    }
  }

  if (!validateString(expectedNonce)) {
    throw new TypeError('"expectedNonce" must be a non-empty string')
  }
  if (claims.nonce !== expectedNonce) {
    throw new OPE('unexpected ID Token "nonce" claim value')
  }

  if (Array.isArray(claims.aud) && claims.aud.length !== 1 && claims.azp !== client.client_id) {
    throw new OPE('unexpected ID Token "azp" (authorized party) claim value')
  }

  return result
}

/**
 * If configured must be the configured one (client) if not configured must be signalled by the
 * issuer to be supported (issuer) if not signalled must be fallback
 */
function checkSigningAlgorithm(
  client: string | undefined,
  issuer: string[] | undefined,
  header: CompactJWSHeaderParameters,
) {
  if (client !== undefined) {
    if (header.alg !== client) {
      throw new OPE('unexpected JWT "alg" header parameter')
    }
    return
  }

  if (Array.isArray(issuer)) {
    if (!issuer.includes(header.alg)) {
      throw new OPE('unexpected JWT "alg" header parameter')
    }
    return
  }

  if (header.alg !== 'RS256') {
    throw new OPE('unexpected JWT "alg" header parameter')
  }
}

/**
 * Returns a parameter by name from URLSearchParams. It must be only provided once. Returns
 * undefined if the parameter is not present.
 */
function getURLSearchParameter(parameters: URLSearchParams, name: string): string | undefined {
  const { 0: value, length } = parameters.getAll(name)
  if (length > 1) {
    throw new OPE(`"${name}" parameter must be provided only once`)
  }
  return value
}

/**
 * DANGER ZONE
 *
 * Use this as a value to {@link validateAuthResponse} `expectedState` parameter to skip the `state`
 * value check. This should only ever be done if you use a `state` parameter value that is integrity
 * protected and bound to the browsing session. One such mechanism to do so is described in an I-D
 * [draft-bradley-oauth-jwt-encoded-state-09](https://datatracker.ietf.org/doc/html/draft-bradley-oauth-jwt-encoded-state-09).
 * It is expected you'll validate such `state` value yourself.
 */
export const skipStateCheck = Symbol()

/**
 * Use this as a value to {@link validateAuthResponse} `expectedState` parameter to indicate no
 * `state` parameter value is expected, i.e. no `state` parameter value was sent with the
 * authorization request.
 */
export const expectNoState = Symbol()

/**
 * Validates an OAuth 2.0 Authorization Response or Authorization Error Response message returned
 * from the authorization server's
 * {@link AuthorizationServer.authorization_endpoint `as.authorization_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Authorization response.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 *
 * @returns Validated Authorization Response parameters or Authorization Error Response.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
 * @see [RFC 9207 - OAuth 2.0 Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207.html)
 */
export function validateAuthResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL,
  expectedState?: string | typeof expectNoState | typeof skipStateCheck,
): URLSearchParams | OAuth2Error {
  assertAs(as)
  assertClient(client)

  if (parameters instanceof URL) {
    parameters = parameters.searchParams
  }

  if (!(parameters instanceof URLSearchParams)) {
    throw new TypeError('"parameters" must be an instance of URLSearchParams, or URL')
  }

  if (getURLSearchParameter(parameters, 'response')) {
    throw new OPE(
      '"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()',
    )
  }

  const iss = getURLSearchParameter(parameters, 'iss')
  const state = getURLSearchParameter(parameters, 'state')

  if (!iss && as.authorization_response_iss_parameter_supported) {
    throw new OPE('response parameter "iss" (issuer) missing')
  }

  if (iss && iss !== as.issuer) {
    throw new OPE('unexpected "iss" (issuer) response parameter value')
  }

  switch (expectedState) {
    case undefined:
    case expectNoState:
      if (state !== undefined) {
        throw new OPE('unexpected "state" response parameter encountered')
      }
      break
    case skipStateCheck:
      break
    default:
      if (!validateString(expectedState)) {
        throw new OPE('"expectedState" must be a non-empty string')
      }
      if (state === undefined) {
        throw new OPE('response parameter "state" missing')
      }
      if (state !== expectedState) {
        throw new OPE('unexpected "state" response parameter value')
      }
  }

  const error = getURLSearchParameter(parameters, 'error')
  if (error) {
    return {
      error,
      error_description: getURLSearchParameter(parameters, 'error_description'),
      error_uri: getURLSearchParameter(parameters, 'error_uri'),
    }
  }

  const id_token = getURLSearchParameter(parameters, 'id_token')
  const token = getURLSearchParameter(parameters, 'token')
  if (id_token !== undefined || token !== undefined) {
    throw new UnsupportedOperationError('implicit and hybrid flows are not supported')
  }

  return brand(new URLSearchParams(parameters))
}

function algToSubtle(
  alg: JWSAlgorithm,
  crv?: string,
): RsaHashedImportParams | EcKeyImportParams | AlgorithmIdentifier {
  switch (alg) {
    case 'PS256': // Fall through
    case 'PS384': // Fall through
    case 'PS512':
      return { name: 'RSA-PSS', hash: `SHA-${alg.slice(-3)}` }
    case 'RS256': // Fall through
    case 'RS384': // Fall through
    case 'RS512':
      return { name: 'RSASSA-PKCS1-v1_5', hash: `SHA-${alg.slice(-3)}` }
    case 'ES256': // Fall through
    case 'ES384':
      return { name: 'ECDSA', namedCurve: `P-${alg.slice(-3)}` }
    case 'ES512':
      return { name: 'ECDSA', namedCurve: 'P-521' }
    case 'EdDSA': {
      switch (crv) {
        case 'Ed25519': // Fall through
        case 'Ed448':
          return crv
        default:
          throw new UnsupportedOperationError()
      }
    }
    default:
      throw new UnsupportedOperationError()
  }
}

async function importJwk(alg: JWSAlgorithm, jwk: JWK) {
  const { ext, key_ops, use, ...key } = jwk
  return crypto.subtle.importKey('jwk', key, algToSubtle(alg, jwk.crv), true, ['verify'])
}

export interface DeviceAuthorizationRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions {}

/**
 * Performs a Device Authorization Request at the
 * {@link AuthorizationServer.device_authorization_endpoint `as.device_authorization_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Device Authorization Request parameters.
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1)
 */
export async function deviceAuthorizationRequest(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: DeviceAuthorizationRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  const url = resolveEndpoint(as, 'device_authorization_endpoint', options)

  const body = new URLSearchParams(parameters)
  body.set('client_id', client.client_id)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  return authenticatedRequest(as, client, 'POST', url, body, headers, options)
}

export interface DeviceAuthorizationResponse {
  readonly device_code: string
  readonly user_code: string
  readonly verification_uri: string
  readonly expires_in: number
  readonly verification_uri_complete?: string
  readonly interval?: number

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * Validates Response instance to be one coming from the
 * {@link AuthorizationServer.device_authorization_endpoint `as.device_authorization_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link deviceAuthorizationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1)
 */
export async function processDeviceAuthorizationResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<DeviceAuthorizationResponse | OAuth2Error> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Device Authorization Endpoint response')
  }

  assertReadableResponse(response)
  let json: JsonValue
  try {
    json = await response.json()
  } catch (cause) {
    throw new OPE('failed to parse "response" body as JSON', { cause })
  }

  if (!isJsonObject<DeviceAuthorizationResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (!validateString(json.device_code)) {
    throw new OPE('"response" body "device_code" property must be a non-empty string')
  }

  if (!validateString(json.user_code)) {
    throw new OPE('"response" body "user_code" property must be a non-empty string')
  }

  if (!validateString(json.verification_uri)) {
    throw new OPE('"response" body "verification_uri" property must be a non-empty string')
  }

  if (typeof json.expires_in !== 'number' || json.expires_in <= 0) {
    throw new OPE('"response" body "expires_in" property must be a positive number')
  }

  if (
    json.verification_uri_complete !== undefined &&
    !validateString(json.verification_uri_complete)
  ) {
    throw new OPE('"response" body "verification_uri_complete" property must be a non-empty string')
  }

  if (json.interval !== undefined && (typeof json.interval !== 'number' || json.interval <= 0)) {
    throw new OPE('"response" body "interval" property must be a positive number')
  }

  return json
}

/**
 * Performs a Device Authorization Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param deviceCode Device Code.
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function deviceCodeGrantRequest(
  as: AuthorizationServer,
  client: Client,
  deviceCode: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  if (!validateString(deviceCode)) {
    throw new TypeError('"deviceCode" must be a non-empty string')
  }

  const parameters = new URLSearchParams(options?.additionalParameters)
  parameters.set('device_code', deviceCode)
  return tokenEndpointRequest(
    as,
    client,
    'urn:ietf:params:oauth:grant-type:device_code',
    parameters,
    options,
  )
}

/**
 * Validates Device Authorization Grant Response instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link deviceCodeGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4)
 */
export async function processDeviceCodeResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<TokenEndpointResponse | OAuth2Error> {
  return processGenericAccessTokenResponse(as, client, response)
}

export interface GenerateKeyPairOptions {
  /**
   * Indicates whether or not the private key may be exported. Default is `false`.
   */
  extractable?: boolean

  /**
   * (RSA algorithms only) The length, in bits, of the RSA modulus. Default is `2048`.
   */
  modulusLength?: number

  /**
   * (EdDSA algorithms only) The EdDSA sub-type. Default is `Ed25519`.
   */
  crv?: 'Ed25519' | 'Ed448'
}

/**
 * Generates a CryptoKeyPair for a given JWS `alg` Algorithm identifier.
 *
 * @param alg Supported JWS `alg` Algorithm identifier.
 *
 * @group Utilities
 */
export async function generateKeyPair(alg: JWSAlgorithm, options?: GenerateKeyPairOptions) {
  if (!validateString(alg)) {
    throw new TypeError('"alg" must be a non-empty string')
  }
  const algorithm: RsaHashedKeyGenParams | EcKeyGenParams | AlgorithmIdentifier = algToSubtle(
    alg,
    alg === 'EdDSA' ? options?.crv ?? 'Ed25519' : undefined,
  )

  if (alg.startsWith('PS') || alg.startsWith('RS')) {
    Object.assign(algorithm, {
      modulusLength: options?.modulusLength ?? 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    })
  }

  return <Promise<CryptoKeyPair>>(
    crypto.subtle.generateKey(algorithm, options?.extractable ?? false, ['sign', 'verify'])
  )
}

export interface JWTAccessTokenClaims extends JWTPayload {
  readonly iss: string
  readonly exp: number
  readonly aud: string | string[]
  readonly sub: string
  readonly iat: number
  readonly jti: string
  readonly client_id: string
  readonly authorization_details?: AuthorizationDetails[]
  readonly scope?: string

  readonly [claim: string]: JsonValue | undefined
}

export interface ValidateJWTAccessTokenOptions extends HttpRequestOptions {
  /**
   * Indicates whether DPoP use is required.
   */
  requireDPoP?: boolean

  /**
   * Same functionality as in {@link Client}
   */
  [clockSkew]?: number

  /**
   * Same functionality as in {@link Client}
   */
  [clockTolerance]?: number
}

function normalizeHtu(htu: string) {
  const url = new URL(htu)
  url.search = ''
  url.hash = ''
  return url.href
}

async function validateDPoP(
  as: AuthorizationServer,
  request: Request,
  accessToken: string,
  accessTokenClaims: JWTPayload,
  options?: ValidateJWTAccessTokenOptions,
) {
  const header = request.headers.get('dpop')
  if (header === null) {
    throw new OPE('operation indicated DPoP use but the request has no DPoP HTTP Header')
  }

  if (request.headers.get('authorization')?.toLowerCase().startsWith('dpop ') === false) {
    throw new OPE(
      `operation indicated DPoP use but the request's Authorization HTTP Header scheme is not DPoP`,
    )
  }

  if (typeof accessTokenClaims.cnf?.jkt !== 'string') {
    throw new OPE(
      'operation indicated DPoP use but the JWT Access Token has no jkt confirmation claim',
    )
  }

  const clockSkew = getClockSkew(options)
  const proof = await validateJwt(
    header,
    checkSigningAlgorithm.bind(
      undefined,
      undefined,
      as?.dpop_signing_alg_values_supported || SUPPORTED_JWS_ALGS,
    ),
    async ({ jwk, alg }) => {
      if (!jwk) {
        throw new OPE('DPoP Proof is missing the jwk header parameter')
      }
      const key = await importJwk(alg, jwk)
      if (key.type !== 'public') {
        throw new OPE('DPoP Proof jwk header parameter must contain a public key')
      }
      return key
    },
    clockSkew,
    getClockTolerance(options),
  )
    .then(checkJwtType.bind(undefined, 'dpop+jwt'))
    .then(validatePresence.bind(undefined, ['iat', 'jti', 'ath', 'htm', 'htu']))

  const now = epochTime() + clockSkew
  const diff = Math.abs(now - proof.claims.iat!)
  if (diff > 300) {
    throw new OPE('DPoP Proof iat is not recent enough')
  }

  if (proof.claims.htm !== request.method) {
    throw new OPE('DPoP Proof htm mismatch')
  }

  if (
    typeof proof.claims.htu !== 'string' ||
    normalizeHtu(proof.claims.htu) !== normalizeHtu(request.url)
  ) {
    throw new OPE('DPoP Proof htu mismatch')
  }

  {
    const expected = b64u(await crypto.subtle.digest('SHA-256', encoder.encode(accessToken)))

    if (proof.claims.ath !== expected) {
      throw new OPE('DPoP Proof ath mismatch')
    }
  }

  {
    let components: JWK
    switch (proof.header.jwk!.kty) {
      case 'EC':
        components = {
          crv: proof.header.jwk!.crv,
          kty: proof.header.jwk!.kty,
          x: proof.header.jwk!.x,
          y: proof.header.jwk!.y,
        }
        break
      case 'OKP':
        components = {
          crv: proof.header.jwk!.crv,
          kty: proof.header.jwk!.kty,
          x: proof.header.jwk!.x,
        }
        break
      case 'RSA':
        components = {
          e: proof.header.jwk!.e,
          kty: proof.header.jwk!.kty,
          n: proof.header.jwk!.n,
        }
        break
      default:
        throw new UnsupportedOperationError()
    }
    const expected = b64u(
      await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(components))),
    )

    if (accessTokenClaims.cnf.jkt !== expected) {
      throw new OPE('JWT Access Token confirmation mismatch')
    }
  }
}

/**
 * Validates use of JSON Web Token (JWT) OAuth 2.0 Access Tokens for a given {@link Request} as per
 * RFC 9068 and optionally also RFC 9449.
 *
 * This does validate the presence and type of all required claims as well as the values of the
 * {@link JWTAccessTokenClaims.iss `iss`}, {@link JWTAccessTokenClaims.exp `exp`},
 * {@link JWTAccessTokenClaims.aud `aud`} claims.
 *
 * This does NOT validate the {@link JWTAccessTokenClaims.sub `sub`},
 * {@link JWTAccessTokenClaims.jti `jti`}, and {@link JWTAccessTokenClaims.client_id `client_id`}
 * claims beyond just checking that they're present and that their type is a string. If you need to
 * validate these values further you would do so after this function's execution.
 *
 * This does NOT validate the DPoP Proof JWT nonce. If your server indicates RS-provided nonces to
 * clients you would check these after this function's execution.
 *
 * This does NOT validate authorization claims such as `scope` either, you would do so after this
 * function's execution.
 *
 * @param as Authorization Server to accept JWT Access Tokens from.
 * @param request
 * @param expectedAudience Audience identifier the resource server expects for itself.
 * @param options
 *
 * @group JWT Access Tokens
 *
 * @see [RFC 9068 - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068.html)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html)
 */
export async function validateJwtAccessToken(
  as: AuthorizationServer,
  request: Request,
  expectedAudience: string,
  options?: ValidateJWTAccessTokenOptions,
) {
  assertAs(as)

  if (!looseInstanceOf(request, Request)) {
    throw new TypeError('"request" must be an instance of Request')
  }

  if (!validateString(expectedAudience)) {
    throw new OPE('"expectedAudience" must be a non-empty string')
  }

  const authorization = request.headers.get('authorization')
  if (authorization === null) {
    throw new OPE('"request" is missing an Authorization HTTP Header')
  }
  let { 0: scheme, 1: accessToken, length } = authorization.split(' ')
  scheme = scheme.toLowerCase()
  switch (scheme) {
    case 'dpop':
    case 'bearer':
      break
    default:
      throw new UnsupportedOperationError('unsupported Authorization HTTP Header scheme')
  }

  if (length !== 2) {
    throw new OPE('invalid Authorization HTTP Header format')
  }

  const requiredClaims: (keyof typeof jwtClaimNames)[] = [
    'iss',
    'exp',
    'aud',
    'sub',
    'iat',
    'jti',
    'client_id',
  ]

  if (options?.requireDPoP || scheme === 'dpop' || request.headers.has('dpop')) {
    requiredClaims.push('cnf')
  }

  const { claims } = await validateJwt(
    accessToken,
    checkSigningAlgorithm.bind(undefined, undefined, SUPPORTED_JWS_ALGS),
    getPublicSigKeyFromIssuerJwksUri.bind(undefined, as, options),
    getClockSkew(options),
    getClockTolerance(options),
  )
    .then(checkJwtType.bind(undefined, 'at+jwt'))
    .then(validatePresence.bind(undefined, requiredClaims))
    .then(validateIssuer.bind(undefined, as.issuer))
    .then(validateAudience.bind(undefined, expectedAudience))

  for (const claim of ['client_id', 'jti', 'sub']) {
    if (typeof claims[claim] !== 'string') {
      throw new OPE(`unexpected JWT "${claim}" claim type`)
    }
  }

  if ('cnf' in claims) {
    if (!isJsonObject(claims.cnf)) {
      throw new OPE('unexpected JWT "cnf" (confirmation) claim value')
    }

    const { 0: cnf, length } = Object.keys(claims.cnf)

    if (length) {
      if (length !== 1) {
        throw new UnsupportedOperationError('multiple confirmation claims are not supported')
      }

      if (cnf !== 'jkt') {
        throw new UnsupportedOperationError('unsupported JWT Confirmation method')
      }
    }
  }

  if (
    options?.requireDPoP ||
    scheme === 'dpop' ||
    claims.cnf?.jkt !== undefined ||
    request.headers.has('dpop')
  ) {
    await validateDPoP(as, request, accessToken, claims, options)
  }

  return <JWTAccessTokenClaims>claims
}

/**
 * @ignore
 *
 * @deprecated Use {@link customFetch}.
 */
export const experimentalCustomFetch = customFetch
/**
 * @ignore
 *
 * @deprecated Use {@link customFetch}.
 */
export const experimental_customFetch = customFetch
/**
 * @ignore
 *
 * @deprecated Use {@link useMtlsAlias}.
 */
export const experimentalUseMtlsAlias = useMtlsAlias
/**
 * @ignore
 *
 * @deprecated Use {@link useMtlsAlias}.
 */
export const experimental_useMtlsAlias = useMtlsAlias
/**
 * @ignore
 *
 * @deprecated Use {@link UseMTLSAliasOptions}.
 */
export type ExperimentalUseMTLSAliasOptions = UseMTLSAliasOptions
/**
 * @ignore
 *
 * @deprecated Use {@link ConfirmationClaims}.
 */
export type IntrospectionConfirmationClaims = ConfirmationClaims
/**
 * @ignore
 *
 * @deprecated Use {@link validateDetachedSignatureResponse}.
 */
export const experimental_validateDetachedSignatureResponse = validateDetachedSignatureResponse
/**
 * @ignore
 *
 * @deprecated Use {@link validateJwtAccessToken}.
 */
export const experimental_validateJwtAccessToken = validateJwtAccessToken
