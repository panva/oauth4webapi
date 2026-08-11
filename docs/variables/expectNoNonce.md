# Variable: expectNoNonce

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **expectNoNonce**: unique `symbol`

Indicates that no ID Token `nonce` claim is expected.

Use this as the [processAuthorizationCodeResponse](../functions/processAuthorizationCodeResponse.md) `oidc.expectedNonce` value when no
`nonce` parameter was sent with the authorization request.
