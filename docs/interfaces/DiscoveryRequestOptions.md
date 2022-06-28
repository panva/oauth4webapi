# Interface: DiscoveryRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [algorithm](DiscoveryRequestOptions.md#algorithm)
- [headers](DiscoveryRequestOptions.md#headers)
- [signal](DiscoveryRequestOptions.md#signal)

## Properties

### algorithm

• `Optional` **algorithm**: [`ProcessingMode`](../types/ProcessingMode.md)

The issuer transformation algorithm to use.

___

### headers

• `Optional` **headers**: `Headers`

A [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
instance to additionally send with the HTTP Request(s) triggered by this
functions invocation.

___

### signal

• `Optional` **signal**: `AbortSignal` \| () => `AbortSignal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
instance, or a factory returning one, to abort the underlying fetch requests.

**`example`** A 5000ms timeout AbortSignal for every request
```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
