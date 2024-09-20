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

### \[jweDecrypt\]?

• `optional` **\[jweDecrypt\]**: [`JweDecryptFunction`](JweDecryptFunction.md)

See [jweDecrypt](../variables/jweDecrypt.md).

***

### authorization\_signed\_response\_alg?

• `optional` **authorization\_signed\_response\_alg**: [`JWSAlgorithm`](../type-aliases/JWSAlgorithm.md)

JWS `alg` algorithm required for signing authorization responses. When not configured the
default is to allow only [supported algorithms](../type-aliases/JWSAlgorithm.md) listed in
[`as.authorization_signing_alg_values_supported`](AuthorizationServer.md#authorization_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### client\_secret?

• `optional` **client\_secret**: `string`

Client secret.

***

### default\_max\_age?

• `optional` **default\_max\_age**: `number`

Default Maximum Authentication Age.

***

### id\_token\_signed\_response\_alg?

• `optional` **id\_token\_signed\_response\_alg**: `string`

JWS `alg` algorithm required for signing the ID Token issued to this Client. When not
configured the default is to allow only algorithms listed in
[`as.id_token_signing_alg_values_supported`](AuthorizationServer.md#id_token_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### introspection\_signed\_response\_alg?

• `optional` **introspection\_signed\_response\_alg**: `string`

JWS `alg` algorithm REQUIRED for signed introspection responses. When not configured the
default is to allow only algorithms listed in
[`as.introspection_signing_alg_values_supported`](AuthorizationServer.md#introspection_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.

***

### require\_auth\_time?

• `optional` **require\_auth\_time**: `boolean`

Boolean value specifying whether the [`auth_time`](IDToken.md#auth_time) Claim in the ID Token
is REQUIRED. Default is `false`.

***

### token\_endpoint\_auth\_method?

• `optional` **token\_endpoint\_auth\_method**: [`ClientAuthenticationMethod`](../type-aliases/ClientAuthenticationMethod.md)

Client [authentication method](../type-aliases/ClientAuthenticationMethod.md) for the client's authenticated
requests. Default is `client_secret_basic`.

***

### use\_mtls\_endpoint\_aliases?

• `optional` **use\_mtls\_endpoint\_aliases**: `boolean`

Indicates the requirement for a client to use mutual TLS endpoint aliases defined by the AS
where present. Default is `false`.

When combined with [customFetch](../variables/customFetch.md) (to use a Fetch API implementation that supports client
certificates) this can be used to target FAPI 2.0 profiles that utilize Mutual-TLS for either
client authentication or sender constraining. FAPI 1.0 Advanced profiles that use PAR and JARM
can also be targetted.

#### Examples

(Node.js) Using [nodejs/undici](https://github.com/nodejs/undici) for Mutual-TLS Client
Authentication and Certificate-Bound Access Tokens support.

```ts
import * as undici from 'undici'
import * as oauth from 'oauth4webapi'

// Prerequisites
let as!: oauth.AuthorizationServer
let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
let params!: URLSearchParams
let key!: string // PEM-encoded key
let cert!: string // PEM-encoded certificate

const agent = new undici.Agent({ connect: { key, cert } })

const response = await oauth.pushedAuthorizationRequest(as, client, params, {
  [oauth.customFetch]: (...args) =>
    undici.fetch(args[0], { ...args[1], dispatcher: agent }),
})
```

(Deno) Using Deno.createHttpClient API for Mutual-TLS Client Authentication and
Certificate-Bound Access Tokens support.

```ts
import * as oauth from 'oauth4webapi'

// Prerequisites
let as!: oauth.AuthorizationServer
let client!: oauth.Client & { use_mtls_endpoint_aliases: true }
let params!: URLSearchParams
let key!: string // PEM-encoded key
let cert!: string // PEM-encoded certificate

const agent = Deno.createHttpClient({ key, cert })

const response = await oauth.pushedAuthorizationRequest(as, client, params, {
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
[`as.userinfo_signing_alg_values_supported`](AuthorizationServer.md#userinfo_signing_alg_values_supported)
and fall back to `RS256` when the authorization server metadata is not set.
