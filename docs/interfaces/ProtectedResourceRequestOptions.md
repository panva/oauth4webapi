[@panva/oauth4webapi](../README.md) / ProtectedResourceRequestOptions

# Interface: ProtectedResourceRequestOptions

## Hierarchy

- [`SignalledRequestOptions`](SignalledRequestOptions.md)

- [`DPoPRequestOptions`](DPoPRequestOptions.md)

  ↳ **`ProtectedResourceRequestOptions`**

  ↳↳ [`UserInfoRequestOptions`](UserInfoRequestOptions.md)

## Table of contents

### Properties

- [DPoP](ProtectedResourceRequestOptions.md#dpop)
- [signal](ProtectedResourceRequestOptions.md#signal)

## Properties

### DPoP

• `Optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

#### Inherited from

[DPoPRequestOptions](DPoPRequestOptions.md).[DPoP](DPoPRequestOptions.md#dpop)

___

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
