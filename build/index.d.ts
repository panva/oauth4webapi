type JsonObject = {
    [Key in string]?: JsonValue;
};
type JsonArray = JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
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
 * @example CryptoKey algorithm for the `PS256`, `PS384`, or `PS512` JWS Algorithm Identifiers
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
 * @example CryptoKey algorithm for the `ES256`, `ES384`, or `ES512` JWS Algorithm Identifiers
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
 * @example CryptoKey algorithm for the `RS256`, `RS384`, or `RS512` JWS Algorithm Identifiers
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
 * @example CryptoKey algorithm for the `EdDSA` JWS Algorithm Identifier (Experimental)
 *
 * Runtime support for this algorithm is very limited, it depends on the [Secure Curves in the Web
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
/** @ignore during Documentation generation but part of the public API */
export declare const clockSkew: unique symbol;
/** @ignore during Documentation generation but part of the public API */
export declare const clockTolerance: unique symbol;
/**
 * Authorization Server Metadata
 *
 * @see [IANA OAuth Authorization Server Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#authorization-server-metadata)
 */
export interface AuthorizationServer {
    /** Authorization server's Issuer Identifier URL. */
    readonly issuer: string;
    /** URL of the authorization server's authorization endpoint. */
    readonly authorization_endpoint?: string;
    /** URL of the authorization server's token endpoint. */
    readonly token_endpoint?: string;
    /** URL of the authorization server's JWK Set document. */
    readonly jwks_uri?: string;
    /** URL of the authorization server's Dynamic Client Registration Endpoint. */
    readonly registration_endpoint?: string;
    /** JSON array containing a list of the `scope` values that this authorization server supports. */
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
    /** JSON array containing a list of client authentication methods supported by this token endpoint. */
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
    /** URL of the authorization server's revocation endpoint. */
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
    /** URL of the authorization server's introspection endpoint. */
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
    /** PKCE code challenge methods supported by this authorization server. */
    readonly code_challenge_methods_supported?: string[];
    /** Signed JWT containing metadata values about the authorization server as claims. */
    readonly signed_metadata?: string;
    /** URL of the authorization server's device authorization endpoint. */
    readonly device_authorization_endpoint?: string;
    /** Indicates authorization server support for mutual-TLS client certificate-bound access tokens. */
    readonly tls_client_certificate_bound_access_tokens?: boolean;
    /**
     * JSON object containing alternative authorization server endpoints, which a client intending to
     * do mutual TLS will use in preference to the conventional endpoints.
     */
    readonly mtls_endpoint_aliases?: MTLSEndpointAliases;
    /** URL of the authorization server's UserInfo Endpoint. */
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
    /** JSON array containing a list of the JWS `alg` values supported by the UserInfo Endpoint. */
    readonly userinfo_signing_alg_values_supported?: string[];
    /** JSON array containing a list of the JWE `alg` values supported by the UserInfo Endpoint. */
    readonly userinfo_encryption_alg_values_supported?: string[];
    /** JSON array containing a list of the JWE `enc` values supported by the UserInfo Endpoint. */
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
    /** JSON array containing a list of the Claim Types that the authorization server supports. */
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
    /** URL of the authorization server's pushed authorization request endpoint. */
    readonly pushed_authorization_request_endpoint?: string;
    /** Indicates whether the authorization server accepts authorization requests only via PAR. */
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
    /** CIBA Backchannel Authentication Endpoint. */
    readonly backchannel_authentication_endpoint?: string;
    /**
     * JSON array containing a list of the JWS signing algorithms supported for validation of signed
     * CIBA authentication requests.
     */
    readonly backchannel_authentication_request_signing_alg_values_supported?: string[];
    /** Supported CIBA authentication result delivery modes. */
    readonly backchannel_token_delivery_modes_supported?: string[];
    /** Indicates whether the authorization server supports the use of the CIBA `user_code` parameter. */
    readonly backchannel_user_code_parameter_supported?: boolean;
    /**
     * URL of an authorization server iframe that supports cross-origin communications for session
     * state information with the RP Client, using the HTML5 postMessage API.
     */
    readonly check_session_iframe?: string;
    /** JSON array containing a list of the JWS algorithms supported for DPoP proof JWTs. */
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
    /** Boolean value specifying whether the authorization server supports HTTP-based logout. */
    readonly frontchannel_logout_supported?: boolean;
    /**
     * Boolean value specifying whether the authorization server can pass a `sid` (session ID) Claim
     * in the Logout Token to identify the RP session with the OP.
     */
    readonly backchannel_logout_session_supported?: boolean;
    /** Boolean value specifying whether the authorization server supports back-channel logout. */
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
    /** Client identifier. */
    client_id: string;
    /** Client secret. */
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
    /** Default Maximum Authentication Age. */
    default_max_age?: number;
    /**
     * Use to adjust the client's assumed current time. Positive and negative finite values
     * representing seconds are allowed. Default is `0` (Date.now() + 0 seconds is used).
     *
     * @ignore during Documentation generation but part of the public API
     *
     * @example Client's local clock is mistakenly 1 hour in the past
     *
     * ```ts
     * const client: oauth.Client = {
     *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
     *   // ... other metadata
     *   [oauth.clockSkew]: +(60 * 60),
     * }
     * ```
     *
     * @example Client's local clock is mistakenly 1 hour in the future
     *
     * ```ts
     * const client: oauth.Client = {
     *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
     *   // ... other metadata
     *   [oauth.clockSkew]: -(60 * 60),
     * }
     * ```
     */
    [clockSkew]?: number;
    /**
     * Use to set allowed client's clock tolerance when checking DateTime JWT Claims. Only positive
     * finite values representing seconds are allowed. Default is `30` (30 seconds).
     *
     * @ignore during Documentation generation but part of the public API
     *
     * @example Tolerate 30 seconds clock skew when validating JWT claims like `exp` or `nbf`.
     *
     * ```ts
     * const client: oauth.Client = {
     *   client_id: 'abc4ba37-4ab8-49b5-99d4-9441ba35d428',
     *   // ... other metadata
     *   [oauth.clockTolerance]: 30,
     * }
     * ```
     */
    [clockTolerance]?: number;
    [metadata: string]: JsonValue | undefined;
}
export declare class UnsupportedOperationError extends Error {
    constructor(message?: string);
}
export declare class OperationProcessingError extends Error {
    constructor(message: string, options?: {
        cause?: unknown;
    });
}
export interface HttpRequestOptions {
    /**
     * An AbortSignal instance, or a factory returning one, to abort the HTTP Request(s) triggered by
     * this function's invocation.
     *
     * @example A 5000ms timeout AbortSignal for every request
     *
     * ```js
     * const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
     * ```
     */
    signal?: (() => AbortSignal) | AbortSignal;
    /**
     * A Headers instance to additionally send with the HTTP Request(s) triggered by this function's
     * invocation.
     */
    headers?: Headers;
}
export interface DiscoveryRequestOptions extends HttpRequestOptions {
    /** The issuer transformation algorithm to use. */
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
 * @see [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)
 * @see [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)
 */
export declare function discoveryRequest(issuerIdentifier: URL, options?: DiscoveryRequestOptions): Promise<Response>;
/**
 * Validates Response instance to be one coming from the authorization server's well-known discovery
 * endpoint.
 *
 * @param expectedIssuerIdentifier Expected Issuer Identifier value.
 * @param response Resolved value from {@link discoveryRequest}.
 *
 * @returns Resolves with the discovered Authorization Server Metadata.
 *
 * @see [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)
 * @see [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)
 */
export declare function processDiscoveryResponse(expectedIssuerIdentifier: URL, response: Response): Promise<AuthorizationServer>;
/**
 * Generate random `code_verifier` value.
 *
 * @see [RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
 */
export declare function generateRandomCodeVerifier(): string;
/**
 * Generate random `state` value.
 *
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.1)
 */
export declare function generateRandomState(): string;
/**
 * Generate random `nonce` value.
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
 */
export declare function generateRandomNonce(): string;
/**
 * Calculates the PKCE `code_verifier` value to send with an authorization request using the S256
 * PKCE Code Challenge Method transformation.
 *
 * @param codeVerifier `code_verifier` value generated e.g. from {@link generateRandomCodeVerifier}.
 *
 * @see [RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
 */
export declare function calculatePKCECodeChallenge(codeVerifier: string): Promise<string>;
export interface DPoPOptions extends CryptoKeyPair {
    /**
     * Private CryptoKey instance to sign the DPoP Proof JWT with.
     *
     * Its algorithm must be compatible with a supported {@link JWSAlgorithm JWS `alg` Algorithm}.
     */
    privateKey: CryptoKey;
    /** The public key corresponding to {@link DPoPOptions.privateKey}. */
    publicKey: CryptoKey;
    /**
     * Server-Provided Nonce to use in the request. This option serves as an override in case the
     * self-correcting mechanism does not work with a particular server. Previously received nonces
     * will be used automatically.
     */
    nonce?: string;
}
export interface DPoPRequestOptions {
    /** DPoP-related options. */
    DPoP?: DPoPOptions;
}
export interface AuthenticatedRequestOptions {
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
 * @see [RFC 9126 - OAuth 2.0 Pushed Authorization Requests](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)
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
/** A helper function used to determine if a response processing function returned an OAuth2Error. */
export declare function isOAuth2Error(input?: ReturnTypes): input is OAuth2Error;
export interface WWWAuthenticateChallengeParameters {
    readonly realm?: string;
    readonly error?: string;
    readonly error_description?: string;
    readonly error_uri?: string;
    readonly algs?: string;
    readonly scope?: string;
    /** NOTE: because the parameter names are case insensitive they are always returned lowercased */
    readonly [parameter: string]: string | undefined;
}
export interface WWWAuthenticateChallenge {
    /** NOTE: because the value is case insensitive it is always returned lowercased */
    readonly scheme: string;
    readonly parameters: WWWAuthenticateChallengeParameters;
}
/**
 * Parses the `WWW-Authenticate` HTTP Header from a Response instance.
 *
 * @returns Array of {@link WWWAuthenticateChallenge} objects. Their order from the response is
 *   preserved. `undefined` when there wasn't a `WWW-Authenticate` HTTP Header returned.
 */
export declare function parseWwwAuthenticateChallenges(response: Response): WWWAuthenticateChallenge[] | undefined;
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
 * @see [RFC 9126 - OAuth 2.0 Pushed Authorization Requests](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)
 */
export declare function processPushedAuthorizationResponse(as: AuthorizationServer, client: Client, response: Response): Promise<PushedAuthorizationResponse | OAuth2Error>;
export interface ProtectedResourceRequestOptions extends Omit<HttpRequestOptions, 'headers'>, DPoPRequestOptions {
    /**
     * Use to adjust the client's assumed current time. Positive and negative finite values
     * representing seconds are allowed. Default is `0` (Date.now() + 0 seconds is used).
     *
     * This option only affects the request if the {@link ProtectedResourceRequestOptions.DPoP DPoP}
     * option is also used.
     *
     * @ignore during Documentation generation but part of the public API
     */
    clockSkew?: number;
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
 * @see [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-protected-resource-access)
 */
export declare function protectedResourceRequest(accessToken: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string, url: URL, headers: Headers, body: RequestInit['body'], options?: ProtectedResourceRequestOptions): Promise<Response>;
export interface UserInfoRequestOptions extends HttpRequestOptions, DPoPRequestOptions {
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
/**
 * DANGER ZONE
 *
 * Use this as a value to {@link processUserInfoResponse} `expectedSubject` parameter to skip the
 * `sub` claim value check.
 *
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse)
 */
export declare const skipSubjectCheck: unique symbol;
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
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
 */
export declare function processUserInfoResponse(as: AuthorizationServer, client: Client, expectedSubject: string | typeof skipSubjectCheck, response: Response): Promise<UserInfoResponse>;
export interface TokenEndpointRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions, DPoPRequestOptions {
    /** Any additional parameters to send. This cannot override existing parameter values. */
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
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)
 * @see [RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
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
}
export interface TokenEndpointResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly id_token?: string;
    readonly refresh_token?: string;
    readonly scope?: string;
    /** NOTE: because the value is case insensitive it is always returned lowercased */
    readonly token_type: string;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface OpenIDTokenEndpointResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly id_token: string;
    readonly refresh_token?: string;
    readonly scope?: string;
    /** NOTE: because the value is case insensitive it is always returned lowercased */
    readonly token_type: string;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface OAuth2TokenEndpointResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly id_token?: undefined;
    readonly refresh_token?: string;
    readonly scope?: string;
    /** NOTE: because the value is case insensitive it is always returned lowercased */
    readonly token_type: string;
    readonly [parameter: string]: JsonValue | undefined;
}
export interface ClientCredentialsGrantResponse {
    readonly access_token: string;
    readonly expires_in?: number;
    readonly scope?: string;
    /** NOTE: because the value is case insensitive it is always returned lowercased */
    readonly token_type: string;
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
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)
 */
export declare function processAuthorizationCodeOpenIDResponse(as: AuthorizationServer, client: Client, response: Response, expectedNonce?: string | typeof expectNoNonce, maxAge?: number | typeof skipAuthTimeCheck): Promise<OpenIDTokenEndpointResponse | OAuth2Error>;
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
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export declare function clientCredentialsGrantRequest(as: AuthorizationServer, client: Client, parameters: URLSearchParams | Record<string, string> | string[][], options?: ClientCredentialsGrantRequestOptions): Promise<Response>;
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
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)
 */
export declare function processClientCredentialsResponse(as: AuthorizationServer, client: Client, response: Response): Promise<ClientCredentialsGrantResponse | OAuth2Error>;
export interface RevocationRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions {
    /** Any additional parameters to send. This cannot override existing parameter values. */
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
 * @see [RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
 */
export declare function revocationRequest(as: AuthorizationServer, client: Client, token: string, options?: RevocationRequestOptions): Promise<Response>;
/**
 * Validates Response instance to be one coming from the
 * {@link AuthorizationServer.revocation_endpoint `as.revocation_endpoint`}.
 *
 * @param response Resolved value from {@link revocationRequest}.
 *
 * @returns Resolves with `undefined` when the request was successful, or an object representing an
 *   OAuth 2.0 protocol style error.
 *
 * @see [RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
 */
export declare function processRevocationResponse(response: Response): Promise<undefined | OAuth2Error>;
export interface IntrospectionRequestOptions extends HttpRequestOptions, AuthenticatedRequestOptions {
    /** Any additional parameters to send. This cannot override existing parameter values. */
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
 * @see [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 * @see [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-4)
 */
export declare function introspectionRequest(as: AuthorizationServer, client: Client, token: string, options?: IntrospectionRequestOptions): Promise<Response>;
export interface IntrospectionConfirmationClaims {
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
    readonly scope: string;
    readonly sub?: string;
    readonly nbf?: number;
    readonly token_type?: string;
    readonly cnf?: IntrospectionConfirmationClaims;
    readonly [claim: string]: JsonValue | undefined;
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
 * @see [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 * @see [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-5)
 */
export declare function processIntrospectionResponse(as: AuthorizationServer, client: Client, response: Response): Promise<IntrospectionResponse | OAuth2Error>;
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
 * @see [JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)](https://openid.net/specs/openid-financial-api-jarm.html)
 */
export declare function validateJwtAuthResponse(as: AuthorizationServer, client: Client, parameters: URLSearchParams | URL, expectedState?: string | typeof expectNoState | typeof skipStateCheck, options?: HttpRequestOptions): Promise<URLSearchParams | OAuth2Error>;
/**
 * DANGER ZONE
 *
 * Use this as a value to {@link validateAuthResponse} `expectedState` parameter to skip the `state`
 * value check. This should only ever be done if you use a `state` parameter value that is integrity
 * protected and bound to the browsing session. One such mechanism to do so is described in an I-D
 * [draft-bradley-oauth-jwt-encoded-state-09](https://datatracker.ietf.org/doc/html/draft-bradley-oauth-jwt-encoded-state-09).
 * It is expected you'll validate such `state` value yourself.
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
 * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2)
 * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
 * @see [RFC 9207 - OAuth 2.0 Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207.html)
 */
export declare function validateAuthResponse(as: AuthorizationServer, client: Client, parameters: URLSearchParams | URL, expectedState?: string | typeof expectNoState | typeof skipStateCheck): URLSearchParams | OAuth2Error;
type ReturnTypes = TokenEndpointResponse | OAuth2TokenEndpointResponse | OpenIDTokenEndpointResponse | ClientCredentialsGrantResponse | DeviceAuthorizationResponse | IntrospectionResponse | OAuth2Error | PushedAuthorizationResponse | URLSearchParams | UserInfoResponse;
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
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4)
 * @see [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
 */
export declare function deviceCodeGrantRequest(as: AuthorizationServer, client: Client, deviceCode: string, options?: TokenEndpointRequestOptions): Promise<Response>;
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
 * @see [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.4)
 */
export declare function processDeviceCodeResponse(as: AuthorizationServer, client: Client, response: Response): Promise<TokenEndpointResponse | OAuth2Error>;
export interface GenerateKeyPairOptions {
    /** Indicates whether or not the private key may be exported. Default is `false`. */
    extractable?: boolean;
    /** (RSA algorithms only) The length, in bits, of the RSA modulus. Default is `2048`. */
    modulusLength?: number;
    /** (EdDSA algorithms only) The EdDSA sub-type. Default is `Ed25519`. */
    crv?: 'Ed25519' | 'Ed448';
}
/**
 * Generates a CryptoKeyPair for a given JWS `alg` Algorithm identifier.
 *
 * @param alg Supported JWS `alg` Algorithm identifier.
 */
export declare function generateKeyPair(alg: JWSAlgorithm, options?: GenerateKeyPairOptions): Promise<CryptoKeyPair>;
export {};
