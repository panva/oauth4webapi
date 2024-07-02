# Function: authorizationCodeGrantRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **authorizationCodeGrantRequest**(`as`, `client`, `callbackParameters`, `redirectUri`, `codeVerifier`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs an Authorization Code grant request at the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `callbackParameters` | [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) | Parameters obtained from the callback to redirect_uri, this is returned from [validateAuthResponse](validateAuthResponse.md), or [validateJwtAuthResponse](validateJwtAuthResponse.md). |
| `redirectUri` | `string` | `redirect_uri` value used in the authorization request. |
| `codeVerifier` | `string` | PKCE `code_verifier` to send to the token endpoint. |
| `options`? | [`TokenEndpointRequestOptions`](../interfaces/TokenEndpointRequestOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

## See

 - [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 - [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)
 - [RFC 7636 - Proof Key for Code Exchange (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
 - [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
