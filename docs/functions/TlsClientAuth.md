# Function: TlsClientAuth()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **TlsClientAuth**(): [`ClientAuth`](../type-aliases/ClientAuth.md)

**`tls_client_auth`** uses the HTTP request body to send only `client_id` as
`application/x-www-form-urlencoded` body parameter and the mTLS key and certificate is configured
through [customFetch](../variables/customFetch.md).

```ts
let clientAuth = oauth.TlsClientAuth()
```

## Returns

[`ClientAuth`](../type-aliases/ClientAuth.md)

## See

 - [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
 - [RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication (PKI Mutual-TLS Method)](https://www.rfc-editor.org/rfc/rfc8705.html#name-pki-mutual-tls-method)
