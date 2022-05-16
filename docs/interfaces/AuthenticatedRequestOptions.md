# Interface: AuthenticatedRequestOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [clientPrivateKey](AuthenticatedRequestOptions.md#clientprivatekey)

## Properties

### clientPrivateKey

• `Optional` **clientPrivateKey**: `CryptoKey` \| [`PrivateKey`](PrivateKey.md)

Private key to use for `private_key_jwt`
[client authentication](../types/ClientAuthenticationMethod.md).
Its algorithm must be compatible with a supported
[JWS `alg` Algorithm](../types/JWSAlgorithm.md).
