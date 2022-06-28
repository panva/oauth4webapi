# Function: calculatePKCECodeChallenge

[💗 Help the project](https://github.com/sponsors/panva)

▸ **calculatePKCECodeChallenge**(`codeVerifier`): `Promise`<`string`\>

Calculates the PKCE `code_verifier` value to send with an authorization request using the S256
PKCE Code Challenge Method transformation.

**`see`** [RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `codeVerifier` | `string` | `code_verifier` value generated e.g. from [generateRandomCodeVerifier](generateRandomCodeVerifier.md). |

#### Returns

`Promise`<`string`\>
