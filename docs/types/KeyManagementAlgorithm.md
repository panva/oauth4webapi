# Type alias: KeyManagementAlgorithm

Ƭ **KeyManagementAlgorithm**: ``"ECDH-ES"`` \| ``"RSA-OAEP"`` \| ``"RSA-OAEP-256"``

Supported JWE "alg" Key Management Algorithm identifier.

**`example`** ECDH-ES CryptoKey algorithm
```ts
interface EcdhEsAlgorithm extends EcKeyAlgorithm {
  name: 'ECDH'
  namedCurve: 'P-256'
}
```

**`example`** RSA-OAEP CryptoKey algorithm
```ts
interface RsaOaepAlgorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-OAEP'
  hash: { name: 'SHA-1' }
}
```

**`example`** RSA-OAEP-256 CryptoKey algorithm
```ts
interface RsaOaep256Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-OAEP'
  hash: { name: 'SHA-256' }
}
```
