import * as lib from '../src/index.js'
import * as env from './env.js'

export const algs = [
  'PS256',
  'PS384',
  'PS512',
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'EdDSA',
  'Ed25519',
]
export const fails: string[] = []
// TODO: remove when P-521 integration in Deno is finished
if (!env.isDeno) {
  algs.push('ES512')
}

export const keys = algs.reduce(
  (acc, alg) => {
    acc[alg] = lib.generateKeyPair(alg)
    return acc
  },
  {} as Record<string, Promise<CryptoKeyPair>>,
)
