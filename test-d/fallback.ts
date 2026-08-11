// Selects the CryptoKey structural fallback by compiling without DOM or Node ambient types.
import * as oauth from 'oauth4webapi'

declare global {
  interface AbortSignal {}
  interface Headers {}
  interface ReadableStream<R = any> {}
  interface Request {}
  interface Response {}
  interface URL {}
  interface URLSearchParams {}

  abstract class CryptoKey {
    readonly type: string
    readonly extractable: boolean
    readonly algorithm: { name: string }
    readonly usages: string[]
  }
}

type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

const _algorithm: Equals<oauth.CryptoKey['algorithm'], { name: string }> = true
const _extractable: Equals<oauth.CryptoKey['extractable'], boolean> = true
const _type: Equals<oauth.CryptoKey['type'], string> = true
const _usages: Equals<oauth.CryptoKey['usages'], string[]> = true

// @ts-expect-error the fallback must not degrade to any
const _notAny: oauth.CryptoKey = 'definitely not a key'

declare const hostKey: CryptoKey
declare const oauthKey: oauth.CryptoKey

const _toOauth: oauth.CryptoKey = hostKey
const _toHost: CryptoKey = oauthKey
const _pair: oauth.CryptoKeyPair = {
  privateKey: hostKey,
  publicKey: hostKey,
}

oauth.PrivateKeyJwt(hostKey)
