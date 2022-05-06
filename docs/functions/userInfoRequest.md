# Function: userInfoRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **userInfoRequest**(`as`, `client`, `accessToken`, `options?`): `Promise`<`Response`\>

Performs a UserInfo Request at the
[`as.userinfo_endpoint`](../interfaces/AuthorizationServer.md#userinfo_endpoint).

Authorization Header is used to transmit the Access Token
value.

**`see`** [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)

**`see`** [draft-ietf-oauth-dpop-08 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-08.html#name-protected-resource-access)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `accessToken` | `string` | Access Token value |
| `options?` | [`UserInfoRequestOptions`](../interfaces/UserInfoRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
