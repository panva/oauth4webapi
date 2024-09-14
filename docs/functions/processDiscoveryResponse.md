# Function: processDiscoveryResponse()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **processDiscoveryResponse**(`expectedIssuerIdentifier`, `response`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AuthorizationServer`](../interfaces/AuthorizationServer.md)\>

Validates [Response](https://developer.mozilla.org/docs/Web/API/Response) instance to be one coming from the authorization server's well-known
discovery endpoint.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `expectedIssuerIdentifier` | [`URL`](https://developer.mozilla.org/docs/Web/API/URL) | Expected Issuer Identifier value. |
| `response` | [`Response`](https://developer.mozilla.org/docs/Web/API/Response) | Resolved value from [discoveryRequest](discoveryRequest.md). |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AuthorizationServer`](../interfaces/AuthorizationServer.md)\>

Resolves with the discovered Authorization Server Metadata.

## See

 - [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)
 - [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)
