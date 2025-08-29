# Function: processResourceDiscoveryResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processResourceDiscoveryResponse**(`expectedResourceIdentifier`, `response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ResourceServer`](../interfaces/ResourceServer.md)\>

Validates [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the resource server's well-known
discovery endpoint.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `expectedResourceIdentifier` | [`URL`](https://developer.mozilla.org/docs/Web/API/URL) | Expected Resource Identifier value. |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [resourceDiscoveryRequest](resourceDiscoveryRequest.md) or from a general [fetch](https://developer.mozilla.org/docs/Web/API/Window/fetch) following [WWWAuthenticateChallengeParameters.resource\_metadata](../interfaces/WWWAuthenticateChallengeParameters.md#resource_metadata). |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ResourceServer`](../interfaces/ResourceServer.md)\>

Resolves with the discovered Resource Server Metadata.

## See

[RFC 9728 - OAuth 2.0 Protected Resource Metadata](https://www.rfc-editor.org/rfc/rfc9728.html#name-protected-resource-metadata-r)
