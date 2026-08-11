// Type-level regression tests. Nothing here runs; the assertion is that `tsc -p test-d` compiles.
//
// Positive assertions use Equals<A, B>, which fails to compile unless the two types are mutually
// assignable. Negative assertions use @ts-expect-error, which fails to compile when the error it
// claims goes away. Run via `npm run typecheck:types`.
import type * as oauth from 'oauth4webapi'
import type { JWK as JoseJWK } from 'jose'

type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

/* JWK remains bidirectionally assignable with the DOM and jose shapes while enumerating every
 * supported member instead of accepting arbitrary parameters through an index signature. */
{
  type ExpectedJWKMember =
    keyof JsonWebKey | 'kid' | 'priv' | 'pub' | 'x5c' | 'x5t' | 'x5t#S256' | 'x5u'

  const _members: Equals<keyof oauth.JWK, ExpectedJWKMember> = true

  const _domToOauth: oauth.JWK = {} as JsonWebKey
  const _oauthToDom: JsonWebKey = {} as oauth.JWK
  const _joseToOauth: oauth.JWK = {} as JoseJWK
  const _oauthToJose: JoseJWK = {} as oauth.JWK

  // @ts-expect-error arbitrary extension parameters are not part of the JWK contract
  const _noCatchAll: oauth.JWK = { extension_parameter: true }
}

/* CryptoKey must alias the host runtime's CryptoKey, never a competing nominal type, and must not
 * silently degrade to `any` - `any` would make both assertions vacuously pass, so pin it. */
{
  const _isHostCryptoKey: Equals<oauth.CryptoKey, CryptoKey> = true
  // @ts-expect-error `any` would accept this
  const _notAny: oauth.CryptoKey = 'definitely not a key'
}

declare const pair: oauth.CryptoKeyPair

const _privateKey: CryptoKey = pair.privateKey
const _publicKey: CryptoKey = pair.publicKey
