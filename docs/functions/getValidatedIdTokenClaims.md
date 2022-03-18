# Function: getValidatedIdTokenClaims

▸ **getValidatedIdTokenClaims**(`ref`): [`IDToken`](../interfaces/IDToken.md) \| `undefined`

Returns ID Token claims validated during [authorizationCodeGrantRequest](authorizationCodeGrantRequest.md) or
[refreshTokenGrantRequest](refreshTokenGrantRequest.md).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ref` | [`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md) \| [`OAuth2TokenEndpointResponse`](../interfaces/OAuth2TokenEndpointResponse.md) \| [`OpenIDTokenEndpointResponse`](../interfaces/OpenIDTokenEndpointResponse.md) | object previously resolved from [processAuthorizationCodeOpenIDResponse](processAuthorizationCodeOpenIDResponse.md), [refreshTokenGrantRequest](refreshTokenGrantRequest.md), or [processDeviceCodeResponse](processDeviceCodeResponse.md). If the "ref" object did not come from these methods, or didn't contain an ID Token, this function returns undefined. |

#### Returns

[`IDToken`](../interfaces/IDToken.md) \| `undefined`

JWT Claims Set from an ID Token, or undefined if there was no ID
Token returned in "ref".
