# Interface: DPoPOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Table of contents

### Properties

- [nonce](DPoPOptions.md#nonce)
- [privateKey](DPoPOptions.md#privatekey)
- [publicKey](DPoPOptions.md#publickey)

## Properties

### nonce

• `Optional` **nonce**: `string`

Server-Provided Nonce to use in the request. This option serves as an
override in case the self-correcting mechanism does not work with a
particular server. Previously received nonces will be used automatically.

___

### privateKey

• **privateKey**: `CryptoKey`

Private
[CryptoKey](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)
instance to sign the DPoP Proof JWT with.

Its algorithm must be compatible with a supported
[JWS "alg" Algorithm](../types/JWSAlgorithm.md).

___

### publicKey

• **publicKey**: `CryptoKey`

The public key corresponding to [DPoPOptions.privateKey](DPoPOptions.md#privatekey)
