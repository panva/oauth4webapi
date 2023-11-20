# Function: generateKeyPair

[💗 Help the project](https://github.com/sponsors/panva)

▸ **generateKeyPair**(`alg`, `options?`): [`Promise`]( https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`CryptoKeyPair`\>

Generates a CryptoKeyPair for a given JWS `alg` Algorithm identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `alg` | [`JWSAlgorithm`](../types/JWSAlgorithm.md) | Supported JWS `alg` Algorithm identifier. |
| `options?` | [`GenerateKeyPairOptions`](../interfaces/GenerateKeyPairOptions.md) | - |

#### Returns

[`Promise`]( https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise )\<`CryptoKeyPair`\>
