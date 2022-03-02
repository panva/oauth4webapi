[@panva/oauth4webapi](../README.md) / JwksRequestOptions

# Interface: JwksRequestOptions

## Hierarchy

- [`SignalledRequestOptions`](SignalledRequestOptions.md)

  ↳ **`JwksRequestOptions`**

## Table of contents

### Properties

- [signal](JwksRequestOptions.md#signal)

## Properties

### signal

• `Optional` **signal**: `AbortSignal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
instance to abort the underlying fetch requests.

**`example`** Obtain a 5000ms timeout AbortSignal
```js
const signal = AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```

#### Inherited from

[SignalledRequestOptions](SignalledRequestOptions.md).[signal](SignalledRequestOptions.md#signal)
