/**
 * JSON Object
 */
export type JsonObject = {
    [Key in string]?: JsonValue;
};
/**
 * JSON Array
 */
export type JsonArray = JsonValue[];
/**
 * JSON Primitives
 */
export type JsonPrimitive = string | number | boolean | null;
/**
 * JSON Values
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface ModifyAssertionFunction {
    (
    /**
     * JWS Header to modify right before it is signed.
     */
    header: Record<string, JsonValue | undefined>, 
    /**
     * JWT Claims Set to modify right before it is signed.
     */
    payload: Record<string, JsonValue | undefined>): void;
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
    key: CryptoKey;
    /**
     * JWK Key ID to add to JOSE headers when this key is used. When not provided no `kid` (JWK Key
     * ID) will be added to the JOSE Header.
     */
    kid?: string;
    /**
     * Use to modify the JWT signed by this key right before it is signed.
     *
     * @see {@link modifyAssertion}
     */
    [modifyAssertion]?: ModifyAssertionFunction;
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
export type ClientAuthenticationMethod = 'client_secret_basic' | 'client_secret_post' | 'private_key_jwt' | 'none';
/**
 * Supported JWS `alg` Algorithm identifiers.
 *
 * @example
 *
 * {@link !CryptoKey.algorithm} for the `PS256`, `PS384`, or `PS512` JWS Algorithm Identifiers
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
 * {@link !CryptoKey.algorithm} for the `ES256`, `ES384`, or `ES512` JWS Algorithm Identifiers
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
 * {@link !CryptoKey.algorithm} for the `RS256`, `RS384`, or `RS512` JWS Algorithm Identifiers
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
 * {@link !CryptoKey.algorithm} for the `EdDSA` JWS Algorithm Identifier (Experimental)
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
export type JWSAlgorithm = 'PS256' | 'ES256' | 'RS256' | 'EdDSA' | 'ES384' | 'PS384' | 'RS384' | 'ES512' | 'PS512' | 'RS512';
export interface JWK {
    readonly kty?: string;
    readonly kid?: string;
    readonly alg?: string;
    readonly use?: string;
    readonly key_ops?: string[];
    readonly e?: string;
    readonly n?: string;
    readonly crv?: string;
    readonly x?: string;
    readonly y?: string;
    readonly [parameter: string]: JsonValue | undefined;
}
/**
 * Use to adjust the assumed current time. Positive and negative finite values representing seconds
 * are allowed. Default is `0` (Date.now() + 0 seconds is used).
 *
 * @example
 *
 * When the local clock is mistakenly 1 hour in the past
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
 * When the local clock is mistakenly 1 hour in the future
 *
 * ```ts
 * const client: oauth.Client = {
 *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
 *   // ... other metadata
 *   [oauth.clockSkew]: -(60 * 60),
 * }
 * ```
 */
export declare const clockSkew: unique symbol;
/**
 * Use to set allowed clock tolerance when checking DateTime JWT Claims. Only positive finite values
 * representing seconds are allowed. Default is `30` (30 seconds).
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
export declare const clockTolerance: unique symbol;
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
 * - Returning self-constructed {@link !Response} instances prohibits AS/RS-signalled DPoP Nonce
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
export declare const customFetch: unique symbol;
/**
 * Use to mutate JWT header and payload before they are signed. Its intended use is working around
 * non-conform server behaviours, such as modifying JWT "aud" (audience) claims, or otherwise
 * changing fixed claims used by this library.
 *
 * @example
 *
 * Changing Private Key JWT client assertion audience issued from an array to a string
 *
 * ```ts
 * import * as oauth from 'oauth4webapi'
 *
 * // Prerequisites
 * let as!: oauth.AuthorizationServer
 * let client!: oauth.Client
 * let parameters!: URLSearchParams
 * let clientPrivateKey!: CryptoKey
 *
 * const response = await oauth.pushedAuthorizationRequest(as, client, parameters, {
 *   clientPrivateKey: {
 *     key: clientPrivateKey,
 *     [oauth.modifyAssertion](header, payload) {
 *       payload.aud = as.issuer
 *     },
 *   },
 * })
 * ```
 *
 * @example
 *
 * Changing Request Object issued by {@link issueRequestObject} to have an expiration of 5 minutes
 *
 * ```ts
 * import * as oauth from 'oauth4webapi'
 *
 * // Prerequisites
 * let as!: oauth.AuthorizationServer
 * let client!: oauth.Client
 * let parameters!: URLSearchParams
 * let jarPrivateKey!: CryptoKey
 *
 * const request = await oauth.issueRequestObject(as, client, parameters, {
 *   key: jarPrivateKey,
 *   [oauth.modifyAssertion](header, payload) {
 *     payload.exp = <number>payload.iat + 300
 *   },
 * })
 * ```
 */
export declare const modifyAssertion: unique symbol;
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
 * import * as oauth from 'oauth4webapi'
 * import * as jose from 'jose'
 *
 * // Prerequisites
 * let as!: oauth.AuthorizationServer
 * let key!: CryptoKey
 * let alg!: string
 * let enc!: string
 *
 * const decoder = new TextDecoder()
 *
 * const client: oauth.Client = {
 *   client_id: 'urn:example:client_id',
 *   async [oauth.jweDecrypt](jwe) {
 *     const { plaintext } = await compactDecrypt(jwe, key, {
 *       keyManagementAlgorithms: [alg],
 *       contentEncryptionAlgorithms: [enc],
 *     }).catch((cause) => {
 *       throw new oauth.OperationProcessingError('decryption failed', { cause })
 *     })
 *
 *     return decoder.decode(plaintext)
 *   },
 * }
 *
 * const params = await oauth.validateJwtAuthResponse(as, client, currentUrl)
 * ```
 */
export declare const jweDecrypt: unique symbol;
/**
 * DANGER ZONE - This option has security implications that must be understood, assessed for
 * applicability, and accepted before use. It is critical that the JSON Web Key Set cache only be
 * writable by your own code.
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
 * import * as oauth from 'oauth4webapi'
 *
 * // Prerequisites
 * let as!: oauth.AuthorizationServer
 * let request!: Request
 * let expectedAudience!: string
 *
 * // Load JSON Web Key Set cache
 * const jwksCache: oauth.JWKSCacheInput = (await getPreviouslyCachedJWKS()) || {}
 * const { uat } = jwksCache
 *
 * // Use JSON Web Key Set cache
 * const accessTokenClaims = await validateJwtAccessToken(as, request, expectedAudience, {
 *   [oauth.jwksCache]: jwksCache,
 * })
 *
 * if (uat !== jwksCache.uat) {
 *   // Update JSON Web Key Set cache
 *   await storeNewJWKScache(jwksCache)
 * }
 * ```
 */
