# Function: ClientSecretJwt()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **ClientSecretJwt**(`clientSecret`, `options?`): [`ClientAuth`](../type-aliases/ClientAuth.md)

**`client_secret_jwt`** uses the HTTP request body to send `client_id`, `client_assertion_type`,
and `client_assertion` as `application/x-www-form-urlencoded` body parameters. HMAC is used for
the assertion's authenticity and integrity.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `clientSecret` | `string` |  |
| `options?` | [`ModifyAssertionOptions`](../interfaces/ModifyAssertionOptions.md) |  |

## Returns

[`ClientAuth`](../type-aliases/ClientAuth.md)

## Example

```ts
let clientSecret!: string

let clientAuth = oauth.ClientSecretJwt(clientSecret)
```

## See

 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 - [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
