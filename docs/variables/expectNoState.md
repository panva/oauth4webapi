# Variable: expectNoState

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **expectNoState**: unique `symbol`

Indicates that no authorization response `state` parameter is expected.

Use this as the [validateAuthResponse](../functions/validateAuthResponse.md) `expectedState` value when no `state` parameter was
sent with the authorization request.
