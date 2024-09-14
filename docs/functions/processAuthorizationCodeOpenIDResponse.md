# Function: processAuthorizationCodeOpenIDResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processAuthorizationCodeOpenIDResponse**(`as`, `client`, `response`, `expectedNonce`?, `maxAge`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`OpenIDTokenEndpointResponse`](../interfaces/OpenIDTokenEndpointResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

(OpenID Connect only) Validates Authorization Code Grant [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one
coming from the [`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [authorizationCodeGrantRequest](authorizationCodeGrantRequest.md). |
| `expectedNonce`? | `string` \| *typeof* [`expectNoNonce`](../variables/expectNoNonce.md) | Expected ID Token `nonce` claim value. Default is [expectNoNonce](../variables/expectNoNonce.md). |
| `maxAge`? | `number` \| *typeof* [`skipAuthTimeCheck`](../variables/skipAuthTimeCheck.md) | ID Token [`auth_time`](../interfaces/IDToken.md#auth_time) claim value will be checked to be present and conform to the `maxAge` value. Use of this option is required if you sent a `max_age` parameter in an authorization request. Default is [`client.default_max_age`](../interfaces/Client.md#default_max_age) and falls back to [skipAuthTimeCheck](../variables/skipAuthTimeCheck.md). |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`OpenIDTokenEndpointResponse`](../interfaces/OpenIDTokenEndpointResponse.md) \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Resolves with an object representing the parsed successful response, or an object
  representing an OAuth 2.0 protocol style error. Use [isOAuth2Error](isOAuth2Error.md) to determine if an
  OAuth 2.0 error was returned.

## See

 - [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1)
 - [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth)
