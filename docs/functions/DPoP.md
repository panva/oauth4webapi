# Function: DPoP()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **DPoP**(`client`, `keyPair`, `options?`): [`DPoPHandle`](../interfaces/DPoPHandle.md)

Creates a DPoP handle that signs sender-constraining proofs with a [CryptoKeyPair](../interfaces/CryptoKeyPair.md) and
tracks server-issued nonces.

This wrapper / handle also keeps track of server-issued nonces, allowing requests to be retried
with a fresh nonce when the server indicates the need to use one. [isDPoPNonceError](isDPoPNonceError.md) can be
used to determine if a rejected error indicates the need to retry the request due to an
expired/missing nonce.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<[`Client`](../interfaces/Client.md), *typeof* [`clockSkew`](../variables/clockSkew.md)\> | - |
| `keyPair` | [`CryptoKeyPair`](../interfaces/CryptoKeyPair.md) | Public/private key pair to sign the DPoP Proof JWT with |
| `options?` | [`ModifyAssertionOptions`](../interfaces/ModifyAssertionOptions.md) | - |

## Returns

[`DPoPHandle`](../interfaces/DPoPHandle.md)

## Example

```ts
let client!: oauth.Client
let keyPair!: oauth.CryptoKeyPair

let DPoP = oauth.DPoP(client, keyPair)
```

## See

[RFC 9449 - OAuth 2.0 Demonstrating Proof of Possession (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html)
