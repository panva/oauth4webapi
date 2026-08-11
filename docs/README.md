# oauth4webapi API Reference

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

## Accessing Protected Resources

| Function | Description |
| ------ | ------ |
| [processUserInfoResponse](functions/processUserInfoResponse.md) | Processes an OpenID Connect UserInfo response. |
| [protectedResourceRequest](functions/protectedResourceRequest.md) | Performs a protected resource request at an arbitrary URL. |
| [userInfoRequest](functions/userInfoRequest.md) | Performs a UserInfo Request. |

## Authorization Code Grant

| Function | Description |
| ------ | ------ |
| [authorizationCodeGrantRequest](functions/authorizationCodeGrantRequest.md) | Performs an Authorization Code Grant request. |
| [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md) | Calculates the PKCE `code_challenge` value to send with an authorization request using the S256 PKCE Code Challenge Method transformation. |
| [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md) | Generates a random `code_verifier` value. |
| [issueRequestObject](functions/issueRequestObject.md) | Generates a signed JWT-Secured Authorization Request (JAR). |
| [processAuthorizationCodeResponse](functions/processAuthorizationCodeResponse.md) | Processes an Authorization Code Grant token response. |
| [validateAuthResponse](functions/validateAuthResponse.md) | Validates an OAuth 2.0 Authorization Response or Authorization Error Response. |
| [validateJwtAuthResponse](functions/validateJwtAuthResponse.md) | Validates a signed JARM authorization response. |

## Authorization Code Grant w/ OpenID Connect (OIDC)

| Function | Description |
| ------ | ------ |
| [authorizationCodeGrantRequest](functions/authorizationCodeGrantRequest.md) | Performs an Authorization Code Grant request. |
| [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md) | Calculates the PKCE `code_challenge` value to send with an authorization request using the S256 PKCE Code Challenge Method transformation. |
| [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md) | Generates a random `code_verifier` value. |
| [getValidatedIdTokenClaims](functions/getValidatedIdTokenClaims.md) | Returns validated ID Token claims from a processed [TokenEndpointResponse](interfaces/TokenEndpointResponse.md), or `undefined` when it contains no ID Token. |
| [issueRequestObject](functions/issueRequestObject.md) | Generates a signed JWT-Secured Authorization Request (JAR). |
| [processAuthorizationCodeResponse](functions/processAuthorizationCodeResponse.md) | Processes an Authorization Code Grant token response. |
| [processUserInfoResponse](functions/processUserInfoResponse.md) | Processes an OpenID Connect UserInfo response. |
| [userInfoRequest](functions/userInfoRequest.md) | Performs a UserInfo Request. |
| [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md) | Validates the JWS signature of a processed JWT response body or ID Token. |
| [validateAuthResponse](functions/validateAuthResponse.md) | Validates an OAuth 2.0 Authorization Response or Authorization Error Response. |
| [validateCodeIdTokenResponse](functions/validateCodeIdTokenResponse.md) | Validates an OpenID Connect `code id_token` authorization response. |
| [validateJwtAuthResponse](functions/validateJwtAuthResponse.md) | Validates a signed JARM authorization response. |

## Authorization Server Metadata

