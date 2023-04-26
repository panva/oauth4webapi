# OAuth 2 / OpenID Connect for Web Platform API JavaScript runtimes

This software is a collection of routines upon which framework-specific client modules may be written. Its objective is to support and, where possible, enforce secure and current best practices using only capabilities common to Browser and Non-Browser JavaScript-based runtime environments.

Target profiles of this software are OAuth 2.1, OAuth 2.0 complemented by the latest Security BCP, and FAPI 2.0. Where applicable OpenID Connect is also supported.

## In Scope & Implemented

- Authorization Server Metadata discovery
- Authorization Code Flow (profiled under OpenID Connect 1.0, OAuth 2.0, OAuth 2.1, and FAPI 2.0), PKCE
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

## [Documentation](docs/README.md)

## [Examples](examples/README.md)

**`example`** ESM import

```js
import * as oauth2 from 'oauth4webapi'
```

**`example`** Deno import

```js
import * as oauth2 from 'https://deno.land/x/oauth4webapi@v2.3.0/mod.ts'
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

The supported JavaScript runtimes include ones that support the utilized Web API globals and standard built-in objects

These are _(this is not an exhaustive list)_:
- Browsers
- Bun
- Cloudflare Workers
- Deno
- Electron
- Node.js ([runtime flags may be needed](https://github.com/panva/oauth4webapi/issues/8))
- Vercel's Edge Runtime

## Out of scope

- CommonJS
- Implicit, Hybrid, and Resource Owner Password Credentials Flows
- Mutual-TLS Client Authentication and Certificate-Bound Access Tokens
- JSON Web Encryption (JWE)
- Automatic polyfills of any kind
