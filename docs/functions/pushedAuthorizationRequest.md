# Function: pushedAuthorizationRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **pushedAuthorizationRequest**(`as`, `client`, `parameters`, `options?`): `Promise`<`Response`\>

Performs a Pushed Authorization Request at the
[`as.pushed_authorization_request_endpoint`](../interfaces/AuthorizationServer.md#pushed_authorization_request_endpoint).

**`see`** [RFC 9126 - OAuth 2.0 Pushed Authorization Requests](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)

**`see`** [draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-dpop-with-pushed-authorizat)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `parameters` | `URLSearchParams` | authorization request parameters |
| `options?` | [`PushedAuthorizationRequestOptions`](../interfaces/PushedAuthorizationRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
