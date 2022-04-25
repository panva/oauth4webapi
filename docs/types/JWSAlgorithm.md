# Type alias: JWSAlgorithm

Ƭ **JWSAlgorithm**: ``"PS256"`` \| ``"ES256"`` \| ``"RS256"``

Supported JWS "alg" Algorithm identifiers.

**`example`** PS256 CryptoKey algorithm
```ts
interface Ps256Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: { name: 'SHA-256' }
}
```

**`example`** ES256 CryptoKey algorithm
```ts
interface Es256Algorithm extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-256'
}
```

**`example`** RS256 CryptoKey algorithm
```ts
interface Rs256Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: { name: 'SHA-256' }
}
```
