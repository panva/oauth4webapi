# Function: processGenericTokenEndpointResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processGenericTokenEndpointResponse**(`as`, `client`, `response`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md)\>

Validates Token Endpoint [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [genericTokenEndpointRequest](genericTokenEndpointRequest.md). |
| `options`? | [`JWEDecryptOptions`](../interfaces/JWEDecryptOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md)\>

## See

 - [Token Exchange Grant Type](https://www.rfc-editor.org/rfc/rfc8693.html)
 - [JWT Bearer Token Grant Type](https://www.rfc-editor.org/rfc/rfc7523.html#section-2.1)
 - [SAML 2.0 Bearer Assertion Grant Type](https://www.rfc-editor.org/rfc/rfc7522.html#section-2.1)
