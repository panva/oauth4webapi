# Interface: ProtectedResourceRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [DPoP](ProtectedResourceRequestOptions.md#dpop)
- [[clockSkew]](ProtectedResourceRequestOptions.md#[clockskew])
- [[experimentalCustomFetch]](ProtectedResourceRequestOptions.md#[experimentalcustomfetch])
- [signal](ProtectedResourceRequestOptions.md#signal)

## Properties

### DPoP

• `Optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

___

### [clockSkew]

• `Optional` **[clockSkew]**: `number`

Use to adjust the client's assumed current time. Positive and negative finite values
representing seconds are allowed. Default is `0` (Date.now() + 0 seconds is used).

This option only affects the request if the [DPoP](DPoPRequestOptions.md#dpop)
option is also used.

___

### [experimentalCustomFetch]

• `Optional` **[experimentalCustomFetch]**: (`input`: `RequestInfo` \| [`URL`]( https://developer.mozilla.org/docs/Web/API/URL ), `init?`: `RequestInit`) => [`Promise`]( https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`Response`]( https://developer.mozilla.org/docs/Web/API/Response )\>

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

See [experimentalCustomFetch](../variables/experimentalCustomFetch.md) for its documentation.

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

## Hierarchy

- [`Omit`]( https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys )\<[`HttpRequestOptions`](HttpRequestOptions.md), ``"headers"``\>

- [`DPoPRequestOptions`](DPoPRequestOptions.md)

  ↳ **`ProtectedResourceRequestOptions`**
