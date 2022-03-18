# Function: introspectionRequest

▸ **introspectionRequest**(`as`, `client`, `token`, `options?`): `Promise`<`Response`\>

Performs an introspection request at the
[`as.introspection_endpoint`](../interfaces/AuthorizationServer.md#introspection_endpoint).

**`see`** [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)

**`see`** [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-4)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `token` | `string` | Token to introspect. You can provide the `token_type_hint` parameter via [options](../interfaces/IntrospectionRequestOptions.md#additionalparameters). |
| `options?` | [`IntrospectionRequestOptions`](../interfaces/IntrospectionRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
