# Function: backchannelAuthenticationRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **backchannelAuthenticationRequest**(`as`, `client`, `clientAuthentication`, `parameters`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs a Backchannel Authentication Request at the
[`as.backchannel\_authentication\_endpoint`](../interfaces/AuthorizationServer.md#backchannel_authentication_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `clientAuthentication` | [`ClientAuth`](../type-aliases/ClientAuth.md) | Client Authentication Method. |
| `parameters` | [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\> \| [`URLSearchParams`](https://developer.mozilla.org/docs/Web/API/URLSearchParams) \| `string`[][] | Backchannel Authentication Request parameters. |
| `options?` | [`BackchannelAuthenticationRequestOptions`](../interfaces/BackchannelAuthenticationRequestOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Resolves with a [Response](https://developer.mozilla.org/docs/Web/API/Response) to then invoke
  [processBackchannelAuthenticationResponse](processBackchannelAuthenticationResponse.md) with

## See

[OpenID Connect Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0-final.html#auth_request)
