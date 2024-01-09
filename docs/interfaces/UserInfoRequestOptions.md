# Interface: UserInfoRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [DPoP](UserInfoRequestOptions.md#dpop)
- [[experimentalCustomFetch]](UserInfoRequestOptions.md#[experimentalcustomfetch])
- [[experimentalUseMtlsAlias]](UserInfoRequestOptions.md#[experimentalusemtlsalias])
- [headers](UserInfoRequestOptions.md#headers)
- [signal](UserInfoRequestOptions.md#signal)

## Properties

### DPoP

• `Optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

___

### [experimentalCustomFetch]

• `Optional` **[experimentalCustomFetch]**: (`input`: `RequestInfo` \| [`URL`]( https://developer.mozilla.org/docs/Web/API/URL ), `init?`: `RequestInit`) => [`Promise`]( https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<[`Response`]( https://developer.mozilla.org/docs/Web/API/Response )\>

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

See [experimentalCustomFetch](../variables/experimentalCustomFetch.md) for its documentation.

___

### [experimentalUseMtlsAlias]

• `Optional` **[experimentalUseMtlsAlias]**: `boolean`

This is an experimental feature, it is not subject to semantic versioning rules. Non-backward
compatible changes or removal may occur in any future release.

See [experimentalUseMtlsAlias](../variables/experimentalUseMtlsAlias.md) for its documentation.

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

## Hierarchy

- [`HttpRequestOptions`](HttpRequestOptions.md)

- [`DPoPRequestOptions`](DPoPRequestOptions.md)

- [`ExperimentalUseMTLSAliasOptions`](ExperimentalUseMTLSAliasOptions.md)

  ↳ **`UserInfoRequestOptions`**
