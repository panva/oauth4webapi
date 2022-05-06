# Function: generateKeyPair

[💗 Help the project](https://github.com/sponsors/panva)

▸ **generateKeyPair**(`alg`, `options?`): `Promise`<`CryptoKeyPair`\>

Generates a
[CryptoKeyPair](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair)
for a given JWS `alg` Algorithm identifier.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `alg` | [`JWSAlgorithm`](../types/JWSAlgorithm.md) | Supported JWS `alg` Algorithm identifier. |
| `options?` | [`GenerateKeyPairOptions`](../interfaces/GenerateKeyPairOptions.md) | - |

#### Returns

`Promise`<`CryptoKeyPair`\>
