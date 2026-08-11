# Function: getValidatedIdTokenClaims()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **getValidatedIdTokenClaims**(`ref`): [`IDToken`](../interfaces/IDToken.md) \| `undefined`

Returns validated ID Token claims from a processed [TokenEndpointResponse](../interfaces/TokenEndpointResponse.md), or `undefined`
when it contains no ID Token.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ref` | [`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) | [TokenEndpointResponse](../interfaces/TokenEndpointResponse.md) previously resolved from e.g. [processAuthorizationCodeResponse](processAuthorizationCodeResponse.md) |

## Returns

[`IDToken`](../interfaces/IDToken.md) \| `undefined`

JWT Claims Set from an ID Token, or undefined if there is no ID Token in `ref`.
