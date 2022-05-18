const NAME = 'oauth4webapi'
const VERSION = 'v1.0.1'
const HOMEPAGE = 'https://github.com/panva/oauth4webapi'
const USER_AGENT = `${NAME}/${VERSION} (${HOMEPAGE})`

export type JsonObject = { [Key in string]?: JsonValue }
export type JsonArray = JsonValue[]
export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

/**
 * Interface to pass an asymmetric private key and, optionally, its associated
 * JWK Key ID to be added as a `kid` JOSE Header Parameter.
 */
export interface PrivateKey {
  /**
   * An asymmetric private
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey CryptoKey}.
   *
   * Its algorithm must be compatible with a supported
   * {@link JWSAlgorithm JWS `alg` Algorithm}.
   */
  key: CryptoKey

  /**
   * JWK Key ID to add to JOSE headers when this key is used. When not provided
   * no `kid` (JWK Key ID) will be added to the JOSE Header.
   */
  kid?: string
}

/**
 * Supported Client Authentication Methods.
 *
 * - **`client_secret_basic`** (default) uses the HTTP `Basic` authentication scheme
 * to send
 * {@link Client.client_id `client_id`} and
 * {@link Client.client_secret `client_secret`}
 * in an `Authorization` HTTP Header.
 *
 * - **`client_secret_post`** uses the HTTP request body to send
 * {@link Client.client_id `client_id`} and
 * {@link Client.client_secret `client_secret`}
 * as `application/x-www-form-urlencoded` body parameters.
 *
 * - **`private_key_jwt`** uses the HTTP request body to send
 * {@link Client.client_id `client_id`}, `client_assertion_type`, and `client_assertion`
 * as `application/x-www-form-urlencoded` body parameters.
 * The `client_assertion` is signed using a private key supplied
 * as an {@link AuthenticatedRequestOptions.clientPrivateKey options parameter}.
 *
 * - **`none`** (public client) uses the HTTP request body to send only
 * {@link Client.client_id `client_id`}
 * as `application/x-www-form-urlencoded` body parameter.
 *
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3 RFC 6749 - The OAuth 2.0 Authorization Framework}
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication OpenID Connect Core 1.0}
 * @see {@link https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method OAuth Token Endpoint Authentication Methods}
 */
export type ClientAuthenticationMethod =
  | 'client_secret_basic'
  | 'client_secret_post'
  | 'private_key_jwt'
  | 'none'

/**
 * Supported JWS `alg` Algorithm identifiers.
 *
 * @example PS256 CryptoKey algorithm
 * ```ts
 * interface Ps256Algorithm extends RsaHashedKeyAlgorithm {
 *   name: 'RSA-PSS'
 *   hash: { name: 'SHA-256' }
 * }
 * ```
 *
 * @example ES256 CryptoKey algorithm
 * ```ts
 * interface Es256Algorithm extends EcKeyAlgorithm {
 *   name: 'ECDSA'
 *   namedCurve: 'P-256'
 * }
 * ```
 *
 * @example RS256 CryptoKey algorithm
 * ```ts
 * interface Rs256Algorithm extends RsaHashedKeyAlgorithm {
 *   name: 'RSASSA-PKCS1-v1_5'
 *   hash: { name: 'SHA-256' }
 * }
 * ```
 */
export type JWSAlgorithm = 'PS256' | 'ES256' | 'RS256'

