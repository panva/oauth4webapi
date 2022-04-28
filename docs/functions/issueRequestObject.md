# Function: issueRequestObject

▸ **issueRequestObject**(`as`, `client`, `parameters`, `privateKey`): `Promise`<`string`\>

Generates JWT-Secured Authorization Request (JAR) that is either signed, or
signed and encrypted.

**`see`** [RFC 9101 - The OAuth 2.0 Authorization Framework: JWT-Secured Authorization Request (JAR)](https://www.rfc-editor.org/rfc/rfc9101.html#name-request-object-2)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata |
| `parameters` | `URLSearchParams` | - |
| `privateKey` | `CryptoKey` \| [`PrivateKey`](../interfaces/PrivateKey.md) | Private key to sign the Request Object with. |

#### Returns

`Promise`<`string`\>
