[@panva/oauth4webapi](../README.md) / processClientCredentialsResponse

# Function: processClientCredentialsResponse

▸ **processClientCredentialsResponse**(`as`, `client`, `response`): `Promise`<[`ClientCredentialsGrantResponse`](../interfaces/ClientCredentialsGrantResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validates Client Credentials Grant
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

**`see`** [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `response` | `Response` | resolved value from [clientCredentialsGrantRequest](clientCredentialsGrantRequest.md) |

#### Returns

`Promise`<[`ClientCredentialsGrantResponse`](../interfaces/ClientCredentialsGrantResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Object representing the parsed successful response, or an object
representing an OAuth 2.0 protocol style error. Use [isOAuth2Error](isOAuth2Error.md) to
determine if an OAuth 2.0 error was returned.
