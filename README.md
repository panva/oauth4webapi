# OAuth 2 / OpenID Connect Client for Web APIs runtime

This is a collection of bits and pieces upon which a more streamlined Client module may be written.

## In Scope & Implemented

- Authorization Server Metadata discovery
- OpenID Connect 1.0 and OAuth 2.0 Authorization Code Flow
- PKCE
- Refresh Token Grant
- Device Authorization Grant
- Client Credentials Grant
- Demonstrating Proof-of-Possession at the Application Layer (DPoP)
- Token Introspection
- JWT Token Introspection
- Token Revocation
- JWT Secured Authorization Response Mode (JARM)
- Confidential and Public Client
- JWT-Secured Authorization Request (JAR)
- Pushed Authorization Requests (PAR)
- UserInfo Requests (Bearer and DPoP)
- JWT UserInfo Responses
- Protected Resource Requests (Bearer and DPoP)

## [Documentation](./docs/README.md)

## [Examples](./examples/README.md)

**`example`** ESM import
```js
import * as oauth2 from '@panva/oauth4webapi'
```

**`example`** Deno import
```js
import * as oauth2 from 'https://deno.land/x/doauth/src/index.ts'
```

- Authorization Code Flow - OpenID Connect [source](./examples/code.ts), or plain OAuth 2.0 [source](./examples/oauth.ts)
- Private Key JWT Client Authentication - [source](./examples/private_key_jwt.ts) | [diff from code flow](./examples/private_key_jwt.diff)
- DPoP - [source](./examples/dpop.ts) | [diff from code flow](./examples/dpop.diff)
- Pushed Authorization Request (PAR) - [source](./examples/par.ts) | [diff from code flow](./examples/par.diff)
- JWT Authorization Response Mode (JARM) - [source](./examples/jarm.ts) | [diff from code flow](./examples/jarm.diff)
- Client Credentials Grant - [source](./examples/client_credentials.ts)
- Device Authorization Grant - [source](./examples/device_authorization_grant.ts)

## Runtime requirements

The supported javascript runtimes include ones that

- are reasonably up to date ECMAScript (targets ES2020, but may be further transpiled for compatibility)
- support required Web APIs
   - [Fetch API][] and its associated globals [fetch][], [Response][], [Headers][]
   - [Web Crypto API][] and its associated globals [crypto][], [CryptoKey][]
   - [TextEncoder][] and [TextDecoder][]
   - [atob][] and [btoa][]
   - [Uint8Array][]
   - [URLSearchParams][]

Other than browsers the supported runtimes are

- Deno (v1.20.1 and newer)
- Cloudflare Workers
- Vercel Edge Functions
- Next.js Middlewares
- Electron (renderer process)

Pending runtime support

- Node.js - once [fetch][] and [Web Crypto API][] are available as globals
- Electron (main process) - once [fetch][] and [Web Crypto API][] are available as globals

## Out of scope

- CommonJS
- OAuth 2.0 & OpenID Connect Implicit Flows
- OAuth 2.0 Resource Owner Password Credentials
- OpenID Connect Hybrid Flows
- MTLS (because fetch does not support client certificates)
- JWS HMAC Signed Responses
- JWE Encrypted Responses
- JWE Key Encryption with RSAES-PKCS1-v1_5
- JWE Key Wrapping with AES Key Wrap
- JWE Key Encryption with AES GCM
- JWE Key Encryption with PBES2
- JWE Direct Encryption with a Shared Symmetric Key

[Web Crypto API]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
[Fetch API]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/fetch
[OpenID Connect Discovery 1.0]: https://openid.net/specs/openid-connect-discovery-1_0.html
[OAuth 2.0 Authorization Server Metadata]: https://www.rfc-editor.org/rfc/rfc8414.html
[TextDecoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder
[TextEncoder]: https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
[btoa]: https://developer.mozilla.org/en-US/docs/Web/API/btoa
[atob]: https://developer.mozilla.org/en-US/docs/Web/API/atob
[Uint8Array]: https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array
[Response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[Headers]: https://developer.mozilla.org/en-US/docs/Web/API/Headers
[crypto]: https://developer.mozilla.org/en-US/docs/Web/API/crypto
[CryptoKey]: https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey
[URLSearchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
