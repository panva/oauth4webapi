# Function: jwksRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **jwksRequest**(`as`, `options?`): `Promise`<`Response`\>

Performs a request to the
[`as.jwks_uri`](../interfaces/AuthorizationServer.md#jwks_uri)

**`see`** [JWK Set Format](https://www.rfc-editor.org/rfc/rfc7517.html#section-5)

**`see`** [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)

**`see`** [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `options?` | [`JwksRequestOptions`](../interfaces/JwksRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