export declare const jwksCache: unique symbol;
/**
 * @ignore
 *
 * @deprecated Use {@link Client.use_mtls_endpoint_aliases `client.use_mtls_endpoint_aliases`}.
 */
export declare const useMtlsAlias: unique symbol;
/**
 * Authorization Server Metadata
 *
 * @see [IANA OAuth Authorization Server Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#authorization-server-metadata)
 */
export interface AuthorizationServer {
    /**
     * Authorization server's Issuer Identifier URL.
     */
    readonly issuer: string;
    /**
     * URL of the authorization server's authorization endpoint.
     */
    readonly authorization_endpoint?: string;
    /**
     * URL of the authorization server's token endpoint.
     */
    readonly token_endpoint?: string;
    /**
     * URL of the authorization server's JWK Set document.
     */
    readonly jwks_uri?: string;
    /**
     * URL of the authorization server's Dynamic Client Registration Endpoint.
     */
    readonly registration_endpoint?: string;
    /**
     * JSON array containing a list of the `scope` values that this authorization server supports.
     */
    readonly scopes_supported?: string[];
    /**
     * JSON array containing a list of the `response_type` values that this authorization server
     * supports.
     */
    readonly response_types_supported?: string[];
    /**
     * JSON array containing a list of the `response_mode` values that this authorization server
     * supports.
     */
    readonly response_modes_supported?: string[];
    /**
     * JSON array containing a list of the `grant_type` values that this authorization server
     * supports.
     */
    readonly grant_types_supported?: string[];
    /**
     * JSON array containing a list of client authentication methods supported by this token endpoint.
     */
    readonly token_endpoint_auth_methods_supported?: string[];
    /**
     * JSON array containing a list of the JWS signing algorithms supported by the token endpoint for
     * the signature on the JWT used to authenticate the client at the token endpoint.
     */
    readonly token_endpoint_auth_signing_alg_values_supported?: string[];
    /**
     * URL of a page containing human-readable information that developers might want or need to know
     * when using the authorization server.
     */
    readonly service_documentation?: string;
    /**
     * Languages and scripts supported for the user interface, represented as a JSON array of language
     * tag values from RFC 5646.
     */
    readonly ui_locales_supported?: string[];
    /**
     * URL that the authorization server provides to the person registering the client to read about
     * the authorization server's requirements on how the client can use the data provided by the
     * authorization server.
     */
    readonly op_policy_uri?: string;
    /**
     * URL that the authorization server provides to the person registering the client to read about
     * the authorization server's terms of service.
     */
    readonly op_tos_uri?: string;
    /**
     * URL of the authorization server's revocation endpoint.
     */
    readonly revocation_endpoint?: string;
    /**
     * JSON array containing a list of client authentication methods supported by this revocation
     * endpoint.
     */
    readonly revocation_endpoint_auth_methods_supported?: string[];
    /**
     * JSON array containing a list of the JWS signing algorithms supported by the revocation endpoint
     * for the signature on the JWT used to authenticate the client at the revocation endpoint.
     */
    readonly revocation_endpoint_auth_signing_alg_values_supported?: string[];
    /**
     * URL of the authorization server's introspection endpoint.
     */
    readonly introspection_endpoint?: string;
    /**
     * JSON array containing a list of client authentication methods supported by this introspection
     * endpoint.
     */
    readonly introspection_endpoint_auth_methods_supported?: string[];
    /**
     * JSON array containing a list of the JWS signing algorithms supported by the introspection
     * endpoint for the signature on the JWT used to authenticate the client at the introspection
     * endpoint.
     */
    readonly introspection_endpoint_auth_signing_alg_values_supported?: string[];
    /**
     * PKCE code challenge methods supported by this authorization server.
     */
    readonly code_challenge_methods_supported?: string[];
    /**
     * Signed JWT containing metadata values about the authorization server as claims.
     */
    readonly signed_metadata?: string;
    /**
     * URL of the authorization server's device authorization endpoint.
     */
    readonly device_authorization_endpoint?: string;
    /**
     * Indicates authorization server support for mutual-TLS client certificate-bound access tokens.
     */
    readonly tls_client_certificate_bound_access_tokens?: boolean;
    /**
     * JSON object containing alternative authorization server endpoints, which a client intending to
     * do mutual TLS will use in preference to the conventional endpoints.
     */
    readonly mtls_endpoint_aliases?: MTLSEndpointAliases;
    /**
     * URL of the authorization server's UserInfo Endpoint.
     */
    readonly userinfo_endpoint?: string;
    /**
     * JSON array containing a list of the Authentication Context Class References that this
     * authorization server supports.
     */
    readonly acr_values_supported?: string[];
    /**
     * JSON array containing a list of the Subject Identifier types that this authorization server
     * supports.
     */
    readonly subject_types_supported?: string[];
    /**
     * JSON array containing a list of the JWS `alg` values supported by the authorization server for
     * the ID Token.
     */
    readonly id_token_signing_alg_values_supported?: string[];
    /**
     * JSON array containing a list of the JWE `alg` values supported by the authorization server for
     * the ID Token.
     */
    readonly id_token_encryption_alg_values_supported?: string[];
    /**
     * JSON array containing a list of the JWE `enc` values supported by the authorization server for
     * the ID Token.
     */
    readonly id_token_encryption_enc_values_supported?: string[];
    /**
     * JSON array containing a list of the JWS `alg` values supported by the UserInfo Endpoint.
     */
    readonly userinfo_signing_alg_values_supported?: string[];
    /**
     * JSON array containing a list of the JWE `alg` values supported by the UserInfo Endpoint.
     */
    readonly userinfo_encryption_alg_values_supported?: string[];
    /**
     * JSON array containing a list of the JWE `enc` values supported by the UserInfo Endpoint.
     */
    readonly userinfo_encryption_enc_values_supported?: string[];
    /**
     * JSON array containing a list of the JWS `alg` values supported by the authorization server for
     * Request Objects.
     */
    readonly request_object_signing_alg_values_supported?: string[];
    /**
     * JSON array containing a list of the JWE `alg` values supported by the authorization server for
     * Request Objects.
     */
    readonly request_object_encryption_alg_values_supported?: string[];
    /**
     * JSON array containing a list of the JWE `enc` values supported by the authorization server for
     * Request Objects.
     */
    readonly request_object_encryption_enc_values_supported?: string[];
    /**
     * JSON array containing a list of the `display` parameter values that the authorization server
     * supports.
     */
    readonly display_values_supported?: string[];
    /**
     * JSON array containing a list of the Claim Types that the authorization server supports.
     */
    readonly claim_types_supported?: string[];
    /**
     * JSON array containing a list of the Claim Names of the Claims that the authorization server MAY
     * be able to supply values for.
     */
    readonly claims_supported?: string[];
    /**
     * Languages and scripts supported for values in Claims being returned, represented as a JSON
     * array of RFC 5646 language tag values.
     */
    readonly claims_locales_supported?: string[];
    /**
     * Boolean value specifying whether the authorization server supports use of the `claims`
     * parameter.
     */
    readonly claims_parameter_supported?: boolean;
    /**
     * Boolean value specifying whether the authorization server supports use of the `request`
     * parameter.
     */
    readonly request_parameter_supported?: boolean;
    /**
     * Boolean value specifying whether the authorization server supports use of the `request_uri`
     * parameter.
     */
    readonly request_uri_parameter_supported?: boolean;
    /**
     * Boolean value specifying whether the authorization server requires any `request_uri` values
     * used to be pre-registered.
     */
    readonly require_request_uri_registration?: boolean;
    /**
     * Indicates where authorization request needs to be protected as Request Object and provided
     * through either `request` or `request_uri` parameter.
     */
    readonly require_signed_request_object?: boolean;
    /**
     * URL of the authorization server's pushed authorization request endpoint.
     */
    readonly pushed_authorization_request_endpoint?: string;
    /**
     * Indicates whether the authorization server accepts authorization requests only via PAR.
     */
    readonly require_pushed_authorization_requests?: boolean;
    /**
     * JSON array containing a list of algorithms supported by the authorization server for
     * introspection response signing.
     */
    readonly introspection_signing_alg_values_supported?: string[];
    /**
     * JSON array containing a list of algorithms supported by the authorization server for
     * introspection response content key encryption (`alg` value).
     */
    readonly introspection_encryption_alg_values_supported?: string[];
    /**
     * JSON array containing a list of algorithms supported by the authorization server for
     * introspection response content encryption (`enc` value).
     */
    readonly introspection_encryption_enc_values_supported?: string[];
    /**
     * Boolean value indicating whether the authorization server provides the `iss` parameter in the
     * authorization response.
     */
    readonly authorization_response_iss_parameter_supported?: boolean;
    /**
     * JSON array containing a list of algorithms supported by the authorization server for
     * introspection response signing.
     */
    readonly authorization_signing_alg_values_supported?: string[];
    /**
     * JSON array containing a list of algorithms supported by the authorization server for
     * introspection response encryption (`alg` value).
     */
    readonly authorization_encryption_alg_values_supported?: string[];
    /**
     * JSON array containing a list of algorithms supported by the authorization server for
     * introspection response encryption (`enc` value).
     */
    readonly authorization_encryption_enc_values_supported?: string[];
    /**
     * CIBA Backchannel Authentication Endpoint.
     */
    readonly backchannel_authentication_endpoint?: string;
    /**
     * JSON array containing a list of the JWS signing algorithms supported for validation of signed
     * CIBA authentication requests.
     */
    readonly backchannel_authentication_request_signing_alg_values_supported?: string[];
    /**
     * Supported CIBA authentication result delivery modes.
     */
    readonly backchannel_token_delivery_modes_supported?: string[];
    /**
     * Indicates whether the authorization server supports the use of the CIBA `user_code` parameter.
     */
    readonly backchannel_user_code_parameter_supported?: boolean;
    /**
     * URL of an authorization server iframe that supports cross-origin communications for session
     * state information with the RP Client, using the HTML5 postMessage API.
     */
    readonly check_session_iframe?: string;
    /**
     * JSON array containing a list of the JWS algorithms supported for DPoP proof JWTs.
     */
    readonly dpop_signing_alg_values_supported?: string[];
    /**
     * URL at the authorization server to which an RP can perform a redirect to request that the
     * End-User be logged out at the authorization server.
     */
    readonly end_session_endpoint?: string;
    /**
     * Boolean value specifying whether the authorization server can pass `iss` (issuer) and `sid`
     * (session ID) query parameters to identify the RP session with the authorization server when the
     * `frontchannel_logout_uri` is used.
     */
    readonly frontchannel_logout_session_supported?: boolean;
    /**
     * Boolean value specifying whether the authorization server supports HTTP-based logout.
     */
    readonly frontchannel_logout_supported?: boolean;
    /**
     * Boolean value specifying whether the authorization server can pass a `sid` (session ID) Claim
     * in the Logout Token to identify the RP session with the OP.
     */
    readonly backchannel_logout_session_supported?: boolean;
    /**
     * Boolean value specifying whether the authorization server supports back-channel logout.
     */
    readonly backchannel_logout_supported?: boolean;
    readonly [metadata: string]: JsonValue | undefined;
}
export interface MTLSEndpointAliases extends Pick<AuthorizationServer, 'token_endpoint' | 'revocation_endpoint' | 'introspection_endpoint' | 'device_authorization_endpoint' | 'userinfo_endpoint' | 'pushed_authorization_request_endpoint'> {
    readonly [metadata: string]: JsonValue | undefined;
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
    client_id: string;
    /**
     * Client secret.
     */
    client_secret?: string;
    /**
     * Client {@link ClientAuthenticationMethod authentication method} for the client's authenticated
     * requests. Default is `client_secret_basic`.
     */
    token_endpoint_auth_method?: ClientAuthenticationMethod;
    /**
     * JWS `alg` algorithm required for signing the ID Token issued to this Client. When not
     * configured the default is to allow only algorithms listed in
     * {@link AuthorizationServer.id_token_signing_alg_values_supported `as.id_token_signing_alg_values_supported`}
     * and fall back to `RS256` when the authorization server metadata is not set.
     */
    id_token_signed_response_alg?: string;
    /**
     * JWS `alg` algorithm required for signing authorization responses. When not configured the
     * default is to allow only {@link JWSAlgorithm supported algorithms} listed in
     * {@link AuthorizationServer.authorization_signing_alg_values_supported `as.authorization_signing_alg_values_supported`}
     * and fall back to `RS256` when the authorization server metadata is not set.
     */
    authorization_signed_response_alg?: JWSAlgorithm;
    /**
     * Boolean value specifying whether the {@link IDToken.auth_time `auth_time`} Claim in the ID Token
     * is REQUIRED. Default is `false`.
     */
    require_auth_time?: boolean;
    /**
     * JWS `alg` algorithm REQUIRED for signing UserInfo Responses. When not configured the default is
     * to allow only algorithms listed in
     * {@link AuthorizationServer.userinfo_signing_alg_values_supported `as.userinfo_signing_alg_values_supported`}
     * and fall back to `RS256` when the authorization server metadata is not set.
     */
    userinfo_signed_response_alg?: string;
    /**
     * JWS `alg` algorithm REQUIRED for signed introspection responses. When not configured the
     * default is to allow only algorithms listed in
     * {@link AuthorizationServer.introspection_signing_alg_values_supported `as.introspection_signing_alg_values_supported`}
     * and fall back to `RS256` when the authorization server metadata is not set.
     */
    introspection_signed_response_alg?: string;
    /**
     * Default Maximum Authentication Age.
     */
    default_max_age?: number;
    /**
     * Indicates the requirement for a client to use mutual TLS endpoint aliases defined by the AS
     * where present. Default is `false`.
     *
     * When combined with {@link customFetch} (to use a Fetch API implementation that supports client
     * certificates) this can be used to target FAPI 2.0 profiles that utilize Mutual-TLS for either
     * client authentication or sender constraining. FAPI 1.0 Advanced profiles that use PAR and JARM
     * can also be targetted.
     *
     * @example
     *
     * (Node.js) Using [nodejs/undici](https://github.com/nodejs/undici) for Mutual-TLS Client
     * Authentication and Certificate-Bound Access Tokens support.
     *
     * ```ts
     * import * as undici from 'undici'
     * import * as oauth from 'oauth4webapi'
     *
     * // Prerequisites
     * let as!: oauth.AuthorizationServer
     * let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
     * let params!: URLSearchParams
     * let key!: string // PEM-encoded key
     * let cert!: string // PEM-encoded certificate
     *
     * const agent = new undici.Agent({ connect: { key, cert } })
     *
     * const response = await oauth.pushedAuthorizationRequest(as, client, params, {
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
     * import * as oauth from 'oauth4webapi'
     *
     * // Prerequisites
     * let as!: oauth.AuthorizationServer
     * let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
     * let params!: URLSearchParams
     * let key!: string // PEM-encoded key
     * let cert!: string // PEM-encoded certificate
     *
     * const agent = Deno.createHttpClient({ key, cert })
     *
     * const response = await oauth.pushedAuthorizationRequest(as, client, params, {
     *   [oauth.customFetch]: (...args) => fetch(args[0], { ...args[1], client: agent }),
     * })
     * ```
     *
     * @see [RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens](https://www.rfc-editor.org/rfc/rfc8705.html)
     */
    use_mtls_endpoint_aliases?: boolean;
    /**
     * See {@link clockSkew}.
     */
    [clockSkew]?: number;
    /**
     * See {@link clockTolerance}.
     */
    [clockTolerance]?: number;
    /**
     * See {@link jweDecrypt}.
     */
    [jweDecrypt]?: JweDecryptFunction;
    [metadata: string]: JsonValue | undefined;
}
/**
 * @group Errors
 */
