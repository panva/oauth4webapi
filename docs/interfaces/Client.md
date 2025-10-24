# Interface: Client

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

Recognized Client Metadata that have an effect on the exposed functionality.

## See

[IANA OAuth Client Registration Metadata registry](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#client-metadata)

## Indexable

\[`metadata`: `string`\]: [`JsonValue`](../type-aliases/JsonValue.md) \| `undefined`

## Properties

### client\_id

• **client\_id**: `string`

Client identifier.

***

### \[clockSkew\]?

• `optional` **\[clockSkew\]**: `number`

See [clockSkew](../variables/clockSkew.md).

***

### \[clockTolerance\]?

• `optional` **\[clockTolerance\]**: `number`

See [clockTolerance](../variables/clockTolerance.md).

***

### authorization\_signed\_response\_alg?

• `optional` **authorization\_signed\_response\_alg**: `string`

JWS `alg` algorithm required for signing authorization responses. When not configured the
default is to allow only algorithms listed in
[`as.authorization\_signing\_alg\_values\_supported`](AuthorizationServer.md#authorization_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### default\_max\_age?

• `optional` **default\_max\_age**: `number`

Default Maximum Authentication Age.

***

### id\_token\_signed\_response\_alg?

• `optional` **id\_token\_signed\_response\_alg**: `string`

JWS `alg` algorithm required for signing the ID Token issued to this Client. When not
configured the default is to allow only algorithms listed in
[`as.id\_token\_signing\_alg\_values\_supported`](AuthorizationServer.md#id_token_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### introspection\_signed\_response\_alg?

• `optional` **introspection\_signed\_response\_alg**: `string`

JWS `alg` algorithm REQUIRED for signed introspection responses. When not configured the
default is to allow only algorithms listed in
[`as.introspection\_signing\_alg\_values\_supported`](AuthorizationServer.md#introspection_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### require\_auth\_time?

• `optional` **require\_auth\_time**: `boolean`

Boolean value specifying whether the [`auth\_time`](IDToken.md#auth_time) Claim in the ID Token
is REQUIRED. Default is `false`.

***

### use\_mtls\_endpoint\_aliases?

• `optional` **use\_mtls\_endpoint\_aliases**: `boolean`

Indicates the requirement for a client to use mutual TLS endpoint aliases defined by the AS
where present. Default is `false`.

When combined with [customFetch](../variables/customFetch.md) (to use a Fetch API implementation that supports client
certificates) this can be used to target security profiles that utilize Mutual-TLS for either
client authentication or sender constraining.

#### Examples

(Node.js) Using [nodejs/undici](https://github.com/nodejs/undici) for Mutual-TLS Client
Authentication and Certificate-Bound Access Tokens support.

```ts
import * as undici from 'undici'

let as!: oauth.AuthorizationServer
let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
let params!: URLSearchParams
let key!: string // PEM-encoded key
let cert!: string // PEM-encoded certificate

let clientAuth = oauth.TlsClientAuth()
let agent = new undici.Agent({ connect: { key, cert } })

let response = await oauth.pushedAuthorizationRequest(as, client, clientAuth, params, {
  // @ts-ignore
  [oauth.customFetch]: (...args) =>
    undici.fetch(args[0], { ...args[1], dispatcher: agent }),
})
```

(Deno) Using Deno.createHttpClient API for Mutual-TLS Client Authentication and
Certificate-Bound Access Tokens support.

```ts
let as!: oauth.AuthorizationServer
let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
let params!: URLSearchParams
let key!: string // PEM-encoded key
let cert!: string // PEM-encoded certificate

let clientAuth = oauth.TlsClientAuth()
// @ts-ignore
let agent = Deno.createHttpClient({ key, cert })

let response = await oauth.pushedAuthorizationRequest(as, client, clientAuth, params, {
  // @ts-ignore
  [oauth.customFetch]: (...args) => fetch(args[0], { ...args[1], client: agent }),
})
```

#### See

[RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens](https://www.rfc-editor.org/rfc/rfc8705.html)

***

### userinfo\_signed\_response\_alg?

• `optional` **userinfo\_signed\_response\_alg**: `string`

JWS `alg` algorithm REQUIRED for signing UserInfo Responses. When not configured the default is
to allow only algorithms listed in
[`as.userinfo\_signing\_alg\_values\_supported`](AuthorizationServer.md#userinfo_signing_alg_values_supported)
and fail otherwise.
