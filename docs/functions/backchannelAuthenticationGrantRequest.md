# Function: backchannelAuthenticationGrantRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **backchannelAuthenticationGrantRequest**(`as`, `client`, `clientAuthentication`, `authReqId`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs a Backchannel Authentication Grant request at the
[`as.token_endpoint`](../interfaces/AuthorizationServer.md#token_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `clientAuthentication` | [`ClientAuth`](../interfaces/ClientAuth.md) | Client Authentication Method. |
| `authReqId` | `string` | Unique identifier to identify the authentication request. This is the [`auth_req_id`](../interfaces/BackchannelAuthenticationResponse.md#auth_req_id) retrieved from [processBackchannelAuthenticationResponse](processBackchannelAuthenticationResponse.md). |
| `options`? | [`TokenEndpointRequestOptions`](../interfaces/TokenEndpointRequestOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Resolves with a [Response](https://developer.mozilla.org/docs/Web/API/Response) to then invoke
  [processBackchannelAuthenticationGrantResponse](processBackchannelAuthenticationGrantResponse.md) with

## See

 - [OpenID Connect Client-Initiated Backchannel Authentication](https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0-final.html#token_request)
 - [RFC 9449 - OAuth 2.0 Demonstrating Proof-of-Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449.html#name-dpop-access-token-request)
