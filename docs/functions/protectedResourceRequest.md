# Function: protectedResourceRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **protectedResourceRequest**(`accessToken`, `method`, `url`, `headers`?, `body`?, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs a protected resource request at an arbitrary URL.

Authorization Header is used to transmit the Access Token value.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `accessToken` | `string` | The Access Token for the request. |
| `method` | `string` | The HTTP method for the request. |
| `url` | [`URL`](https://developer.mozilla.org/docs/Web/API/URL) | Target URL for the request. |
| `headers`? | [`Headers`](https://developer.mozilla.org/docs/Web/API/Headers) | Headers for the request. |
| `body`? | `null` \| `string` \| [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) \| `ArrayBufferView` \| [`Blob`](https://developer.mozilla.org/docs/Web/API/Blob) \| [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) \| [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| [`ReadableStream`](https://developer.mozilla.org/docs/Web/API/ReadableStream)\<`any`\> | Request body compatible with the Fetch API and the request's method. |
| `options`? | [`ProtectedResourceRequestOptions`](../interfaces/ProtectedResourceRequestOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

## See

 - [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750.html#section-2.1)
 - [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-protected-resource-access)
