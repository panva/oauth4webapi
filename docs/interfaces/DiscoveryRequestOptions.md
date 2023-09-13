# Interface: DiscoveryRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [algorithm](DiscoveryRequestOptions.md#algorithm)
- [headers](DiscoveryRequestOptions.md#headers)
- [signal](DiscoveryRequestOptions.md#signal)

## Properties

### algorithm

• `Optional` **algorithm**: ``"oidc"`` \| ``"oauth2"``

The issuer transformation algorithm to use.

___

### headers

• `Optional` **headers**: [`Headers`]( https://developer.mozilla.org/en-US/docs/Web/API/Headers )

A Headers instance to additionally send with the HTTP Request(s) triggered by this function's
invocation.

___

### signal

• `Optional` **signal**: [`AbortSignal`]( https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal ) \| () => [`AbortSignal`]( https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal )

An AbortSignal instance, or a factory returning one, to abort the HTTP Request(s) triggered by
this function's invocation.

**`Example`**

A 5000ms timeout AbortSignal for every request

```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
