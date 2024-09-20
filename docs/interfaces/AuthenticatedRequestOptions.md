# Interface: AuthenticatedRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Properties

### clientPrivateKey?

• `optional` **clientPrivateKey**: [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey) \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../type-aliases/ClientAuthenticationMethod.md). Its algorithm must be compatible with
a supported [JWS `alg` Algorithm](../type-aliases/JWSAlgorithm.md).
