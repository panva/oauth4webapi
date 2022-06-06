# Function: authorizationCodeGrantRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **authorizationCodeGrantRequest**(`as`, `client`, `callbackParameters`, `redirectUri`, `codeVerifier`, `options?`): `Promise`<`Response`\>

Performs an Authorization Code grant request at the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

**`see`** [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)

**`see`** [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)

**`see`** [RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)

**`see`** [draft-ietf-oauth-dpop-09 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-09.html#name-dpop-access-token-request)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `callbackParameters` | `CallbackParameters` | Parameters obtained from the callback to redirect_uri, this is returned from [validateAuthResponse](validateAuthResponse.md), or [validateJwtAuthResponse](validateJwtAuthResponse.md). |
| `redirectUri` | `string` | `redirect_uri` value used in the authorization request. |
| `codeVerifier` | `string` | PKCE `code_verifier` to send to the token endpoint. |
| `options?` | [`TokenEndpointRequestOptions`](../interfaces/TokenEndpointRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
