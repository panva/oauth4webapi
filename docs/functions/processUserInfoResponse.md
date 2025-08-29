# Function: processUserInfoResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processUserInfoResponse**(`as`, `client`, `expectedSubject`, `response`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`UserInfoResponse`](../interfaces/UserInfoResponse.md)\>

Validates [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the
[`as.userinfo\_endpoint`](../interfaces/AuthorizationServer.md#userinfo_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `expectedSubject` | `string` \| *typeof* [`skipSubjectCheck`](../variables/skipSubjectCheck.md) | Expected `sub` claim value. In response to OpenID Connect authentication requests, the expected subject is the one from the ID Token claims retrieved from [getValidatedIdTokenClaims](getValidatedIdTokenClaims.md). |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [userInfoRequest](userInfoRequest.md). |
| `options?` | [`JWEDecryptOptions`](../interfaces/JWEDecryptOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`UserInfoResponse`](../interfaces/UserInfoResponse.md)\>

Resolves with an object representing the parsed successful response. WWW-Authenticate
  HTTP Header challenges are rejected with [WWWAuthenticateChallengeError](../classes/WWWAuthenticateChallengeError.md).

## See

[OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0-errata2.html#UserInfo)
