[@panva/oauth4webapi](../README.md) / processAuthorizationCodeOAuth2Response

# Function: processAuthorizationCodeOAuth2Response

▸ **processAuthorizationCodeOAuth2Response**(`as`, `client`, `response`): `Promise`<[`OAuth2TokenEndpointResponse`](../interfaces/OAuth2TokenEndpointResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

(OAuth 2.0 without OpenID Connect only) Validates Authorization Code Grant
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

**`see`** [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `response` | `Response` | resolved value from [authorizationCodeGrantRequest](authorizationCodeGrantRequest.md) |

#### Returns

`Promise`<[`OAuth2TokenEndpointResponse`](../interfaces/OAuth2TokenEndpointResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Object representing the parsed successful response, or an object
representing an OAuth 2.0 protocol style error. Use [isOAuth2Error](isOAuth2Error.md) to
determine if an OAuth 2.0 error was returned.
