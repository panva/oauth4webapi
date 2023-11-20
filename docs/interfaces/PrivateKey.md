# Interface: PrivateKey

[💗 Help the project](https://github.com/sponsors/panva)

Interface to pass an asymmetric private key and, optionally, its associated JWK Key ID to be
added as a `kid` JOSE Header Parameter.

## Table of contents

### Properties

- [key](PrivateKey.md#key)
- [kid](PrivateKey.md#kid)

## Properties

### key

• **key**: [`CryptoKey`]( https://developer.mozilla.org/docs/Web/API/CryptoKey )

An asymmetric private CryptoKey.

Its algorithm must be compatible with a supported [JWS `alg` Algorithm](../types/JWSAlgorithm.md).

___

### kid

• `Optional` **kid**: `string`

JWK Key ID to add to JOSE headers when this key is used. When not provided no `kid` (JWK Key
ID) will be added to the JOSE Header.
