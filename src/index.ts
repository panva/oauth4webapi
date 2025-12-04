let USER_AGENT: string
// @ts-ignore
if (typeof navigator === 'undefined' || !navigator.userAgent?.startsWith?.('Mozilla/5.0 ')) {
  const NAME = 'oauth4webapi'
  const VERSION = 'v3.8.3'
  USER_AGENT = `${NAME}/${VERSION}`
}

/**
 * @ignore
 */
export type CryptoKey = Extract<
  Awaited<ReturnType<typeof crypto.subtle.generateKey>>,
  { type: string }
>

export interface CryptoKeyPair {
  privateKey: CryptoKey
  publicKey: CryptoKey
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

export interface ModifyAssertionFunction {
  (
    /**
     * JWS Header to modify right before it is signed.
     */
    header: Record<string, JsonValue | undefined>,
    /**
     * JWT Claims Set to modify right before it is signed.
     */
    payload: Record<string, JsonValue | undefined>,
  ): void
}

/**
 * Interface to pass an asymmetric private key and, optionally, its associated JWK Key ID to be
 * added as a `kid` JOSE Header Parameter.
 */
export interface PrivateKey {
  /**
   * An asymmetric private CryptoKey.
   *
   * Its algorithm must be compatible with a supported {@link JWSAlgorithm JWS Algorithm}.
   */
  key: CryptoKey

  /**
   * JWK Key ID to add to JOSE headers when this key is used. When not provided no `kid` (JWK Key
   * ID) will be added to the JOSE Header.
   */
  kid?: string
}

const ERR_INVALID_ARG_VALUE = 'ERR_INVALID_ARG_VALUE'
const ERR_INVALID_ARG_TYPE = 'ERR_INVALID_ARG_TYPE'

type codes = typeof ERR_INVALID_ARG_VALUE | typeof ERR_INVALID_ARG_TYPE

function CodedTypeError(message: string, code: codes, cause?: unknown) {
  const err = new TypeError(message, { cause })
  Object.assign(err, { code })
  return err
}

/**
 * JWS `alg` Algorithm identifiers from the
 * {@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms JSON Web Signature and Encryption Algorithms IANA registry}
 * for which Digital Signature validation is implemented.
 */
export type JWSAlgorithm =
  | 'PS256'
  | 'ES256'
  | 'RS256'
  | 'Ed25519'
  | 'ES384'
  | 'PS384'
  | 'RS384'
  | 'ES512'
  | 'PS512'
  | 'RS512'
  | 'ML-DSA-44'
  | 'ML-DSA-65'
  | 'ML-DSA-87'
  // Deprecated
  | 'EdDSA'

export interface JWK {
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
  readonly pub?: string

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * By default the module only allows interactions with HTTPS endpoints. Setting this option to
 * `true` removes that restriction.
 *
 * @deprecated To make it stand out as something you shouldn't use, possibly only for local
 *   development and testing against non-TLS secured environments.
 */
export const allowInsecureRequests: unique symbol = Symbol()

/**
 * Use to adjust the assumed current time. Positive and negative finite values representing seconds
 * are allowed. Default is `0` (Date.now() + 0 seconds is used).
 *
 * @example
 *
 * When the local clock is mistakenly 1 hour in the past
 *
 * ```ts
 * let client: oauth.Client = {
 *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
 *   // ... other metadata
 *   [oauth.clockSkew]: +(60 * 60),
 * }
 * ```
 *
 * @example
 *
 * When the local clock is mistakenly 1 hour in the future
 *
 * ```ts
 * let client: oauth.Client = {
 *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
 *   // ... other metadata
 *   [oauth.clockSkew]: -(60 * 60),
 * }
 * ```
 */
export const clockSkew: unique symbol = Symbol()

/**
 * Use to set allowed clock tolerance when checking DateTime JWT Claims. Only positive finite values
 * representing seconds are allowed. Default is `30` (30 seconds).
 *
 * @example
 *
 * Tolerate 30 seconds clock skew when validating JWT claims like exp or nbf.
 *
 * ```ts
 * let client: oauth.Client = {
 *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
 *   // ... other metadata
 *   [oauth.clockTolerance]: 30,
 * }
 * ```
 */
export const clockTolerance: unique symbol = Symbol()

/**
 * When configured on an interface that extends {@link HttpRequestOptions}, this applies to `options`
 * parameter for functions that may trigger HTTP requests, this replaces the use of global fetch. As
 * a fetch replacement the arguments and expected return are the same as fetch.
 *
 * In theory any module that claims to be compatible with the Fetch API can be used but your mileage
 * may vary. No workarounds to allow use of non-conform {@link !Response}s will be considered.
 *
 * If you only need to update the {@link !Request} properties you do not need to use a Fetch API
 * module, just change what you need and pass it to globalThis.fetch just like this module would
 * normally do.
 *
 * Its intended use cases are:
 *
 * - {@link !Request}/{@link !Response} tracing and logging
 * - Custom caching strategies for responses of Authorization Server Metadata and JSON Web Key Set
 *   (JWKS) endpoints
 * - Changing the {@link !Request} properties like headers, body, credentials, mode before it is passed
 *   to fetch
 *
 * Known caveats:
 *
 * - Expect Type-related issues when passing the inputs through to fetch-like modules, they hardly
 *   ever get their typings inline with actual fetch, you should `@ts-expect-error` them.
 *
 * @example
 *
 * Using [sindresorhus/ky](https://github.com/sindresorhus/ky) for retries and its hooks feature for
 * logging outgoing requests and their responses.
 *
 * ```js
 * import ky from 'ky'
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
 * Using [nodejs/undici](https://github.com/nodejs/undici) to detect and use HTTP proxies.
 *
 * ```ts
 * import * as undici from 'undici'
 *
 * // see https://undici.nodejs.org/#/docs/api/EnvHttpProxyAgent
 * let envHttpProxyAgent = new undici.EnvHttpProxyAgent()
 *
 * // example use
 * await oauth.discoveryRequest(new URL('https://as.example.com'), {
 *   // @ts-ignore
 *   [oauth.customFetch](...args) {
 *     return undici.fetch(args[0], { ...args[1], dispatcher: envHttpProxyAgent }) // prettier-ignore
 *   },
 * })
 * ```
 *
 * @example
 *
 * Using [nodejs/undici](https://github.com/nodejs/undici) to automatically retry network errors.
 *
 * ```ts
 * import * as undici from 'undici'
 *
 * // see https://undici.nodejs.org/#/docs/api/RetryAgent
 * let retryAgent = new undici.RetryAgent(new undici.Agent(), {
 *   statusCodes: [],
 *   errorCodes: [
 *     'ECONNRESET',
 *     'ECONNREFUSED',
 *     'ENOTFOUND',
 *     'ENETDOWN',
 *     'ENETUNREACH',
 *     'EHOSTDOWN',
 *     'UND_ERR_SOCKET',
 *   ],
 * })
 *
 * // example use
 * await oauth.discoveryRequest(new URL('https://as.example.com'), {
 *   // @ts-ignore
 *   [oauth.customFetch](...args) {
 *     return undici.fetch(args[0], { ...args[1], dispatcher: retryAgent }) // prettier-ignore
 *   },
 * })
 * ```
 *
 * @example
 *
 * Using [nodejs/undici](https://github.com/nodejs/undici) to mock responses in tests.
 *
 * ```ts
 * import * as undici from 'undici'
 *
 * // see https://undici.nodejs.org/#/docs/api/MockAgent
 * let mockAgent = new undici.MockAgent()
 * mockAgent.disableNetConnect()
 *
 * // example use
 * await oauth.discoveryRequest(new URL('https://as.example.com'), {
 *   // @ts-ignore
 *   [oauth.customFetch](...args) {
 *     return undici.fetch(args[0], { ...args[1], dispatcher: mockAgent }) // prettier-ignore
 *   },
 * })
 * ```
 */
export const customFetch: unique symbol = Symbol()

/**
 * Use to mutate JWT header and payload before they are signed. Its intended use is working around
 * non-conform server behaviours, such as modifying JWT "aud" (audience) claims, or otherwise
 * changing fixed claims used by this library.
 *
 * @example
 *
 * Changing the `alg: "Ed25519"` back to `alg: "EdDSA"`
 *
 * ```ts
 * let as!: oauth.AuthorizationServer
 * let client!: oauth.Client
 * let parameters!: URLSearchParams
 * let key!: oauth.CryptoKey | oauth.PrivateKey
 * let keyPair!: oauth.CryptoKeyPair
 *
 * let remapEd25519: oauth.ModifyAssertionOptions = {
 *   [oauth.modifyAssertion]: (header, _payload) => {
 *     if (header.alg === 'Ed25519') {
 *       header.alg = 'EdDSA'
 *     }
 *   },
 * }
 *
 * // For JAR
 * oauth.issueRequestObject(as, client, parameters, key, remapEd25519)
 *
 * // For Private Key JWT
 * oauth.PrivateKeyJwt(key, remapEd25519)
 *
 * // For DPoP
 * oauth.DPoP(client, keyPair, remapEd25519)
 * ```
 */
export const modifyAssertion: unique symbol = Symbol()

/**
 * Use to add support for decrypting JWEs the client encounters, namely
 *
 * - Encrypted ID Tokens returned by the Token Endpoint
 * - Encrypted ID Tokens returned as part of FAPI 1.0 Advanced Detached Signature authorization
 *   responses
 * - Encrypted JWT UserInfo responses
 * - Encrypted JWT Introspection responses
 * - Encrypted JARM Responses
 *
 * @example
 *
 * Decrypting JARM responses
 *
 * ```ts
 * import * as jose from 'jose'
 *
 * let as!: oauth.AuthorizationServer
 * let client!: oauth.Client
 * let key!: oauth.CryptoKey
 * let alg!: string
 * let enc!: string
 * let currentUrl!: URL
 * let state!: string | undefined
 *
 * let decoder = new TextDecoder()
 * let jweDecrypt: oauth.JweDecryptFunction = async (jwe) => {
 *   const { plaintext } = await jose
 *     .compactDecrypt(jwe, key, {
 *       keyManagementAlgorithms: [alg],
 *       contentEncryptionAlgorithms: [enc],
 *     })
 *     .catch((cause: unknown) => {
 *       throw new oauth.OperationProcessingError('decryption failed', { cause })
 *     })
 *
 *   return decoder.decode(plaintext)
 * }
 *
 * let params = await oauth.validateJwtAuthResponse(as, client, currentUrl, state, {
 *   [oauth.jweDecrypt]: jweDecrypt,
 * })
 * ```
 */
export const jweDecrypt: unique symbol = Symbol()

/**
 * > [!WARNING]\
 * > This option has security implications that must be understood, assessed for applicability, and
 * > accepted before use. It is critical that the JSON Web Key Set cache only be writable by your own
 * > code.
 *
 * This option is intended for cloud computing runtimes that cannot keep an in memory cache between
 * their code's invocations. Use in runtimes where an in memory cache between requests is available
 * is not desirable.
 *
 * When configured on an interface that extends {@link JWKSCacheOptions}, this applies to `options`
 * parameter for functions that may trigger HTTP requests to
 * {@link AuthorizationServer.jwks_uri `as.jwks_uri`}, this allows the passed in object to:
 *
 * - Serve as an initial value for the JSON Web Key Set that the module would otherwise need to
 *   trigger an HTTP request for
 * - Have the JSON Web Key Set the function optionally ended up triggering an HTTP request for
 *   assigned to it as properties
 *
 * The intended use pattern is:
 *
 * - Before executing a function with {@link JWKSCacheOptions} in its `options` parameter you pull the
 *   previously cached object from a low-latency key-value store offered by the cloud computing
 *   runtime it is executed on;
 * - Default to an empty object `{}` instead when there's no previously cached value;
 * - Pass it into the options interfaces that extend {@link JWKSCacheOptions};
 * - Afterwards, update the key-value storage if the {@link ExportedJWKSCache.uat `uat`} property of
 *   the object has changed.
 *
 * @example
 *
 * ```ts
 * let as!: oauth.AuthorizationServer
 * let request!: Request
 * let expectedAudience!: string
 * let getPreviouslyCachedJWKS!: () => Promise<oauth.ExportedJWKSCache>
 * let storeNewJWKScache!: (cache: oauth.ExportedJWKSCache) => Promise<void>
 *
 * // Load JSON Web Key Set cache
 * let jwksCache: oauth.JWKSCacheInput = (await getPreviouslyCachedJWKS()) || {}
 * let { uat } = jwksCache
 *
 * // Use JSON Web Key Set cache
 * let accessTokenClaims = await oauth.validateJwtAccessToken(as, request, expectedAudience, {
 *   [oauth.jwksCache]: jwksCache,
 * })
 *
 * if (uat !== jwksCache.uat) {
 *   // Update JSON Web Key Set cache
 *   await storeNewJWKScache(jwksCache)
 * }
 * ```
 */
export const jwksCache: unique symbol = Symbol()

/**
 * Authorization Server Metadata
 *
 * @group Authorization Server Metadata
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
   * JSON array containing a list of the JWS algorithms supported for DPoP Proof JWTs.
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
  /**
   * JSON array containing a list of resource identifiers for OAuth protected resources.
   */
  readonly protected_resources?: string[]

  readonly [metadata: string]: JsonValue | undefined
}

export interface MTLSEndpointAliases extends Pick<
  AuthorizationServer,
  | 'backchannel_authentication_endpoint'
  | 'device_authorization_endpoint'
  | 'introspection_endpoint'
  | 'pushed_authorization_request_endpoint'
  | 'revocation_endpoint'
  | 'token_endpoint'
  | 'userinfo_endpoint'
> {
  readonly [metadata: string]: string | undefined
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
   * JWS `alg` algorithm required for signing the ID Token issued to this Client. When not
   * configured the default is to allow only algorithms listed in
   * {@link AuthorizationServer.id_token_signing_alg_values_supported `as.id_token_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  id_token_signed_response_alg?: string
  /**
   * JWS `alg` algorithm required for signing authorization responses. When not configured the
   * default is to allow only algorithms listed in
   * {@link AuthorizationServer.authorization_signing_alg_values_supported `as.authorization_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  authorization_signed_response_alg?: string
  /**
   * Boolean value specifying whether the {@link IDToken.auth_time `auth_time`} Claim in the ID Token
   * is REQUIRED. Default is `false`.
   */
  require_auth_time?: boolean
  /**
   * JWS `alg` algorithm REQUIRED for signing UserInfo Responses. When not configured the default is
   * to allow only algorithms listed in
   * {@link AuthorizationServer.userinfo_signing_alg_values_supported `as.userinfo_signing_alg_values_supported`}
   * and fail otherwise.
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
   * Indicates the requirement for a client to use mutual TLS endpoint aliases defined by the AS
   * where present. Default is `false`.
   *
   * When combined with {@link customFetch} (to use a Fetch API implementation that supports client
   * certificates) this can be used to target security profiles that utilize Mutual-TLS for either
   * client authentication or sender constraining.
   *
   * @example
   *
   * (Node.js) Using [nodejs/undici](https://github.com/nodejs/undici) for Mutual-TLS Client
   * Authentication and Certificate-Bound Access Tokens support.
   *
   * ```ts
   * import * as undici from 'undici'
   *
   * let as!: oauth.AuthorizationServer
   * let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
   * let params!: URLSearchParams
   * let key!: string // PEM-encoded key
   * let cert!: string // PEM-encoded certificate
   *
   * let clientAuth = oauth.TlsClientAuth()
   * let agent = new undici.Agent({ connect: { key, cert } })
   *
   * let response = await oauth.pushedAuthorizationRequest(as, client, clientAuth, params, {
   *   // @ts-ignore
   *   [oauth.customFetch]: (...args) =>
   *     undici.fetch(args[0], { ...args[1], dispatcher: agent }),
   * })
   * ```
   *
   * @example
   *
   * (Deno) Using Deno.createHttpClient API for Mutual-TLS Client Authentication and
   * Certificate-Bound Access Tokens support.
   *
   * ```ts
   * let as!: oauth.AuthorizationServer
   * let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
   * let params!: URLSearchParams
   * let key!: string // PEM-encoded key
   * let cert!: string // PEM-encoded certificate
   *
   * let clientAuth = oauth.TlsClientAuth()
   * // @ts-ignore
   * let agent = Deno.createHttpClient({ key, cert })
   *
   * let response = await oauth.pushedAuthorizationRequest(as, client, clientAuth, params, {
   *   // @ts-ignore
   *   [oauth.customFetch]: (...args) => fetch(args[0], { ...args[1], client: agent }),
   * })
   * ```
   *
   * @see [RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens](https://www.rfc-editor.org/rfc/rfc8705.html)
   */
  use_mtls_endpoint_aliases?: boolean

  /**
   * See {@link clockSkew}.
   */
  [clockSkew]?: number

  /**
   * See {@link clockTolerance}.
   */
  [clockTolerance]?: number

  [metadata: string]: JsonValue | undefined
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function buf(input: string): Uint8Array<ArrayBuffer>
function buf(input: Uint8Array): string
function buf(input: string | Uint8Array) {
  if (typeof input === 'string') {
    return encoder.encode(input) as Uint8Array<ArrayBuffer>
  }

  return decoder.decode(input)
}

let encodeBase64Url: (input: Uint8Array | ArrayBuffer) => string
// @ts-ignore
if (Uint8Array.prototype.toBase64) {
  encodeBase64Url = (input) => {
    if (input instanceof ArrayBuffer) {
      input = new Uint8Array(input)
    }

    // @ts-ignore
    return input.toBase64({ alphabet: 'base64url', omitPadding: true })
  }
} else {
  const CHUNK_SIZE = 0x8000
  encodeBase64Url = (input) => {
    if (input instanceof ArrayBuffer) {
      input = new Uint8Array(input)
    }

    const arr = []
    for (let i = 0; i < input.byteLength; i += CHUNK_SIZE) {
      // @ts-ignore
      arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)))
    }
    return btoa(arr.join('')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  }
}

let decodeBase64Url: (input: string) => Uint8Array

// @ts-ignore
if (Uint8Array.fromBase64) {
  decodeBase64Url = (input) => {
    try {
      // @ts-ignore
      return Uint8Array.fromBase64(input, { alphabet: 'base64url' })
    } catch (cause) {
      throw CodedTypeError(
        'The input to be decoded is not correctly encoded.',
        ERR_INVALID_ARG_VALUE,
        cause,
      )
    }
  }
} else {
  decodeBase64Url = (input) => {
    try {
      const binary = atob(input.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''))
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      return bytes
    } catch (cause) {
      throw CodedTypeError(
        'The input to be decoded is not correctly encoded.',
        ERR_INVALID_ARG_VALUE,
        cause,
      )
    }
  }
}

function b64u(input: string): Uint8Array
function b64u(input: Uint8Array | ArrayBuffer): string
function b64u(input: string | Uint8Array | ArrayBuffer): string | Uint8Array {
  if (typeof input === 'string') {
    return decodeBase64Url(input)
  }

  return encodeBase64Url(input)
}

/**
 * @group Errors
 */
export class UnsupportedOperationError extends Error {
  code: string
  /**
   * @ignore
   */
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = this.constructor.name
    this.code = UNSUPPORTED_OPERATION
    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

/**
 * @group Errors
 */
export class OperationProcessingError extends Error {
  code?: string

