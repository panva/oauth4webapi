# Interface: IntrospectionRequestOptions

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
| `options` | \{`body`: [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams);`headers`: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>;`method`: `"POST"`;`redirect`: `"manual"`;`signal`: [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal); \} | Options otherwise sent to [fetch](https://developer.mozilla.org/docs/Web/API/Window/fetch) as the `options` argument |
| `options.body` | [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) | The request body content to send to the server |
| `options.headers` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\> | HTTP Headers |
| `options.method` | `"POST"` | The [request method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) |
| `options.redirect` | `"manual"` | See [Request.redirect](https://developer.mozilla.org/docs/Web/API/Request/redirect) |
| `options.signal`? | [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal) | Depending on whether [HttpRequestOptions.signal](HttpRequestOptions.md#signal) was used, if so, it is the value passed, otherwise undefined |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

***

### additionalParameters?

• `optional` **additionalParameters**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\> \| [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| `string`[][]

Any additional parameters to send. This cannot override existing parameter values.

***

### headers?

• `optional` **headers**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\> \| [`string`, `string`][] \| [`Headers`](https://developer.mozilla.org/docs/Web/API/Headers)

Headers to additionally send with the HTTP request(s) triggered by this function's invocation.

***

### requestJwtResponse?

• `optional` **requestJwtResponse**: `boolean`

Request a JWT Response from the
[`as.introspection_endpoint`](AuthorizationServer.md#introspection_endpoint). Default is

- True when
  [`client.introspection_signed_response_alg`](Client.md#introspection_signed_response_alg) is
  set
- False otherwise

***

### signal?

• `optional` **signal**: [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal) \| () => [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal)

An AbortSignal instance, or a factory returning one, to abort the HTTP request(s) triggered by
this function's invocation.

#### Example

A 5000ms timeout AbortSignal for every request

```js
let signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
