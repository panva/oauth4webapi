# Interface: AuthenticatedRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Properties

### \[useMtlsAlias\]?

• `optional` **\[useMtlsAlias\]**: `boolean`

See [useMtlsAlias](../variables/useMtlsAlias.md).

***

### clientPrivateKey?

• `optional` **clientPrivateKey**: [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../type-aliases/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../type-aliases/JWSAlgorithm.md).
