# Variable: ~~nopkce~~

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **nopkce**: unique `symbol`

> [!WARNING]\
> This option has security implications that must be understood, assessed for applicability, and
> accepted before use.

Use this as a value to [authorizationCodeGrantRequest](../functions/authorizationCodeGrantRequest.md) `codeVerifier` parameter to skip the
use of PKCE.

## Deprecated

To make it stand out as something you shouldn't have the need to use as the use of
  PKCE is backwards compatible with authorization servers that don't support it and properly
  ignore unrecognized parameters.

## See

[RFC 7636 - Proof Key for Code Exchange (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html)
