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
import * as oauth from 'oauth4webapi'
import * as jose from 'jose'

// Prerequisites
let as!: oauth.AuthorizationServer
let key!: CryptoKey
let alg!: string
let enc!: string

const decoder = new TextDecoder()

const client: oauth.Client = {
  client_id: 'urn:example:client_id',
  async [oauth.jweDecrypt](jwe) {
    const { plaintext } = await compactDecrypt(jwe, key, {
      keyManagementAlgorithms: [alg],
      contentEncryptionAlgorithms: [enc],
    }).catch((cause) => {
      throw new oauth.OperationProcessingError('decryption failed', { cause })
    })

    return decoder.decode(plaintext)
  },
}

const params = await oauth.validateJwtAuthResponse(as, client, currentUrl)
```
