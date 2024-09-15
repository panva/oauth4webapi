# Type Alias: JWSAlgorithm

[💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

***

• **JWSAlgorithm**: `"PS256"` \| `"ES256"` \| `"RS256"` \| `"EdDSA"` \| `"ES384"` \| `"PS384"` \| `"RS384"` \| `"ES512"` \| `"PS512"` \| `"RS512"`

Supported JWS `alg` Algorithm identifiers.

## Examples

[CryptoKey.algorithm](https://developer.mozilla.org/docs/Web/API/CryptoKey/algorithm) for the `PS256`, `PS384`, or `PS512` JWS Algorithm Identifiers

```ts
interface PS256 extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: 'SHA-256'
}

interface PS384 extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: 'SHA-384'
}

interface PS512 extends RsaHashedKeyAlgorithm {
  name: 'RSA-PSS'
  hash: 'SHA-512'
}
```

[CryptoKey.algorithm](https://developer.mozilla.org/docs/Web/API/CryptoKey/algorithm) for the `ES256`, `ES384`, or `ES512` JWS Algorithm Identifiers

```ts
interface ES256 extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-256'
}

interface ES384 extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-384'
}

interface ES512 extends EcKeyAlgorithm {
  name: 'ECDSA'
  namedCurve: 'P-521'
}
```

[CryptoKey.algorithm](https://developer.mozilla.org/docs/Web/API/CryptoKey/algorithm) for the `RS256`, `RS384`, or `RS512` JWS Algorithm Identifiers

```ts
interface RS256 extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: 'SHA-256'
}

interface RS384 extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: 'SHA-384'
}

interface RS512 extends RsaHashedKeyAlgorithm {
  name: 'RSASSA-PKCS1-v1_5'
  hash: 'SHA-512'
}
```

[CryptoKey.algorithm](https://developer.mozilla.org/docs/Web/API/CryptoKey/algorithm) for the `EdDSA` JWS Algorithm Identifier (Experimental)

Runtime support for this algorithm is limited, it depends on the [Secure Curves in the Web
Cryptography API](https://wicg.github.io/webcrypto-secure-curves/) proposal which is yet to be
widely adopted. If the proposal changes this implementation will follow up with a minor release.

```ts
interface EdDSA extends KeyAlgorithm {
  name: 'Ed25519' | 'Ed448'
}
```
