# Function: processDiscoveryResponse

[💗 Help the project](https://github.com/sponsors/panva)

▸ **processDiscoveryResponse**(`expectedIssuerIdentifier`, `response`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`AuthorizationServer`](../interfaces/AuthorizationServer.md)\>

Validates Response instance to be one coming from the authorization server's well-known discovery
endpoint.

**`see`** [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)

**`see`** [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `expectedIssuerIdentifier` | [`URL`]( https://developer.mozilla.org/en-US/docs/Web/API/URL ) | Expected Issuer Identifier value. |
| `response` | [`Response`]( https://developer.mozilla.org/en-US/docs/Web/API/Response ) | Resolved value from [discoveryRequest](discoveryRequest.md). |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<[`AuthorizationServer`](../interfaces/AuthorizationServer.md)\>

Resolves with the discovered Authorization Server Metadata.
