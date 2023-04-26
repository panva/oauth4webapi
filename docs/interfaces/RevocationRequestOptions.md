# Interface: RevocationRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [additionalParameters](RevocationRequestOptions.md#additionalparameters)
- [clientPrivateKey](RevocationRequestOptions.md#clientprivatekey)
- [headers](RevocationRequestOptions.md#headers)
- [signal](RevocationRequestOptions.md#signal)

## Properties

### additionalParameters

• `Optional` **additionalParameters**: [`Record`]( https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type )<`string`, `string`\> \| [`URLSearchParams`]( https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams ) \| `string`[][]

Any additional parameters to send. This cannot override existing parameter values.

___

### clientPrivateKey

• `Optional` **clientPrivateKey**: [`CryptoKey`]( https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey ) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../types/JWSAlgorithm.md).

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

**`example`** A 5000ms timeout AbortSignal for every request

```js
const signal = () => AbortSignal.timeout(5_000) // Note: AbortSignal.timeout may not yet be available in all runtimes.
```
