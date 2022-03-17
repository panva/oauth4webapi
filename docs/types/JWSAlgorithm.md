# Type alias: JWSAlgorithm

[💗 Help the project](https://github.com/sponsors/panva)

Ƭ **JWSAlgorithm**: ``"PS256"`` \| ``"ES256"`` \| ``"RS256"`` \| ``"EdDSA"``

Supported JWS `alg` Algorithm identifiers.

**`example`** CryptoKey algorithm for the `PS256` JWS Algorithm Identifier

```ts
interface Ps256Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: { name: 'SHA-256' }
}
```

**`example`** CryptoKey algorithm for the `ES256` JWS Algorithm Identifier

```ts
interface Es256Algorithm extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-256'
}
```

**`example`** CryptoKey algorithm for the `RS256` JWS Algorithm Identifier

```ts
interface Rs256Algorithm extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: { name: 'SHA-256' }
}
```

**`example`** CryptoKey algorithm for the `EdDSA` JWS Algorithm Identifier (Experimental)

Runtime support for this algorithm is very limited, it depends on the [Secure Curves in the Web
Cryptography API](https://wicg.github.io/webcrypto-secure-curves/) proposal which is yet to be
widely adopted. If the proposal changes this implementation will follow up with a minor patch
release.

```ts
interface EdDSAAlgorithm extends KeyAlgorithm {
  name: 'Ed25519'
}
```
