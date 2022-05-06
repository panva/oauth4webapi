# Function: processRevocationResponse

[💗 Help the project](https://github.com/sponsors/panva)

▸ **processRevocationResponse**(`response`): `Promise`<`undefined` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

Validates
[Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
to be one coming from the
[`as.revocation_endpoint`](../interfaces/AuthorizationServer.md#revocation_endpoint).

**`see`** [RFC 7009 - OAuth 2.0 Token Revocation](https://www.rfc-editor.org/rfc/rfc7009.html#section-2)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `response` | `Response` | resolved value from [revocationRequest](revocationRequest.md) |

#### Returns

`Promise`<`undefined` \| [`OAuth2Error`](../interfaces/OAuth2Error.md)\>

`undefined` when the request was successful, or an object
representing an OAuth 2.0 protocol style error.
