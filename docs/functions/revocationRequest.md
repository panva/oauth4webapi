# Function: revocationRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **revocationRequest**(`as`, `client`, `clientAuthentication`, `token`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs a Revocation Request at the
[`as.revocation\_endpoint`](../interfaces/AuthorizationServer.md#revocation_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `clientAuthentication` | [`ClientAuth`](../type-aliases/ClientAuth.md) | Client Authentication Method. |
| `token` | `string` | Token to revoke. You can provide the `token_type_hint` parameter via [options](../interfaces/RevocationRequestOptions.md#additionalparameters). |
| `options?` | [`RevocationRequestOptions`](../interfaces/RevocationRequestOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Resolves with a [Response](https://developer.mozilla.org/docs/Web/API/Response) to then invoke [processRevocationResponse](processRevocationResponse.md) with

## See

[RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