export declare class UnsupportedOperationError extends Error {
    constructor(message?: string);
}
/**
 * @group Errors
 */
export declare class OperationProcessingError extends Error {
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
export interface JWKSCacheOptions {
    /**
     * See {@link jwksCache}.
     */
    [jwksCache]?: JWKSCacheInput;
}
export interface HttpRequestOptions {
    /**
     * An AbortSignal instance, or a factory returning one, to abort the HTTP request(s) triggered by
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
    signal?: (() => AbortSignal) | AbortSignal;
    /**
     * Headers to additionally send with the HTTP request(s) triggered by this function's invocation.
     */
    headers?: [string, string][] | Record<string, string> | Headers;
    /**
     * See {@link customFetch}.
     */
    [customFetch]?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}
export interface DiscoveryRequestOptions extends HttpRequestOptions {
    /**
     * The issuer transformation algorithm to use.
     */
    algorithm?: 'oidc' | 'oauth2';
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
export declare function discoveryRequest(issuerIdentifier: URL, options?: DiscoveryRequestOptions): Promise<Response>;
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
 * @see [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)
 */
export declare function processDiscoveryResponse(expectedIssuerIdentifier: URL, response: Response): Promise<AuthorizationServer>;
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
export declare function generateRandomCodeVerifier(): string;
/**
 * Generate random `state` value.
 *
 * @group Utilities
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.1)
 */
export declare function generateRandomState(): string;
/**
 * Generate random `nonce` value.
 *
 * @group Utilities
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
 */
export declare function generateRandomNonce(): string;
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
export declare function calculatePKCECodeChallenge(codeVerifier: string): Promise<string>;
export interface DPoPOptions extends CryptoKeyPair {
    /**
     * Private CryptoKey instance to sign the DPoP Proof JWT with.
     *
     * Its algorithm must be compatible with a supported {@link JWSAlgorithm JWS `alg` Algorithm}.
     */
    privateKey: CryptoKey;
    /**
     * The public key corresponding to {@link DPoPOptions.privateKey}.
     */
    publicKey: CryptoKey;
    /**
     * Server-Provided Nonce to use in the request. This option serves as an override in case the
     * self-correcting mechanism does not work with a particular server. Previously received nonces
     * will be used automatically.
     */
    nonce?: string;
    /**
     * Use to modify the DPoP Proof JWT right before it is signed.
     *
     * @see {@link modifyAssertion}
     */
    [modifyAssertion]?: ModifyAssertionFunction;
}
export interface DPoPRequestOptions {
    /**
     * DPoP-related options.
     */
    DPoP?: DPoPOptions;
}
/**
 * @ignore
 *
 * @deprecated Use {@link Client.use_mtls_endpoint_aliases `client.use_mtls_endpoint_aliases`}.
 */
export interface UseMTLSAliasOptions {
    /**
     * @ignore
     *
     * @deprecated Use {@link Client.use_mtls_endpoint_aliases `client.use_mtls_endpoint_aliases`}.
     */
    [useMtlsAlias]?: boolean;
}
export interface AuthenticatedRequestOptions extends UseMTLSAliasOptions {
    /**
     * Private key to use for `private_key_jwt`
     * {@link ClientAuthenticationMethod client authentication}. Its algorithm must be compatible with
     * a supported {@link JWSAlgorithm JWS `alg` Algorithm}.
     */
    clientPrivateKey?: CryptoKey | PrivateKey;
}
export interface PushedAuthorizationRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions, DPoPRequestOptions {
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
export declare function issueRequestObject(as: AuthorizationServer, client: Client, parameters: URLSearchParams | Record<string, string> | string[][], privateKey: CryptoKey | PrivateKey): Promise<string>;
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
export declare function pushedAuthorizationRequest(as: AuthorizationServer, client: Client, parameters: URLSearchParams | Record<string, string> | string[][], options?: PushedAuthorizationRequestOptions): Promise<Response>;
export interface PushedAuthorizationResponse {
    readonly request_uri: string;
    readonly expires_in: number;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface OAuth2Error {
    readonly error: string;
    readonly error_description?: string;
    readonly error_uri?: string;
    readonly algs?: string;
    readonly scope?: string;
    readonly [parameter: string]: JsonValue | undefined;
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
 * @group JWT Bearer Token Grant Type
 * @group SAML 2.0 Bearer Assertion Grant Type
 * @group Token Exchange Grant Type
 */
export declare function isOAuth2Error(input?: TokenEndpointResponse | OAuth2TokenEndpointResponse | OpenIDTokenEndpointResponse | ClientCredentialsGrantResponse | DeviceAuthorizationResponse | IntrospectionResponse | OAuth2Error | PushedAuthorizationResponse | URLSearchParams | UserInfoResponse): input is OAuth2Error;
export interface WWWAuthenticateChallengeParameters {
    readonly realm?: string;
    readonly error?: string;
    readonly error_description?: string;
    readonly error_uri?: string;
    readonly algs?: string;
    readonly scope?: string;
    /**
     * NOTE: because the parameter names are case insensitive they are always returned lowercased
     */
    readonly [parameter: Lowercase<string>]: string | undefined;
}
export interface WWWAuthenticateChallenge {
    /**
     * NOTE: because the value is case insensitive it is always returned lowercased
     */
    readonly scheme: Lowercase<string>;
    readonly parameters: WWWAuthenticateChallengeParameters;
}
/**
 * Parses the `WWW-Authenticate` HTTP Header from a {@link !Response} instance.
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
 * @group JWT Bearer Token Grant Type
 * @group SAML 2.0 Bearer Assertion Grant Type
 * @group Token Exchange Grant Type
 */
export declare function parseWwwAuthenticateChallenges(response: Response): WWWAuthenticateChallenge[] | undefined;
/**
 * Validates {@link !Response} instance to be one coming from the
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
export declare function processPushedAuthorizationResponse(as: AuthorizationServer, client: Client, response: Response): Promise<PushedAuthorizationResponse | OAuth2Error>;
export interface ProtectedResourceRequestOptions extends Omit<HttpRequestOptions, 'headers'>, DPoPRequestOptions {
    /**
     * See {@link clockSkew}.
     */
    [clockSkew]?: number;
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
export declare function protectedResourceRequest(accessToken: string, method: string, url: URL, headers?: Headers, body?: ReadableStream | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | string | null, options?: ProtectedResourceRequestOptions): Promise<Response>;
export interface UserInfoRequestOptions extends HttpRequestOptions, DPoPRequestOptions, UseMTLSAliasOptions {
}
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
export declare function userInfoRequest(as: AuthorizationServer, client: Client, accessToken: string, options?: UserInfoRequestOptions): Promise<Response>;
export interface UserInfoAddress {
    readonly formatted?: string;
    readonly street_address?: string;
    readonly locality?: string;
    readonly region?: string;
    readonly postal_code?: string;
    readonly country?: string;
    readonly [claim: string]: JsonValue | undefined;
}
export interface UserInfoResponse {
    readonly sub: string;
    readonly name?: string;
    readonly given_name?: string;
    readonly family_name?: string;
    readonly middle_name?: string;
    readonly nickname?: string;
    readonly preferred_username?: string;
    readonly profile?: string;
    readonly picture?: string;
    readonly website?: string;
    readonly email?: string;
    readonly email_verified?: boolean;
    readonly gender?: string;
    readonly birthdate?: string;
    readonly zoneinfo?: string;
    readonly locale?: string;
    readonly phone_number?: string;
    readonly updated_at?: number;
    readonly address?: UserInfoAddress;
    readonly [claim: string]: JsonValue | undefined;
}
export interface ExportedJWKSCache {
    jwks: JWKS;
    uat: number;
}
export type JWKSCacheInput = ExportedJWKSCache | Record<string, never>;
/**
 * DANGER ZONE - This option has security implications that must be understood, assessed for
 * applicability, and accepted before use.
 *
 * Use this as a value to {@link processUserInfoResponse} `expectedSubject` parameter to skip the
 * `sub` claim value check.
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse)
 */
export declare const skipSubjectCheck: unique symbol;
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
 * @returns Resolves with an object representing the parsed successful response, or an object
 *   representing an OAuth 2.0 protocol style error. Use {@link isOAuth2Error} to determine if an
 *   OAuth 2.0 error was returned.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group OpenID Connect (OIDC) UserInfo
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
 */
export declare function processUserInfoResponse(as: AuthorizationServer, client: Client, expectedSubject: string | typeof skipSubjectCheck, response: Response): Promise<UserInfoResponse>;
export interface TokenEndpointRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions, DPoPRequestOptions {
    /**
     * Any additional parameters to send. This cannot override existing parameter values.
     */
    additionalParameters?: URLSearchParams | Record<string, string> | string[][];
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
export declare function refreshTokenGrantRequest(as: AuthorizationServer, client: Client, refreshToken: string, options?: TokenEndpointRequestOptions): Promise<Response>;
/**
 * Returns ID Token claims validated during {@link processAuthorizationCodeOpenIDResponse}.
 *
 * @param ref Value previously resolved from {@link processAuthorizationCodeOpenIDResponse}.
 *
 * @returns JWT Claims Set from an ID Token.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 */
export declare function getValidatedIdTokenClaims(ref: OpenIDTokenEndpointResponse): IDToken;
/**
 * Returns ID Token claims validated during {@link processRefreshTokenResponse} or
 * {@link processDeviceCodeResponse}.
 *
 * @param ref Value previously resolved from {@link processRefreshTokenResponse} or
 *   {@link processDeviceCodeResponse}.
 *
 * @returns JWT Claims Set from an ID Token, or undefined if there is no ID Token in `ref`.
 */
export declare function getValidatedIdTokenClaims(ref: TokenEndpointResponse): IDToken | undefined;
export interface ValidateSignatureOptions extends HttpRequestOptions, JWKSCacheOptions {
}
/**
 * Validates the JWS Signature of an ID Token included in results previously resolved from
 * {@link processAuthorizationCodeOpenIDResponse}, {@link processRefreshTokenResponse}, or
 * {@link processDeviceCodeResponse} for non-repudiation purposes.
 *
 * Note: Validating signatures of ID Tokens received via direct communication between the Client and
 * the Token Endpoint (which it is here) is not mandatory since the TLS server validation is used to
 * validate the issuer instead of checking the token signature. You only need to use this method for
 * non-repudiation purposes.
 *
 * Note: Supports only digital signatures.
 *
 * @param as Authorization Server Metadata.
 * @param ref Value previously resolved from {@link processAuthorizationCodeOpenIDResponse},
 *   {@link processRefreshTokenResponse}, or {@link processDeviceCodeResponse}.
 *
 * @returns Resolves if the signature validates, rejects otherwise.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group FAPI 1.0 Advanced
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)
 */
export declare function validateIdTokenSignature(as: AuthorizationServer, ref: OpenIDTokenEndpointResponse | TokenEndpointResponse, options?: ValidateSignatureOptions): Promise<void>;
/**
 * Validates the JWS Signature of a JWT {@link !Response} body of response previously processed by
 * {@link processUserInfoResponse} for non-repudiation purposes.
 *
 * Note: Validating signatures of JWTs received via direct communication between the Client and a
 * TLS-secured Endpoint (which it is here) is not mandatory since the TLS server validation is used
 * to validate the issuer instead of checking the token signature. You only need to use this method
 * for non-repudiation purposes.
 *
 * Note: Supports only digital signatures.
 *
 * @param as Authorization Server Metadata.
 * @param ref Response previously processed by {@link processUserInfoResponse}.
 *
 * @returns Resolves if the signature validates, rejects otherwise.
 *
 * @group Authorization Code Grant w/ OpenID Connect (OIDC)
 * @group OpenID Connect (OIDC) UserInfo
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
 */
export declare function validateJwtUserInfoSignature(as: AuthorizationServer, ref: Response, options?: ValidateSignatureOptions): Promise<void>;
/**
 * Validates the JWS Signature of an JWT {@link !Response} body of responses previously processed by
 * {@link processIntrospectionResponse} for non-repudiation purposes.
 *
 * Note: Validating signatures of JWTs received via direct communication between the Client and a
 * TLS-secured Endpoint (which it is here) is not mandatory since the TLS server validation is used
 * to validate the issuer instead of checking the token signature. You only need to use this method
 * for non-repudiation purposes.
 *
 * Note: Supports only digital signatures.
 *
 * @param as Authorization Server Metadata.
 * @param ref Response previously processed by {@link processIntrospectionResponse}.
 *
 * @returns Resolves if the signature validates, rejects otherwise.
 *
 * @group Token Introspection
 *
 * @see [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-5)
 */
export declare function validateJwtIntrospectionSignature(as: AuthorizationServer, ref: Response, options?: ValidateSignatureOptions): Promise<void>;
/**
 * Validates Refresh Token Grant {@link !Response} instance to be one coming from the
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
export declare function processRefreshTokenResponse(as: AuthorizationServer, client: Client, response: Response): Promise<TokenEndpointResponse | OAuth2Error>;
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
export declare function authorizationCodeGrantRequest(as: AuthorizationServer, client: Client, callbackParameters: URLSearchParams, redirectUri: string, codeVerifier: string, options?: TokenEndpointRequestOptions): Promise<Response>;
interface JWTPayload {
    readonly iss?: string;
    readonly sub?: string;
    readonly aud?: string | string[];
    readonly jti?: string;
    readonly nbf?: number;
    readonly exp?: number;
    readonly iat?: number;
    readonly cnf?: ConfirmationClaims;
    readonly [claim: string]: JsonValue | undefined;
}
export interface IDToken extends JWTPayload {
    readonly iss: string;
    readonly sub: string;
    readonly aud: string | string[];
    readonly iat: number;
    readonly exp: number;
    readonly nonce?: string;
    readonly auth_time?: number;
    readonly azp?: string;
    readonly [claim: string]: JsonValue | undefined;
}
export interface AuthorizationDetails {
    readonly type: string;
    readonly locations?: string[];
    readonly actions?: string[];
    readonly datatypes?: string[];
    readonly privileges?: string[];
    readonly identifier?: string;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface TokenEndpointResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly id_token?: string;
    readonly refresh_token?: string;
    readonly scope?: string;
    readonly authorization_details?: AuthorizationDetails[];
    /**
     * NOTE: because the value is case insensitive it is always returned lowercased
     */
    readonly token_type: 'bearer' | 'dpop' | Lowercase<string>;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface OpenIDTokenEndpointResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly id_token: string;
    readonly refresh_token?: string;
    readonly scope?: string;
    readonly authorization_details?: AuthorizationDetails[];
    /**
     * NOTE: because the value is case insensitive it is always returned lowercased
     */
    readonly token_type: 'bearer' | 'dpop' | Lowercase<string>;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface OAuth2TokenEndpointResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly id_token?: undefined;
    readonly refresh_token?: string;
    readonly scope?: string;
    readonly authorization_details?: AuthorizationDetails[];
    /**
     * NOTE: because the value is case insensitive it is always returned lowercased
     */
    readonly token_type: 'bearer' | 'dpop' | Lowercase<string>;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface ClientCredentialsGrantResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly scope?: string;
    readonly authorization_details?: AuthorizationDetails[];
    /**
     * NOTE: because the value is case insensitive it is always returned lowercased
     */
    readonly token_type: 'bearer' | 'dpop' | Lowercase<string>;
    readonly [parameter: string]: JsonValue | undefined;
}
/**
 * Use this as a value to {@link processAuthorizationCodeOpenIDResponse} `expectedNonce` parameter to
 * indicate no `nonce` ID Token claim value is expected, i.e. no `nonce` parameter value was sent
 * with the authorization request.
 */
export declare const expectNoNonce: unique symbol;
/**
 * Use this as a value to {@link processAuthorizationCodeOpenIDResponse} `maxAge` parameter to
 * indicate no `auth_time` ID Token claim value check should be performed.
 */
export declare const skipAuthTimeCheck: unique symbol;
/**
 * (OpenID Connect only) Validates Authorization Code Grant {@link !Response} instance to be one
 * coming from the {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
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
export declare function processAuthorizationCodeOpenIDResponse(as: AuthorizationServer, client: Client, response: Response, expectedNonce?: string | typeof expectNoNonce, maxAge?: number | typeof skipAuthTimeCheck): Promise<OpenIDTokenEndpointResponse | OAuth2Error>;
/**
 * (OAuth 2.0 without OpenID Connect only) Validates Authorization Code Grant {@link !Response}
 * instance to be one coming from the
 * {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
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
export declare function processAuthorizationCodeOAuth2Response(as: AuthorizationServer, client: Client, response: Response): Promise<OAuth2TokenEndpointResponse | OAuth2Error>;
export interface ClientCredentialsGrantRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions, DPoPRequestOptions {
}
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
export declare function clientCredentialsGrantRequest(as: AuthorizationServer, client: Client, parameters: URLSearchParams | Record<string, string> | string[][], options?: ClientCredentialsGrantRequestOptions): Promise<Response>;
/**
 * Performs any Grant request at the {@link AuthorizationServer.token_endpoint `as.token_endpoint`}.
 * The purpose is to be able to execute grant requests such as Token Exchange Grant Type, JWT Bearer
 * Token Grant Type, or SAML 2.0 Bearer Assertion Grant Type.
 *
 * @param as Authorization Server Metadata.
 * @param client Client Metadata.
 * @param grantType Grant Type.
 *
 * @group JWT Bearer Token Grant Type
 * @group SAML 2.0 Bearer Assertion Grant Type
 * @group Token Exchange Grant Type
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8693.html Token Exchange Grant Type}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7523.html#section-2.1 JWT Bearer Token Grant Type}
 * @see {@link https://www.rfc-editor.org/rfc/rfc7522.html#section-2.1 SAML 2.0 Bearer Assertion Grant Type}
 */
export declare function genericTokenEndpointRequest(as: AuthorizationServer, client: Client, grantType: string, parameters: URLSearchParams | Record<string, string> | string[][], options?: Omit<TokenEndpointRequestOptions, 'additionalParameters'>): Promise<Response>;
/**
 * Validates Client Credentials Grant {@link !Response} instance to be one coming from the
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
export declare function processClientCredentialsResponse(as: AuthorizationServer, client: Client, response: Response): Promise<ClientCredentialsGrantResponse | OAuth2Error>;
export interface RevocationRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions {
    /**
     * Any additional parameters to send. This cannot override existing parameter values.
     */
    additionalParameters?: URLSearchParams | Record<string, string> | string[][];
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
export declare function revocationRequest(as: AuthorizationServer, client: Client, token: string, options?: RevocationRequestOptions): Promise<Response>;
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
export declare function processRevocationResponse(response: Response): Promise<undefined | OAuth2Error>;
export interface IntrospectionRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions {
    /**
     * Any additional parameters to send. This cannot override existing parameter values.
     */
    additionalParameters?: URLSearchParams | Record<string, string> | string[][];
    /**
     * Request a JWT Response from the
     * {@link AuthorizationServer.introspection_endpoint `as.introspection_endpoint`}. Default is
     *
     * - True when
     *   {@link Client.introspection_signed_response_alg `client.introspection_signed_response_alg`} is
     *   set
     * - False otherwise
     */
    requestJwtResponse?: boolean;
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
export declare function introspectionRequest(as: AuthorizationServer, client: Client, token: string, options?: IntrospectionRequestOptions): Promise<Response>;
export interface ConfirmationClaims {
    readonly 'x5t#S256'?: string;
    readonly jkt?: string;
    readonly [claim: string]: JsonValue | undefined;
}
export interface IntrospectionResponse {
    readonly active: boolean;
    readonly client_id?: string;
    readonly exp?: number;
    readonly iat?: number;
    readonly sid?: string;
    readonly iss?: string;
    readonly jti?: string;
    readonly username?: string;
    readonly aud?: string | string[];
    readonly scope?: string;
    readonly sub?: string;
    readonly nbf?: number;
    readonly token_type?: string;
    readonly cnf?: ConfirmationClaims;
    readonly authorization_details?: AuthorizationDetails[];
    readonly [claim: string]: JsonValue | undefined;
}
/**
 * Validates {@link !Response} instance to be one coming from the
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
export declare function processIntrospectionResponse(as: AuthorizationServer, client: Client, response: Response): Promise<IntrospectionResponse | OAuth2Error>;
export interface JWKS {
    readonly keys: JWK[];
}
export interface JweDecryptFunction {
    (jwe: string): Promise<string>;
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
export declare function validateJwtAuthResponse(as: AuthorizationServer, client: Client, parameters: URLSearchParams | URL, expectedState?: string | typeof expectNoState | typeof skipStateCheck, options?: ValidateSignatureOptions): Promise<URLSearchParams | OAuth2Error>;
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
export declare function validateDetachedSignatureResponse(as: AuthorizationServer, client: Client, parameters: URLSearchParams | URL, expectedNonce: string, expectedState?: string | typeof expectNoState, maxAge?: number | typeof skipAuthTimeCheck, options?: ValidateSignatureOptions): Promise<URLSearchParams | OAuth2Error>;
/**
 * DANGER ZONE - This option has security implications that must be understood, assessed for
 * applicability, and accepted before use.
 *
 * Use this as a value to {@link validateAuthResponse} `expectedState` parameter to skip the `state`
 * value check when you'll be validating such `state` value yourself instead. This should only be
 * done if you use a `state` parameter value that is integrity protected and bound to the browsing
 * session. One such mechanism to do so is described in an I-D
 * [draft-bradley-oauth-jwt-encoded-state-09](https://datatracker.ietf.org/doc/html/draft-bradley-oauth-jwt-encoded-state-09).
 */
export declare const skipStateCheck: unique symbol;
/**
 * Use this as a value to {@link validateAuthResponse} `expectedState` parameter to indicate no
 * `state` parameter value is expected, i.e. no `state` parameter value was sent with the
 * authorization request.
 */
export declare const expectNoState: unique symbol;
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
export declare function validateAuthResponse(as: AuthorizationServer, client: Client, parameters: URLSearchParams | URL, expectedState?: string | typeof expectNoState | typeof skipStateCheck): URLSearchParams | OAuth2Error;
export interface DeviceAuthorizationRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions {
}
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
export declare function deviceAuthorizationRequest(as: AuthorizationServer, client: Client, parameters: URLSearchParams | Record<string, string> | string[][], options?: DeviceAuthorizationRequestOptions): Promise<Response>;
export interface DeviceAuthorizationResponse {
    readonly device_code: string;
    readonly user_code: string;
    readonly verification_uri: string;
    readonly expires_in: number;
    readonly verification_uri_complete?: string;
    readonly interval?: number;
    readonly [parameter: string]: JsonValue | undefined;
}
/**
 * Validates {@link !Response} instance to be one coming from the
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
export declare function processDeviceAuthorizationResponse(as: AuthorizationServer, client: Client, response: Response): Promise<DeviceAuthorizationResponse | OAuth2Error>;
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
export declare function deviceCodeGrantRequest(as: AuthorizationServer, client: Client, deviceCode: string, options?: TokenEndpointRequestOptions): Promise<Response>;
/**
 * Validates Device Authorization Grant {@link !Response} instance to be one coming from the
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
export declare function processDeviceCodeResponse(as: AuthorizationServer, client: Client, response: Response): Promise<TokenEndpointResponse | OAuth2Error>;
export interface GenerateKeyPairOptions {
    /**
     * Indicates whether or not the private key may be exported. Default is `false`.
     */
    extractable?: boolean;
    /**
     * (RSA algorithms only) The length, in bits, of the RSA modulus. Default is `2048`.
     */
    modulusLength?: number;
    /**
     * (EdDSA algorithm only) The EdDSA sub-type. Default is `Ed25519`.
     */
    crv?: 'Ed25519' | 'Ed448';
}
/**
 * Generates a {@link !CryptoKeyPair} for a given JWS `alg` Algorithm identifier.
 *
 * @param alg Supported JWS `alg` Algorithm identifier.
 *
 * @group Utilities
 */
export declare function generateKeyPair(alg: JWSAlgorithm, options?: GenerateKeyPairOptions): Promise<CryptoKeyPair>;
export interface JWTAccessTokenClaims extends JWTPayload {
    readonly iss: string;
    readonly exp: number;
    readonly aud: string | string[];
    readonly sub: string;
    readonly iat: number;
    readonly jti: string;
    readonly client_id: string;
    readonly authorization_details?: AuthorizationDetails[];
    readonly scope?: string;
    readonly [claim: string]: JsonValue | undefined;
}
export interface ValidateJWTAccessTokenOptions extends HttpRequestOptions, JWKSCacheOptions {
    /**
     * Indicates whether DPoP use is required.
     */
    requireDPoP?: boolean;
    /**
     * See {@link clockSkew}.
     */
    [clockSkew]?: number;
    /**
     * See {@link clockTolerance}.
     */
    [clockTolerance]?: number;
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
export declare function validateJwtAccessToken(as: AuthorizationServer, request: Request, expectedAudience: string, options?: ValidateJWTAccessTokenOptions): Promise<JWTAccessTokenClaims>;
/**
 * @ignore
 *
 * @deprecated Use {@link customFetch}.
 */
export declare const experimentalCustomFetch: symbol;
/**
 * @ignore
 *
 * @deprecated Use {@link customFetch}.
 */
export declare const experimental_customFetch: symbol;
/**
 * @ignore
 *
 * @deprecated Use {@link Client.use_mtls_endpoint_aliases `client.use_mtls_endpoint_aliases`}.
 */
export declare const experimentalUseMtlsAlias: symbol;
/**
 * @ignore
 *
 * @deprecated Use {@link Client.use_mtls_endpoint_aliases `client.use_mtls_endpoint_aliases`}.
 */
export declare const experimental_useMtlsAlias: symbol;
/**
 * @ignore
 *
 * @deprecated Use {@link Client.use_mtls_endpoint_aliases `client.use_mtls_endpoint_aliases`}.
 */
export type ExperimentalUseMTLSAliasOptions = UseMTLSAliasOptions;
/**
 * @ignore
 *
 * @deprecated Use {@link ConfirmationClaims}.
 */
export type IntrospectionConfirmationClaims = ConfirmationClaims;
/**
 * @ignore
 *
 * @deprecated Use {@link validateDetachedSignatureResponse}.
 */
export declare const experimental_validateDetachedSignatureResponse: (as: AuthorizationServer, client: Client, parameters: URLSearchParams | URL, expectedNonce: string, expectedState?: string | typeof expectNoState | undefined, maxAge?: number | typeof skipAuthTimeCheck | undefined, options?: ValidateSignatureOptions | undefined) => ReturnType<typeof validateDetachedSignatureResponse>;
/**
 * @ignore
 *
 * @deprecated Use {@link validateJwtAccessToken}.
 */
export declare const experimental_validateJwtAccessToken: (as: AuthorizationServer, request: Request, expectedAudience: string, options?: ValidateJWTAccessTokenOptions | undefined) => ReturnType<typeof validateJwtAccessToken>;
/**
 * @ignore
 *
 * @deprecated Use {@link validateJwtUserinfoSignature}.
 */
export declare const validateJwtUserinfoSignature: (as: AuthorizationServer, ref: Response, options?: ValidateSignatureOptions | undefined) => ReturnType<typeof validateJwtUserInfoSignature>;
/**
 * @ignore
 *
 * @deprecated Use {@link jwksCache}.
 */
export declare const experimental_jwksCache: symbol;
/**
 * @ignore
 *
 * @deprecated Use {@link ValidateSignatureOptions}.
 */
export interface ValidateJwtResponseSignatureOptions extends ValidateSignatureOptions {
}
/**
 * @ignore
 *
 * @deprecated Use {@link ValidateSignatureOptions}.
 */
export interface ValidateDetachedSignatureResponseOptions extends ValidateSignatureOptions {
}
export {};
