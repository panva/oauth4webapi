# Function: protectedResourceRequest

▸ **protectedResourceRequest**(`accessToken`, `method`, `url`, `headers`, `body`, `options?`): `Promise`<`Response`\>

Performs a protected resource request at an arbitrary URL.

Authorization Header is used to transmit the Access Token
value.

**`see`** [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1)

**`see`** [draft-ietf-oauth-dpop-06 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.ietf.org/archive/id/draft-ietf-oauth-dpop-06.html#name-protected-resource-access)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accessToken` | `string` | The access token for the request |
| `method` | `string` | The HTTP method for the request |
| `url` | `URL` | Instance of [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) as the target URL for the request |
| `headers` | `Headers` | Instance of [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) for the request |
| `body` | `undefined` \| ``null`` \| `BodyInit` | see [Fetch API documentation](https://developer.mozilla.org/en-US/docs/Web/API/fetch#body). |
| `options?` | [`ProtectedResourceRequestOptions`](../interfaces/ProtectedResourceRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
