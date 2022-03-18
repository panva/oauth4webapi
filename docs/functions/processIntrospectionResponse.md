# Function: processIntrospectionResponse

▸ **processIntrospectionResponse**(`as`, `client`, `response`, `options?`): `Promise`<[`IntrospectionResponse`](../interfaces/IntrospectionResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validates
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.introspection_endpoint`](../interfaces/AuthorizationServer.md#introspection_endpoint).

**`see`** [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)

**`see`** [draft-ietf-oauth-jwt-introspection-response-12 - JWT Response for OAuth Token Introspection](https://www.ietf.org/archive/id/draft-ietf-oauth-jwt-introspection-response-12.html#section-5)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `response` | `Response` | resolved value from [introspectionRequest](introspectionRequest.md) |
| `options?` | [`SignalledRequestOptions`](../interfaces/SignalledRequestOptions.md) | - |

#### Returns

`Promise`<[`IntrospectionResponse`](../interfaces/IntrospectionResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Object representing the parsed successful response, or an object
representing an OAuth 2.0 protocol style error. Use [isOAuth2Error](isOAuth2Error.md) to
determine if an OAuth 2.0 error was returned.
