# Function: validateJwtAccessToken()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **validateJwtAccessToken**(`as`, `request`, `expectedAudience`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JWTAccessTokenClaims`](../interfaces/JWTAccessTokenClaims.md)\>

Validates use of JSON Web Token (JWT) OAuth 2.0 Access Tokens for a given [Request](https://developer.mozilla.org/docs/Web/API/Request) as per
RFC 6750, RFC 9068, and RFC 9449.

The only supported means of sending access tokens is via the Authorization Request Header Field
method.

This does validate the presence and type of all required claims as well as the values of the
[`iss`](../interfaces/JWTAccessTokenClaims.md#iss), [`exp`](../interfaces/JWTAccessTokenClaims.md#exp),
[`aud`](../interfaces/JWTAccessTokenClaims.md#aud) claims.

This does NOT validate the [`sub`](../interfaces/JWTAccessTokenClaims.md#sub),
[`jti`](../interfaces/JWTAccessTokenClaims.md#jti), and [`client_id`](../interfaces/JWTAccessTokenClaims.md#client_id)
claims beyond just checking that they're present and that their type is a string. If you need to
validate these values further you would do so after this function's execution.

This does NOT validate the DPoP Proof JWT nonce. If your server indicates RS-provided nonces to
clients you would check these after this function's execution.

This does NOT validate authorization claims such as `scope` either, you would do so after this
function's execution.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server to accept JWT Access Tokens from. |
| `request` | [`Request`](https://developer.mozilla.org/docs/Web/API/Request) | - |
| `expectedAudience` | `string` | Audience identifier the resource server expects for itself. |
| `options`? | [`ValidateJWTAccessTokenOptions`](../interfaces/ValidateJWTAccessTokenOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`JWTAccessTokenClaims`](../interfaces/JWTAccessTokenClaims.md)\>

## See

 - [RFC 6750 - OAuth 2.0 Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.html)
 - [RFC 9068 - JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068.html)
 - [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html)
