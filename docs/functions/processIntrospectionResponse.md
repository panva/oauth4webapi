# Function: processIntrospectionResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processIntrospectionResponse**(`as`, `client`, `response`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`IntrospectionResponse`](../interfaces/IntrospectionResponse.md)\>

Validates [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the
[`as.introspection_endpoint`](../interfaces/AuthorizationServer.md#introspection_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [introspectionRequest](introspectionRequest.md). |
| `options`? | [`JWEDecryptOptions`](../interfaces/JWEDecryptOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`IntrospectionResponse`](../interfaces/IntrospectionResponse.md)\>

Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
  style errors are rejected using [ResponseBodyError](../classes/ResponseBodyError.md). WWW-Authenticate HTTP Header
  challenges are rejected with [WWWAuthenticateChallengeError](../classes/WWWAuthenticateChallengeError.md).

## See

 - [RFC 7662 - OAuth 2.0 Token Introspection](https://www.rfc-editor.org/rfc/rfc7662.html#section-2)
 - [RFC 9701 - JWT Response for OAuth Token Introspection](https://www.rfc-editor.org/rfc/rfc9701.html#section-5)