export interface JWK {
  // common
  readonly kty?: string
  readonly kid?: string
  readonly alg?: string
  readonly use?: string
  readonly key_ops?: string[]
  // RSA
  readonly e?: string
  readonly n?: string
  // EC
  readonly crv?: string
  readonly x?: string
  readonly y?: string

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * Authorization Server Metadata
 *
 * @see {@link https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#authorization-server-metadata IANA OAuth Authorization Server Metadata registry}
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
   * JSON array containing a list of the `scope` values that this authorization
   * server supports.
   */
  readonly scopes_supported?: string[]
  /**
   * JSON array containing a list of the `response_type` values that this
   * authorization server supports.
   */
  readonly response_types_supported?: string[]
  /**
   * JSON array containing a list of the `response_mode` values that this
   * authorization server supports.
   */
  readonly response_modes_supported?: string[]
  /**
   * JSON array containing a list of the `grant_type` values that this
   * authorization server supports.
   */
  readonly grant_types_supported?: string[]
  /**
   * JSON array containing a list of client authentication methods supported by
   * this token endpoint.
   */
  readonly token_endpoint_auth_methods_supported?: string[]
  /**
   * JSON array containing a list of the JWS signing algorithms supported by the
   * token endpoint for the signature on the JWT used to authenticate the client
   * at the token endpoint.
   */
  readonly token_endpoint_auth_signing_alg_values_supported?: string[]
  /**
   * URL of a page containing human-readable information that developers might
   * want or need to know when using the authorization server.
   */
  readonly service_documentation?: string
  /**
   * Languages and scripts supported for the user interface, represented as a
   * JSON array of language tag values from RFC 5646.
   */
  readonly ui_locales_supported?: string[]
  /**
   * URL that the authorization server provides to the person registering the
   * client to read about the authorization server's requirements on how the
   * client can use the data provided by the authorization server.
   */
  readonly op_policy_uri?: string
  /**
   * URL that the authorization server provides to the person registering the
   * client to read about the authorization server's terms of service.
   */
  readonly op_tos_uri?: string
  /**
   * URL of the authorization server's revocation endpoint.
   */
  readonly revocation_endpoint?: string
  /**
   * JSON array containing a list of client authentication methods supported by
   * this revocation endpoint.
   */
  readonly revocation_endpoint_auth_methods_supported?: string[]
  /**
   * JSON array containing a list of the JWS signing algorithms supported by the
   * revocation endpoint for the signature on the JWT used to authenticate the
   * client at the revocation endpoint.
   */
  readonly revocation_endpoint_auth_signing_alg_values_supported?: string[]
  /**
   * URL of the authorization server's introspection endpoint.
   */
  readonly introspection_endpoint?: string
  /**
   * JSON array containing a list of client authentication methods supported by
   * this introspection endpoint.
   */
  readonly introspection_endpoint_auth_methods_supported?: string[]
  /**
   * JSON array containing a list of the JWS signing algorithms supported by the
   * introspection endpoint for the signature on the JWT used to authenticate
   * the client at the introspection endpoint.
   */
  readonly introspection_endpoint_auth_signing_alg_values_supported?: string[]
  /**
   * PKCE code challenge methods supported by this authorization server.
   */
  readonly code_challenge_methods_supported?: string[]
  /**
   * Signed JWT containing metadata values about the authorization server as
   * claims.
   */
  readonly signed_metadata?: string
  /**
   * URL of the authorization server's device authorization endpoint.
   */
  readonly device_authorization_endpoint?: string
  /**
   * Indicates authorization server support for mutual-TLS client
   * certificate-bound access tokens.
   */
  readonly tls_client_certificate_bound_access_tokens?: boolean
  /**
   * JSON object containing alternative authorization server endpoints, which a
   * client intending to do mutual TLS will use in preference to the
   * conventional endpoints.
   */
  readonly mtls_endpoint_aliases?: MTLSEndpointAliases
  /**
   * URL of the authorization server's UserInfo Endpoint.
   */
  readonly userinfo_endpoint?: string
  /**
   * JSON array containing a list of the Authentication Context Class References
   * that this authorization server supports.
   */
  readonly acr_values_supported?: string[]
  /**
   * JSON array containing a list of the Subject Identifier types that this
   * authorization server supports.
   */
  readonly subject_types_supported?: string[]
  /**
   * JSON array containing a list of the JWS `alg` values supported by the
   * authorization server for the ID Token.
   */
  readonly id_token_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `alg` values supported by the
   * authorization server for the ID Token.
   */
  readonly id_token_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `enc` values supported by the
   * authorization server for the ID Token.
   */
  readonly id_token_encryption_enc_values_supported?: string[]
  /**
   * JSON array containing a list of the JWS `alg` values supported by the
   * UserInfo Endpoint.
   */
  readonly userinfo_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `alg` values supported by the
   * UserInfo Endpoint.
   */
  readonly userinfo_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `enc` values supported by the
   * UserInfo Endpoint.
   */
  readonly userinfo_encryption_enc_values_supported?: string[]
  /**
   * JSON array containing a list of the JWS `alg` values supported by the
   * authorization server for Request Objects.
   */
  readonly request_object_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `alg` values supported by the
   * authorization server for Request Objects.
   */
  readonly request_object_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of the JWE `enc` values supported by the
   * authorization server for Request Objects.
   */
  readonly request_object_encryption_enc_values_supported?: string[]
  /**
   * JSON array containing a list of the `display` parameter values that the
   * authorization server supports.
   */
  readonly display_values_supported?: string[]
  /**
   * JSON array containing a list of the Claim Types that the authorization
   * server supports.
   */
  readonly claim_types_supported?: string[]
  /**
   * JSON array containing a list of the Claim Names of the Claims that the
   * authorization server MAY be able to supply values for.
   */
  readonly claims_supported?: string[]
  /**
   * Languages and scripts supported for values in Claims being returned,
   * represented as a JSON array of RFC 5646 language tag values.
   */
  readonly claims_locales_supported?: string[]
  /**
   * Boolean value specifying whether the authorization server supports use of
   * the `claims` parameter.
   */
  readonly claims_parameter_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports use of
   * the `request` parameter.
   */
  readonly request_parameter_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports use of
   * the `request_uri` parameter.
   */
  readonly request_uri_parameter_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server requires any
   * `request_uri` values used to be pre-registered.
   */
  readonly require_request_uri_registration?: boolean
  /**
   * Indicates where authorization request needs to be protected as Request
   * Object and provided through either `request` or `request_uri` parameter.
   */
  readonly require_signed_request_object?: boolean
  /**
   * URL of the authorization server's pushed authorization request endpoint.
   */
  readonly pushed_authorization_request_endpoint?: string
  /**
   * Indicates whether the authorization server accepts authorization requests
   * only via PAR.
   */
  readonly require_pushed_authorization_requests?: boolean
  /**
   * JSON array containing a list of algorithms supported by the authorization
   * server for introspection response signing.
   */
  readonly introspection_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization
   * server for introspection response content key encryption (`alg` value).
   */
  readonly introspection_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization
   * server for introspection response content encryption (`enc` value).
   */
  readonly introspection_encryption_enc_values_supported?: string[]
  /**
   * Boolean value indicating whether the authorization server provides the
   * `iss` parameter in the authorization response.
   */
  readonly authorization_response_iss_parameter_supported?: boolean
  /**
   * JSON array containing a list of algorithms supported by the authorization
   * server for introspection response signing.
   */
  readonly authorization_signing_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization
   * server for introspection response encryption (`alg` value).
   */
  readonly authorization_encryption_alg_values_supported?: string[]
  /**
   * JSON array containing a list of algorithms supported by the authorization
   * server for introspection response encryption (`enc` value).
   */
  readonly authorization_encryption_enc_values_supported?: string[]
  /**
   * CIBA Backchannel Authentication Endpoint.
   */
  readonly backchannel_authentication_endpoint?: string
  /**
   * JSON array containing a list of the JWS signing algorithms supported for
   * validation of signed CIBA authentication requests.
   */
  readonly backchannel_authentication_request_signing_alg_values_supported?: string[]
  /**
   * Supported CIBA authentication result delivery modes.
   */
  readonly backchannel_token_delivery_modes_supported?: string[]
  /**
   * Indicates whether the authorization server supports the use of the CIBA
   * `user_code` parameter.
   */
  readonly backchannel_user_code_parameter_supported?: boolean
  /**
   * URL of an authorization server iframe that supports cross-origin
   * communications for session state information with the RP Client, using the
   * HTML5 postMessage API.
   */
  readonly check_session_iframe?: string
  /**
   * JSON array containing a list of the JWS algorithms supported for DPoP proof
   * JWTs.
   */
  readonly dpop_signing_alg_values_supported?: string[]
  /**
   * URL at the authorization server to which an RP can perform a redirect to
   * request that the End-User be logged out at the authorization server.
   */
  readonly end_session_endpoint?: string
  /**
   * Boolean value specifying whether the authorization server can pass `iss`
   * (issuer) and `sid` (session ID) query parameters to identify the RP session
   * with the authorization server when the `frontchannel_logout_uri` is used.
   */
  readonly frontchannel_logout_session_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports
   * HTTP-based logout.
   */
  readonly frontchannel_logout_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server can pass a `sid`
   * (session ID) Claim in the Logout Token to identify the RP session with the
   * OP.
   */
  readonly backchannel_logout_session_supported?: boolean
  /**
   * Boolean value specifying whether the authorization server supports
   * back-channel logout.
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
 * @see {@link https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#client-metadata IANA OAuth Client Registration Metadata registry}
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
   * Client {@link ClientAuthenticationMethod authentication method} for the
   * client's authenticated requests. Default is `client_secret_basic`.
   */
  token_endpoint_auth_method?: ClientAuthenticationMethod
  /**
   * JWS `alg` algorithm required for signing the ID Token issued to this
   * Client. When not configured the default is
   * to allow only {@link JWSAlgorithm supported algorithms} listed in
   * {@link AuthorizationServer.id_token_signing_alg_values_supported `as.id_token_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  id_token_signed_response_alg?: JWSAlgorithm
  /**
   * JWS `alg` algorithm required for signing authorization responses. When not
   * configured the default is
   * to allow only {@link JWSAlgorithm supported algorithms} listed in
   * {@link AuthorizationServer.authorization_signing_alg_values_supported `as.authorization_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  authorization_signed_response_alg?: JWSAlgorithm
  /**
   * Boolean value specifying whether the {@link IDToken.auth_time `auth_time`}
   * Claim in the ID Token is REQUIRED. Default is `false`.
   */
  require_auth_time?: boolean
  /**
   * JWS `alg` algorithm REQUIRED for signing UserInfo Responses. When not
   * configured the default is
   * to allow only {@link JWSAlgorithm supported algorithms} listed in
   * {@link AuthorizationServer.userinfo_signing_alg_values_supported `as.userinfo_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  userinfo_signed_response_alg?: JWSAlgorithm
  /**
   * JWS `alg` algorithm REQUIRED for signed introspection responses. When not
   * configured the default is
   * to allow only {@link JWSAlgorithm supported algorithms} listed in
   * {@link AuthorizationServer.introspection_signing_alg_values_supported `as.introspection_signing_alg_values_supported`}
   * and fall back to `RS256` when the authorization server metadata is not set.
   */
  introspection_signed_response_alg?: JWSAlgorithm
  /**
   * Default Maximum Authentication Age.
   */
  default_max_age?: number

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
  } catch {
    throw new TypeError('The input to be decoded is not correctly encoded.')
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
 * simple LRU
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

export class UnsupportedOperationError extends Error {
  constructor(message?: string) {
    super(message ?? 'operation not supported')
    this.name = this.constructor.name
    // @ts-ignore
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export class OperationProcessingError extends Error {
  constructor(message: string) {
    super(message)
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

export type ProcessingMode = 'oidc' | 'oauth2'

const SUPPORTED_JWS_ALGS: JWSAlgorithm[] = ['PS256', 'ES256', 'RS256']

export interface HttpRequestOptions {
  /**
   * An {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal AbortSignal}
   * instance to abort the underlying fetch requests.
   *
   * @example Obtain a 5000ms timeout AbortSignal
   * ```js
   * const signal = AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
   * ```
   */
  signal?: AbortSignal

  /**
   * A {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers Headers}
   * instance to additionally send with the HTTP Request(s) triggered by this
   * functions invocation.
   */
  headers?: Headers
}

export interface DiscoveryRequestOptions extends HttpRequestOptions {
  /**
   * The issuer transformation algorithm to use.
   */
  algorithm?: ProcessingMode
}

function preserveBodyStream(response: Response) {
  assertReadableResponse(response)
  return response.clone()
}

function processDpopNonce(response: Response) {
  const url = new URL(response.url)
  if (response.headers.has('dpop-nonce')) {
    dpopNonces.set(url.origin, response.headers.get('dpop-nonce')!)
  }
  return response
}

function normalizeTyp(value: string) {
  return value.toLowerCase().replace(/^application\//, '')
}

function isJsonObject<T = JsonObject>(input: JsonValue): input is T {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return false
  }

  return true
}

function prepareHeaders(input: unknown): Headers {
  if (input !== undefined && !(input instanceof Headers)) {
    throw new TypeError('"options.headers" must be an instance of Headers')
  }
  const headers = new Headers(input)
  if (!headers.has('user-agent')) {
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

/**
 * Performs an authorization server metadata discovery using one of two
 * {@link DiscoveryRequestOptions.algorithm transformation algorithms}
 * applied to the `issuerIdentifier` argument.
 *
 * - `oidc` (default) as defined by OpenID Connect Discovery 1.0.
 * - `oauth2` as defined by RFC 8414.
 *
 * The difference between these two algorithms is in their handling of path
 * components in the Issuer Identifier.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8414.html#section-3 RFC 8414 - OAuth 2.0 Authorization Server Metadata}
 * @see {@link https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig OpenID Connect Discovery 1.0}
 *
 * @param issuerIdentifier Issuer Identifier to resolve the well-known discovery
 * URI for.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function discoveryRequest(
  issuerIdentifier: URL,
  options?: DiscoveryRequestOptions,
): Promise<Response> {
  if (!(issuerIdentifier instanceof URL)) {
    throw new TypeError('"issuer" must be an instance of URL')
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
        url.pathname = `.well-known/oauth-authorization-server`
      } else {
        url.pathname = `.well-known/oauth-authorization-server/${url.pathname}`.replace('//', '/')
      }
      break
    default:
      throw new TypeError('"options.algorithm" must be "oidc" (default), or "oauth2"')
  }

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  return fetch(url.href, {
    headers,
    method: 'GET',
    redirect: 'manual',
    signal: options?.signal,
  }).then(processDpopNonce)
}

/**
 * Validates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the authorization server's well-known discovery endpoint.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8414.html#section-3 RFC 8414 - OAuth 2.0 Authorization Server Metadata}
 * @see {@link https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig OpenID Connect Discovery 1.0}
 *
 * @param expectedIssuerIdentifier Expected Issuer Identifier value.
 * @param response Resolved value from {@link discoveryRequest}.
 *
 * @returns Resolves with the discovered Authorization Server Metadata.
 */
export async function processDiscoveryResponse(
  expectedIssuerIdentifier: URL,
  response: Response,
): Promise<AuthorizationServer> {
  if (!(expectedIssuerIdentifier instanceof URL)) {
    throw new TypeError('"expectedIssuer" must be an instance of URL')
  }

  if (!(response instanceof Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    throw new OPE('"response" is not a conform Authorization Server Metadata response')
  }

  let json: JsonValue
  try {
    json = await preserveBodyStream(response).json()
  } catch {
    throw new OPE('failed to parse "response" body as JSON')
  }

  if (!isJsonObject<AuthorizationServer>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (typeof json.issuer !== 'string' || json.issuer.length === 0) {
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
 * @see {@link https://www.rfc-editor.org/rfc/rfc7636.html#section-4 RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)}
 */
export function generateRandomCodeVerifier() {
  return randomBytes()
}

/**
 * Generate random `state` value.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.1 RFC 6749 - The OAuth 2.0 Authorization Framework}
 */
export function generateRandomState() {
  return randomBytes()
}

/**
 * Generate random `nonce` value.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#IDToken OpenID Connect Core 1.0}
 */
export function generateRandomNonce() {
  return randomBytes()
}

/**
 *
 * Calculates the PKCE `code_verifier` value to send with an authorization
 * request using the S256 PKCE Code Challenge Method transformation.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7636.html#section-4 RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)}
 *
 * @param codeVerifier `code_verifier` value generated e.g. from
 * {@link generateRandomCodeVerifier}.
 */
export async function calculatePKCECodeChallenge(codeVerifier: string) {
  if (typeof codeVerifier !== 'string' || codeVerifier.length === 0) {
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

  if (input.kid !== undefined && (typeof input.kid !== 'string' || input.kid.length === 0)) {
    throw new TypeError('"kid" must be a non-empty string')
  }

  return { key: input.key, kid: input.kid }
}

export interface DPoPOptions extends CryptoKeyPair {
  /**
   * Private
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey CryptoKey}
   * instance to sign the DPoP Proof JWT with.
   *
   * Its algorithm must be compatible with a supported
   * {@link JWSAlgorithm JWS `alg` Algorithm}.
   */
  privateKey: CryptoKey

  /**
   * The public key corresponding to {@link DPoPOptions.privateKey}
   */
  publicKey: CryptoKey

  /**
   * Server-Provided Nonce to use in the request. This option serves as an
   * override in case the self-correcting mechanism does not work with a
   * particular server. Previously received nonces will be used automatically.
   */
  nonce?: string
}

export interface DPoPRequestOptions {
  /**
   * DPoP-related options.
   */
  DPoP?: DPoPOptions
}

export interface AuthenticatedRequestOptions {
  /**
   * Private key to use for `private_key_jwt`
   * {@link ClientAuthenticationMethod client authentication}.
   * Its algorithm must be compatible with a supported
   * {@link JWSAlgorithm JWS `alg` Algorithm}.
   */
  clientPrivateKey?: CryptoKey | PrivateKey
}

export interface PushedAuthorizationRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions,
    DPoPRequestOptions {}

/**
 * The client identifier is encoded using the
 * `application/x-www-form-urlencoded` encoding algorithm per Appendix B, and
 * the encoded value is used as the username; the client password is encoded
 * using the same algorithm and used as the password.
 */
function formUrlEncode(token: string) {
  return encodeURIComponent(token).replace(/%20/g, '+')
}

/**
 * Formats client_id and client_secret as an HTTP Basic Authentication header as
 * per the OAuth 2.0 specified in RFC6749.
 */
function clientSecretBasic(clientId: string, clientSecret: string) {
  const username = formUrlEncode(clientId)
  const password = formUrlEncode(clientSecret)
  const credentials = btoa(`${username}:${password}`)
  return `Basic ${credentials}`
}

/**
 * Determines an RSASSA-PSS algorithm identifier from CryptoKey instance
 * properties.
 */
function psAlg(key: CryptoKey): JWSAlgorithm {
  switch ((<RsaHashedKeyAlgorithm>key.algorithm).hash.name) {
    case 'SHA-256':
      return 'PS256'
    default:
      throw new UnsupportedOperationError('unsupported RsaHashedKeyAlgorithm hash name')
  }
}

/**
 * Determines an RSASSA-PKCS1-v1_5 algorithm identifier from CryptoKey instance
 * properties.
 */
function rsAlg(key: CryptoKey): JWSAlgorithm {
  switch ((<RsaHashedKeyAlgorithm>key.algorithm).hash.name) {
    case 'SHA-256':
      return 'RS256'
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
    default:
      throw new UnsupportedOperationError('unsupported EcKeyAlgorithm namedCurve')
  }
}

/**
 * Determines a supported JWS `alg` identifier from CryptoKey instance
 * properties.
 */
function determineJWSAlgorithm(key: CryptoKey) {
  switch (key.algorithm.name) {
    case 'RSA-PSS':
      return psAlg(key)
    case 'RSASSA-PKCS1-v1_5':
      return rsAlg(key)
    case 'ECDSA':
      return esAlg(key)
    default:
      throw new UnsupportedOperationError('unsupported CryptoKey algorithm name')
  }
}

/**
 * Returns the current unix timestamp in seconds.
 */
function epochTime() {
  return Math.floor(Date.now() / 1000)
}

function clientAssertion(as: AuthorizationServer, client: Client) {
  const now = epochTime()
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
 * Generates a unique client assertion to be used in `private_key_jwt`
 * authenticated requests.
 */
async function privateKeyJwt(
  as: AuthorizationServer,
  client: Client,
  key: CryptoKey,
  kid?: string,
) {
  return jwt(
    {
      alg: determineJWSAlgorithm(key),
      kid,
    },
    clientAssertion(as, client),
    key,
  )
}

function assertIssuer(metadata: AuthorizationServer): metadata is AuthorizationServer {
  if (typeof metadata !== 'object' || metadata === null) {
    throw new TypeError('"issuer" must be an object')
  }

  if (typeof metadata.issuer !== 'string' || metadata.issuer.length === 0) {
    throw new TypeError('"issuer.issuer" property must be a non-empty string')
  }
  return true
}

function assertClient(metadata: Client): metadata is Client {
  if (typeof metadata !== 'object' || metadata === null) {
    throw new TypeError('"client" must be an object')
  }

  if (typeof metadata.client_id !== 'string' || metadata.client_id.length === 0) {
    throw new TypeError('"client.client_id" property must be a non-empty string')
  }
  return true
}

function assertClientSecret(clientSecret: unknown) {
  if (typeof clientSecret !== 'string' || clientSecret.length === 0) {
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
 * Applies supported client authentication to an URLSearchParams instance
 * representing the request body and/or a Headers instance to be sent with an
 * authenticated request.
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
    case 'none': {
      assertNoClientSecret('none', client.client_secret)
      assertNoClientPrivateKey('none', clientPrivateKey)
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
  if (key.usages.includes('sign') === false) {
    throw new TypeError(
      'private CryptoKey instances used for signing assertions must include "sign" in their "usages"',
    )
  }
  const input = `${b64u(buf(JSON.stringify(header)))}.${b64u(buf(JSON.stringify(claimsSet)))}`
  const signature = b64u(await crypto.subtle.sign(subtleAlgorithm(key), key, buf(input)))
  return `${input}.${signature}`
}

/**
 * Generates JWT-Secured Authorization Request (JAR) that is either signed, or
 * signed and encrypted.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9101.html#name-request-object-2 RFC 9101 - The OAuth 2.0 Authorization Framework: JWT-Secured Authorization Request (JAR)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param privateKey Private key to sign the Request Object with.
 */
export async function issueRequestObject(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams,
  privateKey: CryptoKey | PrivateKey,
) {
  assertIssuer(as)
  assertClient(client)

  if (!(parameters instanceof URLSearchParams)) {
    throw new TypeError('"parameters" must be an instance of URLSearchParams')
  }
  parameters = new URLSearchParams(parameters)

  const { key, kid } = getKeyAndKid(privateKey)
  if (!isPrivateKey(key)) {
    throw new TypeError('"privateKey.key" must be a private CryptoKey')
  }

  parameters.set('client_id', client.client_id)

  const now = epochTime()
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

  return jwt(
    {
      alg: determineJWSAlgorithm(key),
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
  accessToken?: string,
) {
  const { privateKey, publicKey, nonce = dpopNonces.get(url.origin) } = options

  if (!isPrivateKey(privateKey)) {
    throw new TypeError('"DPoP.privateKey" must be a private CryptoKey')
  }

  if (!isPublicKey(publicKey)) {
    throw new TypeError('"DPoP.publicKey" must be a public CryptoKey')
  }

  if (nonce !== undefined && (typeof nonce !== 'string' || nonce.length === 0)) {
    throw new TypeError('"DPoP.nonce" must be a non-empty string or undefined')
  }

  if (publicKey.extractable !== true) {
    throw new TypeError('"DPoP.publicKey.extractable" must be true')
  }

  const proof = await jwt(
    {
      alg: determineJWSAlgorithm(privateKey),
      typ: 'dpop+jwt',
      jwk: await publicJwk(publicKey),
    },
    {
      iat: epochTime(),
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

/**
 * exports an asymmetric crypto key as bare JWK
 */
async function publicJwk(key: CryptoKey) {
  const { kty, e, n, x, y, crv } = await crypto.subtle.exportKey('jwk', key)
  return { kty, crv, e, n, x, y }
}

/**
 * Performs a Pushed Authorization Request at the
 * {@link AuthorizationServer.pushed_authorization_request_endpoint `as.pushed_authorization_request_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques RFC 9126 - OAuth 2.0 Pushed Authorization Requests}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-dpop-with-pushed-authorizat draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Authorization Request parameters.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function pushedAuthorizationRequest(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams,
  options?: PushedAuthorizationRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (!(parameters instanceof URLSearchParams)) {
    throw new TypeError('"parameters" must be an instance of URLSearchParams')
  }

  if (typeof as.pushed_authorization_request_endpoint !== 'string') {
    throw new TypeError('"issuer.pushed_authorization_request_endpoint" must be a string')
  }

  const url = new URL(as.pushed_authorization_request_endpoint)

  const body = new URLSearchParams(parameters)
  body.set('client_id', client.client_id)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  if (options?.DPoP !== undefined) {
    await dpopProofJwt(headers, options.DPoP, url, 'POST')
    body.set('dpop_jkt', await calculateJwkThumbprint(options.DPoP.publicKey))
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
 * A helper function used to determine if a response processing function
 * returned an OAuth2Error.
 */
export function isOAuth2Error(input?: ReturnTypes): input is OAuth2Error {
  const value = <unknown>input
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    return false
  }

  // @ts-expect-error
  return value.error !== undefined
}

export interface WWWAuthenticateChallenge {
  /**
   * NOTE: because the value is case insensitive it is always returned
   * lowercased
   */
  readonly scheme: string
  readonly parameters: {
    readonly realm?: string
    readonly error?: string
    readonly error_description?: string
    readonly error_uri?: string
    readonly algs?: string
    readonly scope?: string

    /**
     * NOTE: because the parameter names are case insensitive they are always
     * returned lowercased
     */
    readonly [parameter: string]: string | undefined
  }
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
  if (arr.length === 0) {
    return { scheme: scheme.toLowerCase(), parameters: {} }
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
    const key = arr[idx - 1].replace(/^(?:, ?)|=$/g, '').toLowerCase()
    // @ts-expect-error
    parameters[key] = unquote(arr[idx])
  }

  return {
    scheme: scheme.toLowerCase(),
    parameters,
  }
}

/**
 * Parses the `WWW-Authenticate` HTTP Header from a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}.
 *
 * @param response {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}.
 *
 * @returns Array of {@link WWWAuthenticateChallenge} objects. Their order from
 * the response is preserved. `undefined` when there wasn't a `WWW-Authenticate`
 * HTTP Header returned.
 */
export function parseWwwAuthenticateChallenges(
  response: Response,
): WWWAuthenticateChallenge[] | undefined {
  if (!(response instanceof Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.headers.has('www-authenticate') === false) {
    return undefined
  }

  const header = response.headers.get('www-authenticate')!

  const result: [string, number][] = []
  for (const { 1: scheme, index } of header.matchAll(SCHEMES_REGEXP)) {
    result.push([scheme, index!])
  }

  if (result.length === 0) {
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
 * Validates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.pushed_authorization_request_endpoint `as.pushed_authorization_request_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques RFC 9126 - OAuth 2.0 Pushed Authorization Requests}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link pushedAuthorizationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processPushedAuthorizationResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<PushedAuthorizationResponse | OAuth2Error> {
  assertIssuer(as)
  assertClient(client)

  if (!(response instanceof Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 201) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Pushed Authorization Request Endpoint response')
  }

  let json: JsonValue
  try {
    json = await preserveBodyStream(response).json()
  } catch {
    throw new OPE('failed to parse "response" body as JSON')
  }

  if (!isJsonObject<PushedAuthorizationResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (typeof json.request_uri !== 'string' || json.request_uri.length === 0) {
    throw new OPE('"response" body "request_uri" property must be a non-empty string')
  }

  if (typeof json.expires_in !== 'number' || json.expires_in <= 0) {
    throw new OPE('"response" body "expires_in" property must be a positive number')
  }

  return json
}

export interface ProtectedResourceRequestOptions
  extends Omit<HttpRequestOptions, 'headers'>,
    DPoPRequestOptions {}

/**
 * Performs a protected resource request at an arbitrary URL.
 *
 * Authorization Header is used to transmit the Access Token
 * value.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1 RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-protected-resource-access draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)}
 *
 * @param accessToken The Access Token for the request.
 * @param method The HTTP method for the request.
 * @param url Instance of {@link https://developer.mozilla.org/en-US/docs/Web/API/URL URL} as the target URL for the request.
 * @param headers Instance of {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers Headers} for the request.
 * @param body See {@link https://developer.mozilla.org/en-US/docs/Web/API/fetch#body Fetch API documentation}.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function protectedResourceRequest(
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string,
  url: URL,
  headers: Headers,
  body: RequestInit['body'],
  options?: ProtectedResourceRequestOptions,
): Promise<Response> {
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new TypeError('"accessToken" must be a non-empty string')
  }

  if (!(url instanceof URL)) {
    throw new TypeError('"url" must be an instance of URL')
  }

  headers = prepareHeaders(headers)

  if (options?.DPoP === undefined) {
    headers.set('authorization', `Bearer ${accessToken}`)
  } else {
    await dpopProofJwt(headers, options.DPoP, url, 'GET', accessToken)
    headers.set('authorization', `DPoP ${accessToken}`)
  }

  return fetch(url.href, {
    body,
    headers,
    method,
    redirect: 'manual',
    signal: options?.signal,
  }).then(processDpopNonce)
}

export interface UserInfoRequestOptions extends HttpRequestOptions, DPoPRequestOptions {}

/**
 * Performs a UserInfo Request at the
 * {@link AuthorizationServer.userinfo_endpoint `as.userinfo_endpoint`}.
 *
 * Authorization Header is used to transmit the Access Token
 * value.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#UserInfo OpenID Connect Core 1.0}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-protected-resource-access draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param accessToken Access Token value.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function userInfoRequest(
  as: AuthorizationServer,
  client: Client,
  accessToken: string,
  options?: UserInfoRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (typeof as.userinfo_endpoint !== 'string') {
    throw new TypeError('"issuer.userinfo_endpoint" must be a string')
  }

  const url = new URL(as.userinfo_endpoint)

  const headers = prepareHeaders(options?.headers)
  if (client.userinfo_signed_response_alg) {
    headers.set('accept', 'application/jwt')
  } else {
    headers.set('accept', 'application/json')
    headers.append('accept', 'application/jwt')
  }

  return protectedResourceRequest(accessToken, 'GET', url, headers, null, options)
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
  readonly address?: {
    readonly formatted?: string
    readonly street_address?: string
    readonly locality?: string
    readonly region?: string
    readonly postal_code?: string
    readonly country?: string
  }

  readonly [claim: string]: JsonValue | undefined
}

const jwksCache = new LRU<string, { jwks: JsonWebKeySet; iat: number; age: number }>(20)
const cryptoKeyCaches: Record<string, WeakMap<JWK, CryptoKey>> = {}

async function getPublicSigKeyFromIssuerJwksUri(
  as: AuthorizationServer,
  options: HttpRequestOptions | undefined,
  header: CompactJWSHeaderParameters,
): Promise<CryptoKey> {
  const { alg, kid } = header
  checkSupportedJwsAlg(alg)

  let jwks: JsonWebKeySet
  let age: number
  if (jwksCache.has(as.jwks_uri!)) {
    ;({ jwks, age } = jwksCache.get(as.jwks_uri!)!)
    if (age >= 300) {
      // force a re-fetch every 5 minutes
      jwksCache.delete(as.jwks_uri!)
      return getPublicSigKeyFromIssuerJwksUri(as, options, header)
    }
  } else {
    jwks = await jwksRequest(as, options).then(processJwksResponse)
    age = 0
    jwksCache.set(as.jwks_uri!, {
      jwks,
      iat: epochTime(),
      get age() {
        return epochTime() - this.iat
      },
    })
  }

  let kty: string
  switch (alg[0]) {
    case 'R': // Fall through
    case 'P':
      kty = 'RSA'
      break
    case 'E':
      kty = 'EC'
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
    switch (alg) {
      case 'ES256':
        return jwk.crv === 'P-256'
      default:
        return true
    }
  })

  const { 0: jwk, length } = candidates

  if (length === 0) {
    if (age >= 60) {
      // allow re-fetch if cache is at least 1 minute old
      jwksCache.delete(as.jwks_uri!)
      return getPublicSigKeyFromIssuerJwksUri(as, options, header)
    }
    throw new OPE('error when selecting a JWT verification key, no applicable keys found')
  } else if (length !== 1) {
    throw new OPE(
      'error when selecting a JWT verification key, multiple applicable keys found, a "kid" JWT Header Parameter is required',
    )
  }

  cryptoKeyCaches[alg] ||= new WeakMap()

  let key = cryptoKeyCaches[alg].get(jwk)
  if (!key) {
    key = await importJwk({ ...jwk, alg })
    if (key.type !== 'public') {
      throw new OPE('jwks_uri must only contain public keys')
    }
    cryptoKeyCaches[alg].set(jwk, key)
  }

  return key
}

/**
 * DANGER ZONE
 *
 * Use this as a value to {@link processUserInfoResponse} `expectedSubject`
 * parameter to skip the `sub` claim value check.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse OpenID Connect Core 1.0}
 */
export const skipSubjectCheck = Symbol()

function getContentType(response: Response) {
  return response.headers.get('content-type')?.split(';')[0]
}

/**
 * Validates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.userinfo_endpoint `as.userinfo_endpoint`}.
 *
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#UserInfo OpenID Connect Core 1.0}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param expectedSubject Expected `sub` claim value. In response to
 * OpenID Connect authentication requests, the expected subject is the one from
 * the ID Token claims retrieved from {@link getValidatedIdTokenClaims}.
 * @param response Resolved value from {@link userInfoRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processUserInfoResponse(
  as: AuthorizationServer,
  client: Client,
  expectedSubject: string | typeof skipSubjectCheck,
  response: Response,
  options?: HttpRequestOptions,
): Promise<UserInfoResponse> {
  assertIssuer(as)
  assertClient(client)

  if (!(response instanceof Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    throw new OPE('"response" is not a conform UserInfo Endpoint response')
  }

  let json: JsonValue
  if (getContentType(response) === 'application/jwt') {
    if (typeof as.jwks_uri !== 'string') {
      throw new TypeError('"issuer.jwks_uri" must be a string')
    }

    const { claims } = await validateJwt(
      await preserveBodyStream(response).text(),
      checkSigningAlgorithm.bind(
        undefined,
        client.userinfo_signed_response_alg,
        as.userinfo_signing_alg_values_supported,
        'RS256',
      ),
      getPublicSigKeyFromIssuerJwksUri.bind(undefined, as, options),
    )
      .then(validateOptionalAudience.bind(undefined, client.client_id))
      .then(validateOptionalIssuer.bind(undefined, as.issuer))

    json = <JsonValue>claims
  } else {
    if (client.userinfo_signed_response_alg) {
      throw new OPE('JWT UserInfo Response expected')
    }

    try {
      json = await preserveBodyStream(response).json()
    } catch {
      throw new OPE('failed to parse "response" body as JSON')
    }
  }

  if (!isJsonObject<UserInfoResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (typeof json.sub !== 'string' || json.sub.length === 0) {
    throw new OPE('"response" body "sub" property must be a non-empty string')
  }

  switch (expectedSubject) {
    case skipSubjectCheck:
      break
    default:
      if (typeof expectedSubject !== 'string' || expectedSubject.length === 0) {
        throw new OPE('"expectedSubject" must be a non-empty string')
      }
      if (json.sub !== expectedSubject) {
        throw new OPE('unexpected "response" body "sub" value')
      }
  }

  return json
}

async function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength !== b.byteLength) {
    return false
  }

  const len = a.byteLength
  let out = 0
  let i = -1
  while (++i < len) {
    out |= a[i] ^ b[i]
  }
  return out === 0
}

async function idTokenHash(alg: string, data: string) {
  let algorithm: string
  switch (alg) {
    case 'RS256': // Fall through
    case 'PS256': // Fall through
    case 'ES256':
      algorithm = 'SHA-256'
      break
    default:
      throw new UnsupportedOperationError()
  }

  const digest = await crypto.subtle.digest(algorithm, buf(data))
  return b64u(digest.slice(0, digest.byteLength / 2))
}

async function idTokenHashMatches(alg: string, data: string, actual: string) {
  const expected = await idTokenHash(alg, data)
  return timingSafeEqual(buf(actual), buf(expected))
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

  return fetch(url.href, {
    body,
    headers,
    method,
    redirect: 'manual',
    signal: options?.signal,
  }).then(processDpopNonce)
}

export interface TokenEndpointRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions,
    DPoPRequestOptions {
  /**
   * Any additional parameters to send. This cannot override existing parameter
   * values.
   */
  additionalParameters?: URLSearchParams
}

async function tokenEndpointRequest(
  as: AuthorizationServer,
  client: Client,
  grantType: string,
  parameters: URLSearchParams,
  options?: Omit<TokenEndpointRequestOptions, 'additionalParameters'>,
): Promise<Response> {
  if (typeof as.token_endpoint !== 'string') {
    throw new TypeError('"issuer.token_endpoint" must be a string')
  }

  const url = new URL(as.token_endpoint)

  parameters.set('grant_type', grantType)
  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')

  if (options?.DPoP !== undefined) {
    await dpopProofJwt(headers, options.DPoP, url, 'POST')
  }

  return authenticatedRequest(as, client, 'POST', url, parameters, headers, options)
}

/**
 * Performs a Refresh Token Grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-6 RFC 6749 - The OAuth 2.0 Authorization Framework}
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens OpenID Connect Core 1.0}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-dpop-access-token-request draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param refreshToken Refresh Token value.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function refreshTokenGrantRequest(
  as: AuthorizationServer,
  client: Client,
  refreshToken: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
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
 * @param ref Value previously resolved from
 * {@link processAuthorizationCodeOpenIDResponse}.
 *
 * @returns JWT Claims Set from an ID Token.
 */
export function getValidatedIdTokenClaims(ref: OpenIDTokenEndpointResponse): IDToken

/**
 * Returns ID Token claims validated during {@link processRefreshTokenResponse}
 * or {@link processDeviceCodeResponse}.
 *
 * @param ref Value previously resolved from
 * {@link processRefreshTokenResponse} or
 * {@link processDeviceCodeResponse}.
 *
 * @returns JWT Claims Set from an ID Token, or undefined if there is no ID
 * Token in `ref`.
 */
export function getValidatedIdTokenClaims(ref: TokenEndpointResponse): IDToken | undefined
export function getValidatedIdTokenClaims(
  ref: OpenIDTokenEndpointResponse | TokenEndpointResponse,
): IDToken | undefined {
  if (!idTokenClaims.has(ref)) {
    throw new TypeError(
      '"ref" was already garbage collected or did not resolve from the proper sources',
    )
  }

  return idTokenClaims.get(ref)
}

async function processGenericAccessTokenResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: HttpRequestOptions,
  ignoreIdToken = false,
  ignoreRefreshToken = false,
): Promise<TokenEndpointResponse | OAuth2Error> {
  assertIssuer(as)
  assertClient(client)

  if (!(response instanceof Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Token Endpoint response')
  }

  let json: JsonValue
  try {
    json = await preserveBodyStream(response).json()
  } catch {
    throw new OPE('failed to parse "response" body as JSON')
  }

  if (!isJsonObject<TokenEndpointResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (typeof json.access_token !== 'string' || json.access_token.length === 0) {
    throw new OPE('"response" body "access_token" property must be a non-empty string')
  }

  if (typeof json.token_type !== 'string' || json.token_type.length === 0) {
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
    ignoreRefreshToken === false &&
    json.refresh_token !== undefined &&
    (typeof json.refresh_token !== 'string' || json.refresh_token.length === 0)
  ) {
    throw new OPE('"response" body "refresh_token" property must be a non-empty string')
  }

  if (json.scope !== undefined && (typeof json.scope !== 'string' || json.scope.length === 0)) {
    throw new OPE('"response" body "scope" property must be a non-empty string')
  }

  if (ignoreIdToken === false) {
    if (
      json.id_token !== undefined &&
      (typeof json.id_token !== 'string' || json.id_token.length === 0)
    ) {
      throw new OPE('"response" body "id_token" property must be a non-empty string')
    }

    if (json.id_token) {
      if (typeof as.jwks_uri !== 'string') {
        throw new TypeError('"issuer.jwks_uri" must be a string')
      }

      const { header, claims } = await validateJwt(
        json.id_token,
        checkSigningAlgorithm.bind(
          undefined,
          client.id_token_signed_response_alg,
          as.id_token_signing_alg_values_supported,
          'RS256',
        ),
        getPublicSigKeyFromIssuerJwksUri.bind(undefined, as, options),
      )
        .then(validatePresence.bind(undefined, ['aud', 'exp', 'iat', 'iss', 'sub']))
        .then(validateIssuer.bind(undefined, as.issuer))
        .then(validateAudience.bind(undefined, client.client_id))

      if (Array.isArray(claims.aud) && claims.aud.length !== 1 && claims.azp !== client.client_id) {
        throw new OPE('unexpected ID Token "azp" (authorized party)')
      }

      if (client.require_auth_time && typeof claims.auth_time !== 'number') {
        throw new OPE('invalid ID Token "auth_time"')
      }

      if (claims.at_hash !== undefined) {
        if (
          typeof claims.at_hash !== 'string' ||
          (await idTokenHashMatches(header.alg, json.access_token, claims.at_hash)) !== true
        ) {
          throw new OPE('invalid ID Token "at_hash"')
        }
      }

      idTokenClaims.set(json, <IDToken>claims)
    }
  }

  return json
}

/**
 * Validates Refresh Token Grant
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-6 RFC 6749 - The OAuth 2.0 Authorization Framework}
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens OpenID Connect Core 1.0}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link refreshTokenGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processRefreshTokenResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: HttpRequestOptions,
): Promise<TokenEndpointResponse | OAuth2Error> {
  return processGenericAccessTokenResponse(as, client, response, options)
}

function validateOptionalAudience(expected: string, result: ParsedJWT) {
  if (result.claims.aud !== undefined) {
    return validateAudience(expected, result)
  }
  return result
}

function validateAudience(expected: string, result: ParsedJWT) {
  if (Array.isArray(result.claims.aud)) {
    if (result.claims.aud.includes(expected) === false) {
      throw new OPE('unexpected JWT "aud" (audience)')
    }
  } else if (result.claims.aud !== expected) {
    throw new OPE('unexpected JWT "aud" (audience)')
  }

  return result
}

function validateOptionalIssuer(expected: string, result: ParsedJWT) {
  if (result.claims.iss !== undefined) {
    return validateIssuer(expected, result)
  }
  return result
}

function validateIssuer(expected: string, result: ParsedJWT) {
  if (result.claims.iss !== expected) {
    throw new OPE('unexpected JWT "iss" (issuer)')
  }
  return result
}

/**
 * Performs an Authorization Code grant request at the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1 RFC 6749 - The OAuth 2.0 Authorization Framework}
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth OpenID Connect Core 1.0}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7636.html#section-4 RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-dpop-access-token-request draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param callbackParameters Parameters obtained from the callback to
 * redirect_uri, this is returned from {@link validateAuthResponse}, or
 * {@link validateJwtAuthResponse}.
 * @param redirectUri `redirect_uri` value used in the authorization request.
 * @param codeVerifier PKCE `code_verifier` to send to the token endpoint.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function authorizationCodeGrantRequest(
  as: AuthorizationServer,
  client: Client,
  callbackParameters: CallbackParameters,
  redirectUri: string,
  codeVerifier: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (!(callbackParameters instanceof CallbackParameters)) {
    throw new TypeError(
      '"callbackParameters" must be an instance of CallbackParameters obtained from "validateAuthResponse()", or "validateJwtAuthResponse()',
    )
  }

  if (typeof redirectUri !== 'string' || redirectUri.length === 0) {
    throw new TypeError('"redirectUri" must be a non-empty string')
  }

  if (typeof codeVerifier !== 'string' || codeVerifier.length === 0) {
    throw new TypeError('"codeVerifier" must be a non-empty string')
  }

  const code = getURLSearchParameter(callbackParameters, 'code')
  if (!code) {
    throw new OPE('no authorization code received')
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
}

const claimNames = {
  aud: 'audience',
  exp: 'expiration time',
  iat: 'issued at',
  iss: 'issuer',
  sub: 'subject',
}

function validatePresence(required: (keyof typeof claimNames)[], result: ParsedJWT) {
  for (const claim of required) {
    if (result.claims[claim] === undefined) {
      throw new OPE(`missing JWT "${claim}" (${claimNames[claim]})`)
    }
  }
  return result
}

export interface TokenEndpointResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly id_token?: string
  readonly refresh_token?: string
  readonly scope?: string
  /**
   * NOTE: because the value is case insensitive it is always returned
   * lowercased
   */
  readonly token_type: string

  readonly [parameter: string]: JsonValue | undefined
}

export interface OpenIDTokenEndpointResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly id_token: string
  readonly refresh_token?: string
  readonly scope?: string
  /**
   * NOTE: because the value is case insensitive it is always returned
   * lowercased
   */
  readonly token_type: string

  readonly [parameter: string]: JsonValue | undefined
}

export interface OAuth2TokenEndpointResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly id_token?: undefined
  readonly refresh_token?: string
  readonly scope?: string
  /**
   * NOTE: because the value is case insensitive it is always returned
   * lowercased
   */
  readonly token_type: string

  readonly [parameter: string]: JsonValue | undefined
}

export interface ClientCredentialsGrantResponse {
  readonly access_token: string
  readonly expires_in?: number
  readonly scope?: string
  /**
   * NOTE: because the value is case insensitive it is always returned
   * lowercased
   */
  readonly token_type: string

  readonly [parameter: string]: JsonValue | undefined
}

/**
 * Use this as a value to {@link processAuthorizationCodeOpenIDResponse} `expectedNonce`
 * parameter to indicate no `nonce` ID Token claim value is expected, i.e. no `nonce`
 * parameter value was sent with the authorization request.
 */
export const expectNoNonce = Symbol()

/**
 * Use this as a value to {@link processAuthorizationCodeOpenIDResponse} `maxAge`
 * parameter to indicate no `auth_time` ID Token claim value check should be performed.
 */
export const skipAuthTimeCheck = Symbol()

/**
 * (OpenID Connect only) Validates Authorization Code Grant
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1 RFC 6749 - The OAuth 2.0 Authorization Framework}
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth OpenID Connect Core 1.0}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link authorizationCodeGrantRequest}.
 * @param expectedNonce Expected ID Token `nonce` claim value. Default is
 * {@link expectNoNonce}.
 * @param maxAge ID Token {@link IDToken.auth_time `auth_time`} claim value will be
 * checked to be present and conform to the `maxAge` value. Use of this option
 * is required if you sent a `max_age` parameter in an authorization request.
 * Default is
 * {@link Client.default_max_age `client.default_max_age`} and
 * falls back to {@link skipAuthTimeCheck}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processAuthorizationCodeOpenIDResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  expectedNonce?: string | typeof expectNoNonce,
  maxAge?: number | typeof skipAuthTimeCheck,
  options?: HttpRequestOptions,
): Promise<OpenIDTokenEndpointResponse | OAuth2Error> {
  const result = await processGenericAccessTokenResponse(as, client, response, options)

  if (isOAuth2Error(result)) {
    return result
  }

  if (typeof result.id_token !== 'string' || result.id_token.length === 0) {
    throw new OPE('"response" body "id_token" property must be a non-empty string')
  }

  maxAge ??= client.default_max_age ?? skipAuthTimeCheck
  const claims = getValidatedIdTokenClaims(result)!
  if (
    (client.require_auth_time || maxAge !== skipAuthTimeCheck) &&
    claims.auth_time === undefined
  ) {
    throw new OPE('missing ID Token "auth_time" claims')
  }

  if (maxAge !== skipAuthTimeCheck) {
    if (typeof maxAge !== 'number' || maxAge < 0) {
      throw new TypeError('"options.max_age" must be a non-negative number')
    }

    const now = epochTime()
    const tolerance = 30 // TODO: tolerance config
    if (claims.auth_time! + maxAge < now - tolerance) {
      throw new OPE('too much time has elapsed since the last End-User authentication')
    }
  }

  switch (expectedNonce) {
    case undefined:
    case expectNoNonce:
      if (claims.nonce !== undefined) {
        throw new OPE('unexpected ID Token "nonce" claim value received')
      }
      break
    default:
      if (typeof expectedNonce !== 'string' || expectedNonce.length === 0) {
        throw new TypeError('"expectedNonce" must be a non-empty string')
      }
      if (claims.nonce === undefined) {
        throw new OPE('ID Token "nonce" claim missing')
      }
      if (claims.nonce !== expectedNonce) {
        throw new OPE('unexpected ID Token "nonce" claim value received')
      }
  }

  return <OpenIDTokenEndpointResponse>result
}

/**
 * (OAuth 2.0 without OpenID Connect only) Validates Authorization Code Grant
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1 RFC 6749 - The OAuth 2.0 Authorization Framework}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link authorizationCodeGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processAuthorizationCodeOAuth2Response(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<OAuth2TokenEndpointResponse | OAuth2Error> {
  const result = await processGenericAccessTokenResponse(as, client, response)

  if (isOAuth2Error(result)) {
    return result
  }

  if (result.id_token !== undefined) {
    throw new OPE(
      'Unexpected ID Token returned, use processAuthorizationCodeOpenIDResponse() for OpenID Connect callback processing',
    )
  }

  return <OAuth2TokenEndpointResponse>result
}

function checkJwtType(expected: string, result: ParsedJWT) {
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
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4 RFC 6749 - The OAuth 2.0 Authorization Framework}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-dpop-access-token-request draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function clientCredentialsGrantRequest(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams,
  options?: ClientCredentialsGrantRequestOptions,
): Promise<Response> {
  assertIssuer(as)
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
 * Validates Client Credentials Grant
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4 RFC 6749 - The OAuth 2.0 Authorization Framework}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link clientCredentialsGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processClientCredentialsResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<ClientCredentialsGrantResponse | OAuth2Error> {
  const result = await processGenericAccessTokenResponse(
    as,
    client,
    response,
    undefined,
    true,
    true,
  )

  if (isOAuth2Error(result)) {
    return result
  }

  return <ClientCredentialsGrantResponse>result
}

export interface RevocationRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions {
  /**
   * Any additional parameters to send. This cannot override existing parameter
   * values.
   */
  additionalParameters?: URLSearchParams
}

/**
 *
 * Performs a Revocation Request at the
 * {@link AuthorizationServer.revocation_endpoint `as.revocation_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7009.html#section-2 RFC 7009 - OAuth 2.0 Token Revocation}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param token Token to revoke. You can provide the `token_type_hint`
 * parameter via {@link RevocationRequestOptions.additionalParameters options}.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function revocationRequest(
  as: AuthorizationServer,
  client: Client,
  token: string,
  options?: RevocationRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (typeof token !== 'string' || token.length === 0) {
    throw new TypeError('"token" must be a non-empty string')
  }

  if (typeof as.revocation_endpoint !== 'string') {
    throw new TypeError('"issuer.revocation_endpoint" must be a string')
  }

  const url = new URL(as.revocation_endpoint)

  const body = new URLSearchParams(options?.additionalParameters)
  body.set('token', token)

  const headers = prepareHeaders(options?.headers)
  headers.delete('accept')

  return authenticatedRequest(as, client, 'POST', url, body, headers, options)
}

/**
 * Validates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.revocation_endpoint `as.revocation_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7009.html#section-2 RFC 7009 - OAuth 2.0 Token Revocation}
 *
 * @param response Resolved value from {@link revocationRequest}.
 *
 * @returns Resolves with `undefined` when the request was successful, or an object
 * representing an OAuth 2.0 protocol style error.
 */
export async function processRevocationResponse(
  response: Response,
): Promise<undefined | OAuth2Error> {
  if (!(response instanceof Response)) {
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
   * Any additional parameters to send. This cannot override existing parameter
   * values.
   */
  additionalParameters?: URLSearchParams
  /**
   * Request a JWT Response from the
   * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}.
   * Default is
   * - true when
   * {@link Client.introspection_signed_response_alg `client.introspection_signed_response_alg`}
   * is set
   * - false otherwise
   */
  requestJwtResponse?: boolean
}

function assertReadableResponse(response: Response) {
  if (response.bodyUsed === true) {
    throw new TypeError('"response" body has been used already')
  }
}

/**
 * Performs an Introspection Request at the
 * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7662.html#section-2 RFC 7662 - OAuth 2.0 Token Introspection}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-4 draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param token Token to introspect. You can provide the `token_type_hint`
 * parameter via
 * {@link IntrospectionRequestOptions.additionalParameters options}.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function introspectionRequest(
  as: AuthorizationServer,
  client: Client,
  token: string,
  options?: IntrospectionRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (typeof token !== 'string' || token.length === 0) {
    throw new TypeError('"token" must be a non-empty string')
  }

  if (typeof as.introspection_endpoint !== 'string') {
    throw new TypeError('"issuer.introspection_endpoint" must be a string')
  }

  const url = new URL(as.introspection_endpoint)

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
  readonly scope: string
  readonly sub?: string
  readonly nbf?: number
  readonly token_type?: string
  readonly cnf?: {
    readonly 'x5t#S256'?: string
    readonly jkt?: string

    readonly [claim: string]: JsonValue | undefined
  }

  readonly [claim: string]: JsonValue | undefined
}

/**
 * Validates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7662.html#section-2 RFC 7662 - OAuth 2.0 Token Introspection}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-5 draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link introspectionRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processIntrospectionResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: HttpRequestOptions,
): Promise<IntrospectionResponse | OAuth2Error> {
  assertIssuer(as)
  assertClient(client)

  if (!(response instanceof Response)) {
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
    if (typeof as.jwks_uri !== 'string') {
      throw new TypeError('"issuer.jwks_uri" must be a string')
    }

    const { claims } = await validateJwt(
      await preserveBodyStream(response).text(),
      checkSigningAlgorithm.bind(
        undefined,
        client.introspection_signed_response_alg,
        as.introspection_signing_alg_values_supported,
        'RS256',
      ),
      getPublicSigKeyFromIssuerJwksUri.bind(undefined, as, options),
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
    try {
      json = await preserveBodyStream(response).json()
    } catch {
      throw new OPE('failed to parse "response" body as JSON')
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

export interface JwksRequestOptions extends HttpRequestOptions {}

/**
 * Performs a request to the
 * {@link AuthorizationServer.jwks_uri `as.jwks_uri`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7517.html#section-5 JWK Set Format}
 * @see {@link https://www.rfc-editor.org/rfc/rfc8414.html#section-3 RFC 8414 - OAuth 2.0 Authorization Server Metadata}
 * @see {@link https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig OpenID Connect Discovery 1.0}
 *
 * @param as Authorization Server Metadata.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function jwksRequest(
  as: AuthorizationServer,
  options?: JwksRequestOptions,
): Promise<Response> {
  assertIssuer(as)

  if (typeof as.jwks_uri !== 'string') {
    throw new TypeError('"issuer.jwks_uri" must be a string')
  }

  const url = new URL(as.jwks_uri)

  const headers = prepareHeaders(options?.headers)
  headers.set('accept', 'application/json')
  headers.append('accept', 'application/jwk-set+json')

  return fetch(url.href, {
    headers,
    method: 'GET',
    redirect: 'manual',
    signal: options?.signal,
  }).then(processDpopNonce)
}

export interface JsonWebKeySet {
  readonly keys: JWK[]
}

/**
 * Validates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.jwks_uri `as.jwks_uri`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7517.html#section-5 JWK Set Format}
 *
 * @param response Resolved value from {@link jwksRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response.
 */
export async function processJwksResponse(response: Response): Promise<JsonWebKeySet> {
  if (!(response instanceof Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    throw new OPE('"response" is not a conform JSON Web Key Set response')
  }

  let json: JsonValue
  try {
    json = await preserveBodyStream(response).json()
  } catch {
    throw new OPE('failed to parse "response" body as JSON')
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
    try {
      const json: JsonValue = await preserveBodyStream(response).json()
      if (isJsonObject(json) && typeof json.error === 'string' && json.error.length !== 0) {
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
  if (SUPPORTED_JWS_ALGS.includes(<any>alg) === false) {
    throw new UnsupportedOperationError('unsupported JWS `alg` identifier')
  }
  return <JWSAlgorithm>alg
}

function checkRsaKeyAlgorithm(algorithm: RsaKeyAlgorithm) {
  if (typeof algorithm.modulusLength !== 'number' || algorithm.modulusLength < 2048) {
    throw new OPE(`${algorithm.name} modulusLength must be at least 2048 bits`)
  }
}

function subtleAlgorithm(key: CryptoKey): AlgorithmIdentifier | RsaPssParams | EcdsaParams {
  switch (key.algorithm.name) {
    case 'ECDSA':
      return <EcdsaParams>{ name: key.algorithm.name, hash: 'SHA-256' }
    case 'RSA-PSS':
      checkRsaKeyAlgorithm(<RsaKeyAlgorithm>key.algorithm)
      return <RsaPssParams>{
        name: key.algorithm.name,
        saltLength: 256 >> 3,
      }
    case 'RSASSA-PKCS1-v1_5':
      checkRsaKeyAlgorithm(<RsaKeyAlgorithm>key.algorithm)
      return { name: key.algorithm.name }
  }
  throw new UnsupportedOperationError()
}

/**
 * Minimal JWT validation implementation.
 */
async function validateJwt(
  jws: string,
  checkAlg: (h: CompactJWSHeaderParameters) => void,
  getKey: (h: CompactJWSHeaderParameters) => Promise<CryptoKey>,
): Promise<ParsedJWT> {
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split('.')
  if (length === 5) {
    throw new UnsupportedOperationError('JWE structure JWTs are not supported')
  }
  if (length !== 3) {
    throw new OPE('Invalid JWT')
  }

  let header: JsonValue
  try {
    header = JSON.parse(buf(b64u(protectedHeader)))
  } catch {
    throw new OPE('failed to parse JWT Header body as base64url encoded JSON')
  }

  if (!isJsonObject<CompactJWSHeaderParameters>(header)) {
    throw new OPE('JWT Header must be a top level object')
  }

  checkAlg(header)
  if (header.crit !== undefined) {
    throw new OPE('unexpected JWT "crit" header parameter')
  }
  const key = await getKey(header)
  const input = `${protectedHeader}.${payload}`
  const verified = await crypto.subtle.verify(
    subtleAlgorithm(key),
    key,
    b64u(signature),
    buf(input),
  )
  if (verified !== true) {
    throw new OPE('JWT signature verification failed')
  }

  let claims: JsonValue
  try {
    claims = JSON.parse(buf(b64u(payload)))
  } catch {
    throw new OPE('failed to parse JWT Payload body as base64url encoded JSON')
  }

  if (!isJsonObject<JWTPayload>(claims)) {
    throw new OPE('JWT Payload must be a top level object')
  }

  const now = epochTime()
  const tolerance = 30 // TODO: tolerance config

  if (claims.exp !== undefined) {
    if (typeof claims.exp !== 'number') {
      throw new OPE('invalid JWT "exp" (expiration time)')
    }

    if (claims.exp <= now - tolerance) {
      throw new OPE('JWT "exp" (expiration time) timestamp is <= now()')
    }
  }

  if (claims.iat !== undefined) {
    if (typeof claims.iat !== 'number') {
      throw new OPE('invalid JWT "iat" (issued at)')
    }
  }

  if (claims.iss !== undefined) {
    if (typeof claims.iss !== 'string') {
      throw new OPE('invalid JWT "iss" (issuer)')
    }
  }

  if (claims.nbf !== undefined) {
    if (typeof claims.nbf !== 'number') {
      throw new OPE('invalid JWT "nbf" (not before)')
    }
    if (claims.nbf > now + tolerance) {
      throw new OPE('JWT "nbf" (not before) timestamp is > now()')
    }
  }

  if (claims.aud !== undefined) {
    if (typeof claims.aud !== 'string' && !Array.isArray(claims.aud)) {
      throw new OPE('invalid JWT "aud" (audience)')
    }
  }

  return { header, claims }
}

/**
 * Same as {@link validateAuthResponse} but for signed JARM responses.
 *
 * @see {@link https://openid.net/specs/openid-financial-api-jarm-ID1.html openid-financial-api-jarm-ID1 - JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters JARM authorization response.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 *
 * @returns Validated Authorization Response parameters or Authorization Error Response.
 */
export async function validateJwtAuthResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL,
  expectedState?: string | typeof expectNoState | typeof skipStateCheck,
  options?: HttpRequestOptions,
): Promise<CallbackParameters | OAuth2Error> {
  assertIssuer(as)
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
    throw new TypeError('"issuer.jwks_uri" must be a string')
  }

  const { claims } = await validateJwt(
    response,
    checkSigningAlgorithm.bind(
      undefined,
      client.authorization_signed_response_alg,
      as.authorization_signing_alg_values_supported,
      'RS256',
    ),
    getPublicSigKeyFromIssuerJwksUri.bind(undefined, as, options),
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

/**
 * if configured must be the configured one (client)
 * if not configured must be signalled by the issuer to be supported (issuer)
 * if not signalled must be fallback
 */
function checkSigningAlgorithm(
  client: string | undefined,
  issuer: string[] | undefined,
  fallback: string,
  header: CompactJWSHeaderParameters,
) {
  if (client !== undefined) {
    if (header.alg !== client) {
      throw new OPE('unexpected JWT "alg" header parameter')
    }
    return
  }

  if (Array.isArray(issuer)) {
    if (issuer.includes(header.alg) === false) {
      throw new OPE('unexpected JWT "alg" header parameter')
    }
    return
  }

  if (header.alg !== fallback) {
    throw new OPE('unexpected JWT "alg" header parameter')
  }
}

/**
 * Returns a parameter by name from URLSearchParams. It must be only provided
 * once. Returns undefined if the parameter is not present.
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
 * Use this as a value to {@link validateAuthResponse} `expectedState`
 * parameter to skip the `state` value check. This should only ever be done if
 * you use a `state` parameter value that is integrity protected and bound to
 * the browsing session. One such mechanism to do so is described in an I-D
 * {@link https://datatracker.ietf.org/doc/html/draft-bradley-oauth-jwt-encoded-state-09 draft-bradley-oauth-jwt-encoded-state-09}.
 * It is expected you'll validate such `state` value yourself.
 */
export const skipStateCheck = Symbol()

/**
 * Use this as a value to {@link validateAuthResponse} `expectedState`
 * parameter to indicate no `state` parameter value is expected, i.e. no `state`
 * parameter value was sent with the authorization request.
 */
export const expectNoState = Symbol()

class CallbackParameters extends URLSearchParams {}

/**
 * Validates an OAuth 2.0 Authorization Response or Authorization Error Response
 * message returned from the authorization server's {@link
 * AuthorizationServer.authorization_endpoint `as.authorization_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2 RFC 6749 - The OAuth 2.0 Authorization Framework}
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication OpenID Connect Core 1.0}
 * @see {@link https://www.rfc-editor.org/rfc/rfc9207.html RFC 9207 - OAuth 2.0 Authorization Server Issuer Identification}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Authorization response.
 * @param expectedState Expected `state` parameter value. Default is {@link expectNoState}.
 *
 * @returns Validated Authorization Response parameters or Authorization Error Response.
 */
export function validateAuthResponse(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams | URL,
  expectedState?: string | typeof expectNoState | typeof skipStateCheck,
): CallbackParameters | OAuth2Error {
  assertIssuer(as)
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

  if (!iss && as.authorization_response_iss_parameter_supported === true) {
    throw new OPE('"iss" issuer parameter expected')
  }

  if (iss && iss !== as.issuer) {
    throw new OPE('unexpected "iss" issuer parameter value')
  }

  switch (expectedState) {
    case undefined:
    case expectNoState:
      if (state !== undefined) {
        throw new OPE('unexpected "state" parameter received')
      }
      break
    case skipStateCheck:
      break
    default:
      if (typeof expectedState !== 'string' || expectedState.length === 0) {
        throw new OPE('"expectedState" must be a non-empty string')
      }
      if (state === undefined) {
        throw new OPE('"state" callback parameter missing')
      }
      if (state !== expectedState) {
        throw new OPE('unexpected "state" parameter value received')
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

  return new CallbackParameters(parameters)
}

type ReturnTypes =
  | TokenEndpointResponse
  | OAuth2TokenEndpointResponse
  | OpenIDTokenEndpointResponse
  | ClientCredentialsGrantResponse
  | DeviceAuthorizationResponse
  | IntrospectionResponse
  | OAuth2Error
  | PushedAuthorizationResponse
  | URLSearchParams
  | UserInfoResponse

async function importJwk(jwk: JWK) {
  const { alg, ext, key_ops, use, ...key } = jwk

  let algorithm: RsaHashedImportParams | EcKeyImportParams

  switch (alg) {
    case 'PS256':
      algorithm = { name: 'RSA-PSS', hash: 'SHA-256' }
      break
    case 'RS256':
      algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
      break
    case 'ES256':
      algorithm = { name: 'ECDSA', namedCurve: 'P-256' }
      break
    default:
      throw new UnsupportedOperationError()
  }

  return crypto.subtle.importKey('jwk', key, algorithm, true, ['verify'])
}

export interface DeviceAuthorizationRequestOptions
  extends HttpRequestOptions,
    AuthenticatedRequestOptions {}

/**
 * Performs a Device Authorization Request at the
 * {@link AuthorizationServer.device_authorization_endpoint `as.device_authorization_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1 RFC 8628 - OAuth 2.0 Device Authorization Grant}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param parameters Device Authorization Request parameters.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function deviceAuthorizationRequest(
  as: AuthorizationServer,
  client: Client,
  parameters: URLSearchParams,
  options?: DeviceAuthorizationRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (!(parameters instanceof URLSearchParams)) {
    throw new TypeError('"parameters" must be an instance of URLSearchParams')
  }

  if (typeof as.device_authorization_endpoint !== 'string') {
    throw new TypeError('"issuer.device_authorization_endpoint" must be a string')
  }

  const url = new URL(as.device_authorization_endpoint)

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
 * Validates
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.device_authorization_endpoint `as.device_authorization_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1 RFC 8628 - OAuth 2.0 Device Authorization Grant}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link deviceAuthorizationRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processDeviceAuthorizationResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
): Promise<DeviceAuthorizationResponse | OAuth2Error> {
  assertIssuer(as)
  assertClient(client)

  if (!(response instanceof Response)) {
    throw new TypeError('"response" must be an instance of Response')
  }

  if (response.status !== 200) {
    let err: OAuth2Error | undefined
    if ((err = await handleOAuthBodyError(response))) {
      return err
    }
    throw new OPE('"response" is not a conform Device Authorization Endpoint response')
  }

  let json: JsonValue
  try {
    json = await preserveBodyStream(response).json()
  } catch {
    throw new OPE('failed to parse "response" body as JSON')
  }

  if (!isJsonObject<DeviceAuthorizationResponse>(json)) {
    throw new OPE('"response" body must be a top level object')
  }

  if (typeof json.device_code !== 'string' || json.device_code.length === 0) {
    throw new OPE('"response" body "device_code" property must be a non-empty string')
  }

  if (typeof json.user_code !== 'string' || json.user_code.length === 0) {
    throw new OPE('"response" body "user_code" property must be a non-empty string')
  }

  if (typeof json.verification_uri !== 'string' || json.verification_uri.length === 0) {
    throw new OPE('"response" body "verification_uri" property must be a non-empty string')
  }

  if (typeof json.expires_in !== 'number' || json.expires_in <= 0) {
    throw new OPE('"response" body "expires_in" property must be a positive number')
  }

  if (
    json.verification_uri_complete !== undefined &&
    (typeof json.verification_uri_complete !== 'string' ||
      json.verification_uri_complete.length === 0)
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
 * @see {@link https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4 RFC 8628 - OAuth 2.0 Device Authorization Grant}
 * @see {@link https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-dpop-access-token-request draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param deviceCode Device Code.
 *
 * @returns Resolves with
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API Fetch API}'s
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Response}.
 */
export async function deviceCodeGrantRequest(
  as: AuthorizationServer,
  client: Client,
  deviceCode: string,
  options?: TokenEndpointRequestOptions,
): Promise<Response> {
  assertIssuer(as)
  assertClient(client)

  if (typeof deviceCode !== 'string' || deviceCode.length === 0) {
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
 * Validates Device Authorization Grant
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Response Fetch API Response}
 * to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4 RFC 8628 - OAuth 2.0 Device Authorization Grant}
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param response Resolved value from {@link deviceCodeGrantRequest}.
 *
 * @returns Resolves with an object representing the parsed successful response, or an object
 * representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to
 * determine if an OAuth 2.0 error was returned.
 */
export async function processDeviceCodeResponse(
  as: AuthorizationServer,
  client: Client,
  response: Response,
  options?: HttpRequestOptions,
): Promise<TokenEndpointResponse | OAuth2Error> {
  return processGenericAccessTokenResponse(as, client, response, options)
}

export interface GenerateKeyPairOptions {
  /**
   * Indicates whether or not the private key may be exported.
   * Default is `false`.
   */
  extractable?: boolean

  /**
   * (RSA algorithms only) The length, in bits, of the RSA modulus.
   * Default is `2048`.
   */
  modulusLength?: number
}

/**
 * Generates a
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair CryptoKeyPair}
 * for a given JWS `alg` Algorithm identifier.
 *
 * @param alg Supported JWS `alg` Algorithm identifier.
 */
export async function generateKeyPair(
  alg: JWSAlgorithm,
  options?: GenerateKeyPairOptions,
): Promise<CryptoKeyPair> {
  let algorithm: RsaHashedKeyGenParams | EcKeyGenParams

  if (typeof alg !== 'string' || alg.length === 0) {
    throw new TypeError('"alg" must be a non-empty string')
  }

  switch (alg) {
    case 'PS256':
      algorithm = {
        name: 'RSA-PSS',
        hash: 'SHA-256',
        modulusLength: options?.modulusLength ?? 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      }
      break
    case 'RS256':
      algorithm = {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
        modulusLength: options?.modulusLength ?? 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      }
      break
    case 'ES256':
      algorithm = { name: 'ECDSA', namedCurve: 'P-256' }
      break
    default:
      throw new UnsupportedOperationError()
  }

  return crypto.subtle.generateKey(algorithm, options?.extractable ?? false, ['sign', 'verify'])
}

/**
 * Calculates a base64url-encoded SHA-256 JWK Thumbprint.
 *
 * @param key A public extractable
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey CryptoKey}.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc7638.html RFC 7638 - JSON Web Key (JWK) Thumbprint}
 */
export async function calculateJwkThumbprint(key: CryptoKey) {
  if (!isPublicKey(key) || key.extractable !== true) {
    throw new TypeError('"key" must be an extractable public CryptoKey')
  }

  // checks that the key is a supported one
  determineJWSAlgorithm(key)

  const jwk = await crypto.subtle.exportKey('jwk', key)
  let components: JsonValue
  switch (jwk.kty) {
    case 'EC':
      components = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y }
      break
    case 'RSA':
      components = { e: jwk.e, kty: jwk.kty, n: jwk.n }
      break
    default:
      throw new UnsupportedOperationError()
  }

  return b64u(await crypto.subtle.digest('SHA-256', buf(JSON.stringify(components))))
}
