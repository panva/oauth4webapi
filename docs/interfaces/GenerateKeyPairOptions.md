# Interface: GenerateKeyPairOptions

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Properties

### crv?

• `optional` **crv**: `"Ed25519"` \| `"Ed448"`

(EdDSA algorithm only) The EdDSA sub-type. Default is `Ed25519`.

***

### extractable?

• `optional` **extractable**: `boolean`

Indicates whether or not the private key may be exported. Default is `false`.

***

### modulusLength?

• `optional` **modulusLength**: `number`

(RSA algorithms only) The length, in bits, of the RSA modulus. Default is `2048`.
