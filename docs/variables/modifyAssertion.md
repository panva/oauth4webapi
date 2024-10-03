# Variable: modifyAssertion

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **modifyAssertion**: unique `symbol`

Use to mutate JWT header and payload before they are signed. Its intended use is working around
non-conform server behaviours, such as modifying JWT "aud" (audience) claims, or otherwise
changing fixed claims used by this library.

## Examples

Changing Private Key JWT client assertion audience issued from a string to an array

```ts
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let parameters!: URLSearchParams
let key!: oauth.CryptoKey | oauth.PrivateKey

let clientAuth = oauth.PrivateKeyJwt(key, {
  [oauth.modifyAssertion](header, payload) {
    payload.aud = [as.issuer, as.token_endpoint!]
  },
})

let response = await oauth.pushedAuthorizationRequest(as, client, clientAuth, parameters)
```

Changing Request Object issued by [issueRequestObject](../functions/issueRequestObject.md) to have an expiration of 5 minutes

```ts
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let parameters!: URLSearchParams
let key!: oauth.CryptoKey | oauth.PrivateKey

let request = await oauth.issueRequestObject(as, client, parameters, key, {
  [oauth.modifyAssertion](header, payload) {
    payload.exp = <number>payload.iat + 300
  },
})
```

Changing the `alg: "Ed25519"` back to `alg: "EdDSA"`

```ts
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let parameters!: URLSearchParams
let key!: oauth.CryptoKey | oauth.PrivateKey
let keyPair!: oauth.CryptoKeyPair

let remapEd25519: oauth.ModifyAssertionOptions = {
  [oauth.modifyAssertion]: (header) => {
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
