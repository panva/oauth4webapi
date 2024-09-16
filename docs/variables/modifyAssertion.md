# Variable: modifyAssertion

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **modifyAssertion**: unique `symbol`

Use to mutate JWT header and payload before they are signed. Its intended use is working around
non-conform server behaviours, such as modifying JWT "aud" (audience) claims, or otherwise
changing fixed claims used by this library.

## Examples

Changing Private Key JWT client assertion audience issued from an array to a string

```ts
import * as oauth from 'oauth4webapi'

// Prerequisites
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let parameters!: URLSearchParams
let clientPrivateKey!: CryptoKey

const response = await oauth.pushedAuthorizationRequest(as, client, parameters, {
  clientPrivateKey: {
    key: clientPrivateKey,
    [oauth.modifyAssertion](header, payload) {
      payload.aud = as.issuer
    },
  },
})
```

Changing Request Object issued by [issueRequestObject](../functions/issueRequestObject.md) to have an expiration of 5 minutes

```ts
import * as oauth from 'oauth4webapi'

// Prerequisites
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let parameters!: URLSearchParams
let jarPrivateKey!: CryptoKey

const request = await oauth.issueRequestObject(as, client, parameters, {
  key: jarPrivateKey,
  [oauth.modifyAssertion](header, payload) {
    payload.exp = <number>payload.iat + 300
  },
})
```
