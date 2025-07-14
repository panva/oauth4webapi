# Interface: ProtectedResourceRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Properties

### ~~\[allowInsecureRequests\]?~~

• `optional` **\[allowInsecureRequests\]**: `boolean`

See [allowInsecureRequests](../variables/allowInsecureRequests.md).

#### Deprecated

***

### \[customFetch\]()?

• `optional` **\[customFetch\]**: (`url`, `options`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

See [customFetch](../variables/customFetch.md).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `url` | `string` | URL the request is being made sent to [fetch](https://developer.mozilla.org/docs/Web/API/Window/fetch) as the `resource` argument |
| `options` | [`CustomFetchOptions`](CustomFetchOptions.md)\<`string`, [`ProtectedResourceRequestBody`](../type-aliases/ProtectedResourceRequestBody.md)\> | Options otherwise sent to [fetch](https://developer.mozilla.org/docs/Web/API/Window/fetch) as the `options` argument |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

***

### DPoP?

• `optional` **DPoP**: [`DPoPHandle`](DPoPHandle.md)

DPoP handle, obtained from [DPoP](../functions/DPoP.md)

***

### signal?

• `optional` **signal**: [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal) \| (`url`) => [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal)

An AbortSignal instance, or a factory returning one, to abort the HTTP request(s) triggered by
this function's invocation.

#### Example

A 5000ms timeout AbortSignal for every request

```js
let signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