| Name | Description |
| ------ | ------ |
| [AuthorizationServer](interfaces/AuthorizationServer.md) | Metadata describing an OAuth 2.0 authorization server. |
| [discoveryRequest](functions/discoveryRequest.md) | Performs an authorization server metadata discovery using one of two [transformation algorithms](interfaces/DiscoveryRequestOptions.md#algorithm) applied to the `issuerIdentifier` argument. |
| [processDiscoveryResponse](functions/processDiscoveryResponse.md) | Processes an authorization server metadata discovery response. |

## Client Authentication

| Function | Description |
| ------ | ------ |
| [ClientSecretBasic](functions/ClientSecretBasic.md) | **`client_secret_basic`** sends `client_id` and `client_secret` using the HTTP Basic authentication scheme. |
| [ClientSecretJwt](functions/ClientSecretJwt.md) | **`client_secret_jwt`** authenticates the client with an HMAC-protected JWT assertion sent in the form-encoded request body. |
| [ClientSecretPost](functions/ClientSecretPost.md) | **`client_secret_post`** sends `client_id` and `client_secret` in the form-encoded request body. |
| [None](functions/None.md) | **`none`** sends only `client_id` in the form-encoded request body for a public client. |
| [PrivateKeyJwt](functions/PrivateKeyJwt.md) | **`private_key_jwt`** authenticates the client with a digitally signed JWT assertion sent in the form-encoded request body. |
| [TlsClientAuth](functions/TlsClientAuth.md) | **`tls_client_auth`** sends `client_id` in the form-encoded request body while mTLS credentials are configured through [customFetch](variables/customFetch.md). |

## Client Credentials Grant

| Function | Description |
| ------ | ------ |
| [clientCredentialsGrantRequest](functions/clientCredentialsGrantRequest.md) | Performs a Client Credentials Grant request. |
| [processClientCredentialsResponse](functions/processClientCredentialsResponse.md) | Processes a Client Credentials Grant token response. |

## Client-Initiated Backchannel Authentication (CIBA)

| Function | Description |
| ------ | ------ |
| [backchannelAuthenticationGrantRequest](functions/backchannelAuthenticationGrantRequest.md) | Performs a Backchannel Authentication Grant request. |
| [backchannelAuthenticationRequest](functions/backchannelAuthenticationRequest.md) | Performs a Backchannel Authentication Request. |
| [getValidatedIdTokenClaims](functions/getValidatedIdTokenClaims.md) | Returns validated ID Token claims from a processed [TokenEndpointResponse](interfaces/TokenEndpointResponse.md), or `undefined` when it contains no ID Token. |
| [processBackchannelAuthenticationGrantResponse](functions/processBackchannelAuthenticationGrantResponse.md) | Processes a CIBA Backchannel Authentication Grant token response. |
| [processBackchannelAuthenticationResponse](functions/processBackchannelAuthenticationResponse.md) | Processes a CIBA Backchannel Authentication Response. |

## DPoP

| Function | Description |
| ------ | ------ |
| [DPoP](functions/DPoP.md) | Creates a DPoP handle that signs sender-constraining proofs with a [CryptoKeyPair](interfaces/CryptoKeyPair.md) and tracks server-issued nonces. |
| [isDPoPNonceError](functions/isDPoPNonceError.md) | Returns whether an error requires retrying the request with a fresh DPoP nonce. |

## Device Authorization Grant

| Function | Description |
| ------ | ------ |
| [deviceAuthorizationRequest](functions/deviceAuthorizationRequest.md) | Performs a Device Authorization Request. |
| [deviceCodeGrantRequest](functions/deviceCodeGrantRequest.md) | Performs a Device Authorization Grant request. |
| [getValidatedIdTokenClaims](functions/getValidatedIdTokenClaims.md) | Returns validated ID Token claims from a processed [TokenEndpointResponse](interfaces/TokenEndpointResponse.md), or `undefined` when it contains no ID Token. |
| [processDeviceAuthorizationResponse](functions/processDeviceAuthorizationResponse.md) | Processes a Device Authorization Response. |
| [processDeviceCodeResponse](functions/processDeviceCodeResponse.md) | Processes a Device Authorization Grant token response. |

## Dynamic Client Registration (DCR)

| Function | Description |
| ------ | ------ |
| [dynamicClientRegistrationRequest](functions/dynamicClientRegistrationRequest.md) | Performs a Dynamic Client Registration request. |
| [processDynamicClientRegistrationResponse](functions/processDynamicClientRegistrationResponse.md) | Processes a Dynamic Client Registration response. |

## Error Codes

| Variable | Description |
| ------ | ------ |
| [AUTHORIZATION\_RESPONSE\_ERROR](variables/AUTHORIZATION_RESPONSE_ERROR.md) | Error code for OAuth 2.0 Authorization Error Responses. |
| [HTTP\_REQUEST\_FORBIDDEN](variables/HTTP_REQUEST_FORBIDDEN.md) | Error code for requests targeting a non-TLS HTTP endpoint when insecure requests are disabled. |
| [INVALID\_REQUEST](variables/INVALID_REQUEST.md) | Error code for invalid protected resource requests or request contents. |
| [INVALID\_RESPONSE](variables/INVALID_RESPONSE.md) | Error code for invalid authorization server responses. |
| [INVALID\_SERVER\_METADATA](variables/INVALID_SERVER_METADATA.md) | Error code for invalid authorization server metadata. |
| [JSON\_ATTRIBUTE\_COMPARISON](variables/JSON_ATTRIBUTE_COMPARISON.md) | Error code for unexpected JSON response attribute values. |
| [JWT\_CLAIM\_COMPARISON](variables/JWT_CLAIM_COMPARISON.md) | Error code for unexpected JWT claim values. |
| [JWT\_TIMESTAMP\_CHECK](variables/JWT_TIMESTAMP_CHECK.md) | Error code for failed JWT NumericDate comparisons with the current timestamp. |
| [JWT\_USERINFO\_EXPECTED](variables/JWT_USERINFO_EXPECTED.md) | Error code for receiving a JSON UserInfo response when a JWT response was expected. |
| [KEY\_SELECTION](variables/KEY_SELECTION.md) | Error code for JWT signature key selection failures. |
| [MISSING\_SERVER\_METADATA](variables/MISSING_SERVER_METADATA.md) | Error code for missing authorization server metadata. |
| [PARSE\_ERROR](variables/PARSE_ERROR.md) | Error code for JSON parsing failures. |
| [REQUEST\_PROTOCOL\_FORBIDDEN](variables/REQUEST_PROTOCOL_FORBIDDEN.md) | Error code for requests targeting a non-HTTP(S) endpoint. |
| [RESPONSE\_BODY\_ERROR](variables/RESPONSE_BODY_ERROR.md) | Error code for OAuth-style JSON error responses. |
| [RESPONSE\_IS\_NOT\_CONFORM](variables/RESPONSE_IS_NOT_CONFORM.md) | Error code for responses with an unexpected HTTP status code. |
| [RESPONSE\_IS\_NOT\_JSON](variables/RESPONSE_IS_NOT_JSON.md) | Error code for responses with an unexpected media type. |
| [UNSUPPORTED\_OPERATION](variables/UNSUPPORTED_OPERATION.md) | Error code for unsupported operations. |
| [WWW\_AUTHENTICATE\_CHALLENGE](variables/WWW_AUTHENTICATE_CHALLENGE.md) | Error code for responses containing parseable `WWW-Authenticate` challenges. |

## Errors

| Class | Description |
| ------ | ------ |
| [AuthorizationResponseError](classes/AuthorizationResponseError.md) | Thrown when an OAuth 2.0 Authorization Error Response is encountered. |
| [OperationProcessingError](classes/OperationProcessingError.md) | Thrown when an OAuth or OpenID Connect operation cannot be processed. |
| [ResponseBodyError](classes/ResponseBodyError.md) | Thrown when a server returns an OAuth-style error in a JSON response body. |
| [UnsupportedOperationError](classes/UnsupportedOperationError.md) | Thrown when an attempted operation is not supported. |
| [WWWAuthenticateChallengeError](classes/WWWAuthenticateChallengeError.md) | Thrown when a server response contains one or more parseable `WWW-Authenticate` challenges. |

## FAPI 1.0 Advanced

| Function | Description |
| ------ | ------ |
| [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md) | Validates the JWS signature of a processed JWT response body or ID Token. |
| [validateDetachedSignatureResponse](functions/validateDetachedSignatureResponse.md) | Validates a FAPI 1.0 Advanced detached-signature authorization response. |
| [validateJwtAuthResponse](functions/validateJwtAuthResponse.md) | Validates a signed JARM authorization response. |

## FAPI 2.0 Message Signing

| Function | Description |
| ------ | ------ |
| [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md) | Validates the JWS signature of a processed JWT response body or ID Token. |
| [validateJwtAuthResponse](functions/validateJwtAuthResponse.md) | Validates a signed JARM authorization response. |

## JWT Access Tokens

| Function | Description |
| ------ | ------ |
| [validateJwtAccessToken](functions/validateJwtAccessToken.md) | Validates a resource request's JWT access token according to RFC 6750, RFC 9068, and RFC 9449. |

## JWT Bearer Token Grant Type

| Function | Description |
| ------ | ------ |
| [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md) | Performs an arbitrary OAuth grant request. |
| [processGenericTokenEndpointResponse](functions/processGenericTokenEndpointResponse.md) | Processes a token response for an arbitrary OAuth grant. |

## JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)

| Function | Description |
| ------ | ------ |
| [validateJwtAuthResponse](functions/validateJwtAuthResponse.md) | Validates a signed JARM authorization response. |

## JWT-Secured Authorization Request (JAR)

| Function | Description |
| ------ | ------ |
| [issueRequestObject](functions/issueRequestObject.md) | Generates a signed JWT-Secured Authorization Request (JAR). |

## OpenID Connect (OIDC) Discovery

| Function | Description |
| ------ | ------ |
| [discoveryRequest](functions/discoveryRequest.md) | Performs an authorization server metadata discovery using one of two [transformation algorithms](interfaces/DiscoveryRequestOptions.md#algorithm) applied to the `issuerIdentifier` argument. |
| [processDiscoveryResponse](functions/processDiscoveryResponse.md) | Processes an authorization server metadata discovery response. |

## OpenID Connect (OIDC) UserInfo

| Function | Description |
| ------ | ------ |
| [processUserInfoResponse](functions/processUserInfoResponse.md) | Processes an OpenID Connect UserInfo response. |
| [userInfoRequest](functions/userInfoRequest.md) | Performs a UserInfo Request. |
| [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md) | Validates the JWS signature of a processed JWT response body or ID Token. |

## Proof Key for Code Exchange (PKCE)

| Function | Description |
| ------ | ------ |
| [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md) | Calculates the PKCE `code_challenge` value to send with an authorization request using the S256 PKCE Code Challenge Method transformation. |
| [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md) | Generates a random `code_verifier` value. |

## Pushed Authorization Requests (PAR)

| Function | Description |
| ------ | ------ |
| [processPushedAuthorizationResponse](functions/processPushedAuthorizationResponse.md) | Processes a Pushed Authorization Response. |
| [pushedAuthorizationRequest](functions/pushedAuthorizationRequest.md) | Performs a Pushed Authorization Request. |

## Refreshing an Access Token

| Function | Description |
| ------ | ------ |
| [processRefreshTokenResponse](functions/processRefreshTokenResponse.md) | Processes a token response for a Refresh Token Grant. |
| [refreshTokenGrantRequest](functions/refreshTokenGrantRequest.md) | Performs a Refresh Token Grant request. |

## Resource Server Metadata

| Name | Description |
| ------ | ------ |
| [ResourceServer](interfaces/ResourceServer.md) | Metadata describing an OAuth 2.0 protected resource server. |
| [processResourceDiscoveryResponse](functions/processResourceDiscoveryResponse.md) | Processes a protected resource metadata discovery response. |
| [resourceDiscoveryRequest](functions/resourceDiscoveryRequest.md) | Performs a protected resource metadata discovery. |

## SAML 2.0 Bearer Assertion Grant Type

| Function | Description |
| ------ | ------ |
| [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md) | Performs an arbitrary OAuth grant request. |
| [processGenericTokenEndpointResponse](functions/processGenericTokenEndpointResponse.md) | Processes a token response for an arbitrary OAuth grant. |

## Token Exchange Grant Type

| Function | Description |
| ------ | ------ |
| [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md) | Performs an arbitrary OAuth grant request. |
| [processGenericTokenEndpointResponse](functions/processGenericTokenEndpointResponse.md) | Processes a token response for an arbitrary OAuth grant. |

## Token Introspection

| Function | Description |
| ------ | ------ |
| [introspectionRequest](functions/introspectionRequest.md) | Performs an Introspection Request. |
| [processIntrospectionResponse](functions/processIntrospectionResponse.md) | Processes a Token Introspection response. |
| [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md) | Validates the JWS signature of a processed JWT response body or ID Token. |

## Token Revocation

| Function | Description |
| ------ | ------ |
| [processRevocationResponse](functions/processRevocationResponse.md) | Processes a Token Revocation response. |
| [revocationRequest](functions/revocationRequest.md) | Performs a Revocation Request. |

## Utilities

| Function | Description |
| ------ | ------ |
| [generateKeyPair](functions/generateKeyPair.md) | Generates a [CryptoKeyPair](interfaces/CryptoKeyPair.md) for a supported JWS `alg` identifier. |
| [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md) | Generates a random `code_verifier` value. |
| [generateRandomNonce](functions/generateRandomNonce.md) | Generates a random `nonce` value. |
| [generateRandomState](functions/generateRandomState.md) | Generates a random `state` value. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [AuthorizationDetails](interfaces/AuthorizationDetails.md) | An entry in an OAuth 2.0 Rich Authorization Requests `authorization_details` array. |
| [BackchannelAuthenticationRequestOptions](interfaces/BackchannelAuthenticationRequestOptions.md) | Options for a Client-Initiated Backchannel Authentication request. |
| [BackchannelAuthenticationResponse](interfaces/BackchannelAuthenticationResponse.md) | A parsed successful Client-Initiated Backchannel Authentication response. |
| [Client](interfaces/Client.md) | Recognized client metadata that affects this module's behavior. |
| [ClientCredentialsGrantRequestOptions](interfaces/ClientCredentialsGrantRequestOptions.md) | Options for a Client Credentials Grant token request. |
| [ConfirmationClaims](interfaces/ConfirmationClaims.md) | Proof-of-possession confirmation (`cnf`) claims associated with a token. |
| [CryptoKeyPair](interfaces/CryptoKeyPair.md) | An asymmetric public and private `CryptoKey` pair. |
| [CustomFetchOptions](interfaces/CustomFetchOptions.md) | Fetch-style request options passed to a custom fetch implementation. |
| [DeviceAuthorizationRequestOptions](interfaces/DeviceAuthorizationRequestOptions.md) | Options for an OAuth 2.0 Device Authorization Request. |
| [DeviceAuthorizationResponse](interfaces/DeviceAuthorizationResponse.md) | A parsed successful OAuth 2.0 Device Authorization Response. |
| [DiscoveryRequestOptions](interfaces/DiscoveryRequestOptions.md) | Options for an authorization server metadata discovery request. |
| [DPoPHandle](interfaces/DPoPHandle.md) | A DPoP proof-generation and nonce-management handle returned by [DPoP](functions/DPoP.md). |
| [DPoPRequestOptions](interfaces/DPoPRequestOptions.md) | Options for attaching a DPoP proof to an HTTP request. |
| [DynamicClientRegistrationRequestOptions](interfaces/DynamicClientRegistrationRequestOptions.md) | Options for an OAuth 2.0 Dynamic Client Registration request. |
| [ExportedJWKSCache](interfaces/ExportedJWKSCache.md) | A JSON Web Key Set cache value suitable for external persistence. |
| [GenerateKeyPairOptions](interfaces/GenerateKeyPairOptions.md) | Options for generating an asymmetric signing key pair. |
| [HttpRequestOptions](interfaces/HttpRequestOptions.md) | Shared transport options for HTTP requests made by this module. |
| [IDToken](interfaces/IDToken.md) | Claims from a validated OpenID Connect ID Token. |
| [IntrospectionRequestOptions](interfaces/IntrospectionRequestOptions.md) | Options for an OAuth 2.0 Token Introspection request. |
| [IntrospectionResponse](interfaces/IntrospectionResponse.md) | A parsed successful OAuth 2.0 Token Introspection response. |
| [JWEDecryptOptions](interfaces/JWEDecryptOptions.md) | Options for supplying compact JWE decryption support. |
| [JWKS](interfaces/JWKS.md) | A JSON Web Key Set. |
| [JWKSCacheOptions](interfaces/JWKSCacheOptions.md) | Options for supplying an externally persisted JSON Web Key Set cache. |
| [JWTAccessTokenClaims](interfaces/JWTAccessTokenClaims.md) | Claims from a validated JWT access token. |
| [ModifyAssertionFunction](interfaces/ModifyAssertionFunction.md) | A callback that mutates a JWT assertion header and claims immediately before signing. |
| [ModifyAssertionOptions](interfaces/ModifyAssertionOptions.md) | Options for customizing a JWT assertion immediately before signing. |
| [MTLSEndpointAliases](interfaces/MTLSEndpointAliases.md) | Authorization server endpoint aliases used for mutual TLS. |
| [OAuth2Error](interfaces/OAuth2Error.md) | A parsed OAuth 2.0 protocol error response body. |
| [PrivateKey](interfaces/PrivateKey.md) | An asymmetric private key with an optional JWK Key ID for JOSE headers. |
| [ProcessAuthorizationCodeResponseOptions](interfaces/ProcessAuthorizationCodeResponseOptions.md) | Options for processing an Authorization Code Grant token response. |
| [ProcessTokenResponseOptions](interfaces/ProcessTokenResponseOptions.md) | Shared options for processing OAuth 2.0 token endpoint responses. |
| [ProtectedResourceRequestOptions](interfaces/ProtectedResourceRequestOptions.md) | Options for an authenticated protected resource request. |
| [PushedAuthorizationRequestOptions](interfaces/PushedAuthorizationRequestOptions.md) | Options for an OAuth 2.0 Pushed Authorization Request. |
| [PushedAuthorizationResponse](interfaces/PushedAuthorizationResponse.md) | A parsed successful OAuth 2.0 Pushed Authorization Response. |
| [RevocationRequestOptions](interfaces/RevocationRequestOptions.md) | Options for an OAuth 2.0 Token Revocation request. |
| [TokenEndpointRequestOptions](interfaces/TokenEndpointRequestOptions.md) | Shared options for OAuth 2.0 token endpoint requests. |
| [TokenEndpointResponse](interfaces/TokenEndpointResponse.md) | A parsed successful OAuth 2.0 token endpoint response. |
| [UserInfoAddress](interfaces/UserInfoAddress.md) | The structured `address` claim in an OpenID Connect UserInfo response. |
| [UserInfoRequestOptions](interfaces/UserInfoRequestOptions.md) | Options for an OpenID Connect UserInfo request. |
| [UserInfoResponse](interfaces/UserInfoResponse.md) | Claims from a parsed OpenID Connect UserInfo response. |
| [ValidateJWTAccessTokenOptions](interfaces/ValidateJWTAccessTokenOptions.md) | Options for validating a JWT access token at a protected resource. |
| [ValidateSignatureOptions](interfaces/ValidateSignatureOptions.md) | Options for validating a JWT signature with the authorization server's JSON Web Key Set. |
| [WWWAuthenticateChallenge](interfaces/WWWAuthenticateChallenge.md) | A parsed `WWW-Authenticate` challenge. |
| [WWWAuthenticateChallengeParameters](interfaces/WWWAuthenticateChallengeParameters.md) | Known and extension authentication parameters from a `WWW-Authenticate` challenge. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [ClientAuth](type-aliases/ClientAuth.md) | A function that applies client authentication to an authorization server request. |
| [CryptoKey](type-aliases/CryptoKey.md) | A Web Cryptography key as declared by the host runtime. |
| [JsonArray](type-aliases/JsonArray.md) | A JSON array. |
| [JsonObject](type-aliases/JsonObject.md) | A JSON object. |
| [JsonPrimitive](type-aliases/JsonPrimitive.md) | A JSON primitive value. |
| [JsonValue](type-aliases/JsonValue.md) | Any JSON-compatible value. |
| [JweDecryptFunction](type-aliases/JweDecryptFunction.md) | A function that decrypts a compact JWE and returns its nested JWT string. |
| [JWK](type-aliases/JWK.md) | A JSON Web Key with standard JOSE and supported extension parameters. |
| [JWKSCacheInput](type-aliases/JWKSCacheInput.md) | A previously exported JSON Web Key Set cache or an empty object to receive one. |
| [JWSAlgorithm](type-aliases/JWSAlgorithm.md) | A supported JWS `alg` identifier for digital signature validation. |
| [OmitSymbolProperties](type-aliases/OmitSymbolProperties.md) | Removes symbol-keyed properties from a type. |
| [ProtectedResourceRequestBody](type-aliases/ProtectedResourceRequestBody.md) | An HTTP request body accepted by [protectedResourceRequest](functions/protectedResourceRequest.md). |
| [RecognizedTokenTypes](type-aliases/RecognizedTokenTypes.md) | A record of custom `token_type` handlers for processing non-standard token types in OAuth 2.0 token endpoint responses. |

## Variables

| Variable | Description |
| ------ | ------ |
| [~~allowInsecureRequests~~](variables/allowInsecureRequests.md) | By default the module only allows interactions with HTTPS endpoints. Setting this option to `true` removes that restriction. |
| [clockSkew](variables/clockSkew.md) | Adjusts the current time used by protocol validations. |
| [clockTolerance](variables/clockTolerance.md) | Sets the allowed clock tolerance for JWT timestamp claim validation. |
| [customFetch](variables/customFetch.md) | Overrides the Fetch API implementation used for outbound HTTP requests. |
| [expectNoNonce](variables/expectNoNonce.md) | Indicates that no ID Token `nonce` claim is expected. |
| [expectNoState](variables/expectNoState.md) | Indicates that no authorization response `state` parameter is expected. |
| [jweDecrypt](variables/jweDecrypt.md) | Adds support for decrypting JWEs encountered while processing responses. |
| [jwksCache](variables/jwksCache.md) | Provides an externally managed JSON Web Key Set cache for runtimes without persistent in-memory state. |
| [modifyAssertion](variables/modifyAssertion.md) | Provides a hook for mutating a JWT header and payload immediately before signing. |
| [~~nopkce~~](variables/nopkce.md) | Disables PKCE for an Authorization Code Grant request. |
| [skipAuthTimeCheck](variables/skipAuthTimeCheck.md) | Skips validation of the ID Token `auth_time` claim. |
| [skipStateCheck](variables/skipStateCheck.md) | Skips the authorization response `state` value check performed by [validateAuthResponse](functions/validateAuthResponse.md). |
| [skipSubjectCheck](variables/skipSubjectCheck.md) | Skips the UserInfo `sub` claim value check performed by [processUserInfoResponse](functions/processUserInfoResponse.md). |
