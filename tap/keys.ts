import * as lib from '../src/index.js'
import * as env from './env.js'

export const algs = <lib.JWSAlgorithm[]>['RS256', 'PS256', 'ES256']
export const fails = <lib.JWSAlgorithm[]>[]

if (env.isDeno || env.isNode || env.isElectron) {
  algs.push('EdDSA')
} else {
  fails.push('EdDSA')
}

export const keys = algs.reduce((acc, alg) => {
  acc[alg] = lib.generateKeyPair(alg)
  return acc
}, <Record<lib.JWSAlgorithm, Promise<CryptoKeyPair>>>{})
