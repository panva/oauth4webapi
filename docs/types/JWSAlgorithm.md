# Type alias: JWSAlgorithm

[💗 Help the project](https://github.com/sponsors/panva)

Ƭ **JWSAlgorithm**: ``"PS256"`` \| ``"ES256"`` \| ``"RS256"`` \| ``"EdDSA"`` \| ``"ES384"`` \| ``"PS384"`` \| ``"RS384"`` \| ``"ES512"`` \| ``"PS512"`` \| ``"RS512"``

Supported JWS `alg` Algorithm identifiers.

**`Example`**

CryptoKey algorithm for the `PS256`, `PS384`, or `PS512` JWS Algorithm Identifiers

```ts
interface RSAPSSAlgorithm extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: { name: 'SHA-256' | 'SHA-384' | 'SHA-512' }
}

interface PS256 extends RSAPSSAlgorithm {
  hash: { name: 'SHA-256' }
}

interface PS384 extends RSAPSSAlgorithm {
  hash: { name: 'SHA-384' }
}

interface PS512 extends RSAPSSAlgorithm {
  hash: { name: 'SHA-512' }
}
```

**`Example`**

CryptoKey algorithm for the `ES256`, `ES384`, or `ES512` JWS Algorithm Identifiers

```ts
interface ECDSAAlgorithm extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-256' | 'P-384' | 'P-521'
}

interface ES256 extends ECDSAAlgorithm {
  namedCurve: 'P-256'
}

interface ES384 extends ECDSAAlgorithm {
  namedCurve: 'P-384'
}

interface ES512 extends ECDSAAlgorithm {
  namedCurve: 'P-521'
}
```

**`Example`**

CryptoKey algorithm for the `RS256`, `RS384`, or `RS512` JWS Algorithm Identifiers

```ts
interface ECDSAAlgorithm extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: { name: 'SHA-256' | 'SHA-384' | 'SHA-512' }
}

interface RS256 extends ECDSAAlgorithm {
  hash: { name: 'SHA-256' }
}

interface RS384 extends ECDSAAlgorithm {
  hash: { name: 'SHA-384' }
}

interface RS512 extends ECDSAAlgorithm {
  hash: { name: 'SHA-512' }
}
```

**`Example`**

CryptoKey algorithm for the `EdDSA` JWS Algorithm Identifier (Experimental)

Runtime support for this algorithm is very limited, it depends on the [Secure Curves in the Web
Cryptography API](https://wicg.github.io/webcrypto-secure-curves/) proposal which is yet to be
widely adopted. If the proposal changes this implementation will follow up with a minor release.

```ts
interface EdDSA extends KeyAlgorithm {
  name: 'Ed25519' | 'Ed448'
}
```