  /**
   * @ignore
   */
  constructor(message: string, options?: { cause?: unknown; code?: string }) {
    super(message, options)
    this.name = this.constructor.name
    if (options?.code) {
      this.code = options?.code
    }
    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

function OPE(message: string, code?: string, cause?: unknown) {
  return new OperationProcessingError(message, { code, cause })
}

async function calculateJwkThumbprint(jwk: JWK): Promise<string> {
  let components: JsonObject
  switch (jwk.kty) {
    case 'EC':
      components = {
        crv: jwk.crv,
        kty: jwk.kty,
        x: jwk.x,
        y: jwk.y,
      }
      break
    case 'OKP':
      components = {
        crv: jwk.crv,
        kty: jwk.kty,
        x: jwk.x,
      }
      break
    case 'AKP':
      components = {
        alg: jwk.alg,
        kty: jwk.kty,
        pub: jwk.pub,
      }
      break
    case 'RSA':
      components = {
        e: jwk.e,
        kty: jwk.kty,
        n: jwk.n,
      }
      break
    default:
      throw new UnsupportedOperationError('unsupported JWK key type', { cause: jwk })
  }
  return b64u(
    await crypto.subtle.digest(
      'SHA-256',
      buf(JSON.stringify(components)) as Uint8Array<ArrayBuffer>,
    ),
  )
}

function assertCryptoKey(key: unknown, it: string): asserts key is CryptoKey {
  if (!(key instanceof CryptoKey)) {
    throw CodedTypeError(`${it} must be a CryptoKey`, ERR_INVALID_ARG_TYPE)
  }
}

function assertPrivateKey(
  key: unknown,
  it: string,
): asserts key is CryptoKey & { type: 'private' } {
  assertCryptoKey(key, it)

  if (key.type !== 'private') {
    throw CodedTypeError(`${it} must be a private CryptoKey`, ERR_INVALID_ARG_VALUE)
  }
}

function assertPublicKey(key: unknown, it: string): asserts key is CryptoKey & { type: 'public' } {
  assertCryptoKey(key, it)

  if (key.type !== 'public') {
    throw CodedTypeError(`${it} must be a public CryptoKey`, ERR_INVALID_ARG_VALUE)
  }
}

export interface JWKSCacheOptions {
  /**
   * See {@link jwksCache}.
   */
  [jwksCache]?: JWKSCacheInput
}

export interface CustomFetchOptions<Method, BodyType = undefined> {
  /**
   * The request body content to send to the server
   */
  body: BodyType
  /**
   * HTTP Headers
   */
  headers: Record<string, string>
  /**
   * The {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods request method}
   */
  method: Method
  /**
   * See {@link !Request.redirect}
   */
  redirect: 'manual'
  /**
   * Depending on whether {@link HttpRequestOptions.signal} was used, if so, it is the value passed,
   * otherwise undefined
   */
  signal?: AbortSignal
}

export interface HttpRequestOptions<Method, BodyType = undefined> {
  /**
   * An AbortSignal instance, or a factory returning one, to abort the HTTP request(s) triggered by
   * this function's invocation.
   *
   * @example
   *
   * A 5000ms timeout AbortSignal for every request
   *
   * ```js
   * let signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
   * ```
   */
  signal?: ((url: string) => AbortSignal) | AbortSignal

  /**
   * Headers to additionally send with the HTTP request(s) triggered by this function's invocation.
   */
  headers?: [string, string][] | Record<string, string> | Headers

  /**
   * See {@link customFetch}.
   */
  [customFetch]?: (
    /**
     * URL the request is being made sent to {@link !fetch} as the `resource` argument
     */
    url: string,
    /**
     * Options otherwise sent to {@link !fetch} as the `options` argument
     */
    options: CustomFetchOptions<Method, BodyType>,
  ) => Promise<Response>

  /**
   * See {@link allowInsecureRequests}.
   *
   * @deprecated
   */
  [allowInsecureRequests]?: boolean
}

export interface DiscoveryRequestOptions extends HttpRequestOptions<'GET'> {
  /**
   * The issuer transformation algorithm to use.
   */
  algorithm?: 'oidc' | 'oauth2'
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
  const headers = new Headers(input ?? {})

  if (USER_AGENT && !headers.has('user-agent')) {
    headers.set('user-agent', USER_AGENT)
  }

  if (headers.has('authorization')) {
    throw CodedTypeError(
      '"options.headers" must not include the "authorization" header name',
      ERR_INVALID_ARG_VALUE,
    )
  }

  return headers
}

function signal(url: URL, value: HttpRequestOptions<any>['signal']): AbortSignal | undefined {
  if (value !== undefined) {
    if (typeof value === 'function') {
      value = value(url.href)
    }

    if (!(value instanceof AbortSignal)) {
      throw CodedTypeError(
        '"options.signal" must return or be an instance of AbortSignal',
        ERR_INVALID_ARG_TYPE,
      )
    }

    return value
  }

  return undefined
}

function replaceDoubleSlash(pathname: string) {
  if (pathname.includes('//')) {
    return pathname.replace('//', '/')
  }
  return pathname
}

function prependWellKnown(url: URL, wellKnown: string, allowTerminatingSlash = false) {
  if (url.pathname === '/') {
    url.pathname = wellKnown
  } else {
    url.pathname = replaceDoubleSlash(
      `${wellKnown}/${allowTerminatingSlash ? url.pathname : url.pathname.replace(/(\/)$/, '')}`,
    )
  }
  return url
}

function appendWellKnown(url: URL, wellKnown: string) {
  url.pathname = replaceDoubleSlash(`${url.pathname}/${wellKnown}`)
  return url
}

async function performDiscovery(
  input: URL,
  urlName: string,
  transform: (url: URL) => URL,
  options?: HttpRequestOptions<'GET'>,
) {
  if (!(input instanceof URL)) {
    throw CodedTypeError(`"${urlName}" must be an instance of URL`, ERR_INVALID_ARG_TYPE)
  }

  checkProtocol(input, options?.[allowInsecureRequests] !== true)

  const url = transform(new URL(input.href))

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  return (options?.[customFetch] || fetch)(url.href, {
    body: undefined,
    headers: Object.fromEntries(headers.entries()),
    method: 'GET',
    redirect: 'manual',
    signal: signal(url, options?.signal),
  })
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
 * @returns Resolves with a {@link !Response} to then invoke {@link processDiscoveryResponse} with
 *
 * @group Authorization Server Metadata
 * @group OpenID Connect (OIDC) Discovery
 *
 * @see [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)
 * @see [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0-errata2.html#ProviderConfig)
 */
export async function discoveryRequest(
  issuerIdentifier: URL,
  options?: DiscoveryRequestOptions,
): Promise<Response> {
  return performDiscovery(
    issuerIdentifier,
    'issuerIdentifier',
    (url) => {
      switch (options?.algorithm) {
        case undefined: // Fall through
        case 'oidc':
          appendWellKnown(url, '.well-known/openid-configuration')
          break
        case 'oauth2':
          prependWellKnown(url, '.well-known/oauth-authorization-server')
          break
        default:
          throw CodedTypeError(
            '"options.algorithm" must be "oidc" (default), or "oauth2"',
            ERR_INVALID_ARG_VALUE,
          )
      }
      return url
    },
    options,
  )
}

function assertNumber(
  input: unknown,
  allow0: boolean,
  it: string,
  code?: string,
  cause?: unknown,
): asserts input is number {
  try {
    if (typeof input !== 'number' || !Number.isFinite(input)) {
      throw CodedTypeError(`${it} must be a number`, ERR_INVALID_ARG_TYPE, cause)
    }

    if (input > 0) return

    if (allow0) {
      if (input !== 0) {
        throw CodedTypeError(`${it} must be a non-negative number`, ERR_INVALID_ARG_VALUE, cause)
      }
      return
    }

    throw CodedTypeError(`${it} must be a positive number`, ERR_INVALID_ARG_VALUE, cause)
  } catch (err) {
    if (code) {
      throw OPE((err as Error).message, code, cause)
    }

    throw err
  }
}

function assertString(
  input: unknown,
  it: string,
  code?: string,
  cause?: unknown,
): asserts input is string {
  try {
    if (typeof input !== 'string') {
      throw CodedTypeError(`${it} must be a string`, ERR_INVALID_ARG_TYPE, cause)
    }

    if (input.length === 0) {
      throw CodedTypeError(`${it} must not be empty`, ERR_INVALID_ARG_VALUE, cause)
    }
  } catch (err) {
    if (code) {
      throw OPE((err as Error).message, code, cause)
    }

    throw err
  }
}

/**
 * Validates {@link !Response} instance to be one coming from the authorization server's well-known
 * discovery endpoint.
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
 * @see [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0-errata2.html#ProviderConfig)
 */
export async function processDiscoveryResponse(
  expectedIssuerIdentifier: URL,
  response: Response,
): Promise<AuthorizationServer> {
  const expected = expectedIssuerIdentifier as URL | typeof _nodiscoverycheck
  if (!(expected instanceof URL) && expected !== _nodiscoverycheck) {
    throw CodedTypeError(
      '"expectedIssuerIdentifier" must be an instance of URL',
      ERR_INVALID_ARG_TYPE,
    )
  }

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  if (response.status !== 200) {
    throw OPE(
      '"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)',
      RESPONSE_IS_NOT_CONFORM,
      response,
    )
  }

  assertReadableResponse(response)
  const json = await getResponseJsonBody<AuthorizationServer>(response)

  assertString(json.issuer, '"response" body "issuer" property', INVALID_RESPONSE, { body: json })

  if (expected !== _nodiscoverycheck && new URL(json.issuer).href !== expected.href) {
    throw OPE(
      '"response" body "issuer" property does not match the expected value',
      JSON_ATTRIBUTE_COMPARISON,
      { expected: expected.href, body: json, attribute: 'issuer' },
    )
  }

  return json
}

function assertApplicationJson(response: Response): void {
  assertContentType(response, 'application/json')
}

function notJson(response: Response, ...types: string[]) {
  let msg = '"response" content-type must be '
  if (types.length > 2) {
    const last = types.pop()
    msg += `${types.join(', ')}, or ${last}`
  } else if (types.length === 2) {
    msg += `${types[0]} or ${types[1]}`
  } else {
    msg += types[0]
  }
  return OPE(msg, RESPONSE_IS_NOT_JSON, response)
}

function assertContentTypes(response: Response, ...types: string[]): void {
  if (!types.includes(getContentType(response)!)) {
    throw notJson(response, ...types)
  }
}

function assertContentType(response: Response, contentType: string): void {
  if (getContentType(response) !== contentType) {
    throw notJson(response, contentType)
  }
}

/**
 * Generates 32 random bytes and encodes them using base64url.
 */
function randomBytes(): string {
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
export function generateRandomCodeVerifier(): string {
  return randomBytes()
}

/**
 * Generate random `state` value.
 *
 * @group Utilities
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.1)
 */
export function generateRandomState(): string {
  return randomBytes()
}

/**
 * Generate random `nonce` value.
 *
 * @group Utilities
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#IDToken)
 */
export function generateRandomNonce(): string {
  return randomBytes()
}

/**
 * Calculates the PKCE `code_challenge` value to send with an authorization request using the S256
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
export async function calculatePKCECodeChallenge(codeVerifier: string): Promise<string> {
  assertString(codeVerifier, 'codeVerifier')

  return b64u(await crypto.subtle.digest('SHA-256', buf(codeVerifier) as Uint8Array<ArrayBuffer>))
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

  if (input.kid !== undefined) {
    assertString(input.kid, '"kid"')
  }

  return {
    key: input.key,
    kid: input.kid,
  }
}

export interface DPoPRequestOptions {
  /**
   * DPoP handle, obtained from {@link DPoP}
   */
  DPoP?: DPoPHandle
}

export interface PushedAuthorizationRequestOptions
  extends HttpRequestOptions<'POST', URLSearchParams>, DPoPRequestOptions {}

/**
 * Determines an RSASSA-PSS algorithm identifier from CryptoKey instance properties.
 */
function psAlg(key: CryptoKey): string {
  switch ((key.algorithm as RsaHashedKeyAlgorithm).hash.name) {
    case 'SHA-256':
      return 'PS256'
    case 'SHA-384':
      return 'PS384'
    case 'SHA-512':
      return 'PS512'
    default:
      throw new UnsupportedOperationError('unsupported RsaHashedKeyAlgorithm hash name', {
        cause: key,
      })
  }
}

/**
 * Determines an RSASSA-PKCS1-v1_5 algorithm identifier from CryptoKey instance properties.
 */
function rsAlg(key: CryptoKey): string {
  switch ((key.algorithm as RsaHashedKeyAlgorithm).hash.name) {
    case 'SHA-256':
      return 'RS256'
    case 'SHA-384':
      return 'RS384'
    case 'SHA-512':
      return 'RS512'
    default:
      throw new UnsupportedOperationError('unsupported RsaHashedKeyAlgorithm hash name', {
        cause: key,
      })
  }
}

/**
 * Determines an ECDSA algorithm identifier from CryptoKey instance properties.
 */
function esAlg(key: CryptoKey): string {
  switch ((key.algorithm as EcKeyAlgorithm).namedCurve) {
    case 'P-256':
      return 'ES256'
    case 'P-384':
      return 'ES384'
    case 'P-521':
      return 'ES512'
    default:
      throw new UnsupportedOperationError('unsupported EcKeyAlgorithm namedCurve', { cause: key })
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
    case 'Ed25519':
    case 'ML-DSA-44':
    case 'ML-DSA-65':
    case 'ML-DSA-87':
      return key.algorithm.name
    case 'EdDSA':
      return 'Ed25519'
    default:
      throw new UnsupportedOperationError('unsupported CryptoKey algorithm name', { cause: key })
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

function assertAs(as: AuthorizationServer): asserts as is AuthorizationServer {
  if (typeof as !== 'object' || as === null) {
    throw CodedTypeError('"as" must be an object', ERR_INVALID_ARG_TYPE)
  }

  assertString(as.issuer, '"as.issuer"')
}

function assertClient(client: Client): asserts client is Client {
  if (typeof client !== 'object' || client === null) {
    throw CodedTypeError('"client" must be an object', ERR_INVALID_ARG_TYPE)
  }

  assertString(client.client_id, '"client.client_id"')
}

/**
 * The client identifier is encoded using the `application/x-www-form-urlencoded` encoding algorithm
 * per Appendix B, and the encoded value is used as the username; the client password is encoded
 * using the same algorithm and used as the password.
 */
function formUrlEncode(token: string) {
  return encodeURIComponent(token).replace(/(?:[-_.!~*'()]|%20)/g, (substring) => {
    switch (substring) {
      case '-':
      case '_':
      case '.':
      case '!':
      case '~':
      case '*':
      case "'":
      case '(':
      case ')':
        return `%${substring.charCodeAt(0).toString(16).toUpperCase()}`
      case '%20':
        return '+'
      default:
        throw new Error()
    }
  })
}

/**
 * Implementation of the Client's Authentication Method at the Authorization Server.
 *
 * @see {@link ClientSecretPost}
 * @see {@link ClientSecretBasic}
 * @see {@link PrivateKeyJwt}
 * @see {@link None}
 * @see {@link TlsClientAuth}
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 */
export type ClientAuth = (
  as: AuthorizationServer,
  client: Client,
  body: URLSearchParams,
  headers: Headers,
) => void | Promise<void>

/**
 * **`client_secret_post`** uses the HTTP request body to send `client_id` and `client_secret` as
 * `application/x-www-form-urlencoded` body parameters
 *
 * @example
 *
 * ```ts
 * let clientSecret!: string
 *
 * let clientAuth = oauth.ClientSecretPost(clientSecret)
 * ```
 *
 * @param clientSecret
 *
 * @group Client Authentication
 *
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
 */
export function ClientSecretPost(clientSecret: string): ClientAuth {
  assertString(clientSecret, '"clientSecret"')
  return (_as, client, body, _headers) => {
    body.set('client_id', client.client_id)
    body.set('client_secret', clientSecret)
  }
}

/**
 * **`client_secret_basic`** uses the HTTP `Basic` authentication scheme to send `client_id` and
 * `client_secret` in an `Authorization` HTTP Header.
 *
 * @example
 *
 * ```ts
 * let clientSecret!: string
 *
 * let clientAuth = oauth.ClientSecretBasic(clientSecret)
 * ```
 *
 * @param clientSecret
 *
 * @group Client Authentication
 *
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
 */
export function ClientSecretBasic(clientSecret: string): ClientAuth {
  assertString(clientSecret, '"clientSecret"')
  return (_as, client, _body, headers) => {
    const username = formUrlEncode(client.client_id)
    const password = formUrlEncode(clientSecret)
    const credentials = btoa(`${username}:${password}`)
    headers.set('authorization', `Basic ${credentials}`)
  }
}

export interface ModifyAssertionOptions {
  /**
   * Use to modify a JWT assertion payload or header right before it is signed.
   *
   * @see {@link modifyAssertion}
   */
  [modifyAssertion]?: ModifyAssertionFunction
}

function clientAssertionPayload(as: AuthorizationServer, client: Client) {
  const now = epochTime() + getClockSkew(client)
  return {
    jti: randomBytes(),
    aud: as.issuer,
    exp: now + 60,
    iat: now,
    nbf: now,
    iss: client.client_id,
    sub: client.client_id,
  }
}

/**
 * **`private_key_jwt`** uses the HTTP request body to send `client_id`, `client_assertion_type`,
 * and `client_assertion` as `application/x-www-form-urlencoded` body parameters. Digital signature
 * is used for the assertion's authenticity and integrity.
 *
 * @example
 *
 * ```ts
 * let key!: oauth.CryptoKey | oauth.PrivateKey
 *
 * let clientAuth = oauth.PrivateKeyJwt(key)
 * ```
 *
 * @param clientPrivateKey
 *
 * @group Client Authentication
 *
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
 */
export function PrivateKeyJwt(
  clientPrivateKey: CryptoKey | PrivateKey,
  options?: ModifyAssertionOptions,
): ClientAuth {
  const { key, kid } = getKeyAndKid(clientPrivateKey)
  assertPrivateKey(key, '"clientPrivateKey.key"')
  return async (as, client, body, _headers) => {
    const header = { alg: keyToJws(key), kid }
    const payload = clientAssertionPayload(as, client)

    options?.[modifyAssertion]?.(header, payload)

    body.set('client_id', client.client_id)
    body.set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer')
    body.set('client_assertion', await signJwt(header, payload, key))
  }
}

/**
 * **`client_secret_jwt`** uses the HTTP request body to send `client_id`, `client_assertion_type`,
 * and `client_assertion` as `application/x-www-form-urlencoded` body parameters. HMAC is used for
 * the assertion's authenticity and integrity.
 *
 * @example
 *
 * ```ts
 * let clientSecret!: string
 *
 * let clientAuth = oauth.ClientSecretJwt(clientSecret)
 * ```
 *
 * @param clientSecret
 * @param options
 *
 * @group Client Authentication
 *
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
 */
export function ClientSecretJwt(
  clientSecret: string,
  options?: ModifyAssertionOptions,
): ClientAuth {
  assertString(clientSecret, '"clientSecret"')
  const modify = options?.[modifyAssertion]
  let key: CryptoKey
  return async (as, client, body, _headers) => {
    key ||= await crypto.subtle.importKey(
      'raw',
      buf(clientSecret) as Uint8Array<ArrayBuffer>,
      { hash: 'SHA-256', name: 'HMAC' },
      false,
      ['sign'],
    )

    const header = { alg: 'HS256' }
    const payload = clientAssertionPayload(as, client)

    modify?.(header, payload)

    const data = `${b64u(buf(JSON.stringify(header)))}.${b64u(buf(JSON.stringify(payload)))}`
    const hmac = await crypto.subtle.sign(key.algorithm, key, buf(data) as Uint8Array<ArrayBuffer>)

    body.set('client_id', client.client_id)
    body.set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer')
    body.set('client_assertion', `${data}.${b64u(new Uint8Array(hmac))}`)
  }
}

/**
 * **`none`** (public client) uses the HTTP request body to send only `client_id` as
 * `application/x-www-form-urlencoded` body parameter.
 *
 * ```ts
 * let clientAuth = oauth.None()
 * ```
 *
 * @group Client Authentication
 *
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
 */
export function None(): ClientAuth {
  return (_as, client, body, _headers) => {
    body.set('client_id', client.client_id)
  }
}

/**
 * **`tls_client_auth`** uses the HTTP request body to send only `client_id` as
 * `application/x-www-form-urlencoded` body parameter and the mTLS key and certificate is configured
 * through {@link customFetch}.
 *
 * ```ts
 * let clientAuth = oauth.TlsClientAuth()
 * ```
 *
 * @group Client Authentication
 *
 * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 * @see [RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication (PKI Mutual-TLS Method)](https://www.rfc-editor.org/rfc/rfc8705.html#name-pki-mutual-tls-method)
 */
export function TlsClientAuth(): ClientAuth {
  return None()
}

/**
 * Minimal JWT sign() implementation.
 */
async function signJwt(
  header: CompactJWSHeaderParameters,
  payload: Record<string, unknown>,
  key: CryptoKey,
) {
  if (!key.usages.includes('sign')) {
    throw CodedTypeError(
      'CryptoKey instances used for signing assertions must include "sign" in their "usages"',
      ERR_INVALID_ARG_VALUE,
    )
  }
  const input = `${b64u(buf(JSON.stringify(header)))}.${b64u(buf(JSON.stringify(payload)))}`
  const signature = b64u(
    await crypto.subtle.sign(keyToSubtle(key), key, buf(input) as Uint8Array<ArrayBuffer>),
  )
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
  options?: ModifyAssertionOptions,
): Promise<string> {
  assertAs(as)
  assertClient(client)

  parameters = new URLSearchParams(parameters)

  const { key, kid } = getKeyAndKid(privateKey)
  assertPrivateKey(key, '"privateKey.key"')

  parameters.set('client_id', client.client_id)

  const now = epochTime() + getClockSkew(client)
  const claims: Record<string, JsonValue> = {
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

      assertNumber(claims.max_age, true, '"max_age" parameter')
    }
  }

  {
    let value = parameters.get('claims')
    if (value !== null) {
      try {
        claims.claims = JSON.parse(value)
      } catch (cause) {
        throw OPE('failed to parse the "claims" parameter as JSON', PARSE_ERROR, cause)
      }

      if (!isJsonObject(claims.claims)) {
        throw CodedTypeError(
          '"claims" parameter must be a JSON with a top level object',
          ERR_INVALID_ARG_VALUE,
        )
      }
    }
  }

  {
    let value = parameters.get('authorization_details')
    if (value !== null) {
      try {
        claims.authorization_details = JSON.parse(value)
      } catch (cause) {
        throw OPE(
          'failed to parse the "authorization_details" parameter as JSON',
          PARSE_ERROR,
          cause,
        )
      }

      if (!Array.isArray(claims.authorization_details)) {
        throw CodedTypeError(
          '"authorization_details" parameter must be a JSON with a top level array',
          ERR_INVALID_ARG_VALUE,
        )
      }
    }
  }

  const header = {
    alg: keyToJws(key),
    typ: 'oauth-authz-req+jwt',
    kid,
  }

  options?.[modifyAssertion]?.(header, claims)

  return signJwt(header, claims, key)
}

let jwkCache: WeakMap<CryptoKey, JWK>

async function getSetPublicJwkCache(key: CryptoKey, alg: string) {
  // @ts-expect-error TS doesn't know about the OKP pub yet
  const { kty, e, n, x, y, crv, pub } = await crypto.subtle.exportKey('jwk', key)
  const jwk: JWK & { alg?: string } = { kty, e, n, x, y, crv, pub }
  if (kty === 'AKP') jwk.alg = alg
  jwkCache.set(key, jwk)
  return jwk
}

/**
 * Exports an asymmetric crypto key as bare JWK
 */
async function publicJwk(key: CryptoKey, alg: string) {
  jwkCache ||= new WeakMap()
  return jwkCache.get(key) || getSetPublicJwkCache(key, alg)
}

// @ts-ignore
const URLParse: (url: string | URL, base?: string | URL) => URL | null = URL.parse
  ? // @ts-ignore
    (url, base) => URL.parse(url, base)
  : (url, base) => {
      try {
        return new URL(url, base)
      } catch {
        return null
      }
    }

/**
 * @ignore
 */
export function checkProtocol(url: URL, enforceHttps: boolean | undefined) {
  if (enforceHttps && url.protocol !== 'https:') {
    throw OPE('only requests to HTTPS are allowed', HTTP_REQUEST_FORBIDDEN, url)
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw OPE('only HTTP and HTTPS requests are allowed', REQUEST_PROTOCOL_FORBIDDEN, url)
  }
}

function validateEndpoint(
  value: unknown,
  endpoint: keyof AuthorizationServer,
  useMtlsAlias: boolean | undefined,
  enforceHttps: boolean | undefined,
) {
  let url: URL | null
  if (typeof value !== 'string' || !(url = URLParse(value))) {
    throw OPE(
      `authorization server metadata does not contain a valid ${useMtlsAlias ? `"as.mtls_endpoint_aliases.${endpoint}"` : `"as.${endpoint}"`}`,
      value === undefined ? MISSING_SERVER_METADATA : INVALID_SERVER_METADATA,
      { attribute: useMtlsAlias ? `mtls_endpoint_aliases.${endpoint}` : endpoint },
    )
  }

  checkProtocol(url, enforceHttps)

  return url
}

/**
 * This is not part of the public API.
 *
 * @private
 *
 * @ignore
 *
 * @internal
 */
export function resolveEndpoint(
  as: AuthorizationServer,
  endpoint: keyof AuthorizationServer,
  useMtlsAlias: boolean | undefined,
  enforceHttps: boolean | undefined,
): URL {
  if (useMtlsAlias && as.mtls_endpoint_aliases && endpoint in as.mtls_endpoint_aliases) {
    return validateEndpoint(
      as.mtls_endpoint_aliases[endpoint],
      endpoint,
      useMtlsAlias,
      enforceHttps,
    )
  }

  return validateEndpoint(as[endpoint], endpoint, useMtlsAlias, enforceHttps)
}

/**
 * Performs a Pushed Authorization Request at the
 * {@link AuthorizationServer.pushed_authorization_request_endpoint `as.pushed_authorization_request_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param parameters Authorization Request parameters.
 *
 * @returns Resolves with a {@link !Response} to then invoke
 *   {@link processPushedAuthorizationResponse} with
 *
 * @group Pushed Authorization Requests (PAR)
 *
 * @see [RFC 9126 - OAuth 2.0 Pushed Authorization Requests (PAR)](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-with-pushed-authorizat)
 */
export async function pushedAuthorizationRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: PushedAuthorizationRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  const url = resolveEndpoint(
    as,
    'pushed_authorization_request_endpoint',
    client.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  const body = new URLSearchParams(parameters)
  body.set('client_id', client.client_id)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  if (options?.DPoP !== undefined) {
    assertDPoP(options.DPoP)
    await options.DPoP.addProof(url, headers, 'POST')
  }

  const response = await authenticatedRequest(
    as,
    client,
    clientAuthentication,
    url,
    body,
    headers,
    options,
  )
  options?.DPoP?.cacheNonce(response, url)
  return response
}

/**
 * DPoP handle, obtained from {@link DPoP}
 */
export interface DPoPHandle {
  /**
   * This is not part of the public API.
   *
   * @private
   *
   * @ignore
   *
   * @internal
   */
  addProof(url: URL, headers: Headers, htm: string, accessToken?: string): Promise<void>
  /**
   * This is not part of the public API.
   *
   * @private
   *
   * @ignore
   *
   * @internal
   */
  cacheNonce(response: Response, url: URL): void
  /**
   * Calculates the JWK Thumbprint of the DPoP public key using the SHA-256 hash function for use as
   * the optional `dpop_jkt` authorization request parameter.
   *
   * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-authorization-code-binding-)
   */
  calculateThumbprint(): Promise<string>
}

class DPoPHandler implements DPoPHandle {
  #header?: CompactJWSHeaderParameters
  #privateKey: CryptoKey
  #publicKey: CryptoKey
  #clockSkew: number
  #modifyAssertion?: ModifyAssertionFunction
  #map?: Map<string, string>
  #jkt?: string

  constructor(
    client: Pick<Client, typeof clockSkew>,
    keyPair: CryptoKeyPair,
    options?: ModifyAssertionOptions,
  ) {
    assertPrivateKey(keyPair?.privateKey, '"DPoP.privateKey"')
    assertPublicKey(keyPair?.publicKey, '"DPoP.publicKey"')

    if (!keyPair.publicKey.extractable) {
      throw CodedTypeError('"DPoP.publicKey.extractable" must be true', ERR_INVALID_ARG_VALUE)
    }

    this.#modifyAssertion = options?.[modifyAssertion]
    this.#clockSkew = getClockSkew(client)
    this.#privateKey = keyPair.privateKey
    this.#publicKey = keyPair.publicKey
    branded.add(this)
  }

  #get(key: string) {
    this.#map ||= new Map()
    let item = this.#map.get(key)
    if (item) {
      this.#map.delete(key)
      this.#map.set(key, item)
    }
    return item
  }

  #set(key: string, val: string) {
    this.#map ||= new Map()
    this.#map.delete(key)
    if (this.#map.size === 100) {
      this.#map.delete(this.#map.keys().next().value!)
    }
    this.#map.set(key, val)
  }

  async calculateThumbprint() {
    if (!this.#jkt) {
      const jwk = await crypto.subtle.exportKey('jwk', this.#publicKey)
      this.#jkt ||= await calculateJwkThumbprint(jwk as JWK)
    }

    return this.#jkt
  }

  async addProof(url: URL, headers: Headers, htm: string, accessToken?: string): Promise<void> {
    const alg = keyToJws(this.#privateKey)
    this.#header ||= {
      alg,
      typ: 'dpop+jwt',
      jwk: await publicJwk(this.#publicKey, alg),
    }

    const nonce = this.#get(url.origin)

    const now = epochTime() + this.#clockSkew
    const payload = {
      iat: now,
      jti: randomBytes(),
      htm,
      nonce,
      htu: `${url.origin}${url.pathname}`,
      ath: accessToken
        ? b64u(await crypto.subtle.digest('SHA-256', buf(accessToken) as Uint8Array<ArrayBuffer>))
        : undefined,
    }

    this.#modifyAssertion?.(this.#header, payload)

    headers.set('dpop', await signJwt(this.#header, payload, this.#privateKey))
  }

  cacheNonce(response: Response, url: URL): void {
    try {
      const nonce = response.headers.get('dpop-nonce')
      if (nonce) {
        this.#set(url.origin, nonce)
      }
    } catch {}
  }
}

/**
 * Used to determine if a rejected error indicates the need to retry the request due to an
 * expired/missing nonce.
 *
 * @group DPoP
 */
export function isDPoPNonceError(err: unknown): boolean {
  if (err instanceof WWWAuthenticateChallengeError) {
    const { 0: challenge, length } = err.cause
    return (
      length === 1 && challenge.scheme === 'dpop' && challenge.parameters.error === 'use_dpop_nonce'
    )
  }

  if (err instanceof ResponseBodyError) {
    return err.error === 'use_dpop_nonce'
  }

  return false
}

/**
 * Returns a wrapper / handle around a {@link CryptoKeyPair} that is used for negotiating and proving
 * proof-of-possession to sender-constrain OAuth 2.0 tokens via DPoP at the Authorization Server and
 * Resource Server.
 *
 * This wrapper / handle also keeps track of server-issued nonces, allowing requests to be retried
 * with a fresh nonce when the server indicates the need to use one. {@link isDPoPNonceError} can be
 * used to determine if a rejected error indicates the need to retry the request due to an
 * expired/missing nonce.
 *
 * @example
 *
 * ```ts
 * let client!: oauth.Client
 * let keyPair!: oauth.CryptoKeyPair
 *
 * let DPoP = oauth.DPoP(client, keyPair)
 * ```
 *
 * @param keyPair Public/private key pair to sign the DPoP Proof JWT with
 *
 * @group DPoP
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9449.html RFC 9449 - OAuth 2.0 Demonstrating Proof of Possession (DPoP)}
 */
export function DPoP(
  client: Pick<Client, typeof clockSkew>,
  keyPair: CryptoKeyPair,
  options?: ModifyAssertionOptions,
): DPoPHandle {
  return new DPoPHandler(client, keyPair, options)
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
 * Throw when a server responds with an "OAuth-style" error JSON body
 *
 * @example
 *
 * ```http
 * HTTP/1.1 400 Bad Request
 * Content-Type: application/json;charset=UTF-8
 * Cache-Control: no-store
 * Pragma: no-cache
 *
 * {
 *   "error": "invalid_request"
 * }
 * ```
 *
 * @group Errors
 */
export class ResponseBodyError extends Error {
  /**
   * The parsed JSON response body
   */
  override cause: Record<string, JsonValue | undefined>

  code: typeof RESPONSE_BODY_ERROR

  /**
   * Error code given in the JSON response
   */
  error: string

  /**
   * HTTP Status Code of the response
   */
  status: number

  /**
   * Human-readable text providing additional information, used to assist the developer in
   * understanding the error that occurred, given in the JSON response
   */
  error_description?: string

  /**
   * The "OAuth-style" error {@link !Response}, its {@link !Response.bodyUsed} is `true` and the JSON
   * body is available in {@link ResponseBodyError.cause}
   */
  response!: Response

  /**
   * @ignore
   */
  constructor(
    message: string,
    options: {
      cause: OAuth2Error
      response: Response
    },
  ) {
    super(message, options)
    this.name = this.constructor.name
    this.code = RESPONSE_BODY_ERROR
    this.cause = options.cause
    this.error = options.cause.error
    this.status = options.response.status
    this.error_description = options.cause.error_description
    Object.defineProperty(this, 'response', { enumerable: false, value: options.response })

    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

/**
 * Thrown when OAuth 2.0 Authorization Error Response is encountered.
 *
 * @example
 *
 * ```http
 * HTTP/1.1 302 Found
 * Location: https://client.example.com/cb?error=access_denied&state=xyz
 * ```
 *
 * @group Errors
 */
export class AuthorizationResponseError extends Error {
  /**
   * Authorization Response parameters as {@link !URLSearchParams}
   */
  override cause: URLSearchParams

  code: typeof AUTHORIZATION_RESPONSE_ERROR

  /**
   * Error code given in the Authorization Response
   */
  error: string

  /**
   * Human-readable text providing additional information, used to assist the developer in
   * understanding the error that occurred, given in the Authorization Response
   */
  error_description?: string

  /**
   * @ignore
   */
  constructor(
    message: string,
    options: {
      cause: URLSearchParams
    },
  ) {
    super(message, options)
    this.name = this.constructor.name
    this.code = AUTHORIZATION_RESPONSE_ERROR
    this.cause = options.cause
    this.error = options.cause.get('error')!
    this.error_description = options.cause.get('error_description') ?? undefined

    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

/**
 * Thrown when a server responds with a parseable WWW-Authenticate challenges, typically because of
 * expired tokens, or bad client authentication
 *
 * @example
 *
 * ```http
 * HTTP/1.1 401 Unauthorized
 * WWW-Authenticate: Bearer error="invalid_token", error_description="The access token expired"
 * ```
 *
 * @group Errors
 */
export class WWWAuthenticateChallengeError extends Error {
  /**
   * The parsed WWW-Authenticate HTTP Header challenges
   */
  override cause: WWWAuthenticateChallenge[]

  code: typeof WWW_AUTHENTICATE_CHALLENGE

  /**
   * The {@link !Response} that included a WWW-Authenticate HTTP Header challenges, its
   * {@link !Response.bodyUsed} is `false`
   */
  response: Response

  /**
   * HTTP Status Code of the response
   */
  status: number

  /**
   * @ignore
   */
  constructor(message: string, options: { cause: WWWAuthenticateChallenge[]; response: Response }) {
    super(message, options)
    this.name = this.constructor.name
    this.code = WWW_AUTHENTICATE_CHALLENGE
    this.cause = options.cause
    this.status = options.response.status
    this.response = options.response
    Object.defineProperty(this, 'response', { enumerable: false })

    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

/**
 * WWW-Authenticate challenge auth-param dictionary with known and unknown parameter names
 */
export interface WWWAuthenticateChallengeParameters {
  /**
   * Identifies the protection space
   */
  readonly realm?: string
  /**
   * A machine-readable error code value
   */
  readonly error?: string
  /**
   * Human-readable ASCII text providing additional information, used to assist the client developer
   * in understanding the error that occurred
   */
  readonly error_description?: string
  /**
   * A URI identifying a human-readable web page with information about the error, used to provide
   * the client developer with additional information about the error
   */
  readonly error_uri?: string
  /**
   * A space-delimited list of supported algorithms, used in
   * {@link https://www.rfc-editor.org/rfc/rfc9449.html RFC 9449 - OAuth 2.0 Demonstrating Proof of Possession (DPoP)}
   * challenges
   */
  readonly algs?: string
  /**
   * The scope necessary to access the protected resource, used with `insufficient_scope` error code
   */
  readonly scope?: string
  /**
   * The URL of the protected resource metadata
   */
  readonly resource_metadata?: string

  /**
   * > [!NOTE]\
   * > Because the parameter names are case insensitive they are always returned lowercased
   */
  readonly [parameter: Lowercase<string>]: string | undefined
}

/**
 * Parsed WWW-Authenticate challenge
 */
export interface WWWAuthenticateChallenge {
  /**
   * Parsed WWW-Authenticate challenge auth-scheme
   *
   * > [!NOTE]\
   * > Because the value is case insensitive it is always returned lowercased
   */
  readonly scheme: Lowercase<string>
  /**
   * Parsed WWW-Authenticate challenge auth-param dictionary (always present but may be empty, e.g.
   * when {@link WWWAuthenticateChallenge.token68 token68} is present, or when no auth-param pairs
   * were provided)
   */
  readonly parameters: WWWAuthenticateChallengeParameters
  /**
   * Parsed WWW-Authenticate challenge token68
   */
  readonly token68?: string
}

const tokenMatch = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+"
const token68Match = '[a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2}'
const quotedMatch = '"((?:[^"\\\\]|\\\\[\\s\\S])*)"'

const quotedParamMatcher = '(' + tokenMatch + ')\\s*=\\s*' + quotedMatch
const paramMatcher = '(' + tokenMatch + ')\\s*=\\s*(' + tokenMatch + ')'

const schemeRE = new RegExp('^[,\\s]*(' + tokenMatch + ')')
const quotedParamRE = new RegExp('^[,\\s]*' + quotedParamMatcher + '[,\\s]*(.*)')
const unquotedParamRE = new RegExp('^[,\\s]*' + paramMatcher + '[,\\s]*(.*)')
const token68ParamRE = new RegExp('^(' + token68Match + ')(?:$|[,\\s])(.*)')

function parseWwwAuthenticateChallenges(
  response: Response,
): WWWAuthenticateChallenge[] | undefined {
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  const header = response.headers.get('www-authenticate')
  if (header === null) {
    return undefined
  }

  const challenges: WWWAuthenticateChallenge[] = []

  let rest: string | undefined = header
  while (rest) {
    let match: RegExpMatchArray | null = rest.match(schemeRE)
    const scheme = match?.['1'].toLowerCase() as Lowercase<string>
    if (!scheme) {
      return undefined
    }

    // Calculate remainder after scheme
    const afterScheme = rest.substring(match![0].length)
    if (afterScheme && !afterScheme.match(/^[\s,]/)) {
      // Invalid: scheme must be followed by space, comma, or end
      return undefined
    }
    // Check if there's a space after scheme (indicating parameters may follow)
    const spaceMatch = afterScheme.match(/^\s+(.*)$/)
    const hasParameters = !!spaceMatch
    rest = spaceMatch ? spaceMatch[1] : undefined

    const parameters: WWWAuthenticateChallenge['parameters'] = {}
    let token68: string | undefined

    if (hasParameters) {
      while (rest) {
        let key: string
        let value: string
        if ((match = rest.match(quotedParamRE))) {
          ;[, key, value, rest] = match
          if (value.includes('\\')) {
            try {
              value = JSON.parse(`"${value}"`)
            } catch {}
          }
          // @ts-expect-error
          parameters[key.toLowerCase() as Lowercase<string>] = value
          continue
        }

        if ((match = rest.match(unquotedParamRE))) {
          ;[, key, value, rest] = match
          // @ts-expect-error
          parameters[key.toLowerCase() as Lowercase<string>] = value
          continue
        }

        if ((match = rest.match(token68ParamRE))) {
          if (Object.keys(parameters).length) {
            break
          }
          ;[, token68, rest] = match
          break
        }

        return undefined
      }
    } else {
      // No space after scheme - set rest to the comma-prefixed remainder for next iteration
      rest = afterScheme || undefined
    }

    const challenge: WWWAuthenticateChallenge = { scheme, parameters }
    if (token68) {
      // @ts-expect-error
      challenge.token68 = token68
    }
    challenges.push(challenge)
  }

  if (!challenges.length) {
    return undefined
  }

  return challenges
}

/**
 * Validates {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.pushed_authorization_request_endpoint `as.pushed_authorization_request_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link pushedAuthorizationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Pushed Authorization Requests (PAR)
 *
 * @see [RFC 9126 - OAuth 2.0 Pushed Authorization Requests (PAR)](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)
 */
export async function processPushedAuthorizationResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<PushedAuthorizationResponse> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  await checkOAuthBodyError(response, 201, 'Pushed Authorization Request Endpoint')

  assertReadableResponse(response)
  const json = await getResponseJsonBody<Writeable<PushedAuthorizationResponse>>(response)

  assertString(json.request_uri, '"response" body "request_uri" property', INVALID_RESPONSE, {
    body: json,
  })

  let expiresIn: unknown =
    typeof json.expires_in !== 'number' ? parseFloat(json.expires_in) : json.expires_in
  assertNumber(expiresIn, true, '"response" body "expires_in" property', INVALID_RESPONSE, {
    body: json,
  })
  json.expires_in = expiresIn

  return json
}

export type ProtectedResourceRequestBody =
  | ArrayBuffer
  | null
  | ReadableStream
  | string
  | Uint8Array
  | undefined
  | URLSearchParams

export interface ProtectedResourceRequestOptions
  extends
    Omit<HttpRequestOptions<string, ProtectedResourceRequestBody>, 'headers'>,
    DPoPRequestOptions {}

async function parseOAuthResponseErrorBody(response: Response): Promise<OAuth2Error | undefined> {
  if (response.status > 399 && response.status < 500) {
    assertReadableResponse(response)
    assertApplicationJson(response)
    try {
      const json: JsonValue = await response.clone().json()
      if (isJsonObject<OAuth2Error>(json) && typeof json.error === 'string' && json.error.length) {
        return json
      }
    } catch {}
  }
  return undefined
}

async function checkOAuthBodyError(response: Response, expected: number, label: string) {
  if (response.status !== expected) {
    checkAuthenticationChallenges(response)

    let err: OAuth2Error | undefined
    if ((err = await parseOAuthResponseErrorBody(response))) {
      await response.body?.cancel()
      throw new ResponseBodyError('server responded with an error in the response body', {
        cause: err,
        response,
      })
    }
    throw OPE(
      `"response" is not a conform ${label} response (unexpected HTTP status code)`,
      RESPONSE_IS_NOT_CONFORM,
      response,
    )
  }
}

function assertDPoP(option: DPoPHandle): asserts option is DPoPHandler {
  if (!branded.has(option)) {
    throw CodedTypeError('"options.DPoP" is not a valid DPoPHandle', ERR_INVALID_ARG_VALUE)
  }
}

async function resourceRequest(
  accessToken: string,
  method: string,
  url: URL,
  headers?: Headers,
  body?: ProtectedResourceRequestBody,
  options?: ProtectedResourceRequestOptions,
): Promise<Response> {
  assertString(accessToken, '"accessToken"')

  if (!(url instanceof URL)) {
    throw CodedTypeError('"url" must be an instance of URL', ERR_INVALID_ARG_TYPE)
  }

  checkProtocol(url, options?.[allowInsecureRequests] !== true)

  headers = prepareHeaders(headers)

  if (options?.DPoP) {
    assertDPoP(options.DPoP)
    await options.DPoP.addProof(url, headers, method.toUpperCase(), accessToken)
  }

  headers.set('authorization', `${headers.has('dpop') ? 'DPoP' : 'Bearer'} ${accessToken}`)

  const response = await (options?.[customFetch] || fetch)(url.href, {
    // @ts-ignore
    body,
    headers: Object.fromEntries(headers.entries()),
    method,
    redirect: 'manual',
    signal: signal(url, options?.signal),
  })
  options?.DPoP?.cacheNonce(response, url)
  return response
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
 * @returns Resolves with a {@link !Response} instance. WWW-Authenticate HTTP Header challenges are
 *   rejected with {@link WWWAuthenticateChallengeError}.
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
  body?: ProtectedResourceRequestBody,
  options?: ProtectedResourceRequestOptions,
): Promise<Response> {
  const response = await resourceRequest(accessToken, method, url, headers, body, options)
  checkAuthenticationChallenges(response)
  return response
}

export interface UserInfoRequestOptions extends HttpRequestOptions<'GET'>, DPoPRequestOptions {}

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
 * @returns Resolves with a {@link !Response} to then invoke {@link processUserInfoResponse} with
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group OpenID Connect (OIDC) UserInfo
 * @group Accessing Protected Resources
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#UserInfo)
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

  const url = resolveEndpoint(
    as,
    'userinfo_endpoint',
    client.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  const headers = prepareHeaders(options?.headers)
  if (client.userinfo_signed_response_alg) {
    headers.set('accept', 'application/jwt')
  } else {
    headers.set('accept', 'application/json')
    headers.append('accept', 'application/jwt')
  }

  return resourceRequest(accessToken, 'GET', url, headers, null, {
    ...options,
    [clockSkew]: getClockSkew(client),
  } as ProtectedResourceRequestOptions)
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

let jwksMap: WeakMap<AuthorizationServer, ExportedJWKSCache & { age: number }>

export interface ExportedJWKSCache {
  jwks: JWKS
  uat: number
}

export type JWKSCacheInput = ExportedJWKSCache | Record<string, never>

function setJwksCache(
  as: AuthorizationServer,
  jwks: JWKS,
  uat: number,
  cache?: JWKSCacheInput,
): undefined {
  jwksMap ||= new WeakMap()
  jwksMap.set(as, {
    jwks,
    uat,
    get age() {
      return epochTime() - this.uat
    },
  })

  if (cache) {
    Object.assign(cache, { jwks: structuredClone(jwks), uat })
  }
}

function isFreshJwksCache(input: unknown): input is ExportedJWKSCache {
  if (typeof input !== 'object' || input === null) {
    return false
  }

  if (!('uat' in input) || typeof input.uat !== 'number' || epochTime() - input.uat >= 300) {
    return false
  }

  if (
    !('jwks' in input) ||
    !isJsonObject(input.jwks) ||
    !Array.isArray(input.jwks.keys) ||
    !Array.prototype.every.call(input.jwks.keys, isJsonObject)
  ) {
    return false
  }

  return true
}

function clearJwksCache(as: AuthorizationServer, cache?: Partial<JWKSCacheInput>) {
  jwksMap?.delete(as)
  delete cache?.jwks
  delete cache?.uat
}

async function getPublicSigKeyFromIssuerJwksUri(
  as: AuthorizationServer,
  options: (HttpRequestOptions<'GET'> & JWKSCacheOptions) | undefined,
  header: CompactJWSHeaderParameters,
): Promise<CryptoKey> {
  const { alg, kid } = header
  checkSupportedJwsAlg(header)

  if (!jwksMap?.has(as) && isFreshJwksCache(options?.[jwksCache])) {
    setJwksCache(as, options?.[jwksCache].jwks, options?.[jwksCache].uat)
  }

  let jwks: JWKS
  let age: number

  if (jwksMap?.has(as)) {
    ;({ jwks, age } = jwksMap.get(as)!)
    if (age >= 300) {
      // force a re-fetch every 5 minutes
      clearJwksCache(as, options?.[jwksCache])
      return getPublicSigKeyFromIssuerJwksUri(as, options, header)
    }
  } else {
    jwks = await jwksRequest(as, options).then(processJwksResponse)
    age = 0
    setJwksCache(as, jwks, epochTime(), options?.[jwksCache])
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
    case 'ML':
      kty = 'AKP'
      break
    default:
      throw new UnsupportedOperationError('unsupported JWS algorithm', { cause: { alg } })
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
      case alg === 'Ed25519' && jwk.crv !== 'Ed25519': // Fall through
      case alg === 'EdDSA' && jwk.crv !== 'Ed25519': // Fall through
        return false
    }

    return true
  })

  const { 0: jwk, length } = candidates

  if (!length) {
    if (age >= 60) {
      // allow re-fetch if cache is at least 1 minute old
      clearJwksCache(as, options?.[jwksCache])
      return getPublicSigKeyFromIssuerJwksUri(as, options, header)
    }
    throw OPE(
      'error when selecting a JWT verification key, no applicable keys found',
      KEY_SELECTION,
      { header, candidates, jwks_uri: new URL(as.jwks_uri!) },
    )
  }

  if (length !== 1) {
    throw OPE(
      'error when selecting a JWT verification key, multiple applicable keys found, a "kid" JWT Header Parameter is required',
      KEY_SELECTION,
      { header, candidates, jwks_uri: new URL(as.jwks_uri!) },
    )
  }

  return importJwk(alg, jwk)
}

/**
 * > [!WARNING]\
 * > This option has security implications that must be understood, assessed for applicability, and
 * > accepted before use.
 *
 * Use this as a value to {@link processUserInfoResponse} `expectedSubject` parameter to skip the
 * `sub` claim value check.
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#UserInfoResponse)
 */
export const skipSubjectCheck: unique symbol = Symbol()

/**
 * This is not part of the public API.
 *
 * @private
 *
 * @ignore
 *
 * @internal
 */
export function getContentType(input: Response | Request): string | undefined {
  return input.headers.get('content-type')?.split(';')[0]
}

export interface JWEDecryptOptions {
  /**
   * See {@link jweDecrypt}.
   */
  [jweDecrypt]?: JweDecryptFunction
}

/**
 * A record of custom `token_type` handlers for processing non-standard token types in OAuth 2.0
 * token endpoint responses.
 *
 * This allows extending the library to support non-standard token types returned by the
 * authorization server's token endpoint with optional specific processing.
 *
 * By default, this library recognizes and handles `bearer` and `dpop` token types. When a token
 * endpoint response contains a different `token_type` value, you can provide custom handlers to
 * process these tokens appropriately. Token types other than `bearer`, `dpop`, and ones represented
 * in this record will be rejected as per https://www.rfc-editor.org/rfc/rfc6749.html#section-7.1
 *
 * @example
 *
 * Allow a custom `mac` token type
 *
 * ```ts
 * let recognizedTokenTypes: oauth.RecognizedTokenTypes = {
 *   mac: () => {},
 * }
 * ```
 *
 * @example
 *
 * Allow a custom `mac` token type with additional constraints put on the token endpoint JSON
 * response
 *
 * ```ts
 * let recognizedTokenTypes: oauth.RecognizedTokenTypes = {
 *   mac: (response: Response, tokenResponse: oauth.TokenEndpointResponse) => {
 *     if (typeof tokenResponse.id !== 'string') {
 *       throw new oauth.UnsupportedOperationError('invalid "mac" token_type', {
 *         cause: { body: tokenResponse },
 *       })
 *     }
 *   },
 * }
 * ```
 *
 * > [!NOTE]\
 * > Token type names are case insensitive and will be normalized to lowercase before lookup.
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-7.1)
 */
export type RecognizedTokenTypes = Record<
  Lowercase<string>,
  (res: Response, body: TokenEndpointResponse) => void
>

export interface ProcessTokenResponseOptions extends JWEDecryptOptions {
  /**
   * See {@link RecognizedTokenTypes}.
   */
  recognizedTokenTypes?: RecognizedTokenTypes
}

/**
 * Validates {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.userinfo_endpoint `as.userinfo_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param expectedSubject Expected `sub` claim value. In response to OpenID Connect authentication
 *   requests, the expected subject is the one from the ID Token claims retrieved from
 *   {@link getValidatedIdTokenClaims}.
 * @param response Resolved value from {@link userInfoRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. WWW-Authenticate
 *   HTTP Header challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group OpenID Connect (OIDC) UserInfo
 * @group Accessing Protected Resources
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#UserInfo)
 */
export async function processUserInfoResponse(
  as: AuthorizationServer,
  client: Client,
  expectedSubject: string | typeof skipSubjectCheck,
  response: Response,
  options?: JWEDecryptOptions,
): Promise<UserInfoResponse> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  checkAuthenticationChallenges(response)

  if (response.status !== 200) {
    throw OPE(
      '"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)',
      RESPONSE_IS_NOT_CONFORM,
      response,
    )
  }

  assertReadableResponse(response)

  let json: JsonObject
  if (getContentType(response) === 'application/jwt') {
    const { claims, jwt } = await validateJwt(
      await response.text(),
      checkSigningAlgorithm.bind(
        undefined,
        client.userinfo_signed_response_alg,
        as.userinfo_signing_alg_values_supported,
        undefined,
      ),
      getClockSkew(client),
      getClockTolerance(client),
      options?.[jweDecrypt],
    )
      .then(validateOptionalAudience.bind(undefined, client.client_id))
      .then(validateOptionalIssuer.bind(undefined, as))

    jwtRefs.set(response, jwt)
    json = claims
  } else {
    if (client.userinfo_signed_response_alg) {
      throw OPE('JWT UserInfo Response expected', JWT_USERINFO_EXPECTED, response)
    }
    json = await getResponseJsonBody(response)
  }

  assertString(json.sub, '"response" body "sub" property', INVALID_RESPONSE, { body: json })

  switch (expectedSubject) {
    case skipSubjectCheck:
      break
    default:
      assertString(expectedSubject, '"expectedSubject"')

      if (json.sub !== expectedSubject) {
        throw OPE('unexpected "response" body "sub" property value', JSON_ATTRIBUTE_COMPARISON, {
          expected: expectedSubject,
          body: json,
          attribute: 'sub',
        })
      }
  }

  return json as UserInfoResponse
}

async function authenticatedRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  url: URL,
  body: URLSearchParams,
  headers: Headers,
  options?: Omit<HttpRequestOptions<'POST', URLSearchParams>, 'headers'>,
) {
  await clientAuthentication(as, client, body, headers)
  headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')

  return (options?.[customFetch] || fetch)(url.href, {
    body,
    headers: Object.fromEntries(headers.entries()),
    method: 'POST',
    redirect: 'manual',
    signal: signal(url, options?.signal),
  })
}

export interface TokenEndpointRequestOptions
  extends HttpRequestOptions<'POST', URLSearchParams>, DPoPRequestOptions {
  /**
   * Any additional parameters to send. This cannot override existing parameter values.
   */
  additionalParameters?: URLSearchParams | Record<string, string> | string[][]
}

async function tokenEndpointRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  grantType: string,
  parameters: URLSearchParams,
  options?: Omit<TokenEndpointRequestOptions, 'additionalParameters'>,
): Promise<Response> {
  const url = resolveEndpoint(
    as,
    'token_endpoint',
    client.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  parameters.set('grant_type', grantType)
  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  if (options?.DPoP !== undefined) {
    assertDPoP(options.DPoP)
    await options.DPoP.addProof(url, headers, 'POST')
  }

  const response = await authenticatedRequest(
    as,
    client,
    clientAuthentication,
    url,
    parameters,
    headers,
    options,
  )
  options?.DPoP?.cacheNonce(response, url)
  return response
}

/**
 * Performs a Refresh Token Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param refreshToken Refresh Token value.
 *
 * @returns Resolves with a {@link !Response} to then invoke {@link processRefreshTokenResponse} with
 *
 * @group Refreshing an Access Token
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-6)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#RefreshTokens)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function refreshTokenGrantRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  refreshToken: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  assertString(refreshToken, '"refreshToken"')

  const parameters = new URLSearchParams(options?.additionalParameters)
  parameters.set('refresh_token', refreshToken)
  return tokenEndpointRequest(
    as,
    client,
    clientAuthentication,
    'refresh_token',
    parameters,
    options,
  )
}

const idTokenClaims = new WeakMap<TokenEndpointResponse, IDToken>()
const jwtRefs = new WeakMap<Response, string>()

/**
 * Returns ID Token Claims Set from a {@link TokenEndpointResponse} processed by e.g.
 * {@link processAuthorizationCodeResponse}. To optionally validate the ID Token Signature use
 * {@link validateApplicationLevelSignature}.
 *
 * @param ref {@link TokenEndpointResponse} previously resolved from e.g.
 *   {@link processAuthorizationCodeResponse}
 *
 * @returns JWT Claims Set from an ID Token, or undefined if there is no ID Token in `ref`.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group Client-Initiated Backchannel Authentication (CIBA)
 * @group Device Authorization Grant
 */
export function getValidatedIdTokenClaims(ref: TokenEndpointResponse): IDToken | undefined {
  if (!ref.id_token) {
    return undefined
  }

  const claims = idTokenClaims.get(ref)
  if (!claims) {
    throw CodedTypeError(
      '"ref" was already garbage collected or did not resolve from the proper sources',
      ERR_INVALID_ARG_VALUE,
    )
  }

  return claims
}

export interface ValidateSignatureOptions extends HttpRequestOptions<'GET'>, JWKSCacheOptions {}

/**
 * Validates the JWS Signature of either a JWT {@link !Response.body} or
 * {@link TokenEndpointResponse.id_token} of a processed {@link !Response}
 *
 * > [!NOTE]\
 * > Validating signatures of JWTs received via direct communication between the Client and a
 * > TLS-secured Endpoint (which it is here) is not mandatory since the TLS server validation is used
 * > to validate the issuer instead of checking the token signature. You only need to use this method
 * > for non-repudiation purposes.
 *
 * > [!NOTE]\
 * > Supports only digital signatures.
 *
 * @param as Authorization Server Metadata.
 * @param ref Response previously processed by this module that contained an ID Token or its
 *   response body was a JWT
 *
 * @returns Resolves if the signature validates, rejects otherwise.
 *
 * @group FAPI 1.0 Advanced
 * @group FAPI 2.0 Message Signing
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group OpenID Connect (OIDC) UserInfo
 * @group Token Introspection
 *
 * @see [RFC 9701 - JWT Response for OAuth Token Introspection](https://www.rfc-editor.org/rfc/rfc9701.html#section-5)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#UserInfo)
 */
export async function validateApplicationLevelSignature(
  as: AuthorizationServer,
  ref: Response,
  options?: ValidateSignatureOptions,
): Promise<void> {
  assertAs(as)

  if (!jwtRefs.has(ref)) {
    throw CodedTypeError(
      '"ref" does not contain a processed JWT Response to verify the signature of',
      ERR_INVALID_ARG_VALUE,
    )
  }

  const { 0: protectedHeader, 1: payload, 2: encodedSignature } = jwtRefs.get(ref)!.split('.')

  const header: CompactJWSHeaderParameters = JSON.parse(buf(b64u(protectedHeader)))

  if (header.alg.startsWith('HS')) {
    throw new UnsupportedOperationError('unsupported JWS algorithm', { cause: { alg: header.alg } })
  }

  let key!: CryptoKey
  key = await getPublicSigKeyFromIssuerJwksUri(as, options, header)
  await validateJwsSignature(protectedHeader, payload, key, b64u(encodedSignature))
}

async function processGenericAccessTokenResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  additionalRequiredIdTokenClaims: (keyof typeof jwtClaimNames)[] | undefined,
  decryptFn: JweDecryptFunction | undefined,
  recognizedTokenTypes: RecognizedTokenTypes | undefined,
): Promise<TokenEndpointResponse> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  await checkOAuthBodyError(response, 200, 'Token Endpoint')

  assertReadableResponse(response)
  const json = await getResponseJsonBody<Writeable<TokenEndpointResponse>>(response)

  assertString(json.access_token, '"response" body "access_token" property', INVALID_RESPONSE, {
    body: json,
  })

  assertString(json.token_type, '"response" body "token_type" property', INVALID_RESPONSE, {
    body: json,
  })

  json.token_type = json.token_type.toLowerCase() as Lowercase<string>

  if (json.expires_in !== undefined) {
    let expiresIn: unknown =
      typeof json.expires_in !== 'number' ? parseFloat(json.expires_in) : json.expires_in
    assertNumber(expiresIn, true, '"response" body "expires_in" property', INVALID_RESPONSE, {
      body: json,
    })
    json.expires_in = expiresIn
  }

  if (json.refresh_token !== undefined) {
    assertString(json.refresh_token, '"response" body "refresh_token" property', INVALID_RESPONSE, {
      body: json,
    })
  }

  // allows empty
  if (json.scope !== undefined && typeof json.scope !== 'string') {
    throw OPE('"response" body "scope" property must be a string', INVALID_RESPONSE, { body: json })
  }

  if (json.id_token !== undefined) {
    assertString(json.id_token, '"response" body "id_token" property', INVALID_RESPONSE, {
      body: json,
    })

    const requiredClaims: (keyof typeof jwtClaimNames)[] = ['aud', 'exp', 'iat', 'iss', 'sub']

    if (client.require_auth_time === true) {
      requiredClaims.push('auth_time')
    }

    if (client.default_max_age !== undefined) {
      assertNumber(client.default_max_age, true, '"client.default_max_age"')
      requiredClaims.push('auth_time')
    }

    if (additionalRequiredIdTokenClaims?.length) {
      requiredClaims.push(...additionalRequiredIdTokenClaims)
    }

    const { claims, jwt } = await validateJwt(
      json.id_token,
      checkSigningAlgorithm.bind(
        undefined,
        client.id_token_signed_response_alg,
        as.id_token_signing_alg_values_supported,
        'RS256',
      ),
      getClockSkew(client),
      getClockTolerance(client),
      decryptFn,
    )
      .then(validatePresence.bind(undefined, requiredClaims))
      .then(validateIssuer.bind(undefined, as))
      .then(validateAudience.bind(undefined, client.client_id))

    if (Array.isArray(claims.aud) && claims.aud.length !== 1) {
      if (claims.azp === undefined) {
        throw OPE(
          'ID Token "aud" (audience) claim includes additional untrusted audiences',
          JWT_CLAIM_COMPARISON,
          { claims, claim: 'aud' },
        )
      }
      if (claims.azp !== client.client_id) {
        throw OPE(
          'unexpected ID Token "azp" (authorized party) claim value',
          JWT_CLAIM_COMPARISON,
          { expected: client.client_id, claims, claim: 'azp' },
        )
      }
    }

    if (claims.auth_time !== undefined) {
      assertNumber(
        claims.auth_time,
        true,
        'ID Token "auth_time" (authentication time)',
        INVALID_RESPONSE,
        { claims },
      )
    }

    jwtRefs.set(response, jwt)
    idTokenClaims.set(json, claims as IDToken)
  }

  if (recognizedTokenTypes?.[json.token_type] !== undefined) {
    recognizedTokenTypes[json.token_type](response, json)
  } else if (json.token_type !== 'dpop' && json.token_type !== 'bearer') {
    throw new UnsupportedOperationError('unsupported `token_type` value', { cause: { body: json } })
  }

  return json
}

function checkAuthenticationChallenges(response: Response) {
  let challenges: WWWAuthenticateChallenge[] | undefined
  if ((challenges = parseWwwAuthenticateChallenges(response))) {
    throw new WWWAuthenticateChallengeError(
      'server responded with a challenge in the WWW-Authenticate HTTP Header',
      { cause: challenges, response },
    )
  }
}

/**
 * Validates Refresh Token Grant {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link refreshTokenGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Refreshing an Access Token
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-6)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#RefreshTokens)
 */
export async function processRefreshTokenResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: ProcessTokenResponseOptions,
): Promise<TokenEndpointResponse> {
  return processGenericAccessTokenResponse(
    as,
    client,
    response,
    undefined,
    options?.[jweDecrypt],
    options?.recognizedTokenTypes,
  )
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
      throw OPE('unexpected JWT "aud" (audience) claim value', JWT_CLAIM_COMPARISON, {
        expected,
        claims: result.claims,
        claim: 'aud',
      })
    }
  } else if (result.claims.aud !== expected) {
    throw OPE('unexpected JWT "aud" (audience) claim value', JWT_CLAIM_COMPARISON, {
      expected,
      claims: result.claims,
      claim: 'aud',
    })
  }

  return result
}

function validateOptionalIssuer(
  as: AuthorizationServer,
  result: Awaited<ReturnType<typeof validateJwt>>,
) {
  if (result.claims.iss !== undefined) {
    return validateIssuer(as, result)
  }
  return result
}

function validateIssuer(as: AuthorizationServer, result: Awaited<ReturnType<typeof validateJwt>>) {
  // @ts-ignore
  const expected = as[_expectedIssuer]?.(result) ?? as.issuer
  if (result.claims.iss !== expected) {
    throw OPE('unexpected JWT "iss" (issuer) claim value', JWT_CLAIM_COMPARISON, {
      expected,
      claims: result.claims,
      claim: 'iss',
    })
  }
  return result
}

const branded = new WeakSet<URLSearchParams | DPoPHandle>()
function brand(searchParams: URLSearchParams) {
  branded.add(searchParams)
  return searchParams
}

/**
 * > [!WARNING]\
 * > This option has security implications that must be understood, assessed for applicability, and
 * > accepted before use.
 *
 * Use this as a value to {@link authorizationCodeGrantRequest} `codeVerifier` parameter to skip the
 * use of PKCE.
 *
 * @deprecated To make it stand out as something you shouldn't have the need to use as the use of
 *   PKCE is backwards compatible with authorization servers that don't support it and properly
 *   ignore unrecognized parameters.
 *
 * @see [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html)
 */
export const nopkce: unique symbol = Symbol()

/**
 * Performs an Authorization Code grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param callbackParameters Parameters obtained from the callback to redirect_uri, this is returned
 *   from {@link validateAuthResponse}, or {@link validateJwtAuthResponse}.
 * @param redirectUri `redirect_uri` value used in the authorization request.
 * @param codeVerifier PKCE `code_verifier` to send to the token endpoint.
 *
 * @returns Resolves with a {@link !Response} to then invoke {@link processAuthorizationCodeResponse}
 *   with
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#CodeFlowAuth)
 * @see [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function authorizationCodeGrantRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  callbackParameters: URLSearchParams,
  redirectUri: string,
  codeVerifier: string | typeof nopkce,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  if (!branded.has(callbackParameters)) {
    throw CodedTypeError(
      '"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()',
      ERR_INVALID_ARG_VALUE,
    )
  }

  assertString(redirectUri, '"redirectUri"')

  const code = getURLSearchParameter(callbackParameters, 'code')
  if (!code) {
    throw OPE('no authorization code in "callbackParameters"', INVALID_RESPONSE)
  }

  const parameters = new URLSearchParams(options?.additionalParameters)
  parameters.set('redirect_uri', redirectUri)
  parameters.set('code', code)

  if (codeVerifier !== nopkce) {
    assertString(codeVerifier, '"codeVerifier"')
    parameters.set('code_verifier', codeVerifier)
  }

  return tokenEndpointRequest(
    as,
    client,
    clientAuthentication,
    'authorization_code',
    parameters,
    options,
  )
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
  alg: string
  kid?: string
  typ?: string
  crit?: string[]
  jwk?: JWK

  [parameter: string]: JsonValue | undefined
}

interface ParsedJWT {
  header: CompactJWSHeaderParameters
  claims: JWTPayload
  jwt: string
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
  auth_time: 'authentication time',
}

function validatePresence(
  required: (keyof typeof jwtClaimNames)[],
  result: Awaited<ReturnType<typeof validateJwt>>,
) {
  for (const claim of required) {
    if (result.claims[claim] === undefined) {
      throw OPE(`JWT "${claim}" (${jwtClaimNames[claim]}) claim missing`, INVALID_RESPONSE, {
        claims: result.claims,
      })
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

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export interface TokenEndpointResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly id_token?: string
  readonly refresh_token?: string
  readonly scope?: string
  readonly authorization_details?: AuthorizationDetails[]
  /**
   * > [!NOTE]\
   * > Because the value is case insensitive it is always returned lowercased
   */
  readonly token_type: 'bearer' | 'dpop' | Lowercase<string>

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * Use this as a value to {@link processAuthorizationCodeResponse} `oidc.expectedNonce` parameter to
 * indicate no `nonce` ID Token claim value is expected, i.e. no `nonce` parameter value was sent
 * with the authorization request.
 */
export const expectNoNonce: unique symbol = Symbol()

/**
 * Use this as a value to {@link processAuthorizationCodeResponse} `oidc.maxAge` parameter to
 * indicate no `auth_time` ID Token claim value check should be performed.
 */
export const skipAuthTimeCheck: unique symbol = Symbol()

export interface ProcessAuthorizationCodeResponseOptions extends ProcessTokenResponseOptions {
  /**
   * Expected ID Token `nonce` claim value. Default is {@link expectNoNonce}.
   */
  expectedNonce?: string | typeof expectNoNonce
  /**
   * ID Token {@link IDToken.auth_time `auth_time`} claim value will be checked to be present and
   * conform to the `maxAge` value. Use of this option is required if you sent a `max_age` parameter
   * in an authorization request. Default is {@link Client.default_max_age `client.default_max_age`}
   * and falls back to {@link skipAuthTimeCheck}.
   */
  maxAge?: number | typeof skipAuthTimeCheck
  /**
   * When true this requires {@link TokenEndpointResponse.id_token} to be present
   */
  requireIdToken?: boolean
}

/**
 * Validates Authorization Code Grant {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link authorizationCodeGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#CodeFlowAuth)
 */
export async function processAuthorizationCodeResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: ProcessAuthorizationCodeResponseOptions,
): Promise<TokenEndpointResponse> {
  if (
    typeof options?.expectedNonce === 'string' ||
    typeof options?.maxAge === 'number' ||
    options?.requireIdToken
  ) {
    return processAuthorizationCodeOpenIDResponse(
      as,
      client,
      response,
      options.expectedNonce,
      options.maxAge,
      options[jweDecrypt],
      options.recognizedTokenTypes,
    )
  }

  return processAuthorizationCodeOAuth2Response(
    as,
    client,
    response,
    options?.[jweDecrypt],
    options?.recognizedTokenTypes,
  )
}

async function processAuthorizationCodeOpenIDResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  expectedNonce: string | typeof expectNoNonce | undefined,
  maxAge: number | typeof skipAuthTimeCheck | undefined,
  decryptFn: JweDecryptFunction | undefined,
  recognizedTokenTypes: RecognizedTokenTypes | undefined,
): Promise<TokenEndpointResponse> {
  const additionalRequiredClaims: (keyof typeof jwtClaimNames)[] = []

  switch (expectedNonce) {
    case undefined:
      expectedNonce = expectNoNonce
      break
    case expectNoNonce:
      break
    default:
      assertString(expectedNonce, '"expectedNonce" argument')
      additionalRequiredClaims.push('nonce')
  }

  maxAge ??= client.default_max_age
  switch (maxAge) {
    case undefined:
      maxAge = skipAuthTimeCheck
      break
    case skipAuthTimeCheck:
      break
    default:
      assertNumber(maxAge, true, '"maxAge" argument')
      additionalRequiredClaims.push('auth_time')
  }

  const result = await processGenericAccessTokenResponse(
    as,
    client,
    response,
    additionalRequiredClaims,
    decryptFn,
    recognizedTokenTypes,
  )

  assertString(result.id_token, '"response" body "id_token" property', INVALID_RESPONSE, {
    body: result,
  })

  const claims = getValidatedIdTokenClaims(result)!
  if (maxAge !== skipAuthTimeCheck) {
    const now = epochTime() + getClockSkew(client)
    const tolerance = getClockTolerance(client)
    if (claims.auth_time! + maxAge < now - tolerance) {
      throw OPE(
        'too much time has elapsed since the last End-User authentication',
        JWT_TIMESTAMP_CHECK,
        { claims, now, tolerance, claim: 'auth_time' },
      )
    }
  }

  if (expectedNonce === expectNoNonce) {
    if (claims.nonce !== undefined) {
      throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
        expected: undefined,
        claims,
        claim: 'nonce',
      })
    }
  } else if (claims.nonce !== expectedNonce) {
    throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
      expected: expectedNonce,
      claims,
      claim: 'nonce',
    })
  }

