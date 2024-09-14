# Function: validateIdTokenSignature()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **validateIdTokenSignature**(`as`, `ref`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Validates the JWS Signature of an ID Token included in results previously resolved from
[processAuthorizationCodeOpenIDResponse](processAuthorizationCodeOpenIDResponse.md), [processRefreshTokenResponse](processRefreshTokenResponse.md), or
[processDeviceCodeResponse](processDeviceCodeResponse.md) for non-repudiation purposes.

Note: Validating signatures of ID Tokens received via direct communication between the Client and
the Token Endpoint (which it is here) is not mandatory since the TLS server validation is used to
validate the issuer instead of checking the token signature. You only need to use this method for
non-repudiation purposes.

Note: Supports only digital signatures.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `ref` | [`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) \| [`OpenIDTokenEndpointResponse`](../interfaces/OpenIDTokenEndpointResponse.md) | Value previously resolved from [processAuthorizationCodeOpenIDResponse](processAuthorizationCodeOpenIDResponse.md), [processRefreshTokenResponse](processRefreshTokenResponse.md), or [processDeviceCodeResponse](processDeviceCodeResponse.md). |
| `options`? | [`ValidateSignatureOptions`](../interfaces/ValidateSignatureOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Resolves if the signature validates, rejects otherwise.

## See

[OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)
