# oauth4webapi API Reference

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

## Functions

- [getValidatedIdTokenClaims](functions/getValidatedIdTokenClaims.md)

## Accessing Protected Resources

- [processUserInfoResponse](functions/processUserInfoResponse.md)
- [protectedResourceRequest](functions/protectedResourceRequest.md)
- [userInfoRequest](functions/userInfoRequest.md)

## Authorization Code Grant

- [authorizationCodeGrantRequest](functions/authorizationCodeGrantRequest.md)
- [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)
- [issueRequestObject](functions/issueRequestObject.md)
- [processAuthorizationCodeResponse](functions/processAuthorizationCodeResponse.md)
- [validateAuthResponse](functions/validateAuthResponse.md)
- [validateJwtAuthResponse](functions/validateJwtAuthResponse.md)

## Authorization Code Grant w/ OpenID Connect (OIDC)

- [authorizationCodeGrantRequest](functions/authorizationCodeGrantRequest.md)
- [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)
- [issueRequestObject](functions/issueRequestObject.md)
- [processAuthorizationCodeResponse](functions/processAuthorizationCodeResponse.md)
- [processUserInfoResponse](functions/processUserInfoResponse.md)
- [userInfoRequest](functions/userInfoRequest.md)
- [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md)
- [validateAuthResponse](functions/validateAuthResponse.md)
- [validateCodeIdTokenResponse](functions/validateCodeIdTokenResponse.md)
- [validateJwtAuthResponse](functions/validateJwtAuthResponse.md)

## Authorization Server Metadata

- [discoveryRequest](functions/discoveryRequest.md)
- [processDiscoveryResponse](functions/processDiscoveryResponse.md)

## Client Authentication

- [ClientSecretBasic](functions/ClientSecretBasic.md)
- [ClientSecretJwt](functions/ClientSecretJwt.md)
- [ClientSecretPost](functions/ClientSecretPost.md)
- [None](functions/None.md)
- [PrivateKeyJwt](functions/PrivateKeyJwt.md)
- [TlsClientAuth](functions/TlsClientAuth.md)

## Client Credentials Grant

- [clientCredentialsGrantRequest](functions/clientCredentialsGrantRequest.md)
- [processClientCredentialsResponse](functions/processClientCredentialsResponse.md)

## Client-Initiated Backchannel Authentication (CIBA)

- [backchannelAuthenticationGrantRequest](functions/backchannelAuthenticationGrantRequest.md)
- [backchannelAuthenticationRequest](functions/backchannelAuthenticationRequest.md)
- [processBackchannelAuthenticationGrantResponse](functions/processBackchannelAuthenticationGrantResponse.md)
- [processBackchannelAuthenticationResponse](functions/processBackchannelAuthenticationResponse.md)

## DPoP

- [DPoP](functions/DPoP.md)
- [isDPoPNonceError](functions/isDPoPNonceError.md)

## Device Authorization Grant

- [deviceAuthorizationRequest](functions/deviceAuthorizationRequest.md)
- [deviceCodeGrantRequest](functions/deviceCodeGrantRequest.md)
- [processDeviceAuthorizationResponse](functions/processDeviceAuthorizationResponse.md)
- [processDeviceCodeResponse](functions/processDeviceCodeResponse.md)

## Error Codes

- [AUTHORIZATION\_RESPONSE\_ERROR](variables/AUTHORIZATION_RESPONSE_ERROR.md)
- [HTTP\_REQUEST\_FORBIDDEN](variables/HTTP_REQUEST_FORBIDDEN.md)
- [INVALID\_REQUEST](variables/INVALID_REQUEST.md)
- [INVALID\_RESPONSE](variables/INVALID_RESPONSE.md)
- [INVALID\_SERVER\_METADATA](variables/INVALID_SERVER_METADATA.md)
- [JSON\_ATTRIBUTE\_COMPARISON](variables/JSON_ATTRIBUTE_COMPARISON.md)
- [JWT\_CLAIM\_COMPARISON](variables/JWT_CLAIM_COMPARISON.md)
- [JWT\_TIMESTAMP\_CHECK](variables/JWT_TIMESTAMP_CHECK.md)
- [JWT\_USERINFO\_EXPECTED](variables/JWT_USERINFO_EXPECTED.md)
- [KEY\_SELECTION](variables/KEY_SELECTION.md)
- [MISSING\_SERVER\_METADATA](variables/MISSING_SERVER_METADATA.md)
- [PARSE\_ERROR](variables/PARSE_ERROR.md)
- [REQUEST\_PROTOCOL\_FORBIDDEN](variables/REQUEST_PROTOCOL_FORBIDDEN.md)
- [RESPONSE\_BODY\_ERROR](variables/RESPONSE_BODY_ERROR.md)
- [RESPONSE\_IS\_NOT\_CONFORM](variables/RESPONSE_IS_NOT_CONFORM.md)
- [RESPONSE\_IS\_NOT\_JSON](variables/RESPONSE_IS_NOT_JSON.md)
- [UNSUPPORTED\_OPERATION](variables/UNSUPPORTED_OPERATION.md)
- [WWW\_AUTHENTICATE\_CHALLENGE](variables/WWW_AUTHENTICATE_CHALLENGE.md)

