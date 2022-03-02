[@panva/oauth4webapi](../README.md) / PrivateKey

# Interface: PrivateKey

Interface to pass an asymmetric private key and, optionally, its associated
JWK Key ID to be added as a `kid` JOSE Header Parameter.

## Table of contents

### Properties

- [key](PrivateKey.md#key)
- [kid](PrivateKey.md#kid)

## Properties

### key

• **key**: `CryptoKey`

An asymmetric private
[CryptoKey](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey).

Its algorithm must be compatible with a supported
[JWS "alg" Algorithm](../types/JWSAlgorithm.md).

___

### kid

• `Optional` **kid**: `string`

JWK Key ID to add to JOSE headers when this key is used. When not provided
no `kid` (JWK Key ID) will be added to the JOSE Header.