  return result
}

async function processAuthorizationCodeOAuth2Response(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  decryptFn: JweDecryptFunction | undefined,
  recognizedTokenTypes: RecognizedTokenTypes | undefined,
): Promise<TokenEndpointResponse> {
  const result = await processGenericAccessTokenResponse(
    as,
    client,
    response,
    undefined,
    decryptFn,
    recognizedTokenTypes,
  )

  const claims = getValidatedIdTokenClaims(result)
  if (claims) {
    if (client.default_max_age !== undefined) {
      assertNumber(client.default_max_age, true, '"client.default_max_age"')
      const now = epochTime() + getClockSkew(client)
      const tolerance = getClockTolerance(client)
      if (claims.auth_time! + client.default_max_age < now - tolerance) {
        throw OPE(
          'too much time has elapsed since the last End-User authentication',
          JWT_TIMESTAMP_CHECK,
          { claims, now, tolerance, claim: 'auth_time' },
        )
      }
    }

    if (claims.nonce !== undefined) {
      throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
        expected: undefined,
        claims,
        claim: 'nonce',
      })
    }
  }

  return result
}

/**
 * @group Error Codes
 *
 * @see {@link WWWAuthenticateChallengeError}
 */
export const WWW_AUTHENTICATE_CHALLENGE = 'OAUTH_WWW_AUTHENTICATE_CHALLENGE'
/**
 * @group Error Codes
 *
 * @see {@link ResponseBodyError}
 */