## Errors

- [AuthorizationResponseError](classes/AuthorizationResponseError.md)
- [OperationProcessingError](classes/OperationProcessingError.md)
- [ResponseBodyError](classes/ResponseBodyError.md)
- [UnsupportedOperationError](classes/UnsupportedOperationError.md)
- [WWWAuthenticateChallengeError](classes/WWWAuthenticateChallengeError.md)

## FAPI 1.0 Advanced

- [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md)
- [validateDetachedSignatureResponse](functions/validateDetachedSignatureResponse.md)
- [validateJwtAuthResponse](functions/validateJwtAuthResponse.md)

## FAPI 2.0 Message Signing

- [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md)
- [validateJwtAuthResponse](functions/validateJwtAuthResponse.md)

## JWT Access Tokens

- [validateJwtAccessToken](functions/validateJwtAccessToken.md)

## JWT Bearer Token Grant Type

- [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md)
- [processGenericTokenEndpointResponse](functions/processGenericTokenEndpointResponse.md)

## JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)

- [validateJwtAuthResponse](functions/validateJwtAuthResponse.md)

## JWT-Secured Authorization Request (JAR)

- [issueRequestObject](functions/issueRequestObject.md)

## OpenID Connect (OIDC) Discovery

- [discoveryRequest](functions/discoveryRequest.md)
- [processDiscoveryResponse](functions/processDiscoveryResponse.md)

## OpenID Connect (OIDC) UserInfo

- [processUserInfoResponse](functions/processUserInfoResponse.md)
- [userInfoRequest](functions/userInfoRequest.md)
- [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md)

## Proof Key for Code Exchange (PKCE)

- [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)

## Pushed Authorization Requests (PAR)

- [processPushedAuthorizationResponse](functions/processPushedAuthorizationResponse.md)
- [pushedAuthorizationRequest](functions/pushedAuthorizationRequest.md)

## Refreshing an Access Token

- [processRefreshTokenResponse](functions/processRefreshTokenResponse.md)
- [refreshTokenGrantRequest](functions/refreshTokenGrantRequest.md)

## SAML 2.0 Bearer Assertion Grant Type

- [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md)
- [processGenericTokenEndpointResponse](functions/processGenericTokenEndpointResponse.md)

## Token Exchange Grant Type

- [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md)
- [processGenericTokenEndpointResponse](functions/processGenericTokenEndpointResponse.md)

## Token Introspection

- [introspectionRequest](functions/introspectionRequest.md)
- [processIntrospectionResponse](functions/processIntrospectionResponse.md)
- [validateApplicationLevelSignature](functions/validateApplicationLevelSignature.md)

## Token Revocation

- [processRevocationResponse](functions/processRevocationResponse.md)
- [revocationRequest](functions/revocationRequest.md)

## Utilities

- [generateKeyPair](functions/generateKeyPair.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)
- [generateRandomNonce](functions/generateRandomNonce.md)
- [generateRandomState](functions/generateRandomState.md)

## Interfaces

