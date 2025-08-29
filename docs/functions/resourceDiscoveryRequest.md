# Function: resourceDiscoveryRequest()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **resourceDiscoveryRequest**(`resourceIdentifier`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Performs a protected resource metadata discovery.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `resourceIdentifier` | [`URL`](https://developer.mozilla.org/docs/Web/API/URL) | Protected resource's resource identifier to resolve the well-known discovery URI for |
| `options?` | [`HttpRequestOptions`](../interfaces/HttpRequestOptions.md)\<`"GET"`, `undefined`\> | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Response`](https://developer.mozilla.org/docs/Web/API/Response)\>

Resolves with a [Response](https://developer.mozilla.org/docs/Web/API/Response) to then invoke [processResourceDiscoveryResponse](processResourceDiscoveryResponse.md)
  with

## See

[RFC 9728 - OAuth 2.0 Protected Resource Metadata](https://www.rfc-editor.org/rfc/rfc9728.html#name-protected-resource-metadata-)
