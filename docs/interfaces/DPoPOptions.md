# Interface: DPoPOptions

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## Properties

### privateKey

• **privateKey**: [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey)

Private CryptoKey instance to sign the DPoP Proof JWT with.

Its algorithm must be compatible with a supported [JWS `alg` Algorithm](../type-aliases/JWSAlgorithm.md).

***

### publicKey

• **publicKey**: [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey)

The public key corresponding to [DPoPOptions.privateKey](DPoPOptions.md#privatekey).

***

### \[modifyAssertion\]?

• `optional` **\[modifyAssertion\]**: [`ModifyAssertionFunction`](ModifyAssertionFunction.md)

Use to modify the DPoP Proof JWT right before it is signed.

#### See

[modifyAssertion](../variables/modifyAssertion.md)

***

### nonce?

• `optional` **nonce**: `string`

Server-Provided Nonce to use in the request. This option serves as an override in case the
self-correcting mechanism does not work with a particular server. Previously received nonces
will be used automatically.
