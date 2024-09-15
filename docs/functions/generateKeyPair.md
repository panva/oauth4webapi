# Function: generateKeyPair()

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

▸ **generateKeyPair**(`alg`, `options`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKeyPair`](https://developer.mozilla.org/docs/Web/API/CryptoKeyPair)\>

Generates a [CryptoKeyPair](https://developer.mozilla.org/docs/Web/API/CryptoKeyPair) for a given JWS `alg` Algorithm identifier.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `alg` | [`JWSAlgorithm`](../type-aliases/JWSAlgorithm.md) | Supported JWS `alg` Algorithm identifier. |
| `options`? | [`GenerateKeyPairOptions`](../interfaces/GenerateKeyPairOptions.md) | - |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKeyPair`](https://developer.mozilla.org/docs/Web/API/CryptoKeyPair)\>
