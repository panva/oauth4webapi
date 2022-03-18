[@panva/oauth4webapi](../README.md) / KeyManagementAlgorithm

# Type alias: KeyManagementAlgorithm

Ƭ **KeyManagementAlgorithm**: ``"ECDH-ES"`` \| ``"RSA-OAEP"`` \| ``"RSA-OAEP-256"`` \| ``"RSA-OAEP-384"`` \| ``"RSA-OAEP-512"``

Supported JWE "alg" Key Management Algorithm identifier.

Compatibility notes:
- ECDH-ES using NIST curve P-521 is not supported Safari 14 and older
- ECDH-ES using NIST curve P-521 is not supported iOS/iPadOS 14 and older

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

**`example`** RSA-OAEP-384 CryptoKey algorithm
```ts
interface RsaOaep384Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-OAEP'
  hash: { name: 'SHA-384' }
}
```

**`example`** RSA-OAEP-512 CryptoKey algorithm
```ts
interface RsaOaep512Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-OAEP'
  hash: { name: 'SHA-512' }
}
```

**`example`** ECDH-ES CryptoKey algorithm
```ts
interface EcdhEsAlgorithm extends EcKeyAlgorithm {
  name: 'ECDH'
  namedCurve: 'P-256' | 'P-384' | 'P-521'
}
```
