# Function: validateJwtAuthResponse

▸ **validateJwtAuthResponse**(`as`, `client`, `parameters`, `expectedState?`, `options?`): `Promise`<`CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Same as [validateAuthResponse](validateAuthResponse.md) but for signed JARM responses.

**`see`** [openid-financial-api-jarm-ID1 - JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)](https://openid.net/specs/openid-financial-api-jarm-ID1.html)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | `undefined` | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | `undefined` | Client Metadata |
| `parameters` | `URL` \| `URLSearchParams` | `undefined` | JARM authorization response |
| `expectedState` | `string` \| typeof [`expectNoState`](../variables/expectNoState.md) \| typeof [`skipStateCheck`](../variables/skipStateCheck.md) | `expectNoState` | Expected "state" parameter value |
| `options?` | [`HttpRequestOptions`](../interfaces/HttpRequestOptions.md) | `undefined` | - |

#### Returns

`Promise`<`CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validated Authorization Response parameters or Authorization Error Response.
