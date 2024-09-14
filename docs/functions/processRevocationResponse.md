# Function: processRevocationResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processRevocationResponse**(`response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validates [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the
[`as.revocation_endpoint`](../interfaces/AuthorizationServer.md#revocation_endpoint).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [revocationRequest](revocationRequest.md). |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Resolves with `undefined` when the request was successful, or an object representing an
  OAuth 2.0 protocol style error.

## See

[RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
