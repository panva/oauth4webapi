[@panva/oauth4webapi](../README.md) / deviceAuthorizationRequest

# Function: deviceAuthorizationRequest

▸ **deviceAuthorizationRequest**(`as`, `client`, `parameters`, `options?`): `Promise`<`Response`\>

Performs a Device Authorization Request at the
[`as.device_authorization_endpoint`](../interfaces/AuthorizationServer.md#device_authorization_endpoint).

**`see`** [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `parameters` | `URLSearchParams` | device authorization request parameters |
| `options?` | [`DeviceAuthorizationRequestOptions`](../interfaces/DeviceAuthorizationRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
