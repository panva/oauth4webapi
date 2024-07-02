# Type Alias: ClientAuthenticationMethod

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• **ClientAuthenticationMethod**: `"client_secret_basic"` \| `"client_secret_post"` \| `"private_key_jwt"` \| `"none"`

Supported Client Authentication Methods.

- **`client_secret_basic`** (default) uses the HTTP `Basic` authentication scheme to send
  [`client_id`](../interfaces/Client.md#client_id) and [`client_secret`](../interfaces/Client.md#client_secret) in an
  `Authorization` HTTP Header.
- **`client_secret_post`** uses the HTTP request body to send [`client_id`](../interfaces/Client.md#client_id)
  and [`client_secret`](../interfaces/Client.md#client_secret) as `application/x-www-form-urlencoded` body
  parameters.
- **`private_key_jwt`** uses the HTTP request body to send [`client_id`](../interfaces/Client.md#client_id),
  `client_assertion_type`, and `client_assertion` as `application/x-www-form-urlencoded` body
  parameters. The `client_assertion` is signed using a private key supplied as an
  [options parameter](../interfaces/AuthenticatedRequestOptions.md#clientprivatekey).
- **`none`** (public client) uses the HTTP request body to send only
  [`client_id`](../interfaces/Client.md#client_id) as `application/x-www-form-urlencoded` body parameter.

## See

 - [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3)
 - [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
