# Function: PrivateKeyJwt()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **PrivateKeyJwt**(`clientPrivateKey`, `options`?): [`ClientAuth`](../interfaces/ClientAuth.md)

**`private_key_jwt`** uses the HTTP request body to send `client_id`, `client_assertion_type`,
and `client_assertion` as `application/x-www-form-urlencoded` body parameters. Digital signature
is used for the assertion's authenticity and integrity.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `clientPrivateKey` | [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey) \| [`PrivateKey`](../interfaces/PrivateKey.md) |  |
| `options`? | [`ModifyAssertionOptions`](../interfaces/ModifyAssertionOptions.md) | - |

## Returns

[`ClientAuth`](../interfaces/ClientAuth.md)

## Example

```ts
let key!: oauth.CryptoKey | oauth.PrivateKey

let clientAuth = oauth.PrivateKeyJwt(key)
```

## See

 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 - [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#ClientAuthentication)
