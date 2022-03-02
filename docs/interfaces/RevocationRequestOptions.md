[@panva/oauth4webapi](../README.md) / RevocationRequestOptions

# Interface: RevocationRequestOptions

## Hierarchy

- [`SignalledRequestOptions`](SignalledRequestOptions.md)

- [`AuthenticatedRequestOptions`](AuthenticatedRequestOptions.md)

  ↳ **`RevocationRequestOptions`**

## Table of contents

### Properties

- [additionalParameters](RevocationRequestOptions.md#additionalparameters)
- [clientPrivateKey](RevocationRequestOptions.md#clientprivatekey)
- [signal](RevocationRequestOptions.md#signal)

## Properties

### additionalParameters

• `Optional` **additionalParameters**: `URLSearchParams`

Any additional parameters to send. This cannot override existing parameter
values.

___

### clientPrivateKey

• `Optional` **clientPrivateKey**: [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/TokenEndpointAuthMethod.md).

#### Inherited from

[AuthenticatedRequestOptions](AuthenticatedRequestOptions.md).[clientPrivateKey](AuthenticatedRequestOptions.md#clientprivatekey)

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
