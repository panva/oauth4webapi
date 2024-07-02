# Function: getValidatedIdTokenClaims()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

## getValidatedIdTokenClaims(ref)

▸ **getValidatedIdTokenClaims**(`ref`): [`IDToken`](../interfaces/IDToken.md)

Returns ID Token claims validated during [processAuthorizationCodeOpenIDResponse](processAuthorizationCodeOpenIDResponse.md).

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ref` | [`OpenIDTokenEndpointResponse`](../interfaces/OpenIDTokenEndpointResponse.md) | Value previously resolved from [processAuthorizationCodeOpenIDResponse](processAuthorizationCodeOpenIDResponse.md). |

### Returns

[`IDToken`](../interfaces/IDToken.md)

JWT Claims Set from an ID Token.

## getValidatedIdTokenClaims(ref)

▸ **getValidatedIdTokenClaims**(`ref`): [`IDToken`](../interfaces/IDToken.md) \| `undefined`

Returns ID Token claims validated during [processRefreshTokenResponse](processRefreshTokenResponse.md) or
[processDeviceCodeResponse](processDeviceCodeResponse.md).

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ref` | [`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) | Value previously resolved from [processRefreshTokenResponse](processRefreshTokenResponse.md) or [processDeviceCodeResponse](processDeviceCodeResponse.md). |

### Returns

[`IDToken`](../interfaces/IDToken.md) \| `undefined`

JWT Claims Set from an ID Token, or undefined if there is no ID Token in `ref`.
