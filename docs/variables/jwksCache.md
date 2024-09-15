# Variable: jwksCache

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **jwksCache**: unique `symbol`

DANGER ZONE - This option has security implications that must be understood, assessed for
applicability, and accepted before use. It is critical that the JSON Web Key Set cache only be
writable by your own code.

This option is intended for cloud computing runtimes that cannot keep an in memory cache between
their code's invocations. Use in runtimes where an in memory cache between requests is available
is not desirable.

When configured on an interface that extends [JWKSCacheOptions](../interfaces/JWKSCacheOptions.md), this applies to `options`
parameter for functions that may trigger HTTP requests to
[`as.jwks_uri`](../interfaces/AuthorizationServer.md#jwks_uri), this allows the passed in object to:

- Serve as an initial value for the JSON Web Key Set that the module would otherwise need to
  trigger an HTTP request for
- Have the JSON Web Key Set the function optionally ended up triggering an HTTP request for
  assigned to it as properties

The intended use pattern is:

- Before executing a function with [JWKSCacheOptions](../interfaces/JWKSCacheOptions.md) in its `options` parameter you pull the
  previously cached object from a low-latency key-value store offered by the cloud computing
  runtime it is executed on;
- Default to an empty object `{}` instead when there's no previously cached value;
- Pass it into the options interfaces that extend [JWKSCacheOptions](../interfaces/JWKSCacheOptions.md);
- Afterwards, update the key-value storage if the [`uat`](../interfaces/ExportedJWKSCache.md#uat) property of
  the object has changed.

## Example

```ts
import * as oauth from 'oauth4webapi'

// Prerequisites
let as!: oauth.AuthorizationServer
let request!: Request
let expectedAudience!: string

// Load JSON Web Key Set cache
const jwksCache: oauth.JWKSCacheInput = (await getPreviouslyCachedJWKS()) || {}
const { uat } = jwksCache

// Use JSON Web Key Set cache
const accessTokenClaims = await validateJwtAccessToken(as, request, expectedAudience, {
  [oauth.jwksCache]: jwksCache,
})

if (uat !== jwksCache.uat) {
  // Update JSON Web Key Set cache
  await storeNewJWKScache(jwksCache)
}
```
