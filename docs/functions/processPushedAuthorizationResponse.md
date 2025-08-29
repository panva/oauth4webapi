# Function: processPushedAuthorizationResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processPushedAuthorizationResponse**(`as`, `client`, `response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PushedAuthorizationResponse`](../interfaces/PushedAuthorizationResponse.md)\>

Validates [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the
[`as.pushed\_authorization\_request\_endpoint`](../interfaces/AuthorizationServer.md#pushed_authorization_request_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [pushedAuthorizationRequest](pushedAuthorizationRequest.md). |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`PushedAuthorizationResponse`](../interfaces/PushedAuthorizationResponse.md)\>

Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
  style errors are rejected using [ResponseBodyError](../classes/ResponseBodyError.md). WWW-Authenticate HTTP Header
  challenges are rejected with [WWWAuthenticateChallengeError](../classes/WWWAuthenticateChallengeError.md).

## See

[RFC 9126 - OAuth 2.0 Pushed Authorization Requests (PAR)](https://www.rfc-editor.org/rfc/rfc9126.html#name-pushed-authorization-reques)
