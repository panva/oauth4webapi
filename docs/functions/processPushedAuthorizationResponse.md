[@panva/oauth4webapi](../README.md) / processPushedAuthorizationResponse

# Function: processPushedAuthorizationResponse

▸ **processPushedAuthorizationResponse**(`as`, `client`, `response`): `Promise`<[`PushedAuthorizationResponse`](../interfaces/PushedAuthorizationResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validates
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.pushed_authorization_request_endpoint`](../interfaces/AuthorizationServer.md#pushed_authorization_request_endpoint).

**`see`** [RFC 9126 - OAuth 2.0 Pushed Authorization Requests](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `response` | `Response` | resolved value from [pushedAuthorizationRequest](pushedAuthorizationRequest.md) |

#### Returns

`Promise`<[`PushedAuthorizationResponse`](../interfaces/PushedAuthorizationResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Object representing the parsed successful response, or an object
representing an OAuth 2.0 protocol style error. Use [isOAuth2Error](isOAuth2Error.md) to
determine if an OAuth 2.0 error was returned.
