# Function: clientCredentialsGrantRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **clientCredentialsGrantRequest**(`as`, `client`, `parameters`, `options?`): `Promise`<`Response`\>

Performs a Client Credentials Grant request at the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

**`see`** [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)

**`see`** [draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-dpop-access-token-request)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `parameters` | `URLSearchParams` | - |
| `options?` | [`ClientCredentialsGrantRequestOptions`](../interfaces/ClientCredentialsGrantRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
