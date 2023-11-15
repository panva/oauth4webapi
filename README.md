# OAuth 2 / OpenID Connect for JavaScript Runtimes

This software provides a collection of routines that can be used to build client modules for OAuth 2.1, OAuth 2.0 with the latest Security Best Current Practices (BCP), and FAPI 2.0, as well as OpenID Connect where applicable. The primary goal of this software is to promote secure and up-to-date best practices while using only the capabilities common to both browser and non-browser JavaScript runtimes.

## Features

The following features are currently in scope and implemented in this software:

- Authorization Server Metadata discovery
- Authorization Code Flow (profiled under OpenID Connect 1.0, OAuth 2.0, OAuth 2.1, and FAPI 2.0), with PKCE
- Refresh Token, Device Authorization, and Client Credentials Grants
- Demonstrating Proof-of-Possession at the Application Layer (DPoP)
- Token Introspection and Revocation
- Pushed Authorization Requests (PAR)
- UserInfo and Protected Resource Requests
- Authorization Server Issuer Identification
- JWT Secured Introspection, Response Mode (JARM), Authorization Request (JAR), and UserInfo

## [Certification](https://openid.net/certification/faq/)

[<img width="96" height="50" align="right" src="https://user-images.githubusercontent.com/241506/166977513-7cd710a9-7f60-4944-aebe-a658e9f36375.png" alt="OpenID Certification">](#certification)

[Filip Skokan](https://github.com/panva) has certified that [this software](https://github.com/panva/oauth4webapi) conforms to the Basic RP Conformance Profile of the OpenID Connect™ protocol.

## [💗 Help the project](https://github.com/sponsors/panva)

## Dependencies: 0

`oauth4webapi` has no dependencies and it exports tree-shakeable ESM.

## [Documentation](docs/README.md)

## [Examples](examples/README.md)

**`example`** ESM import

```js
import * as oauth2 from 'oauth4webapi'
```

**`example`** Deno import

```js
import * as oauth2 from 'https://deno.land/x/oauth4webapi@v2.4.0/mod.ts'
```

- Authorization Code Flow - OpenID Connect [source](examples/code.ts), or plain OAuth 2 [source](examples/oauth.ts)
- Public Client Authorization Code Flow - [source](examples/public.ts) | [diff from code flow](examples/public.diff)
- Private Key JWT Client Authentication - [source](examples/private_key_jwt.ts) | [diff from code flow](examples/private_key_jwt.diff)
- DPoP - [source](examples/dpop.ts) | [diff from code flow](examples/dpop.diff)
- Pushed Authorization Request (PAR) - [source](examples/par.ts) | [diff from code flow](examples/par.diff)
- Client Credentials Grant - [source](examples/client_credentials.ts)
- Device Authorization Grant - [source](examples/device_authorization_grant.ts)
- FAPI 2.0 (Private Key JWT, PAR, DPoP) - [source](examples/fapi2.ts)
- FAPI 2.0 Message Signing (Private Key JWT, PAR, DPoP, JAR, JARM) - [source](examples/fapi2-message-signing.ts) | [diff](examples/fapi2-message-signing.diff)

## Supported Runtimes

The supported JavaScript runtimes include those that support the utilized Web API globals and standard built-in objects. These are _(but are not limited to)_:

- Browsers
- Bun
- Cloudflare Workers
- Deno
- Electron
- Node.js ([runtime flags may be needed](https://github.com/panva/oauth4webapi/issues/8))
- Vercel's Edge Runtime

## Out of scope

The following features are currently out of scope:

- CommonJS
- Implicit, Hybrid, and Resource Owner Password Credentials Flows
- Mutual-TLS Client Authentication and Certificate-Bound Access Tokens
- JSON Web Encryption (JWE)
- Automatic polyfills of any kind
