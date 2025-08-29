# Function: introspectionRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **introspectionRequest**(`as`, `client`, `clientAuthentication`, `token`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs an Introspection Request at the
[`as.introspection\_endpoint`](../interfaces/AuthorizationServer.md#introspection_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `clientAuthentication` | [`ClientAuth`](../type-aliases/ClientAuth.md) | Client Authentication Method. |
| `token` | `string` | Token to introspect. You can provide the `token_type_hint` parameter via [options](../interfaces/IntrospectionRequestOptions.md#additionalparameters). |
| `options?` | [`IntrospectionRequestOptions`](../interfaces/IntrospectionRequestOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Resolves with a [Response](https://developer.mozilla.org/docs/Web/API/Response) to then invoke [processIntrospectionResponse](processIntrospectionResponse.md) with

## See

 - [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 - [RFC 9701 - JWT Response for OAuth Token Introspection](https://www.rfc-editor.org/rfc/rfc9701.html#section-4)
