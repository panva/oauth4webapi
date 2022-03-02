[@panva/oauth4webapi](../README.md) / PublicKey

# Interface: PublicKey

Interface to pass an asymmetric public key and, optionally, its associated
JWK Key ID to be added as a `kid` JOSE Header Parameter.

## Table of contents

### Properties

- [key](PublicKey.md#key)
- [kid](PublicKey.md#kid)

## Properties

### key

• **key**: `CryptoKey`

An asymmetric public
[CryptoKey](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey).

Its algorithm must be compatible with a supported
[JWE "alg" Key Management Algorithm](../types/KeyManagementAlgorithm.md).

___

### kid

• `Optional` **kid**: `string`

JWK Key ID to add to JOSE headers when this key is used. When not provided
no `kid` (JWK Key ID) will be added to the JOSE Header.
