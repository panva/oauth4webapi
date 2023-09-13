# Function: calculatePKCECodeChallenge

[💗 Help the project](https://github.com/sponsors/panva)

▸ **calculatePKCECodeChallenge**(`codeVerifier`): [`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

Calculates the PKCE `code_verifier` value to send with an authorization request using the S256
PKCE Code Challenge Method transformation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `codeVerifier` | `string` | `code_verifier` value generated e.g. from [generateRandomCodeVerifier](generateRandomCodeVerifier.md). |

#### Returns

[`Promise`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise )<`string`\>

**`See`**

[RFC 7636 - Proof Key for Code Exchange by OAuth Public Clients (PKCE)](https://www.rfc-editor.org/rfc/rfc7636.html#section-4)
