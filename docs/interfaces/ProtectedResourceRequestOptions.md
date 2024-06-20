# Interface: ProtectedResourceRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [DPoP](ProtectedResourceRequestOptions.md#dpop)
- [[clockSkew]](ProtectedResourceRequestOptions.md#clockskew)
- [[customFetch]](ProtectedResourceRequestOptions.md#customfetch)
- [signal](ProtectedResourceRequestOptions.md#signal)

## Properties

### DPoP

• `Optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

___

### [clockSkew]

• `Optional` **[clockSkew]**: `number`

See [clockSkew](../variables/clockSkew.md).

___

### [customFetch]

• `Optional` **[customFetch]**: (`input`: `RequestInfo` \| [`URL`]( https://developer.mozilla.org/docs/Web/API/URL ), `init?`: `RequestInit`) => [`Promise`]( https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`Response`]( https://developer.mozilla.org/docs/Web/API/Response )\>

See [customFetch](../variables/customFetch.md).

___

### signal

• `Optional` **signal**: [`AbortSignal`]( https://developer.mozilla.org/docs/Web/API/AbortSignal ) \| () => [`AbortSignal`]( https://developer.mozilla.org/docs/Web/API/AbortSignal )

An AbortSignal instance, or a factory returning one, to abort the HTTP request(s) triggered by
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