export const RESPONSE_BODY_ERROR = 'OAUTH_RESPONSE_BODY_ERROR'
/**
 * @group Error Codes
 *
 * @see {@link UnsupportedOperationError}
 */
export const UNSUPPORTED_OPERATION = 'OAUTH_UNSUPPORTED_OPERATION'
/**
 * @group Error Codes
 *
 * @see {@link AuthorizationResponseError}
 */
export const AUTHORIZATION_RESPONSE_ERROR = 'OAUTH_AUTHORIZATION_RESPONSE_ERROR'
/**
 * Assigned as {@link OperationProcessingError.code} when a JWT UserInfo Response was expected but a
 * regular JSON one was given instead.
 *
 * @group Error Codes
 */
export const JWT_USERINFO_EXPECTED = 'OAUTH_JWT_USERINFO_EXPECTED'
/**
 * Assigned as {@link OperationProcessingError.code} when the following fails to parse as JSON
 *
 * - JWS/JWE Headers
 * - JSON response bodies
 * - "claims" authorization request parameters
 * - "authorization_details" authorization request parameters
 *
 * @group Error Codes
 */
export const PARSE_ERROR = 'OAUTH_PARSE_ERROR'
/**
 * Assigned as {@link OperationProcessingError.code} when authorization server responses are invalid.
 *
 * @group Error Codes
 */
