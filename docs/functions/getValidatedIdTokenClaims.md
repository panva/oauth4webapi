# Function: getValidatedIdTokenClaims()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **getValidatedIdTokenClaims**(`ref`): `undefined` \| [`IDToken`](../interfaces/IDToken.md)

Returns ID Token Claims Set from a [TokenEndpointResponse](../interfaces/TokenEndpointResponse.md) processed by e.g.
[processAuthorizationCodeResponse](processAuthorizationCodeResponse.md). To optionally validate the ID Token Signature use
[validateApplicationLevelSignature](validateApplicationLevelSignature.md).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ref` | [`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) | [TokenEndpointResponse](../interfaces/TokenEndpointResponse.md) previously resolved from e.g. [processAuthorizationCodeResponse](processAuthorizationCodeResponse.md) |

## Returns

`undefined` \| [`IDToken`](../interfaces/IDToken.md)

JWT Claims Set from an ID Token, or undefined if there is no ID Token in `ref`.
