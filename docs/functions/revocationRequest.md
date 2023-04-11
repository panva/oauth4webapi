# Function: revocationRequest

[💗 Help the project](https://github.com/sponsors/panva)

▸ **revocationRequest**(`as`, `client`, `token`, `options?`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>

Performs a Revocation Request at the
[`as.revocation_endpoint`](../interfaces/AuthorizationServer.md#revocation_endpoint).

**`see`** [RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `token` | `string` | Token to revoke. You can provide the `token_type_hint` parameter via [options](../interfaces/RevocationRequestOptions.md#additionalparameters). |
| `options?` | [`RevocationRequestOptions`](../interfaces/RevocationRequestOptions.md) | - |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response )\>