export const INVALID_RESPONSE = 'OAUTH_INVALID_RESPONSE'
/**
 * Assigned as {@link OperationProcessingError.code} during {@link validateJwtAccessToken} when the
 * request or its contents are invalid.
 *
 * @group Error Codes
 */
export const INVALID_REQUEST = 'OAUTH_INVALID_REQUEST'
/**
 * Assigned as {@link OperationProcessingError.code} when a {@link !Response} does not have the
 * expected `application/json` response-type HTTP Header.
 *
 * @group Error Codes
 */
export const RESPONSE_IS_NOT_JSON = 'OAUTH_RESPONSE_IS_NOT_JSON'
/**
 * Assigned as {@link OperationProcessingError.code} when a {@link !Response} does not have the
 * expected success HTTP Status Code as defined by its specification.
 *
 * @group Error Codes
 */
export const RESPONSE_IS_NOT_CONFORM = 'OAUTH_RESPONSE_IS_NOT_CONFORM'
/**
 * Assigned as {@link OperationProcessingError.code} when a request is about to made to a non-TLS
 * secured HTTP endpoint and {@link allowInsecureRequests} is not provided.
 *
 * @group Error Codes
 */
export const HTTP_REQUEST_FORBIDDEN = 'OAUTH_HTTP_REQUEST_FORBIDDEN'
/**
 * Assigned as {@link OperationProcessingError.code} when a request is about to made to a non-HTTP(S)
 * endpoint.
 *
 * @group Error Codes
 */
export const REQUEST_PROTOCOL_FORBIDDEN = 'OAUTH_REQUEST_PROTOCOL_FORBIDDEN'
/**
 * Assigned as {@link OperationProcessingError.code} when a JWT NumericDate comparison with the
 * current timestamp fails.
 *
 * @group Error Codes
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7519.html#section-2 JSON Web Token (JWT)}
 */
export const JWT_TIMESTAMP_CHECK = 'OAUTH_JWT_TIMESTAMP_CHECK_FAILED'
/**
 * Assigned as {@link OperationProcessingError.code} when a JWT claim is not of a given expected
 * value.
 *
 * @group Error Codes
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7519.html#section-2 JSON Web Token (JWT)}
 */
export const JWT_CLAIM_COMPARISON = 'OAUTH_JWT_CLAIM_COMPARISON_FAILED'
/**
 * Assigned as {@link OperationProcessingError.code} when a {@link !Response} JSON body attribute is
 * not of a given expected value.
 *
 * @group Error Codes
 */
export const JSON_ATTRIBUTE_COMPARISON = 'OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED'
/**
 * Assigned as {@link OperationProcessingError.code} when a JWT signature validation fails to select
 * an applicable key.
 *
 * @group Error Codes
 */
export const KEY_SELECTION = 'OAUTH_KEY_SELECTION_FAILED'
/**
 * Assigned as {@link OperationProcessingError.code} when the AS configuration is missing metadata.
 *
 * @group Error Codes
 */
export const MISSING_SERVER_METADATA = 'OAUTH_MISSING_SERVER_METADATA'
/**
 * Assigned as {@link OperationProcessingError.code} when the AS configuration has invalid metadata.
 *
 * @group Error Codes
 */
export const INVALID_SERVER_METADATA = 'OAUTH_INVALID_SERVER_METADATA'

function checkJwtType(expected: string, result: Awaited<ReturnType<typeof validateJwt>>) {
  if (typeof result.header.typ !== 'string' || normalizeTyp(result.header.typ) !== expected) {
    throw OPE('unexpected JWT "typ" header parameter value', INVALID_RESPONSE, {
      header: result.header,
    })
  }

  return result
}

export interface ClientCredentialsGrantRequestOptions
  extends HttpRequestOptions<'POST', URLSearchParams>, DPoPRequestOptions {}

/**
 * Performs a Client Credentials Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 *
 * @returns Resolves with a {@link !Response} to then invoke {@link processClientCredentialsResponse}
 *   with
 *
 * @group Client Credentials Grant
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function clientCredentialsGrantRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: ClientCredentialsGrantRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  return tokenEndpointRequest(
    as,
    client,
    clientAuthentication,
    'client_credentials',
    new URLSearchParams(parameters),
    options,
  )
}

/**
 * Performs any Grant request at the {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 * The purpose is to be able to execute grant requests such as Token Exchange Grant Type, JWT Bearer
 * Token Grant Type, or SAML 2.0 Bearer Assertion Grant Type.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param grantType Grant Type.
 *
 * @returns Resolves with a {@link !Response} to then invoke
 *   {@link processGenericTokenEndpointResponse} with
 *
 * @group JWT Bearer Token Grant Type
 * @group SAML 2.0 Bearer Assertion Grant Type
 * @group Token Exchange Grant Type
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8693.html Token Exchange Grant Type}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7523.html#section-2.1 JWT Bearer Token Grant Type}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7522.html#section-2.1 SAML 2.0 Bearer Assertion Grant Type}
 */
