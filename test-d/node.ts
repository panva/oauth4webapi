import type * as oauth from 'oauth4webapi'
import type { webcrypto } from 'node:crypto'

type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

const _isHostCryptoKey: Equals<oauth.CryptoKey, webcrypto.CryptoKey> = true

// @ts-expect-error `any` would accept this
const _notAny: oauth.CryptoKey = 'definitely not a key'

declare const hostKey: webcrypto.CryptoKey
declare const oauthKey: oauth.CryptoKey

const _toOauth: oauth.CryptoKey = hostKey
const _toHost: webcrypto.CryptoKey = oauthKey
