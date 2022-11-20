# Function: protectedResourceRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **protectedResourceRequest**(`accessToken`, `method`, `url`, `headers`, `body`, `options?`): `Promise`<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>

Performs a protected resource request at an arbitrary URL.

Authorization Header is used to transmit the Access Token value.

**`see`** [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1)

**`see`** [draft-ietf-oauth-dpop-11 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-11.html#name-protected-resource-access)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accessToken` | `string` | The Access Token for the request. |
| `method` | `string` | The HTTP method for the request. |
| `url` | [`URL`]( https://developer.mozilla.org/en-US/docs/Web/API/URL ) | Target URL for the request. |
| `headers` | [`Headers`]( https://developer.mozilla.org/en-US/docs/Web/API/Headers ) | Headers for the request. |
| `body` | `undefined` \| ``null`` \| `BodyInit` | Request body compatible with the Fetch API and the request's method. |
| `options?` | [`ProtectedResourceRequestOptions`](../interfaces/ProtectedResourceRequestOptions.md) | - |

#### Returns

`Promise`<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>