- [AuthorizationDetails](interfaces/AuthorizationDetails.md)
- [AuthorizationServer](interfaces/AuthorizationServer.md)
- [BackchannelAuthenticationRequestOptions](interfaces/BackchannelAuthenticationRequestOptions.md)
- [BackchannelAuthenticationResponse](interfaces/BackchannelAuthenticationResponse.md)
- [Client](interfaces/Client.md)
- [ClientCredentialsGrantRequestOptions](interfaces/ClientCredentialsGrantRequestOptions.md)
- [ConfirmationClaims](interfaces/ConfirmationClaims.md)
- [CryptoKeyPair](interfaces/CryptoKeyPair.md)
- [CustomFetchOptions](interfaces/CustomFetchOptions.md)
- [DeviceAuthorizationRequestOptions](interfaces/DeviceAuthorizationRequestOptions.md)
- [DeviceAuthorizationResponse](interfaces/DeviceAuthorizationResponse.md)
- [DiscoveryRequestOptions](interfaces/DiscoveryRequestOptions.md)
- [DPoPHandle](interfaces/DPoPHandle.md)
- [DPoPRequestOptions](interfaces/DPoPRequestOptions.md)
- [ExportedJWKSCache](interfaces/ExportedJWKSCache.md)
- [GenerateKeyPairOptions](interfaces/GenerateKeyPairOptions.md)
- [HttpRequestOptions](interfaces/HttpRequestOptions.md)
- [IDToken](interfaces/IDToken.md)
- [IntrospectionRequestOptions](interfaces/IntrospectionRequestOptions.md)
- [IntrospectionResponse](interfaces/IntrospectionResponse.md)
- [JWEDecryptOptions](interfaces/JWEDecryptOptions.md)
- [JWK](interfaces/JWK.md)
- [JWKS](interfaces/JWKS.md)
- [JWKSCacheOptions](interfaces/JWKSCacheOptions.md)
- [JWTAccessTokenClaims](interfaces/JWTAccessTokenClaims.md)
- [ModifyAssertionFunction](interfaces/ModifyAssertionFunction.md)
- [ModifyAssertionOptions](interfaces/ModifyAssertionOptions.md)
- [MTLSEndpointAliases](interfaces/MTLSEndpointAliases.md)
- [OAuth2Error](interfaces/OAuth2Error.md)
- [PrivateKey](interfaces/PrivateKey.md)
- [ProcessAuthorizationCodeResponseOptions](interfaces/ProcessAuthorizationCodeResponseOptions.md)
- [ProtectedResourceRequestOptions](interfaces/ProtectedResourceRequestOptions.md)
- [PushedAuthorizationRequestOptions](interfaces/PushedAuthorizationRequestOptions.md)
- [PushedAuthorizationResponse](interfaces/PushedAuthorizationResponse.md)
- [RevocationRequestOptions](interfaces/RevocationRequestOptions.md)
- [TokenEndpointRequestOptions](interfaces/TokenEndpointRequestOptions.md)
- [TokenEndpointResponse](interfaces/TokenEndpointResponse.md)
- [UserInfoAddress](interfaces/UserInfoAddress.md)
- [UserInfoRequestOptions](interfaces/UserInfoRequestOptions.md)
- [UserInfoResponse](interfaces/UserInfoResponse.md)
- [ValidateJWTAccessTokenOptions](interfaces/ValidateJWTAccessTokenOptions.md)
- [ValidateSignatureOptions](interfaces/ValidateSignatureOptions.md)
- [WWWAuthenticateChallenge](interfaces/WWWAuthenticateChallenge.md)
- [WWWAuthenticateChallengeParameters](interfaces/WWWAuthenticateChallengeParameters.md)

## Type Aliases

- [ClientAuth](type-aliases/ClientAuth.md)
- [JsonArray](type-aliases/JsonArray.md)
- [JsonObject](type-aliases/JsonObject.md)
- [JsonPrimitive](type-aliases/JsonPrimitive.md)
- [JsonValue](type-aliases/JsonValue.md)
- [JweDecryptFunction](type-aliases/JweDecryptFunction.md)
- [JWKSCacheInput](type-aliases/JWKSCacheInput.md)
- [JWSAlgorithm](type-aliases/JWSAlgorithm.md)
- [ProtectedResourceRequestBody](type-aliases/ProtectedResourceRequestBody.md)

## Variables

- [allowInsecureRequests](variables/allowInsecureRequests.md)
- [clockSkew](variables/clockSkew.md)
- [clockTolerance](variables/clockTolerance.md)
- [customFetch](variables/customFetch.md)
- [expectNoNonce](variables/expectNoNonce.md)
- [expectNoState](variables/expectNoState.md)
- [jweDecrypt](variables/jweDecrypt.md)
- [jwksCache](variables/jwksCache.md)
- [modifyAssertion](variables/modifyAssertion.md)
- [skipAuthTimeCheck](variables/skipAuthTimeCheck.md)
- [skipStateCheck](variables/skipStateCheck.md)
- [skipSubjectCheck](variables/skipSubjectCheck.md)