export async function genericTokenEndpointRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  grantType: string,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: Omit<TokenEndpointRequestOptions, 'additionalParameters'>,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  assertString(grantType, '"grantType"')

  return tokenEndpointRequest(
    as,
    client,
    clientAuthentication,
    grantType,
    new URLSearchParams(parameters),
    options,
  )
}

/**
 * Validates Token Endpoint {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link genericTokenEndpointRequest}.
 *
 * @group JWT Bearer Token Grant Type
 * @group SAML 2.0 Bearer Assertion Grant Type
 * @group Token Exchange Grant Type
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8693.html Token Exchange Grant Type}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7523.html#section-2.1 JWT Bearer Token Grant Type}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7522.html#section-2.1 SAML 2.0 Bearer Assertion Grant Type}
 */
export async function processGenericTokenEndpointResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: ProcessTokenResponseOptions,
): Promise<TokenEndpointResponse> {
  return processGenericAccessTokenResponse(
    as,
    client,
    response,
    undefined,
    options?.[jweDecrypt],
    options?.recognizedTokenTypes,
  )
}

/**
 * Validates Client Credentials Grant {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link clientCredentialsGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Client Credentials Grant
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)
 */
export async function processClientCredentialsResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: ProcessTokenResponseOptions,
): Promise<TokenEndpointResponse> {
  return processGenericAccessTokenResponse(
    as,
    client,
    response,
    undefined,
    options?.[jweDecrypt],
    options?.recognizedTokenTypes,
  )
}

export interface RevocationRequestOptions extends HttpRequestOptions<'POST', URLSearchParams> {
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
 * @param clientAuthentication Client Authentication Method.
 * @param token Token to revoke. You can provide the `token_type_hint` parameter via
 *   {@link RevocationRequestOptions.additionalParameters options}.
 *
 * @returns Resolves with a {@link !Response} to then invoke {@link processRevocationResponse} with
 *
 * @group Token Revocation
 *
 * @see [RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
 */
export async function revocationRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  token: string,
  options?: RevocationRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  assertString(token, '"token"')

  const url = resolveEndpoint(
    as,
    'revocation_endpoint',
    client.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  const body = new URLSearchParams(options?.additionalParameters)
  body.set('token', token)

  const headers = prepareHeaders(options?.headers)
  headers.delete('accept')

  return authenticatedRequest(as, client, clientAuthentication, url, body, headers, options)
}

/**
 * Validates {@link !Response} instance to be one coming from the
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
export async function processRevocationResponse(response: Response): Promise<undefined> {
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  await checkOAuthBodyError(response, 200, 'Revocation Endpoint')

  return undefined
}

export interface IntrospectionRequestOptions extends HttpRequestOptions<'POST', URLSearchParams> {
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

function assertReadableResponse(response: Response): void {
  if (response.bodyUsed) {
    throw CodedTypeError('"response" body has been used already', ERR_INVALID_ARG_VALUE)
  }
}

/**
 * Performs an Introspection Request at the
 * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param token Token to introspect. You can provide the `token_type_hint` parameter via
 *   {@link IntrospectionRequestOptions.additionalParameters options}.
 *
 * @returns Resolves with a {@link !Response} to then invoke {@link processIntrospectionResponse} with
 *
 * @group Token Introspection
 *
 * @see [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 * @see [RFC 9701 - JWT Response for OAuth Token Introspection](https://www.rfc-editor.org/rfc/rfc9701.html#section-4)
 */
export async function introspectionRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  token: string,
  options?: IntrospectionRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  assertString(token, '"token"')

  const url = resolveEndpoint(
    as,
    'introspection_endpoint',
    client.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  const body = new URLSearchParams(options?.additionalParameters)
  body.set('token', token)
  const headers = prepareHeaders(options?.headers)
  if (options?.requestJwtResponse ?? client.introspection_signed_response_alg) {
    headers.set('accept', 'application/token-introspection+jwt')
  } else {
    headers.set('accept', 'application/json')
  }

  return authenticatedRequest(as, client, clientAuthentication, url, body, headers, options)
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
 * Validates {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link introspectionRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Token Introspection
 *
 * @see [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 * @see [RFC 9701 - JWT Response for OAuth Token Introspection](https://www.rfc-editor.org/rfc/rfc9701.html#section-5)
 */
export async function processIntrospectionResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: JWEDecryptOptions,
): Promise<IntrospectionResponse> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  await checkOAuthBodyError(response, 200, 'Introspection Endpoint')

  let json: JsonObject
  if (getContentType(response) === 'application/token-introspection+jwt') {
    assertReadableResponse(response)
    const { claims, jwt } = await validateJwt(
      await response.text(),
      checkSigningAlgorithm.bind(
        undefined,
        client.introspection_signed_response_alg,
        as.introspection_signing_alg_values_supported,
        'RS256',
      ),
      getClockSkew(client),
      getClockTolerance(client),
      options?.[jweDecrypt],
    )
      .then(checkJwtType.bind(undefined, 'token-introspection+jwt'))
      .then(validatePresence.bind(undefined, ['aud', 'iat', 'iss']))
      .then(validateIssuer.bind(undefined, as))
      .then(validateAudience.bind(undefined, client.client_id))

    jwtRefs.set(response, jwt)
    if (!isJsonObject(claims.token_introspection)) {
      throw OPE('JWT "token_introspection" claim must be a JSON object', INVALID_RESPONSE, {
        claims,
      })
    }
    json = claims.token_introspection
  } else {
    assertReadableResponse(response)
    json = await getResponseJsonBody(response)
  }

  if (typeof json.active !== 'boolean') {
    throw OPE('"response" body "active" property must be a boolean', INVALID_RESPONSE, {
      body: json,
    })
  }

  return json as IntrospectionResponse
}

async function jwksRequest(
  as: AuthorizationServer,
  options?: HttpRequestOptions<'GET'>,
): Promise<Response> {
  assertAs(as)

  const url = resolveEndpoint(as, 'jwks_uri', false, options?.[allowInsecureRequests] !== true)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')
  headers.append('accept', 'application/jwk-set+json')

  return (options?.[customFetch] || fetch)(url.href, {
    body: undefined,
    headers: Object.fromEntries(headers.entries()),
    method: 'GET',
    redirect: 'manual',
    signal: signal(url, options?.signal),
  })
}

export interface JWKS {
  readonly keys: JWK[]
}

async function processJwksResponse(response: Response): Promise<JWKS> {
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  if (response.status !== 200) {
    throw OPE(
      '"response" is not a conform JSON Web Key Set response (unexpected HTTP status code)',
      RESPONSE_IS_NOT_CONFORM,
      response,
    )
  }

  assertReadableResponse(response)
  const json = await getResponseJsonBody<JWKS>(response, (response) =>
    assertContentTypes(response, 'application/json', 'application/jwk-set+json'),
  )

  if (!Array.isArray(json.keys)) {
    throw OPE('"response" body "keys" property must be an array', INVALID_RESPONSE, { body: json })
  }

  if (!Array.prototype.every.call(json.keys, isJsonObject)) {
    throw OPE(
      '"response" body "keys" property members must be JWK formatted objects',
      INVALID_RESPONSE,
      { body: json },
    )
  }

  return json
}

function supported(alg: string) {
  switch (alg) {
    case 'PS256':
    case 'ES256':
    case 'RS256':
    case 'PS384':
    case 'ES384':
    case 'RS384':
    case 'PS512':
    case 'ES512':
    case 'RS512':
    case 'Ed25519':
    case 'EdDSA':
    case 'ML-DSA-44':
    case 'ML-DSA-65':
    case 'ML-DSA-87':
      return true
    default:
      return false
  }
}

function checkSupportedJwsAlg(header: CompactJWSHeaderParameters) {
  if (!supported(header.alg)) {
    throw new UnsupportedOperationError('unsupported JWS "alg" identifier', {
      cause: { alg: header.alg },
    })
  }
}

function checkRsaKeyAlgorithm(key: CryptoKey) {
  const { algorithm } = key as CryptoKey & { algorithm: RsaHashedKeyAlgorithm }
  if (typeof algorithm.modulusLength !== 'number' || algorithm.modulusLength < 2048) {
    throw new UnsupportedOperationError(`unsupported ${algorithm.name} modulusLength`, {
      cause: key,
    })
  }
}

function ecdsaHashName(key: CryptoKey) {
  const { algorithm } = key as CryptoKey & { algorithm: EcKeyAlgorithm }
  switch (algorithm.namedCurve) {
    case 'P-256':
      return 'SHA-256'
    case 'P-384':
      return 'SHA-384'
    case 'P-521':
      return 'SHA-512'
    default:
      throw new UnsupportedOperationError('unsupported ECDSA namedCurve', { cause: key })
  }
}

function keyToSubtle(key: CryptoKey): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
  switch (key.algorithm.name) {
    case 'ECDSA':
      return {
        name: key.algorithm.name,
        hash: ecdsaHashName(key),
      } as EcdsaParams
    case 'RSA-PSS': {
      checkRsaKeyAlgorithm(key)
      switch ((key.algorithm as RsaHashedKeyAlgorithm).hash.name) {
        case 'SHA-256': // Fall through
        case 'SHA-384': // Fall through
        case 'SHA-512':
          return {
            name: key.algorithm.name,
            saltLength:
              parseInt((key.algorithm as RsaHashedKeyAlgorithm).hash.name.slice(-3), 10) >> 3,
          } as RsaPssParams
        default:
          throw new UnsupportedOperationError('unsupported RSA-PSS hash name', { cause: key })
      }
    }
    case 'RSASSA-PKCS1-v1_5':
      checkRsaKeyAlgorithm(key)
      return key.algorithm.name
    case 'ML-DSA-44':
    case 'ML-DSA-65':
    case 'ML-DSA-87':
    case 'Ed25519':
      return key.algorithm.name
  }
  throw new UnsupportedOperationError('unsupported CryptoKey algorithm name', { cause: key })
}

async function validateJwsSignature(
  protectedHeader: string,
  payload: string,
  key: CryptoKey,
  signature: Uint8Array,
) {
  const data = buf(`${protectedHeader}.${payload}`)
  const algorithm = keyToSubtle(key)
  const verified = await crypto.subtle.verify(
    algorithm,
    key,
    signature as Uint8Array<ArrayBuffer>,
    data as Uint8Array<ArrayBuffer>,
  )
  if (!verified) {
    throw OPE('JWT signature verification failed', INVALID_RESPONSE, {
      key,
      data,
      signature,
      algorithm,
    })
  }
}

export type JweDecryptFunction = (jwe: string) => Promise<string>

/**
 * Minimal JWT validation implementation.
 */
async function validateJwt(
  jws: string,
  checkAlg: (h: CompactJWSHeaderParameters) => void,
  clockSkew: number,
  clockTolerance: number,
  decryptJwt: JweDecryptFunction | undefined,
): Promise<ParsedJWT> {
  let { 0: protectedHeader, 1: payload, length } = jws.split('.')

  if (length === 5) {
    if (decryptJwt !== undefined) {
      jws = await decryptJwt(jws)
      ;({ 0: protectedHeader, 1: payload, length } = jws.split('.'))
    } else {
      throw new UnsupportedOperationError('JWE decryption is not configured', { cause: jws })
    }
  }

  if (length !== 3) {
    throw OPE('Invalid JWT', INVALID_RESPONSE, jws)
  }

  let header: JsonValue
  try {
    header = JSON.parse(buf(b64u(protectedHeader)))
  } catch (cause) {
    throw OPE('failed to parse JWT Header body as base64url encoded JSON', PARSE_ERROR, cause)
  }

  if (!isJsonObject<CompactJWSHeaderParameters>(header)) {
    throw OPE('JWT Header must be a top level object', INVALID_RESPONSE, jws)
  }

  checkAlg(header)
  if (header.crit !== undefined) {
    throw new UnsupportedOperationError('no JWT "crit" header parameter extensions are supported', {
      cause: { header },
    })
  }

  let claims: JsonValue
  try {
    claims = JSON.parse(buf(b64u(payload)))
  } catch (cause) {
    throw OPE('failed to parse JWT Payload body as base64url encoded JSON', PARSE_ERROR, cause)
  }

  if (!isJsonObject<JWTPayload>(claims)) {
    throw OPE('JWT Payload must be a top level object', INVALID_RESPONSE, jws)
  }

  const now = epochTime() + clockSkew

  if (claims.exp !== undefined) {
    if (typeof claims.exp !== 'number') {
      throw OPE('unexpected JWT "exp" (expiration time) claim type', INVALID_RESPONSE, { claims })
    }

    if (claims.exp <= now - clockTolerance) {
      throw OPE(
        'unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp',
        JWT_TIMESTAMP_CHECK,
        { claims, now, tolerance: clockTolerance, claim: 'exp' },
      )
    }
  }

  if (claims.iat !== undefined) {
    if (typeof claims.iat !== 'number') {
      throw OPE('unexpected JWT "iat" (issued at) claim type', INVALID_RESPONSE, { claims })
    }
  }

  if (claims.iss !== undefined) {
    if (typeof claims.iss !== 'string') {
      throw OPE('unexpected JWT "iss" (issuer) claim type', INVALID_RESPONSE, { claims })
    }
  }

  if (claims.nbf !== undefined) {
    if (typeof claims.nbf !== 'number') {
      throw OPE('unexpected JWT "nbf" (not before) claim type', INVALID_RESPONSE, { claims })
    }
    if (claims.nbf > now + clockTolerance) {
      throw OPE('unexpected JWT "nbf" (not before) claim value', JWT_TIMESTAMP_CHECK, {
        claims,
        now,
        tolerance: clockTolerance,
        claim: 'nbf',
      })
    }
  }

  if (claims.aud !== undefined) {
    if (typeof claims.aud !== 'string' && !Array.isArray(claims.aud)) {
      throw OPE('unexpected JWT "aud" (audience) claim type', INVALID_RESPONSE, { claims })
    }
  }

  return { header, claims, jwt: jws }
}

/**
 * Same as {@link validateAuthResponse} but for signed JARM responses.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters JARM authorization response.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 *
 * @returns Validated Authorization Response parameters. Authorization Error Responses are rejected
 *   using {@link AuthorizationResponseError}.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)
 * @group FAPI 2.0 Message Signing
 * @group FAPI 1.0 Advanced
 *
 * @see [JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)](https://openid.net/specs/openid-financial-api-jarm-final.html)
 */
export async function validateJwtAuthResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL,
  expectedState?: string | typeof expectNoState | typeof skipStateCheck,
  options?: ValidateSignatureOptions & JWEDecryptOptions,
): Promise<URLSearchParams> {
  assertAs(as)
  assertClient(client)

  if (parameters instanceof URL) {
    parameters = parameters.searchParams
  }

  if (!(parameters instanceof URLSearchParams)) {
    throw CodedTypeError(
      '"parameters" must be an instance of URLSearchParams, or URL',
      ERR_INVALID_ARG_TYPE,
    )
  }

  const response = getURLSearchParameter(parameters, 'response')
  if (!response) {
    throw OPE('"parameters" does not contain a JARM response', INVALID_RESPONSE)
  }

  const { claims, header, jwt } = await validateJwt(
    response,
    checkSigningAlgorithm.bind(
      undefined,
      client.authorization_signed_response_alg,
      as.authorization_signing_alg_values_supported,
      'RS256',
    ),
    getClockSkew(client),
    getClockTolerance(client),
    options?.[jweDecrypt],
  )
    .then(validatePresence.bind(undefined, ['aud', 'exp', 'iss']))
    .then(validateIssuer.bind(undefined, as))
    .then(validateAudience.bind(undefined, client.client_id))

  const { 0: protectedHeader, 1: payload, 2: encodedSignature } = jwt.split('.')

  const signature = b64u(encodedSignature)
  const key = await getPublicSigKeyFromIssuerJwksUri(as, options, header)
  await validateJwsSignature(protectedHeader, payload, key, signature)

  const result = new URLSearchParams()
  for (const [key, value] of Object.entries(claims)) {
    // filters out timestamps
    if (typeof value === 'string' && key !== 'aud') {
      result.set(key, value)
    }
  }

  return validateAuthResponse(as, client, result, expectedState)
}

interface CShakeParams {
  name: string
  length: number
}

async function idTokenHash(data: string, header: CompactJWSHeaderParameters, claimName: string) {
  let algorithm: string | CShakeParams
  switch (header.alg) {
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
    case 'ES512': // Fall through
    case 'Ed25519': // Fall through
    case 'EdDSA':
      algorithm = 'SHA-512'
      break
    case 'ML-DSA-44':
    case 'ML-DSA-65':
    case 'ML-DSA-87':
      algorithm = { name: 'cSHAKE256', length: 512 }
      break
    default:
      throw new UnsupportedOperationError(
        `unsupported JWS algorithm for ${claimName} calculation`,
        { cause: { alg: header.alg } },
      )
  }

  const digest = await crypto.subtle.digest(algorithm, buf(data) as Uint8Array<ArrayBuffer>)
  return b64u(digest.slice(0, digest.byteLength / 2))
}

async function idTokenHashMatches(
  data: string,
  actual: string,
  header: CompactJWSHeaderParameters,
  claimName: string,
) {
  const expected = await idTokenHash(data, header, claimName)
  return actual === expected
}

/**
 * Same as {@link validateAuthResponse} but for FAPI 1.0 Advanced Detached Signature authorization
 * responses.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Authorization Response parameters as URLSearchParams, instance of URL with
 *   parameters in a fragment/hash, or a `form_post` Request instance.
 * @param expectedNonce Expected ID Token `nonce` claim value.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 * @param maxAge ID Token {@link IDToken.auth_time `auth_time`} claim value will be checked to be
 *   present and conform to the `maxAge` value. Use of this option is required if you sent a
 *   `max_age` parameter in an authorization request. Default is
 *   {@link Client.default_max_age `client.default_max_age`} and falls back to
 *   {@link skipAuthTimeCheck}.
 *
 * @returns Validated Authorization Response parameters. Authorization Error Responses are rejected
 *   using {@link AuthorizationResponseError}.
 *
 * @group FAPI 1.0 Advanced
 *
 * @see [Financial-grade API Security Profile 1.0 - Part 2: Advanced](https://openid.net/specs/openid-financial-api-part-2-1_0-final.html#id-token-as-detached-signature)
 */
export async function validateDetachedSignatureResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL | Request,
  expectedNonce: string,
  expectedState?: string | typeof expectNoState,
  maxAge?: number | typeof skipAuthTimeCheck,
  options?: ValidateSignatureOptions & JWEDecryptOptions,
): Promise<URLSearchParams> {
  return validateHybridResponse(
    as,
    client,
    parameters,
    expectedNonce,
    expectedState,
    maxAge,
    options,
    true,
  )
}

/**
 * Same as {@link validateAuthResponse} but for `code id_token` authorization responses.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Authorization Response parameters as URLSearchParams, instance of URL with
 *   parameters in a fragment/hash, or a `form_post` Request instance.
 * @param expectedNonce Expected ID Token `nonce` claim value.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 * @param maxAge ID Token {@link IDToken.auth_time `auth_time`} claim value will be checked to be
 *   present and conform to the `maxAge` value. Use of this option is required if you sent a
 *   `max_age` parameter in an authorization request. Default is
 *   {@link Client.default_max_age `client.default_max_age`} and falls back to
 *   {@link skipAuthTimeCheck}.
 *
 * @returns Validated Authorization Response parameters. Authorization Error Responses are rejected
 *   using {@link AuthorizationResponseError}.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#HybridFlowAuth)
 */
export async function validateCodeIdTokenResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL | Request,
  expectedNonce: string,
  expectedState?: string | typeof expectNoState,
  maxAge?: number | typeof skipAuthTimeCheck,
  options?: ValidateSignatureOptions & JWEDecryptOptions,
): Promise<URLSearchParams> {
  return validateHybridResponse(
    as,
    client,
    parameters,
    expectedNonce,
    expectedState,
    maxAge,
    options,
    false,
  )
}

