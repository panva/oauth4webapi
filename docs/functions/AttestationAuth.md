# Function: AttestationAuth()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **AttestationAuth**(`attestation`, `key`, `options`?): [`ClientAuth`](../type-aliases/ClientAuth.md)

**`attest_jwt_client_auth`** uses the HTTP request body to send only `client_id` as
`application/x-www-form-urlencoded` body parameter, `OAuth-Client-Attestation` HTTP Header field
to transmit a Client Attestation JWT issued to the client instance by its Client Attester, and
`OAuth-Client-Attestation-PoP` HTTP Header field to transmit a Proof of Possession (PoP) of its
Client Instance Key.

> [!NOTE]\
> This is an experimental feature.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attestation` | `string` | Client Attestation JWT issued to the client instance by its Client Attester. |
| `key` | [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey) | Client Instance Key |
| `options`? | [`ModifyAssertionOptions`](../interfaces/ModifyAssertionOptions.md) |  |

## Returns

[`ClientAuth`](../type-aliases/ClientAuth.md)

## Example

```ts
let key!: oauth.CryptoKey
let attestation!: string

let clientAuth = oauth.AttestationAuth(attestation, key)
```

## See

 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 - [draft-ietf-oauth-attestation-based-client-auth-05 - OAuth 2.0 Attestation-Based Client Authentication](https://www.ietf.org/archive/id/draft-ietf-oauth-attestation-based-client-auth-05.html)
