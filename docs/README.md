# oauth4webapi API Reference

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

## Accessing Protected Resources

- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [protectedResourceRequest](functions/protectedResourceRequest.md)

## Authorization Code Grant

- [authorizationCodeGrantRequest](functions/authorizationCodeGrantRequest.md)
- [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [issueRequestObject](functions/issueRequestObject.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processAuthorizationCodeOAuth2Response](functions/processAuthorizationCodeOAuth2Response.md)
- [validateAuthResponse](functions/validateAuthResponse.md)
- [validateJwtAuthResponse](functions/validateJwtAuthResponse.md)

## Authorization Code Grant w/ OpenID Connect (OIDC)

- [authorizationCodeGrantRequest](functions/authorizationCodeGrantRequest.md)
- [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)
- [getValidatedIdTokenClaims](functions/getValidatedIdTokenClaims.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [issueRequestObject](functions/issueRequestObject.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processAuthorizationCodeOpenIDResponse](functions/processAuthorizationCodeOpenIDResponse.md)
- [processUserInfoResponse](functions/processUserInfoResponse.md)
- [userInfoRequest](functions/userInfoRequest.md)
- [validateAuthResponse](functions/validateAuthResponse.md)
- [validateIdTokenSignature](functions/validateIdTokenSignature.md)
- [validateJwtAuthResponse](functions/validateJwtAuthResponse.md)
- [validateJwtUserInfoSignature](functions/validateJwtUserInfoSignature.md)

## Authorization Server Metadata

- [discoveryRequest](functions/discoveryRequest.md)
- [processDiscoveryResponse](functions/processDiscoveryResponse.md)

## Client Credentials Grant

- [clientCredentialsGrantRequest](functions/clientCredentialsGrantRequest.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processClientCredentialsResponse](functions/processClientCredentialsResponse.md)

## Device Authorization Grant

- [deviceAuthorizationRequest](functions/deviceAuthorizationRequest.md)
- [deviceCodeGrantRequest](functions/deviceCodeGrantRequest.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processDeviceAuthorizationResponse](functions/processDeviceAuthorizationResponse.md)
- [processDeviceCodeResponse](functions/processDeviceCodeResponse.md)

## Errors

- [OperationProcessingError](classes/OperationProcessingError.md)
- [UnsupportedOperationError](classes/UnsupportedOperationError.md)

## FAPI 1.0 Advanced

- [validateDetachedSignatureResponse](functions/validateDetachedSignatureResponse.md)
- [validateIdTokenSignature](functions/validateIdTokenSignature.md)

## JWT Access Tokens

- [validateJwtAccessToken](functions/validateJwtAccessToken.md)

## JWT Bearer Token Grant Type

- [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)

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
- [validateJwtUserInfoSignature](functions/validateJwtUserInfoSignature.md)

## Proof Key for Code Exchange (PKCE)

- [calculatePKCECodeChallenge](functions/calculatePKCECodeChallenge.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)

## Pushed Authorization Requests (PAR)

- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processPushedAuthorizationResponse](functions/processPushedAuthorizationResponse.md)
- [pushedAuthorizationRequest](functions/pushedAuthorizationRequest.md)

## Refreshing an Access Token

- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processRefreshTokenResponse](functions/processRefreshTokenResponse.md)
- [refreshTokenGrantRequest](functions/refreshTokenGrantRequest.md)

## SAML 2.0 Bearer Assertion Grant Type

- [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)

## Token Exchange Grant Type

- [genericTokenEndpointRequest](functions/genericTokenEndpointRequest.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)

## Token Introspection

- [introspectionRequest](functions/introspectionRequest.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processIntrospectionResponse](functions/processIntrospectionResponse.md)
- [validateJwtIntrospectionSignature](functions/validateJwtIntrospectionSignature.md)

## Token Revocation

- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)
- [processRevocationResponse](functions/processRevocationResponse.md)
- [revocationRequest](functions/revocationRequest.md)

## Utilities

- [generateKeyPair](functions/generateKeyPair.md)
- [generateRandomCodeVerifier](functions/generateRandomCodeVerifier.md)
- [generateRandomNonce](functions/generateRandomNonce.md)
- [generateRandomState](functions/generateRandomState.md)
- [isOAuth2Error](functions/isOAuth2Error.md)
- [parseWwwAuthenticateChallenges](functions/parseWwwAuthenticateChallenges.md)

## Interfaces

- [AuthenticatedRequestOptions](interfaces/AuthenticatedRequestOptions.md)
- [AuthorizationDetails](interfaces/AuthorizationDetails.md)
- [AuthorizationServer](interfaces/AuthorizationServer.md)
- [Client](interfaces/Client.md)
- [ClientCredentialsGrantRequestOptions](interfaces/ClientCredentialsGrantRequestOptions.md)
- [ClientCredentialsGrantResponse](interfaces/ClientCredentialsGrantResponse.md)
- [ConfirmationClaims](interfaces/ConfirmationClaims.md)
- [DeviceAuthorizationRequestOptions](interfaces/DeviceAuthorizationRequestOptions.md)
- [DeviceAuthorizationResponse](interfaces/DeviceAuthorizationResponse.md)
- [DiscoveryRequestOptions](interfaces/DiscoveryRequestOptions.md)
- [DPoPOptions](interfaces/DPoPOptions.md)
- [DPoPRequestOptions](interfaces/DPoPRequestOptions.md)
- [ExportedJWKSCache](interfaces/ExportedJWKSCache.md)
- [GenerateKeyPairOptions](interfaces/GenerateKeyPairOptions.md)
- [HttpRequestOptions](interfaces/HttpRequestOptions.md)
- [IDToken](interfaces/IDToken.md)
- [IntrospectionRequestOptions](interfaces/IntrospectionRequestOptions.md)
- [IntrospectionResponse](interfaces/IntrospectionResponse.md)
- [JweDecryptFunction](interfaces/JweDecryptFunction.md)
- [JWK](interfaces/JWK.md)
- [JWKS](interfaces/JWKS.md)
- [JWKSCacheOptions](interfaces/JWKSCacheOptions.md)
- [JWTAccessTokenClaims](interfaces/JWTAccessTokenClaims.md)
- [ModifyAssertionFunction](interfaces/ModifyAssertionFunction.md)
- [MTLSEndpointAliases](interfaces/MTLSEndpointAliases.md)
- [OAuth2Error](interfaces/OAuth2Error.md)
- [OAuth2TokenEndpointResponse](interfaces/OAuth2TokenEndpointResponse.md)
- [OpenIDTokenEndpointResponse](interfaces/OpenIDTokenEndpointResponse.md)
- [PrivateKey](interfaces/PrivateKey.md)
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

- [ClientAuthenticationMethod](type-aliases/ClientAuthenticationMethod.md)
- [JsonArray](type-aliases/JsonArray.md)
- [JsonObject](type-aliases/JsonObject.md)
- [JsonPrimitive](type-aliases/JsonPrimitive.md)
- [JsonValue](type-aliases/JsonValue.md)
- [JWKSCacheInput](type-aliases/JWKSCacheInput.md)
- [JWSAlgorithm](type-aliases/JWSAlgorithm.md)

## Variables

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
