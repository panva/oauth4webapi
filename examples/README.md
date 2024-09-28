## [💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

## Sponsor

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../sponsor/Auth0byOkta_dark.png">
  <source media="(prefers-color-scheme: light)" srcset="../sponsor/Auth0byOkta_light.png">
  <img height="65" align="left" alt="Auth0 by Okta" src="../sponsor/Auth0byOkta_light.png">
</picture> 

If you want to quickly add authentication to JavaScript apps, feel free to check out Auth0's JavaScript SDK and free plan. [Create an Auth0 account; it's free!][sponsor-auth0]<br><br>

## Examples

A collection of examples for the most common use cases.

- Authorization Code Flow (OAuth 2.0) - [source](oauth.ts)
- Authorization Code Flow (OpenID Connect) - [source](oidc.ts) | [diff](oidc.diff)
- Extensions
  - DPoP - [source](dpop.ts) | [diff](dpop.diff)
  - JWT Secured Authorization Request (JAR) - [source](jar.ts) | [diff](jar.diff)
  - JWT Secured Authorization Response Mode (JARM) - [source](jarm.ts) | [diff](jarm.diff)
  - Pushed Authorization Request (PAR) - [source](par.ts) | [diff](par.diff)
- Client Authentication
  - Client Secret in HTTP Body - [source](oauth.ts)
  - Client Secret in HTTP Authorization Header - [source](client_secret_basic.ts) | [diff](client_secret_basic.diff)
  - Private Key JWT Client Authentication - [source](private_key_jwt.ts) | [diff](private_key_jwt.diff)
  - Public Client - [source](public.ts) | [diff](public.diff)
- Other Grants
  - Client Credentials Grant - [source](client_credentials.ts)
  - Device Authorization Grant - [source](device_authorization_grant.ts)
  - Refresh Token Grant - [source](refresh_token.ts) | [diff](refresh_token.diff)
- FAPI
  - FAPI 1.0 Advanced - [source](fapi1-advanced.ts) | [diff](fapi1-advanced.diff)
  - FAPI 2.0 Security Profile - [source](fapi2.ts) | [diff](fapi2.diff)
  - FAPI 2.0 Message Signing - [source](fapi2-message-signing.ts) | [diff](fapi2-message-signing.diff)

[sponsor-auth0]: https://auth0.com/signup?utm_source=external_sites&utm_medium=panva&utm_campaign=devn_signup
