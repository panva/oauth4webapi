import * as lib from '../src/index.js'
import * as env from './env.js'

export const algs = <lib.JWSAlgorithm[]>[
  'PS256',
  'PS384',
  'PS512',
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
]
export const fails = <lib.JWSAlgorithm[]>[]
;(env.isDeno ? fails : algs).push('ES512')
;(env.isBrowser ? fails : algs).push('EdDSA')

export const keys = algs.reduce((acc, alg) => {
  acc[alg] = lib.generateKeyPair(alg)
  return acc
}, <Record<lib.JWSAlgorithm, Promise<CryptoKeyPair>>>{})
