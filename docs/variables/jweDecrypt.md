# Variable: jweDecrypt

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **jweDecrypt**: unique `symbol`

Use to add support for decrypting JWEs the client encounters, namely

- Encrypted ID Tokens returned by the Token Endpoint
- Encrypted ID Tokens returned as part of FAPI 1.0 Advanced Detached Signature authorization
  responses
- Encrypted JWT UserInfo responses
- Encrypted JWT Introspection responses
- Encrypted JARM Responses

## Example

Decrypting JARM responses

```ts
import * as jose from 'jose'

let as!: oauth.AuthorizationServer
let client!: oauth.Client
let key!: oauth.CryptoKey
let alg!: string
let enc!: string
let currentUrl!: URL
let state!: string | undefined

let decoder = new TextDecoder()
let jweDecrypt: oauth.JweDecryptFunction = async (jwe) => {
  const { plaintext } = await jose
    .compactDecrypt(jwe, key, {
      keyManagementAlgorithms: [alg],
      contentEncryptionAlgorithms: [enc],
    })
    .catch((cause: unknown) => {
      throw new oauth.OperationProcessingError('decryption failed', { cause })
    })

  return decoder.decode(plaintext)
}

let params = await oauth.validateJwtAuthResponse(as, client, currentUrl, state, {
  [oauth.jweDecrypt]: jweDecrypt,
})
```
