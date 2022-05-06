# Function: processDeviceAuthorizationResponse

[💗 Help the project](https://github.com/sponsors/panva)

▸ **processDeviceAuthorizationResponse**(`as`, `client`, `response`): `Promise`<[`DeviceAuthorizationResponse`](../interfaces/DeviceAuthorizationResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validates
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.device_authorization_endpoint`](../interfaces/AuthorizationServer.md#device_authorization_endpoint).

**`see`** [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628.html#section-3.1)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `response` | `Response` | Resolved value from [deviceAuthorizationRequest](deviceAuthorizationRequest.md). |

#### Returns

`Promise`<[`DeviceAuthorizationResponse`](../interfaces/DeviceAuthorizationResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Resolves with an object representing the parsed successful response, or an object
representing an OAuth 2.0 protocol style error. Use [isOAuth2Error](isOAuth2Error.md) to
determine if an OAuth 2.0 error was returned.
