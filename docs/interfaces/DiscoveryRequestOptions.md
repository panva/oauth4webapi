# Interface: DiscoveryRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [[experimentalCustomFetch]](DiscoveryRequestOptions.md#[experimentalcustomfetch])
- [algorithm](DiscoveryRequestOptions.md#algorithm)
- [headers](DiscoveryRequestOptions.md#headers)
- [signal](DiscoveryRequestOptions.md#signal)

## Properties

### [experimentalCustomFetch]

• `Optional` **[experimentalCustomFetch]**: (`input`: `string` \| [`Request`]( https://developer.mozilla.org/docs/Web/API/Request ) \| [`URL`]( https://developer.mozilla.org/docs/Web/API/URL ), `init?`: `RequestInit`) => [`Promise`]( https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`Response`]( https://developer.mozilla.org/docs/Web/API/Response )\>

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

See [experimentalCustomFetch](../variables/experimentalCustomFetch.md) for its documentation.

___

### algorithm

• `Optional` **algorithm**: ``"oidc"`` \| ``"oauth2"``

The issuer transformation algorithm to use.

___

### headers

• `Optional` **headers**: [`Record`]( https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type )\<`string`, `string`\> \| [`string`, `string`][] \| [`Headers`]( https://developer.mozilla.org/docs/Web/API/Headers )

Headers to additionally send with the HTTP Request(s) triggered by this function's invocation.

___

### signal

• `Optional` **signal**: [`AbortSignal`]( https://developer.mozilla.org/docs/Web/API/AbortSignal ) \| () => [`AbortSignal`]( https://developer.mozilla.org/docs/Web/API/AbortSignal )

An AbortSignal instance, or a factory returning one, to abort the HTTP Request(s) triggered by
this function's invocation.

**`Example`**

A 5000ms timeout AbortSignal for every request

```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
