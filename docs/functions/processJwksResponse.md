# Function: processJwksResponse

▸ **processJwksResponse**(`response`): `Promise`<[`JsonWebKeySet`](../interfaces/JsonWebKeySet.md)\>

Validates
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.jwks_uri`](../interfaces/AuthorizationServer.md#jwks_uri).

**`see`** [JWK Set Format](https://www.rfc-editor.org/rfc/rfc7517.html#section-5)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `response` | `Response` | resolved value from [jwksRequest](jwksRequest.md) |

#### Returns

`Promise`<[`JsonWebKeySet`](../interfaces/JsonWebKeySet.md)\>

Object representing the parsed successful response
