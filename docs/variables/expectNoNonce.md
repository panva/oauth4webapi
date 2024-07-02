# Variable: expectNoNonce

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **expectNoNonce**: unique `symbol`

Use this as a value to [processAuthorizationCodeOpenIDResponse](../functions/processAuthorizationCodeOpenIDResponse.md) `expectedNonce` parameter to
indicate no `nonce` ID Token claim value is expected, i.e. no `nonce` parameter value was sent
with the authorization request.
