# Function: processRefreshTokenResponse

[💗 Help the project](https://github.com/sponsors/panva)

▸ **processRefreshTokenResponse**(`as`, `client`, `response`, `options?`): `Promise`<[`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validates Refresh Token Grant
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

**`see`** [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-6)

**`see`** [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#RefreshTokens)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `response` | `Response` | resolved value from [refreshTokenGrantRequest](refreshTokenGrantRequest.md) |
| `options?` | [`HttpRequestOptions`](../interfaces/HttpRequestOptions.md) | - |

#### Returns

`Promise`<[`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Object representing the parsed successful response, or an object
representing an OAuth 2.0 protocol style error. Use [isOAuth2Error](isOAuth2Error.md) to
determine if an OAuth 2.0 error was returned.
