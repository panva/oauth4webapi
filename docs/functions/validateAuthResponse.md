[@panva/oauth4webapi](../README.md) / validateAuthResponse

# Function: validateAuthResponse

▸ **validateAuthResponse**(`as`, `client`, `parameters`, `expectedState?`): `CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)

TODO

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | `undefined` | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | `undefined` | Client Metadata |
| `parameters` | `URL` \| `URLSearchParams` | `undefined` | TODO |
| `expectedState` | `string` \| typeof [`expectNoState`](../variables/expectNoState.md) \| typeof [`skipStateCheck`](../variables/skipStateCheck.md) | `expectNoState` | Expected "state" parameter value |

#### Returns

`CallbackParameters` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)

TODO
