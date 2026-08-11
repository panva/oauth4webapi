// A lexical `const crypto` is not a property of `globalThis`, so the structural fallback is used.
import * as oauth from 'oauth4webapi'

declare global {
  const crypto: Crypto
}

type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

const _usesFallback: Equals<'hostMarker' extends keyof oauth.CryptoKey ? true : false, false> = true

// @ts-expect-error the fallback must not degrade to any
const _notAny: oauth.CryptoKey = 'definitely not a key'

declare const hostKey: CryptoKey
declare const oauthKey: oauth.CryptoKey
declare const oauthPair: oauth.CryptoKeyPair

const _toOauth: oauth.CryptoKey = hostKey
const _toHost: CryptoKey = oauthKey
const _toHostPair: CryptoKeyPair = oauthPair

crypto.subtle.exportKey('raw', oauthKey)
oauth.PrivateKeyJwt(hostKey)
