# Function: validateDetachedSignatureResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **validateDetachedSignatureResponse**(`as`, `client`, `parameters`, `expectedNonce`, `expectedState`?, `maxAge`?, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Same as [validateAuthResponse](validateAuthResponse.md) but for FAPI 1.0 Advanced Detached Signature authorization
responses.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `parameters` | [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| [`URL`](https://developer.mozilla.org/docs/Web/API/URL) | Authorization Response parameters as URLSearchParams or an instance of URL with parameters in a fragment/hash. |
| `expectedNonce` | `string` | Expected ID Token `nonce` claim value. |
| `expectedState`? | `string` \| *typeof* [`expectNoState`](../variables/expectNoState.md) | Expected `state` parameter value. Default is [expectNoState](../variables/expectNoState.md). |
| `maxAge`? | `number` \| *typeof* [`skipAuthTimeCheck`](../variables/skipAuthTimeCheck.md) | ID Token [`auth_time`](../interfaces/IDToken.md#auth_time) claim value will be checked to be present and conform to the `maxAge` value. Use of this option is required if you sent a `max_age` parameter in an authorization request. Default is [`client.default_max_age`](../interfaces/Client.md#default_max_age) and falls back to [skipAuthTimeCheck](../variables/skipAuthTimeCheck.md). |
| `options`? | [`ValidateSignatureOptions`](../interfaces/ValidateSignatureOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validated Authorization Response parameters or Authorization Error Response.

## See

[Financial-grade API Security Profile 1.0 - Part 2: Advanced](https://openid.net/specs/openid-financial-api-part-2-1_0.html#id-token-as-detached-signature)
