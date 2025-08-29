# Function: genericTokenEndpointRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **genericTokenEndpointRequest**(`as`, `client`, `clientAuthentication`, `grantType`, `parameters`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs any Grant request at the [`as.token\_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).
The purpose is to be able to execute grant requests such as Token Exchange Grant Type, JWT Bearer
Token Grant Type, or SAML 2.0 Bearer Assertion Grant Type.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `clientAuthentication` | [`ClientAuth`](../type-aliases/ClientAuth.md) | Client Authentication Method. |
| `grantType` | `string` | Grant Type. |
| `parameters` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\> \| [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| `string`[][] | - |
| `options?` | [`Omit`](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)\<[`TokenEndpointRequestOptions`](../interfaces/TokenEndpointRequestOptions.md), `"additionalParameters"`\> | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Resolves with a [Response](https://developer.mozilla.org/docs/Web/API/Response) to then invoke
  [processGenericTokenEndpointResponse](processGenericTokenEndpointResponse.md) with

## See

 - [Token Exchange Grant Type](https://www.rfc-editor.org/rfc/rfc8693.html)
 - [JWT Bearer Token Grant Type](https://www.rfc-editor.org/rfc/rfc7523.html#section-2.1)
 - [SAML 2.0 Bearer Assertion Grant Type](https://www.rfc-editor.org/rfc/rfc7522.html#section-2.1)
