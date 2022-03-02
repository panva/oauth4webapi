[@panva/oauth4webapi](../README.md) / UserInfoRequestOptions

# Interface: UserInfoRequestOptions

## Hierarchy

- [`ProtectedResourceRequestOptions`](ProtectedResourceRequestOptions.md)

  ↳ **`UserInfoRequestOptions`**

## Table of contents

### Properties

- [DPoP](UserInfoRequestOptions.md#dpop)
- [signal](UserInfoRequestOptions.md#signal)

## Properties

### DPoP

• `Optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

#### Inherited from

[ProtectedResourceRequestOptions](ProtectedResourceRequestOptions.md).[DPoP](ProtectedResourceRequestOptions.md#dpop)

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

[ProtectedResourceRequestOptions](ProtectedResourceRequestOptions.md).[signal](ProtectedResourceRequestOptions.md#signal)