async function consumeStream(request: Request) {
  if (request.bodyUsed) {
    throw CodedTypeError(
      'form_post Request instances must contain a readable body',
      ERR_INVALID_ARG_VALUE,
      { cause: request },
    )
  }

  return request.text()
}

/**
 * This is not part of the public API.
 *
 * @private
 *
 * @ignore
 *
 * @internal
 */
export async function formPostResponse(request: Request): Promise<string> {
  if (request.method !== 'POST') {
    throw CodedTypeError(
      'form_post responses are expected to use the POST method',
      ERR_INVALID_ARG_VALUE,
      { cause: request },
    )
  }

  if (getContentType(request) !== 'application/x-www-form-urlencoded') {
    throw CodedTypeError(
      'form_post responses are expected to use the application/x-www-form-urlencoded content-type',
      ERR_INVALID_ARG_VALUE,
      { cause: request },
    )
  }

  return consumeStream(request)
}

async function validateHybridResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL | Request,
  expectedNonce: string,
  expectedState: string | typeof expectNoState | undefined,
  maxAge: number | typeof skipAuthTimeCheck | undefined,
  options: (ValidateSignatureOptions & JWEDecryptOptions) | undefined,
  fapi: boolean,
): Promise<URLSearchParams> {
  assertAs(as)
  assertClient(client)

  if (parameters instanceof URL) {
    if (!parameters.hash.length) {
      throw CodedTypeError(
        '"parameters" as an instance of URL must contain a hash (fragment) with the Authorization Response parameters',
        ERR_INVALID_ARG_VALUE,
      )
    }
    parameters = new URLSearchParams(parameters.hash.slice(1))
  } else if (looseInstanceOf(parameters, Request)) {
    parameters = new URLSearchParams(await formPostResponse(parameters))
  } else if (parameters instanceof URLSearchParams) {
    parameters = new URLSearchParams(parameters)
  } else {
    throw CodedTypeError(
      '"parameters" must be an instance of URLSearchParams, URL, or Response',
      ERR_INVALID_ARG_TYPE,
    )
  }

  const id_token = getURLSearchParameter(parameters, 'id_token')
  parameters.delete('id_token')

  switch (expectedState) {
    case undefined:
    case expectNoState:
      break
    default:
      assertString(expectedState, '"expectedState" argument')
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

  if (!id_token) {
    throw OPE('"parameters" does not contain an ID Token', INVALID_RESPONSE)
  }
  const code = getURLSearchParameter(parameters, 'code')
  if (!code) {
    throw OPE('"parameters" does not contain an Authorization Code', INVALID_RESPONSE)
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

  const state = parameters.get('state')
  if (fapi && (typeof expectedState === 'string' || state !== null)) {
    requiredClaims.push('s_hash')
  }

  if (maxAge !== undefined) {
    assertNumber(maxAge, true, '"maxAge" argument')
  } else if (client.default_max_age !== undefined) {
    assertNumber(client.default_max_age, true, '"client.default_max_age"')
  }

  maxAge ??= client.default_max_age ?? skipAuthTimeCheck
  if (client.require_auth_time || maxAge !== skipAuthTimeCheck) {
    requiredClaims.push('auth_time')
  }

  const { claims, header, jwt } = await validateJwt(
    id_token,
    checkSigningAlgorithm.bind(
      undefined,
      client.id_token_signed_response_alg,
      as.id_token_signing_alg_values_supported,
      'RS256',
    ),
    getClockSkew(client),
    getClockTolerance(client),
    options?.[jweDecrypt],
  )
    .then(validatePresence.bind(undefined, requiredClaims))
    .then(validateIssuer.bind(undefined, as))
    .then(validateAudience.bind(undefined, client.client_id))

  const clockSkew = getClockSkew(client)
  const now = epochTime() + clockSkew
  if (claims.iat! < now - 3600) {
    throw OPE(
      'unexpected JWT "iat" (issued at) claim value, it is too far in the past',
      JWT_TIMESTAMP_CHECK,
      { now, claims, claim: 'iat' },
    )
  }

  assertString(claims.c_hash, 'ID Token "c_hash" (code hash) claim value', INVALID_RESPONSE, {
    claims,
  })

  if (claims.auth_time !== undefined) {
    assertNumber(
      claims.auth_time,
      true,
      'ID Token "auth_time" (authentication time)',
      INVALID_RESPONSE,
      { claims },
    )
  }

  if (maxAge !== skipAuthTimeCheck) {
    const now = epochTime() + getClockSkew(client)
    const tolerance = getClockTolerance(client)
    if ((claims as IDToken).auth_time! + maxAge < now - tolerance) {
      throw OPE(
        'too much time has elapsed since the last End-User authentication',
        JWT_TIMESTAMP_CHECK,
        { claims, now, tolerance, claim: 'auth_time' },
      )
    }
  }

  assertString(expectedNonce, '"expectedNonce" argument')

  if (claims.nonce !== expectedNonce) {
    throw OPE('unexpected ID Token "nonce" claim value', JWT_CLAIM_COMPARISON, {
      expected: expectedNonce,
      claims,
      claim: 'nonce',
    })
  }

  if (Array.isArray(claims.aud) && claims.aud.length !== 1) {
    if (claims.azp === undefined) {
      throw OPE(
        'ID Token "aud" (audience) claim includes additional untrusted audiences',
        JWT_CLAIM_COMPARISON,
        { claims, claim: 'aud' },
      )
    }
    if (claims.azp !== client.client_id) {
      throw OPE('unexpected ID Token "azp" (authorized party) claim value', JWT_CLAIM_COMPARISON, {
        expected: client.client_id,
        claims,
        claim: 'azp',
      })
    }
  }

  const { 0: protectedHeader, 1: payload, 2: encodedSignature } = jwt.split('.')

  const signature = b64u(encodedSignature)
  const key = await getPublicSigKeyFromIssuerJwksUri(as, options, header)
  await validateJwsSignature(protectedHeader, payload, key, signature)

  if ((await idTokenHashMatches(code, claims.c_hash, header, 'c_hash')) !== true) {
    throw OPE('invalid ID Token "c_hash" (code hash) claim value', JWT_CLAIM_COMPARISON, {
      code,
      alg: header.alg,
      claim: 'c_hash',
      claims,
    })
  }

  if ((fapi && state !== null) || claims.s_hash !== undefined) {
    assertString(claims.s_hash, 'ID Token "s_hash" (state hash) claim value', INVALID_RESPONSE, {
      claims,
    })
    assertString(state, '"state" response parameter', INVALID_RESPONSE, { parameters })

    if ((await idTokenHashMatches(state, claims.s_hash, header, 's_hash')) !== true) {
      throw OPE('invalid ID Token "s_hash" (state hash) claim value', JWT_CLAIM_COMPARISON, {
        state,
        alg: header.alg,
        claim: 's_hash',
        claims,
      })
    }
  }

  return result
}

/**
 * If configured must be the configured one (client), if not configured must be signalled by the
 * issuer to be supported (issuer), if not signalled may be a default fallback, otherwise its a
 * failure
 */
function checkSigningAlgorithm(
  client: string | string[] | undefined,
  issuer: string[] | undefined,
  fallback: string | string[] | typeof supported | undefined,
  header: CompactJWSHeaderParameters,
) {
  if (client !== undefined) {
    if (typeof client === 'string' ? header.alg !== client : !client.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: client,
        reason: 'client configuration',
      })
    }
    return
  }

  if (Array.isArray(issuer)) {
    if (!issuer.includes(header.alg)) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: issuer,
        reason: 'authorization server metadata',
      })
    }
    return
  }

  if (fallback !== undefined) {
    if (
      typeof fallback === 'string'
        ? header.alg !== fallback
        : typeof fallback === 'function'
          ? !fallback(header.alg)
          : !fallback.includes(header.alg)
    ) {
      throw OPE('unexpected JWT "alg" header parameter', INVALID_RESPONSE, {
        header,
        expected: fallback,
        reason: 'default value',
      })
    }
    return
  }

  throw OPE(
    'missing client or server configuration to verify used JWT "alg" header parameter',
    undefined,
    { client, issuer, fallback },
  )
}

/**
 * Returns a parameter by name from URLSearchParams. It must be only provided once. Returns
 * undefined if the parameter is not present.
 */
function getURLSearchParameter(parameters: URLSearchParams, name: string): string | undefined {
  const { 0: value, length } = parameters.getAll(name)
  if (length > 1) {
    throw OPE(`"${name}" parameter must be provided only once`, INVALID_RESPONSE)
  }
  return value
}

/**
 * > [!WARNING]\
 * > This option has security implications that must be understood, assessed for applicability, and
 * > accepted before use.
 *
 * Use this as a value to {@link validateAuthResponse} `expectedState` parameter to skip the `state`
 * value check when you'll be validating such `state` value yourself instead. This should only be
 * done if you use a `state` parameter value that is integrity protected and bound to the browsing
 * session. One such mechanism to do so is described in an I-D
 * [draft-bradley-oauth-jwt-encoded-state-09](https://datatracker.ietf.org/doc/html/draft-bradley-oauth-jwt-encoded-state-09).
 */
export const skipStateCheck: unique symbol = Symbol()

/**
 * Use this as a value to {@link validateAuthResponse} `expectedState` parameter to indicate no
 * `state` parameter value is expected, i.e. no `state` parameter value was sent with the
 * authorization request.
 */
export const expectNoState: unique symbol = Symbol()

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
 * @returns Validated Authorization Response parameters. Authorization Error Responses throw
 *   {@link AuthorizationResponseError}.
 *
 * @group Authorization Code Grant
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#CodeFlowAuth)
 * @see [RFC 9207 - OAuth 2.0 Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207.html)
 */
export function validateAuthResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL,
  expectedState?: string | typeof expectNoState | typeof skipStateCheck,
): URLSearchParams {
  assertAs(as)
  assertClient(client)

  if (parameters instanceof URL) {
    parameters = parameters.searchParams
  }

  if (!(parameters instanceof URLSearchParams)) {
    throw CodedTypeError(
      '"parameters" must be an instance of URLSearchParams, or URL',
      ERR_INVALID_ARG_TYPE,
    )
  }

  if (getURLSearchParameter(parameters, 'response')) {
    throw OPE(
      '"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()',
      INVALID_RESPONSE,
      { parameters },
    )
  }

  const iss = getURLSearchParameter(parameters, 'iss')
  const state = getURLSearchParameter(parameters, 'state')

  if (!iss && as.authorization_response_iss_parameter_supported) {
    throw OPE('response parameter "iss" (issuer) missing', INVALID_RESPONSE, { parameters })
  }

  if (iss && iss !== as.issuer) {
    throw OPE('unexpected "iss" (issuer) response parameter value', INVALID_RESPONSE, {
      expected: as.issuer,
      parameters,
    })
  }

  switch (expectedState) {
    case undefined:
    case expectNoState:
      if (state !== undefined) {
        throw OPE('unexpected "state" response parameter encountered', INVALID_RESPONSE, {
          expected: undefined,
          parameters,
        })
      }
      break
    case skipStateCheck:
      break
    default:
      assertString(expectedState, '"expectedState" argument')

      if (state !== expectedState) {
        throw OPE(
          state === undefined
            ? 'response parameter "state" missing'
            : 'unexpected "state" response parameter value',
          INVALID_RESPONSE,
          { expected: expectedState, parameters },
        )
      }
  }

  const error = getURLSearchParameter(parameters, 'error')
  if (error) {
    throw new AuthorizationResponseError('authorization response from the server is an error', {
      cause: parameters,
    })
  }

  const id_token = getURLSearchParameter(parameters, 'id_token')
  const token = getURLSearchParameter(parameters, 'token')
  if (id_token !== undefined || token !== undefined) {
    throw new UnsupportedOperationError('implicit and hybrid flows are not supported')
  }

  return brand(new URLSearchParams(parameters))
}

function algToSubtle(alg: string): RsaHashedImportParams | EcKeyImportParams | AlgorithmIdentifier {
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
    case 'EdDSA':
      return 'Ed25519'
    case 'Ed25519':
    case 'ML-DSA-44':
    case 'ML-DSA-65':
    case 'ML-DSA-87':
      return alg
    default:
      throw new UnsupportedOperationError('unsupported JWS algorithm', { cause: { alg } })
  }
}

async function importJwk(alg: string, jwk: JWK) {
  const { ext, key_ops, use, ...key } = jwk
  return crypto.subtle.importKey('jwk', key, algToSubtle(alg), true, ['verify'])
}

export interface DeviceAuthorizationRequestOptions extends HttpRequestOptions<
  'POST',
  URLSearchParams
> {}

/**
 * Performs a Device Authorization Request at the
 * {@link AuthorizationServer.device_authorization_endpoint `as.device_authorization_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param parameters Device Authorization Request parameters.
 *
 * @returns Resolves with a {@link !Response} to then invoke
 *   {@link processDeviceAuthorizationResponse} with
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1)
 */
export async function deviceAuthorizationRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: DeviceAuthorizationRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  const url = resolveEndpoint(
    as,
    'device_authorization_endpoint',
    client.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  const body = new URLSearchParams(parameters)
  body.set('client_id', client.client_id)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  return authenticatedRequest(as, client, clientAuthentication, url, body, headers, options)
}

export interface DeviceAuthorizationResponse {
  /**
   * The device verification code
   */
  readonly device_code: string
  /**
   * The end-user verification code
   */
  readonly user_code: string
  /**
   * The end-user verification URI on the authorization server. The URI should be short and easy to
   * remember as end users will be asked to manually type it into their user agent.
   */
  readonly verification_uri: string
  /**
   * The lifetime in seconds of the "device_code" and "user_code"
   */
  readonly expires_in: number
  /**
   * A verification URI that includes the "user_code" (or other information with the same function
   * as the "user_code"), which is designed for non-textual transmission
   */
  readonly verification_uri_complete?: string
  /**
   * The minimum amount of time in seconds that the client should wait between polling requests to
   * the token endpoint.
   */
  readonly interval?: number

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * Validates {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.device_authorization_endpoint `as.device_authorization_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link deviceAuthorizationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1)
 */
export async function processDeviceAuthorizationResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<DeviceAuthorizationResponse> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  await checkOAuthBodyError(response, 200, 'Device Authorization Endpoint')

  assertReadableResponse(response)
  const json = await getResponseJsonBody<Writeable<DeviceAuthorizationResponse>>(response)

  assertString(json.device_code, '"response" body "device_code" property', INVALID_RESPONSE, {
    body: json,
  })
  assertString(json.user_code, '"response" body "user_code" property', INVALID_RESPONSE, {
    body: json,
  })
  assertString(
    json.verification_uri,
    '"response" body "verification_uri" property',
    INVALID_RESPONSE,
    { body: json },
  )

  let expiresIn: unknown =
    typeof json.expires_in !== 'number' ? parseFloat(json.expires_in) : json.expires_in
  assertNumber(expiresIn, true, '"response" body "expires_in" property', INVALID_RESPONSE, {
    body: json,
  })
  json.expires_in = expiresIn

  if (json.verification_uri_complete !== undefined) {
    assertString(
      json.verification_uri_complete,
      '"response" body "verification_uri_complete" property',
      INVALID_RESPONSE,
      { body: json },
    )
  }

  if (json.interval !== undefined) {
    assertNumber(json.interval, false, '"response" body "interval" property', INVALID_RESPONSE, {
      body: json,
    })
  }

  return json
}

/**
 * Performs a Device Authorization Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param deviceCode Device Code. This is the
 *   {@link DeviceAuthorizationResponse.device_code `device_code`} retrieved from
 *   {@link processDeviceAuthorizationResponse}.
 *
 * @returns Resolves with a {@link !Response} to then invoke {@link processDeviceCodeResponse} with
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function deviceCodeGrantRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  deviceCode: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  assertString(deviceCode, '"deviceCode"')

  const parameters = new URLSearchParams(options?.additionalParameters)
  parameters.set('device_code', deviceCode)
  return tokenEndpointRequest(
    as,
    client,
    clientAuthentication,
    'urn:ietf:params:oauth:grant-type:device_code',
    parameters,
    options,
  )
}

/**
 * Validates Device Authorization Grant {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link deviceCodeGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Device Authorization Grant
 *
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4)
 */
export async function processDeviceCodeResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: ProcessTokenResponseOptions,
): Promise<TokenEndpointResponse> {
  return processGenericAccessTokenResponse(
    as,
    client,
    response,
    undefined,
    options?.[jweDecrypt],
    options?.recognizedTokenTypes,
  )
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
}

/**
 * Generates a {@link CryptoKeyPair} for a given JWS `alg` Algorithm identifier.
 *
 * @param alg Supported JWS `alg` Algorithm identifier. Must be a
 *   {@link JWSAlgorithm supported JWS Algorithm}.
 *
 * @group Utilities
 */
export async function generateKeyPair(
  alg: string,
  options?: GenerateKeyPairOptions,
): Promise<CryptoKeyPair> {
  assertString(alg, '"alg"')

  const algorithm: RsaHashedKeyGenParams | EcKeyGenParams | AlgorithmIdentifier = algToSubtle(alg)

  if (alg.startsWith('PS') || alg.startsWith('RS')) {
    Object.assign(algorithm, {
      modulusLength: options?.modulusLength ?? 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    })
  }

  return crypto.subtle.generateKey(algorithm, options?.extractable ?? false, [
    'sign',
    'verify',
  ]) as Promise<CryptoKeyPair>
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

export interface ValidateJWTAccessTokenOptions extends HttpRequestOptions<'GET'>, JWKSCacheOptions {
  /**
   * Indicates whether DPoP use is required.
   */
  requireDPoP?: boolean

  /**
   * See {@link clockSkew}.
   */
  [clockSkew]?: number

  /**
   * See {@link clockTolerance}.
   */
  [clockTolerance]?: number

  /**
   * Supported (or expected) JWT "alg" header parameter values for the JWT Access Token (and DPoP
   * Proof JWTs). Default is all {@link JWSAlgorithm supported JWS Algorithms}.
   */
  signingAlgorithms?: string[]
}

function normalizeHtu(htu: string) {
  const url = new URL(htu)
  url.search = ''
  url.hash = ''
  return url.href
}

async function validateDPoP(
  request: Request,
  accessToken: string,
  accessTokenClaims: JWTPayload,
  options?: Pick<
    ValidateJWTAccessTokenOptions,
    typeof clockSkew | typeof clockTolerance | 'signingAlgorithms'
  >,
) {
  const headerValue = request.headers.get('dpop')
  if (headerValue === null) {
    throw OPE(
      'operation indicated DPoP use but the request has no DPoP HTTP Header',
      INVALID_REQUEST,
      { headers: request.headers },
    )
  }

  if (request.headers.get('authorization')?.toLowerCase().startsWith('dpop ') === false) {
    throw OPE(
      `operation indicated DPoP use but the request's Authorization HTTP Header scheme is not DPoP`,
      INVALID_REQUEST,
      { headers: request.headers },
    )
  }

  if (typeof accessTokenClaims.cnf?.jkt !== 'string') {
    throw OPE(
      'operation indicated DPoP use but the JWT Access Token has no jkt confirmation claim',
      INVALID_REQUEST,
      { claims: accessTokenClaims },
    )
  }

  const clockSkew = getClockSkew(options)
  const proof = await validateJwt(
    headerValue,
    checkSigningAlgorithm.bind(undefined, options?.signingAlgorithms, undefined, supported),
    clockSkew,
    getClockTolerance(options),
    undefined,
  )
    .then(checkJwtType.bind(undefined, 'dpop+jwt'))
    .then(validatePresence.bind(undefined, ['iat', 'jti', 'ath', 'htm', 'htu']))

  const now = epochTime() + clockSkew
  const diff = Math.abs(now - proof.claims.iat!)
  if (diff > 300) {
    throw OPE('DPoP Proof iat is not recent enough', JWT_TIMESTAMP_CHECK, {
      now,
      claims: proof.claims,
      claim: 'iat',
    }) // TODO: add a symbol skip here for when the RS uses nonces
  }

  if (proof.claims.htm !== request.method) {
    throw OPE('DPoP Proof htm mismatch', JWT_CLAIM_COMPARISON, {
      expected: request.method,
      claims: proof.claims,
      claim: 'htm',
    })
  }

  if (
    typeof proof.claims.htu !== 'string' ||
    normalizeHtu(proof.claims.htu) !== normalizeHtu(request.url)
  ) {
    throw OPE('DPoP Proof htu mismatch', JWT_CLAIM_COMPARISON, {
      expected: normalizeHtu(request.url),
      claims: proof.claims,
      claim: 'htu',
    })
  }

  {
    const expected = b64u(
      await crypto.subtle.digest('SHA-256', buf(accessToken) as Uint8Array<ArrayBuffer>),
    )

    if (proof.claims.ath !== expected) {
      throw OPE('DPoP Proof ath mismatch', JWT_CLAIM_COMPARISON, {
        expected,
        claims: proof.claims,
        claim: 'ath',
      })
    }
  }

  {
    const expected = await calculateJwkThumbprint(proof.header.jwk!)

    if (accessTokenClaims.cnf.jkt !== expected) {
      throw OPE('JWT Access Token confirmation mismatch', JWT_CLAIM_COMPARISON, {
        expected,
        claims: accessTokenClaims,
        claim: 'cnf.jkt',
      })
    }
  }

  const { 0: protectedHeader, 1: payload, 2: encodedSignature } = headerValue.split('.')

  const signature = b64u(encodedSignature)
  const { jwk, alg } = proof.header
  if (!jwk) {
    throw OPE('DPoP Proof is missing the jwk header parameter', INVALID_REQUEST, {
      header: proof.header,
    })
  }
  const key = await importJwk(alg, jwk)
  if (key.type !== 'public') {
    throw OPE('DPoP Proof jwk header parameter must contain a public key', INVALID_REQUEST, {
      header: proof.header,
    })
  }
  await validateJwsSignature(protectedHeader, payload, key, signature)
}

