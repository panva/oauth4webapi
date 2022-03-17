[@panva/oauth4webapi](../README.md) / validateJwtAuthResponse

# Function: validateJwtAuthResponse

▸ **validateJwtAuthResponse**(`as`, `client`, `parameters`, `expectedState`, `options?`): `Promise`<`CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Same as [validateAuthResponse](validateAuthResponse.md) but for signed JARM responses.

**`see`** [openid-financial-api-jarm-ID1 - JWT Secured Authorization Response Mode for OAuth 2.0 (JARM)](https://openid.net/specs/openid-financial-api-jarm-ID1.html)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `parameters` | `URL` \| `URLSearchParams` | JARM authorization response |
| `expectedState` | `string` \| typeof [`expectNoState`](../variables/expectNoState.md) \| typeof [`skipStateCheck`](../variables/skipStateCheck.md) | Expected "state" parameter value |
| `options?` | [`SignalledRequestOptions`](../interfaces/SignalledRequestOptions.md) | - |

#### Returns

`Promise`<`CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validated Authorization Response parameters or Authorization Error Response.
