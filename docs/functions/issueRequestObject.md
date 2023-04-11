# Function: issueRequestObject

[💗 Help the project](https://github.com/sponsors/panva)

▸ **issueRequestObject**(`as`, `client`, `parameters`, `privateKey`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

Generates a signed JWT-Secured Authorization Request (JAR).

**`see`** [RFC 9101 - The OAuth 2.0 Authorization Framework: JWT-Secured Authorization Request (JAR)](https://www.rfc-editor.org/rfc/rfc9101.html#name-request-object-2)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `as` | [`AuthorizationServer`](../interfaces/AuthorizationServer.md) | Authorization Server Metadata. |
| `client` | [`Client`](../interfaces/Client.md) | Client Metadata. |
| `parameters` | [`URLSearchParams`]( https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams ) | - |
| `privateKey` | [`CryptoKey`]( https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey ) \| [`PrivateKey`](../interfaces/PrivateKey.md) | Private key to sign the Request Object with. |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>
