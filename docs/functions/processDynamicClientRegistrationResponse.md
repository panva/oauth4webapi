# Function: processDynamicClientRegistrationResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processDynamicClientRegistrationResponse**(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`OmitSymbolProperties`](../type-aliases/OmitSymbolProperties.md)\<[`Client`](../interfaces/Client.md)\>\>

Validates [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the
[`as.registration\_endpoint`](../interfaces/AuthorizationServer.md#registration_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [dynamicClientRegistrationRequest](dynamicClientRegistrationRequest.md). |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`OmitSymbolProperties`](../type-aliases/OmitSymbolProperties.md)\<[`Client`](../interfaces/Client.md)\>\>

Resolves with an object representing the parsed successful response. OAuth 2.0 protocol
  style errors are rejected using [ResponseBodyError](../classes/ResponseBodyError.md). WWW-Authenticate HTTP Header
  challenges are rejected with [WWWAuthenticateChallengeError](../classes/WWWAuthenticateChallengeError.md).

## See

 - [RFC 7591 - OAuth 2.0 Dynamic Client Registration Protocol (DCR)](https://www.rfc-editor.org/rfc/rfc7591.html#section-3.2)
 - [OpenID Connect Dynamic Client Registration 1.0 (DCR)](https://openid.net/specs/openid-connect-registration-1_0-errata2.html#RegistrationResponse)
