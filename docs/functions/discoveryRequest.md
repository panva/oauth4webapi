[@panva/oauth4webapi](../README.md) / discoveryRequest

# Function: discoveryRequest

▸ **discoveryRequest**(`issuerIdentifier`, `options?`): `Promise`<`Response`\>

Performs an authorization server metadata discovery using one of two
algorithms.

- "oidc" (default) with the issuer identifier URL as input and target url
transformation algorithm as defined by OpenID Connect Discovery 1.0.
- "oauth2" with the issuer identifier URL as input and target url
transformation algorithm as defined by RFC 8414.

The difference between these two algorithms is in their handling of path
components in the issuer identifier.

**`see`** [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html#section-3)

**`see`** [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `issuerIdentifier` | `URL` | Issuer identifier to resolve the well-known discovery URI for |
| `options?` | [`DiscoveryRequestOptions`](../interfaces/DiscoveryRequestOptions.md) | - |

#### Returns

`Promise`<`Response`\>

Resolves with
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)'s
[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
