# Variable: skipStateCheck

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• `const` **skipStateCheck**: unique `symbol`

DANGER ZONE - This option has security implications that must be understood, assessed for
applicability, and accepted before use.

Use this as a value to [validateAuthResponse](../functions/validateAuthResponse.md) `expectedState` parameter to skip the `state`
value check when you'll be validating such `state` value yourself instead. This should only be
done if you use a `state` parameter value that is integrity protected and bound to the browsing
session. One such mechanism to do so is described in an I-D
[draft-bradley-oauth-jwt-encoded-state-09](https://datatracker.ietf.org/doc/html/draft-bradley-oauth-jwt-encoded-state-09).
