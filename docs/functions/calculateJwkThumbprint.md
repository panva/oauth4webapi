# Function: calculateJwkThumbprint

[💗 Help the project](https://github.com/sponsors/panva)

▸ **calculateJwkThumbprint**(`key`): `Promise`<`string`\>

Calculates a base64url-encoded SHA-256 JWK Thumbprint.

**`see`** [RFC 7638 - JSON Web Key (JWK) Thumbprint](https://www.rfc-editor.org/rfc/rfc7638.html)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `CryptoKey` | A public extractable [CryptoKey](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey). |

#### Returns

`Promise`<`string`\>
