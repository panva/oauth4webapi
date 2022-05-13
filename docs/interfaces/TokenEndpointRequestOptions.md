# Interface: TokenEndpointRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [DPoP](TokenEndpointRequestOptions.md#dpop)
- [additionalParameters](TokenEndpointRequestOptions.md#additionalparameters)
- [clientPrivateKey](TokenEndpointRequestOptions.md#clientprivatekey)
- [headers](TokenEndpointRequestOptions.md#headers)
- [signal](TokenEndpointRequestOptions.md#signal)

## Properties

### DPoP

• `Optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

___

### additionalParameters

• `Optional` **additionalParameters**: `URLSearchParams`

Any additional parameters to send. This cannot override existing parameter
values.

___

### clientPrivateKey

• `Optional` **clientPrivateKey**: `CryptoKey` \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/ClientAuthenticationMethod.md).

___

### headers

• `Optional` **headers**: `Headers`

A [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
instance to additionally send with the HTTP Request(s) triggered by this
functions invocation.

___

### signal

• `Optional` **signal**: `AbortSignal`

An [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
instance to abort the underlying fetch requests.

**`example`** Obtain a 5000ms timeout AbortSignal
```js
const signal = AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
