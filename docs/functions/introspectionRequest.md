# Function: introspectionRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **introspectionRequest**(`as`, `client`, `token`, `options?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>

Performs an Introspection Request at the
[`as.introspection_endpoint`](../interfaces/AuthorizationServer.md#introspection_endpoint).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `token` | `string` | Token to introspect. You can provide the `token_type_hint` parameter via [options](../interfaces/IntrospectionRequestOptions.md#additionalparameters). |
| `options?` | [`IntrospectionRequestOptions`](../interfaces/IntrospectionRequestOptions.md) | - |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>

**`See`**

 - [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 - [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-4)
