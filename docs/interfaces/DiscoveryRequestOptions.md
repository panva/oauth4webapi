# Interface: DiscoveryRequestOptions

## Table of contents

### Properties

- [algorithm](DiscoveryRequestOptions.md#algorithm)
- [signal](DiscoveryRequestOptions.md#signal)

## Properties

### algorithm

• `Optional` **algorithm**: [`ProcessingMode`](../types/ProcessingMode.md)

The issuer transformation algorithm to use.

___

### signal

• `Optional` **signal**: `AbortSignal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
instance to abort the underlying fetch requests.

**`example`** Obtain a 5000ms timeout AbortSignal
```js
const signal = AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
