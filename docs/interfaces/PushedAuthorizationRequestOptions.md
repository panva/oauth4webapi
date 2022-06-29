# Interface: PushedAuthorizationRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [DPoP](PushedAuthorizationRequestOptions.md#dpop)
- [clientPrivateKey](PushedAuthorizationRequestOptions.md#clientprivatekey)
- [headers](PushedAuthorizationRequestOptions.md#headers)
- [signal](PushedAuthorizationRequestOptions.md#signal)

## Properties

### DPoP

• `Optional` **DPoP**: [`DPoPOptions`](DPoPOptions.md)

DPoP-related options.

___

### clientPrivateKey

• `Optional` **clientPrivateKey**: [`CryptoKey`]( https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey ) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../types/JWSAlgorithm.md).

___

### headers

• `Optional` **headers**: [`Headers`]( https://developer.mozilla.org/en-US/docs/Web/API/Headers )

A Headers instance to additionally send with the HTTP Request(s) triggered by this function's invocation.

___

### signal

• `Optional` **signal**: [`AbortSignal`]( https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal ) \| () => [`AbortSignal`]( https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal )

An AbortSignal instance, or a factory returning one, to abort the HTTP Request(s) triggered by
this function's invocation.

**`example`** A 5000ms timeout AbortSignal for every request

```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
