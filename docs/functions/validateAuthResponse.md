[@panva/oauth4webapi](../README.md) / validateAuthResponse

# Function: validateAuthResponse

▸ **validateAuthResponse**(`as`, `client`, `parameters`, `expectedState?`): `CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)

Validates an OAuth 2.0 Authorization Response or Authorization Error Response
message returned from the authorization server's [`as.authorization_endpoint`](../interfaces/AuthorizationServer.md#authorization_endpoint).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | `undefined` | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | `undefined` | Client Metadata |
| `parameters` | `URL` \| `URLSearchParams` | `undefined` | Authorization response |
| `expectedState` | `string` \| typeof [`expectNoState`](../variables/expectNoState.md) \| typeof [`skipStateCheck`](../variables/skipStateCheck.md) | `expectNoState` | Expected "state" parameter value |

#### Returns

`CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)

Validated Authorization Response parameters or Authorization Error Response.
