# Interface: DPoPSigner

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

A DPoP signing key managed outside Web Crypto, such as a hardware-backed key.

## Methods

### sign()

▸ **sign**(`input`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) \| [`Uint8Array`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)\<`ArrayBufferLike`\>\>

Signs the exact JWS Signing Input bytes with the corresponding private key and algorithm. The
input is not pre-hashed. Return the raw JWS signature, not its base64url encoding. ECDSA
signatures must use the IEEE P1363 (r || s) format, not ASN.1 DER. Throwing or rejecting
prevents the request from being sent.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`Uint8Array`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)\<[`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)\> |

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) \| [`Uint8Array`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)\<`ArrayBufferLike`\>\>

## Properties

### publicKey

• **publicKey**: [`CryptoKey`](https://developer.mozilla.org/docs/Web/API/CryptoKey)

Extractable public key corresponding to the signing key. Its algorithm determines the JWS
algorithm used for the proof.
