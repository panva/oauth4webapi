# Function: ClientSecretPost()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **ClientSecretPost**(`clientSecret`): [`ClientAuth`](../interfaces/ClientAuth.md)

**`client_secret_post`** uses the HTTP request body to send `client_id` and `client_secret` as
`application/x-www-form-urlencoded` body parameters

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `clientSecret` | `string` |  |

## Returns

[`ClientAuth`](../interfaces/ClientAuth.md)

## Example

```ts
let clientSecret!: string

let clientAuth = oauth.ClientSecretPost(clientSecret)
```

## See

 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 - [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3)
 - [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
