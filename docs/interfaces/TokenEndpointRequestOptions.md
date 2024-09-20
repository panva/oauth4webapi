# Interface: TokenEndpointRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Properties

### \[customFetch\]()?

• `optional` **\[customFetch\]**: (`input`, `init`?) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

See [customFetch](../variables/customFetch.md).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | `RequestInfo` \| [`URL`](https://developer.mozilla.org/docs/Web/API/URL) |
| `init`? | `RequestInit` |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

***

### additionalParameters?

• `optional` **additionalParameters**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\> \| [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| `string`[][]

Any additional parameters to send. This cannot override existing parameter values.

***

### clientPrivateKey?

• `optional` **clientPrivateKey**: [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../type-aliases/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../type-aliases/JWSAlgorithm.md).

***

### DPoP?

• `optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

***

### headers?

• `optional` **headers**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\> \| [`string`, `string`][] \| [`Headers`](https://developer.mozilla.org/docs/Web/API/Headers)

Headers to additionally send with the HTTP request(s) triggered by this function's invocation.

***

### signal?

• `optional` **signal**: [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal) \| () => [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal)

An AbortSignal instance, or a factory returning one, to abort the HTTP request(s) triggered by
this function's invocation.

#### Example

A 5000ms timeout AbortSignal for every request

```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
