# Function: processBackchannelAuthenticationGrantResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processBackchannelAuthenticationGrantResponse**(`as`, `client`, `response`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md)\>

Validates Backchannel Authentication Grant [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the
[`as.token\_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [backchannelAuthenticationGrantRequest](backchannelAuthenticationGrantRequest.md). |
| `options?` | [`ProcessTokenResponseOptions`](../interfaces/ProcessTokenResponseOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TokenEndpointResponse`](../interfaces/TokenEndpointResponse.md)\>

Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
  style errors are rejected using [ResponseBodyError](../classes/ResponseBodyError.md). WWW-Authenticate HTTP Header
  challenges are rejected with [WWWAuthenticateChallengeError](../classes/WWWAuthenticateChallengeError.md).

## See

[OpenID Connect Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0-final.html#token_request)
