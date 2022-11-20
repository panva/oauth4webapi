# Function: clientCredentialsGrantRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **clientCredentialsGrantRequest**(`as`, `client`, `parameters`, `options?`): `Promise`<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>

Performs a Client Credentials Grant request at the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

**`see`** [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)

**`see`** [draft-ietf-oauth-dpop-11 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-11.html#name-dpop-access-token-request)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `parameters` | [`URLSearchParams`]( https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams ) | - |
| `options?` | [`ClientCredentialsGrantRequestOptions`](../interfaces/ClientCredentialsGrantRequestOptions.md) | - |

#### Returns

`Promise`<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>
