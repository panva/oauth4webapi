[@panva/oauth4webapi](../README.md) / JWSAlgorithm

# Type alias: JWSAlgorithm

Ƭ **JWSAlgorithm**: ``"PS256"`` \| ``"PS384"`` \| ``"PS512"`` \| ``"RS256"`` \| ``"RS384"`` \| ``"RS512"`` \| ``"ES256"`` \| ``"ES384"`` \| ``"ES512"``

Supported JWS "alg" Algorithm identifiers.

Compatibility notes:
- ES512 is not supported Safari 14 and older
- ES512 is not supported iOS/iPadOS 14 and older

**`example`** PS256 CryptoKey algorithm
```ts
interface Ps256Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: { name: 'SHA-256' }
}
```

**`example`** PS384 CryptoKey algorithm
```ts
interface Ps384Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: { name: 'SHA-384' }
}
```

**`example`** PS512 CryptoKey algorithm
```ts
interface Ps512Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: { name: 'SHA-512' }
}
```

**`example`** RS256 CryptoKey algorithm
```ts
interface Rs256Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: { name: 'SHA-256' }
}
```

**`example`** RS384 CryptoKey algorithm
```ts
interface Rs384Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: { name: 'SHA-384' }
}
```

**`example`** RS512 CryptoKey algorithm
```ts
interface Rs512Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: { name: 'SHA-512' }
}
```

**`example`** ES256 CryptoKey algorithm
```ts
interface Es256Algorithm extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-256'
}
```

**`example`** ES384 CryptoKey algorithm
```ts
interface Es384Algorithm extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-384'
}
```

**`example`** ES512 CryptoKey algorithm
```ts
interface Es512Algorithm extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-521'
}
```
