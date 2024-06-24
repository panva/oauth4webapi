# Interface: GenerateKeyPairOptions

[💗 Help the project](https://github.com/sponsors/panva)

## Properties

### crv?

• `optional` **crv**: `"Ed25519"` \| `"Ed448"`

(EdDSA algorithms only) The EdDSA sub-type. Default is `Ed25519`.

***

### extractable?

• `optional` **extractable**: `boolean`

Indicates whether or not the private key may be exported. Default is `false`.

***

### modulusLength?

• `optional` **modulusLength**: `number`

(RSA algorithms only) The length, in bits, of the RSA modulus. Default is `2048`.
