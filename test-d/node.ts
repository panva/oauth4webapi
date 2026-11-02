import type * as oauth from 'oauth4webapi'
import type { JsonWebKeyInput, webcrypto } from 'node:crypto'

type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

/* Pin both assignment directions for Node's key input and Web Crypto JWK types without exposing a
 * catch-all index to oauth4webapi consumers. */
{
  const _nodeToOauth: oauth.JWK = {} as JsonWebKeyInput['key']
  const _oauthToNode: JsonWebKeyInput['key'] = {} as oauth.JWK
  const _nodeWebToOauth: oauth.JWK = {} as webcrypto.JsonWebKey
  const _oauthToNodeWeb: webcrypto.JsonWebKey = {} as oauth.JWK
  const _noCatchAll: Equals<string extends keyof oauth.JWK ? true : false, false> = true
}

/* Node's RequestInit declares duplex as the literal "half". This assignment rejects a future
 * widening to string while the equality assertion also rejects accidentally dropping the member. */
{
  type Options = oauth.CustomFetchOptions<'POST', URLSearchParams>
  const _duplex: Equals<Options['duplex'], 'half' | undefined> = true
  const _requestInit: RequestInit = {} as Options
}

const _isHostCryptoKey: Equals<oauth.CryptoKey, webcrypto.CryptoKey> = true

// @ts-expect-error `any` would accept this
const _notAny: oauth.CryptoKey = 'definitely not a key'

declare const hostKey: webcrypto.CryptoKey
declare const oauthKey: oauth.CryptoKey

const _toOauth: oauth.CryptoKey = hostKey
const _toHost: webcrypto.CryptoKey = oauthKey
