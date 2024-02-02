# Variable: useMtlsAlias

[💗 Help the project](https://github.com/sponsors/panva)

• `Const` **useMtlsAlias**: typeof [`useMtlsAlias`](useMtlsAlias.md)

When combined with [customFetch](customFetch.md) (to use a Fetch API implementation that supports client
certificates) this can be used to target FAPI 2.0 profiles that utilize Mutual-TLS for either
client authentication or sender constraining. FAPI 1.0 Advanced profiles that use PAR and JARM
can also be targetted.

When configured on an interface that extends [UseMTLSAliasOptions](../interfaces/UseMTLSAliasOptions.md) this makes the client
prioritize an endpoint URL present in
[`as.mtls_endpoint_aliases`](../interfaces/AuthorizationServer.md#mtls_endpoint_aliases).

**`Example`**

(Node.js) Using [nodejs/undici](https://github.com/nodejs/undici) for Mutual-TLS Client
Authentication and Certificate-Bound Access Tokens support.

```js
import * as undici from 'undici'
import * as oauth from 'oauth4webapi'

const response = await oauth.pushedAuthorizationRequest(as, client, params, {
  [oauth.useMtlsAlias]: true,
  [oauth.customFetch]: (...args) => {
    return undici.fetch(args[0], {
      ...args[1],
      dispatcher: new undici.Agent({
        connect: {
          key: clientKey,
          cert: clientCertificate,
        },
      }),
    })
  },
})
```

**`Example`**

(Deno) Using Deno.createHttpClient API for Mutual-TLS Client Authentication and Certificate-Bound
Access Tokens support. This is currently (Jan 2023) locked behind the --unstable command line
flag.

```js
import * as oauth from 'oauth4webapi'

const agent = Deno.createHttpClient({
  certChain: clientCertificate,
  privateKey: clientKey,
})

const response = await oauth.pushedAuthorizationRequest(as, client, params, {
  [oauth.useMtlsAlias]: true,
  [oauth.customFetch]: (...args) => {
    return fetch(args[0], {
      ...args[1],
      client: agent,
    })
  },
})
```

**`See`**

[RFC 8705 - OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens](https://www.rfc-editor.org/rfc/rfc8705.html)
