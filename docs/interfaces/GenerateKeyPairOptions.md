# Interface: GenerateKeyPairOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [crv](GenerateKeyPairOptions.md#crv)
- [extractable](GenerateKeyPairOptions.md#extractable)
- [modulusLength](GenerateKeyPairOptions.md#moduluslength)

## Properties

### crv

• `Optional` **crv**: ``"Ed25519"`` \| ``"Ed448"``

(EdDSA algorithms only) The EdDSA sub-type. Default is `Ed25519`.

___

### extractable

• `Optional` **extractable**: `boolean`

Indicates whether or not the private key may be exported. Default is `false`.

___

### modulusLength

• `Optional` **modulusLength**: `number`

(RSA algorithms only) The length, in bits, of the RSA modulus. Default is `2048`.
