# Variable: modifyAssertion

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **modifyAssertion**: unique `symbol`

Provides a hook for mutating a JWT header and payload immediately before signing.

Its intended use is working around non-conforming server behavior, such as modifying JWT `aud`
(audience) claims or otherwise changing fixed claims used by this module.

## Example

Changing the `alg: "Ed25519"` back to `alg: "EdDSA"`

```ts
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let parameters!: URLSearchParams
let key!: oauth.CryptoKey | oauth.PrivateKey
let keyPair!: oauth.CryptoKeyPair

let remapEd25519: oauth.ModifyAssertionOptions = {
  [oauth.modifyAssertion]: (header, _payload) => {
    if (header.alg === 'Ed25519') {
      header.alg = 'EdDSA'
    }
  },
}

// For JAR
oauth.issueRequestObject(as, client, parameters, key, remapEd25519)

// For Private Key JWT
oauth.PrivateKeyJwt(key, remapEd25519)

// For DPoP
oauth.DPoP(client, keyPair, remapEd25519)
```