/**
 * Validates use of JSON Web Token (JWT) OAuth 2.0 Access Tokens for a given {@link !Request} as per
 * RFC 6750, RFC 9068, and RFC 9449.
 *
 * The only supported means of sending access tokens is via the Authorization Request Header Field
 * method.
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
 * @param expectedAudience Audience identifier the resource server expects for itself.
 *
 * @group JWT Access Tokens
 *
 * @see [RFC 6750 - OAuth 2.0 Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.html)
 * @see [RFC 9068 - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068.html)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html)
 */
export async function validateJwtAccessToken(
  as: AuthorizationServer,
  request: Request,
  expectedAudience: string,
  options?: ValidateJWTAccessTokenOptions,
): Promise<JWTAccessTokenClaims> {
  assertAs(as)

  if (!looseInstanceOf(request, Request)) {
    throw CodedTypeError('"request" must be an instance of Request', ERR_INVALID_ARG_TYPE)
  }

  assertString(expectedAudience, '"expectedAudience"')

  const authorization = request.headers.get('authorization')
  if (authorization === null) {
    throw OPE('"request" is missing an Authorization HTTP Header', INVALID_REQUEST, {
      headers: request.headers,
    })
  }
  let { 0: scheme, 1: accessToken, length } = authorization.split(' ')
  scheme = scheme.toLowerCase()
  switch (scheme) {
    case 'dpop':
    case 'bearer':
      break
    default:
      throw new UnsupportedOperationError('unsupported Authorization HTTP Header scheme', {
        cause: { headers: request.headers },
      })
  }

  if (length !== 2) {
    throw OPE('invalid Authorization HTTP Header format', INVALID_REQUEST, {
      headers: request.headers,
    })
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

  const { claims, header } = await validateJwt(
    accessToken,
    checkSigningAlgorithm.bind(undefined, options?.signingAlgorithms, undefined, supported),
    getClockSkew(options),
    getClockTolerance(options),
    undefined,
  )
    .then(checkJwtType.bind(undefined, 'at+jwt'))
    .then(validatePresence.bind(undefined, requiredClaims))
    .then(validateIssuer.bind(undefined, as))
    .then(validateAudience.bind(undefined, expectedAudience))
    .catch(reassignRSCode)

  for (const claim of ['client_id', 'jti', 'sub']) {
    if (typeof claims[claim] !== 'string') {
      throw OPE(`unexpected JWT "${claim}" claim type`, INVALID_REQUEST, { claims })
    }
  }

  if ('cnf' in claims) {
    if (!isJsonObject(claims.cnf)) {
      throw OPE('unexpected JWT "cnf" (confirmation) claim value', INVALID_REQUEST, { claims })
    }

    const { 0: cnf, length } = Object.keys(claims.cnf)

    if (length) {
      if (length !== 1) {
        throw new UnsupportedOperationError('multiple confirmation claims are not supported', {
          cause: { claims },
        })
      }

      if (cnf !== 'jkt') {
        throw new UnsupportedOperationError('unsupported JWT Confirmation method', {
          cause: { claims },
        })
      }
    }
  }

  const { 0: protectedHeader, 1: payload, 2: encodedSignature } = accessToken.split('.')

  const signature = b64u(encodedSignature)
  const key = await getPublicSigKeyFromIssuerJwksUri(as, options, header)
  await validateJwsSignature(protectedHeader, payload, key, signature)

  if (
    options?.requireDPoP ||
    scheme === 'dpop' ||
    claims.cnf?.jkt !== undefined ||
    request.headers.has('dpop')
  ) {
    await validateDPoP(request, accessToken, claims, options).catch(reassignRSCode)
  }

  return claims as JWTAccessTokenClaims
}

function reassignRSCode(err: unknown): never {
  if (err instanceof OperationProcessingError && err?.code === INVALID_REQUEST) {
    err.code = INVALID_RESPONSE
  }
  throw err
}

export interface BackchannelAuthenticationRequestOptions extends HttpRequestOptions<
  'POST',
  URLSearchParams
> {}

/**
 * Performs a Backchannel Authentication Request at the
 * {@link AuthorizationServer.backchannel_authentication_endpoint `as.backchannel_authentication_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param parameters Backchannel Authentication Request parameters.
 *
 * @returns Resolves with a {@link !Response} to then invoke
 *   {@link processBackchannelAuthenticationResponse} with
 *
 * @group Client-Initiated Backchannel Authentication (CIBA)
 *
 * @see [OpenID Connect Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0-final.html#auth_request)
 */
export async function backchannelAuthenticationRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  parameters: URLSearchParams | Record<string, string> | string[][],
  options?: BackchannelAuthenticationRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  const url = resolveEndpoint(
    as,
    'backchannel_authentication_endpoint',
    client.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  const body = new URLSearchParams(parameters)
  body.set('client_id', client.client_id)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  return authenticatedRequest(as, client, clientAuthentication, url, body, headers, options)
}

export interface BackchannelAuthenticationResponse {
  /**
   * Unique identifier to identify the authentication request.
   */
  readonly auth_req_id: string
  /**
   * The lifetime in seconds of the "auth_req_id".
   */
  readonly expires_in: number
  /**
   * The minimum amount of time in seconds that the client should wait between polling requests to
   * the token endpoint.
   */
  readonly interval?: number

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * Validates {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.backchannel_authentication_endpoint `as.backchannel_authentication_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link backchannelAuthenticationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Client-Initiated Backchannel Authentication (CIBA)
 *
 * @see [OpenID Connect Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0-final.html#auth_request)
 */
export async function processBackchannelAuthenticationResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<BackchannelAuthenticationResponse> {
  assertAs(as)
  assertClient(client)

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  await checkOAuthBodyError(response, 200, 'Backchannel Authentication Endpoint')

  assertReadableResponse(response)
  const json = await getResponseJsonBody<Writeable<BackchannelAuthenticationResponse>>(response)

  assertString(json.auth_req_id, '"response" body "auth_req_id" property', INVALID_RESPONSE, {
    body: json,
  })

  let expiresIn: unknown =
    typeof json.expires_in !== 'number' ? parseFloat(json.expires_in) : json.expires_in
  assertNumber(expiresIn, true, '"response" body "expires_in" property', INVALID_RESPONSE, {
    body: json,
  })
  json.expires_in = expiresIn

  if (json.interval !== undefined) {
    assertNumber(json.interval, false, '"response" body "interval" property', INVALID_RESPONSE, {
      body: json,
    })
  }

  return json
}

/**
 * Performs a Backchannel Authentication Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param clientAuthentication Client Authentication Method.
 * @param authReqId Unique identifier to identify the authentication request. This is the
 *   {@link BackchannelAuthenticationResponse.auth_req_id `auth_req_id`} retrieved from
 *   {@link processBackchannelAuthenticationResponse}.
 *
 * @returns Resolves with a {@link !Response} to then invoke
 *   {@link processBackchannelAuthenticationGrantResponse} with
 *
 * @group Client-Initiated Backchannel Authentication (CIBA)
 *
 * @see [OpenID Connect Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0-final.html#token_request)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export async function backchannelAuthenticationGrantRequest(
  as: AuthorizationServer,
  client: Client,
  clientAuthentication: ClientAuth,
  authReqId: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertAs(as)
  assertClient(client)

  assertString(authReqId, '"authReqId"')

  const parameters = new URLSearchParams(options?.additionalParameters)
  parameters.set('auth_req_id', authReqId)
  return tokenEndpointRequest(
    as,
    client,
    clientAuthentication,
    'urn:openid:params:grant-type:ciba',
    parameters,
    options,
  )
}

/**
 * Validates Backchannel Authentication Grant {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link backchannelAuthenticationGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Client-Initiated Backchannel Authentication (CIBA)
 *
 * @see [OpenID Connect Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0-final.html#token_request)
 */
export async function processBackchannelAuthenticationGrantResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: ProcessTokenResponseOptions,
): Promise<TokenEndpointResponse> {
  return processGenericAccessTokenResponse(
    as,
    client,
    response,
    undefined,
    options?.[jweDecrypt],
    options?.recognizedTokenTypes,
  )
}

/**
 * Removes all Symbol properties from a type
 */
export type OmitSymbolProperties<T> = {
  [K in keyof T as K extends symbol ? never : K]: T[K]
}

export interface DynamicClientRegistrationRequestOptions
  extends HttpRequestOptions<'POST', string>, DPoPRequestOptions {
  /**
   * Access token optionally issued by an authorization server used to authorize calls to the client
   * registration endpoint.
   */
  initialAccessToken?: string
}

/**
 * Performs a Dynamic Client Registration at the
 * {@link AuthorizationServer.registration_endpoint `as.registration_endpoint`} using the provided
 * client metadata.
 *
 * @param as Authorization Server Metadata.
 * @param metadata Requested Client Metadata.
 * @param options
 *
 * @returns Resolves with a {@link !Response} to then invoke
 *   {@link processDynamicClientRegistrationResponse} with
 *
 * @group Dynamic Client Registration (DCR)
 *
 * @see [RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol (DCR)](https://www.rfc-editor.org/rfc/rfc7591.html#section-3.1)
 * @see [OpenID Connect Dynamic Client Registration 1.0 (DCR)](https://openid.net/specs/openid-connect-registration-1_0-errata2.html#RegistrationRequest)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-protected-resource-access)
 */
export async function dynamicClientRegistrationRequest(
  as: AuthorizationServer,
  metadata: Partial<OmitSymbolProperties<Client>>,
  options?: DynamicClientRegistrationRequestOptions,
): Promise<Response> {
  assertAs(as)

  const url = resolveEndpoint(
    as,
    'registration_endpoint',
    metadata.use_mtls_endpoint_aliases,
    options?.[allowInsecureRequests] !== true,
  )

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')
  headers.set('content-type', 'application/json')

  const method = 'POST'

  if (options?.DPoP) {
    assertDPoP(options.DPoP)
    await options.DPoP.addProof(url, headers, method, options.initialAccessToken)
  }

  if (options?.initialAccessToken) {
    headers.set(
      'authorization',
      `${headers.has('dpop') ? 'DPoP' : 'Bearer'} ${options.initialAccessToken}`,
    )
  }

  const response = await (options?.[customFetch] || fetch)(url.href, {
    body: JSON.stringify(metadata),
    headers: Object.fromEntries(headers.entries()),
    method,
    redirect: 'manual',
    signal: signal(url, options?.signal),
  })
  options?.DPoP?.cacheNonce(response, url)
  return response
}

/**
 * Validates {@link !Response} instance to be one coming from the
 * {@link AuthorizationServer.registration_endpoint `as.registration_endpoint`}.
 *
 * @param response Resolved value from {@link dynamicClientRegistrationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
 *   style errors are rejected using {@link ResponseBodyError}. WWW-Authenticate HTTP Header
 *   challenges are rejected with {@link WWWAuthenticateChallengeError}.
 *
 * @group Dynamic Client Registration (DCR)
 *
 * @see [RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol (DCR)](https://www.rfc-editor.org/rfc/rfc7591.html#section-3.2)
 * @see [OpenID Connect Dynamic Client Registration 1.0 (DCR)](https://openid.net/specs/openid-connect-registration-1_0-errata2.html#RegistrationResponse)
 */
export async function processDynamicClientRegistrationResponse(
  response: Response,
): Promise<OmitSymbolProperties<Client>> {
  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  await checkOAuthBodyError(response, 201, 'Dynamic Client Registration Endpoint')

  assertReadableResponse(response)
  const json = await getResponseJsonBody<Writeable<Client>>(response)

  assertString(json.client_id, '"response" body "client_id" property', INVALID_RESPONSE, {
    body: json,
  })

  if (json.client_secret !== undefined) {
    assertString(json.client_secret, '"response" body "client_secret" property', INVALID_RESPONSE, {
      body: json,
    })
  }

  if (json.client_secret) {
    assertNumber(
      json.client_secret_expires_at,
      true,
      '"response" body "client_secret_expires_at" property',
      INVALID_RESPONSE,
      {
        body: json,
      },
    )
  }

  return json
}

/**
 * Protected Resource Server Metadata
 *
 * @group Resource Server Metadata
 *
 * @see [IANA OAuth Protected Resource Server Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#protected-resource-metadata)
 */
export interface ResourceServer {
  /**
   * Resource server's Resource Identifier URL.
   */
  readonly resource: string

  /**
   * JSON array containing a list of OAuth authorization server issuer identifiers
   */
  readonly authorization_servers?: string[]

  /**
   * URL of the protected resource's JWK Set document
   */
  readonly jwks_uri?: string

  /**
   * JSON array containing a list of the OAuth 2.0 scope values that are used in authorization
   * requests to request access to this protected resource
   */
  readonly scopes_supported?: string[]

  /**
   * JSON array containing a list of the OAuth 2.0 Bearer Token presentation methods that this
   * protected resource supports
   */
  readonly bearer_methods_supported?: string[]

  /**
   * JSON array containing a list of the JWS signing algorithms (alg values) supported by the
   * protected resource for signed content
   */
  readonly resource_signing_alg_values_supported?: string[]

  /**
   * Human-readable name of the protected resource
   */
  readonly resource_name?: string

  /**
   * URL of a page containing human-readable information that developers might want or need to know
   * when using the protected resource
   */
  readonly resource_documentation?: string

  /**
   * URL of a page containing human-readable information about the protected resource's requirements
   * on how the client can use the data provided by the protected resource
   */
  readonly resource_policy_uri?: string

  /**
   * URL of a page containing human-readable information about the protected resource's terms of
   * service
   */
  readonly resource_tos_uri?: string

  /**
   * Boolean value indicating protected resource support for mutual-TLS client certificate-bound
   * access tokens
   */
  readonly tls_client_certificate_bound_access_tokens?: boolean

  /**
   * JSON array containing a list of the authorization details type values supported by the resource
   * server when the authorization_details request parameter is used
   */
  readonly authorization_details_types_supported?: boolean

  /**
   * JSON array containing a list of the JWS alg values supported by the resource server for
   * validating DPoP proof JWTs
   */
  readonly dpop_signing_alg_values_supported?: boolean

  /**
   * Boolean value specifying whether the protected resource always requires the use of DPoP-bound
   * access tokens
   */
  readonly dpop_bound_access_tokens_required?: boolean

  /**
   * Signed JWT containing metadata parameters about the protected resource as claims
   */
  readonly signed_metadata?: string

  readonly [metadata: string]: JsonValue | undefined
}

/**
 * Performs a protected resource metadata discovery.
 *
 * @param resourceIdentifier Protected resource's resource identifier to resolve the well-known
 *   discovery URI for
 *
 * @returns Resolves with a {@link !Response} to then invoke {@link processResourceDiscoveryResponse}
 *   with
 *
 * @group Resource Server Metadata
 *
 * @see [RFC 9728 - OAuth 2.0 Protected Resource Metadata](https://www.rfc-editor.org/rfc/rfc9728.html#name-protected-resource-metadata-)
 */
export async function resourceDiscoveryRequest(
  resourceIdentifier: URL,
  options?: HttpRequestOptions<'GET'>,
): Promise<Response> {
  return performDiscovery(
    resourceIdentifier,
    'resourceIdentifier',
    (url) => {
      prependWellKnown(url, '.well-known/oauth-protected-resource', true)
      return url
    },
    options,
  )
}

/**
 * Validates {@link !Response} instance to be one coming from the resource server's well-known
 * discovery endpoint.
 *
 * @param expectedResourceIdentifier Expected Resource Identifier value.
 * @param response Resolved value from {@link resourceDiscoveryRequest} or from a general
 *   {@link !fetch} following {@link WWWAuthenticateChallengeParameters.resource_metadata}.
 *
 * @returns Resolves with the discovered Resource Server Metadata.
 *
 * @group Resource Server Metadata
 *
 * @see [RFC 9728 - OAuth 2.0 Protected Resource Metadata](https://www.rfc-editor.org/rfc/rfc9728.html#name-protected-resource-metadata-r)
 */
export async function processResourceDiscoveryResponse(
  expectedResourceIdentifier: URL,
  response: Response,
): Promise<ResourceServer> {
  const expected = expectedResourceIdentifier as URL | typeof _nodiscoverycheck
  if (!(expected instanceof URL) && expected !== _nodiscoverycheck) {
    throw CodedTypeError(
      '"expectedResourceIdentifier" must be an instance of URL',
      ERR_INVALID_ARG_TYPE,
    )
  }

  if (!looseInstanceOf(response, Response)) {
    throw CodedTypeError('"response" must be an instance of Response', ERR_INVALID_ARG_TYPE)
  }

  if (response.status !== 200) {
    throw OPE(
      '"response" is not a conform Resource Server Metadata response (unexpected HTTP status code)',
      RESPONSE_IS_NOT_CONFORM,
      response,
    )
  }

  assertReadableResponse(response)
  const json = await getResponseJsonBody<ResourceServer>(response)

  assertString(json.resource, '"response" body "resource" property', INVALID_RESPONSE, {
    body: json,
  })

  if (expected !== _nodiscoverycheck && new URL(json.resource).href !== expected.href) {
    throw OPE(
      '"response" body "resource" property does not match the expected value',
      JSON_ATTRIBUTE_COMPARISON,
      { expected: expected.href, body: json, attribute: 'resource' },
    )
  }

  return json
}

async function getResponseJsonBody<T = JsonObject>(
  response: Response,
  check: (response: Response) => void = assertApplicationJson,
): Promise<T> {
  let json: JsonValue
  try {
    json = await response.json()
  } catch (cause) {
    check(response)
    throw OPE('failed to parse "response" body as JSON', PARSE_ERROR, cause)
  }

  if (!isJsonObject<T>(json)) {
    throw OPE('"response" body must be a top level object', INVALID_RESPONSE, { body: json })
  }

  return json
}

/**
 * This is not part of the public API.
 *
 * @private
 *
 * @ignore
 *
 * @internal
 */
export const _nopkce = nopkce

/**
 * This is not part of the public API.
 *
 * @private
 *
 * @ignore
 *
 * @internal
 */
export const _nodiscoverycheck: unique symbol = Symbol()

/**
 * This is not part of the public API.
 *
 * @private
 *
 * @ignore
 *
 * @internal
 */
export const _expectedIssuer: unique symbol = Symbol()
