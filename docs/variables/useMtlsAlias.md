# Variable: useMtlsAlias

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **useMtlsAlias**: unique `symbol`

When combined with [customFetch](customFetch.md) (to use a Fetch API implementation that supports client
certificates) this can be used to target FAPI 2.0 profiles that utilize Mutual-TLS for either
client authentication or sender constraining. FAPI 1.0 Advanced profiles that use PAR and JARM
can also be targetted.

When configured on an interface that extends [UseMTLSAliasOptions](../interfaces/UseMTLSAliasOptions.md) this makes the client
prioritize an endpoint URL present in
[`as.mtls_endpoint_aliases`](../interfaces/AuthorizationServer.md#mtls_endpoint_aliases).

## Examples

(Node.js) Using [nodejs/undici](https://github.com/nodejs/undici) for Mutual-TLS Client
Authentication and Certificate-Bound Access Tokens support.

```ts
import * as undici from 'undici'
import * as oauth from 'oauth4webapi'

// Prerequisites
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let params!: URLSearchParams
let key!: string // PEM-encoded key
let cert!: string // PEM-encoded certificate

const agent = new undici.Agent({ connect: { key, cert } })

const response = await oauth.pushedAuthorizationRequest(as, client, params, {
  [oauth.useMtlsAlias]: true,
  [oauth.customFetch]: (...args) => undici.fetch(args[0], { ...args[1], dispatcher: agent }),
})
```

(Deno) Using Deno.createHttpClient API for Mutual-TLS Client Authentication and Certificate-Bound
Access Tokens support.

```ts
import * as oauth from 'oauth4webapi'

// Prerequisites
let as!: oauth.AuthorizationServer
let client!: oauth.Client
let params!: URLSearchParams
let key!: string // PEM-encoded key
let cert!: string // PEM-encoded certificate

const agent = Deno.createHttpClient({ key, cert })

const response = await oauth.pushedAuthorizationRequest(as, client, params, {
  [oauth.useMtlsAlias]: true,
  [oauth.customFetch]: (...args) => fetch(args[0], { ...args[1], client: agent }),
})
```

## See

[RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens](https://www.rfc-editor.org/rfc/rfc8705.html)
