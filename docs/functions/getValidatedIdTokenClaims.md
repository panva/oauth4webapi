# Function: getValidatedIdTokenClaims

[💗 Help the project](https://github.com/sponsors/panva)

▸ **getValidatedIdTokenClaims**(`ref`): [`IDToken`](../interfaces/IDToken.md)

Returns ID Token claims validated during [processAuthorizationCodeOpenIDResponse](processAuthorizationCodeOpenIDResponse.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [`OpenIDTokenEndpointResponse`](../interfaces/OpenIDTokenEndpointResponse.md) | Value previously resolved from [processAuthorizationCodeOpenIDResponse](processAuthorizationCodeOpenIDResponse.md). |

#### Returns

[`IDToken`](../interfaces/IDToken.md)

JWT Claims Set from an ID Token.

▸ **getValidatedIdTokenClaims**(`ref`): [`IDToken`](../interfaces/IDToken.md) \| `undefined`

Returns ID Token claims validated during [processRefreshTokenResponse](processRefreshTokenResponse.md) or
[processDeviceCodeResponse](processDeviceCodeResponse.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) | Value previously resolved from [processRefreshTokenResponse](processRefreshTokenResponse.md) or   [processDeviceCodeResponse](processDeviceCodeResponse.md). |

#### Returns

[`IDToken`](../interfaces/IDToken.md) \| `undefined`

JWT Claims Set from an ID Token, or undefined if there is no ID Token in `ref`.
