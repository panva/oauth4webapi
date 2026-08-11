# Function: generateKeyPair()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **generateKeyPair**(`alg`, `options?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKeyPair`](../interfaces/CryptoKeyPair.md)\>

Generates a [CryptoKeyPair](../interfaces/CryptoKeyPair.md) for a supported JWS `alg` identifier.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `alg` | `string` | Supported JWS `alg` Algorithm identifier. Must be a [supported JWS Algorithm](../type-aliases/JWSAlgorithm.md). |
| `options?` | [`GenerateKeyPairOptions`](../interfaces/GenerateKeyPairOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKeyPair`](../interfaces/CryptoKeyPair.md)\>
