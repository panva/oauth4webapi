import type QUnit from 'qunit'
import * as lib from '../src/index.js'
import { fails, keys } from './keys.js'

function isRSA(alg: string) {
  return alg.startsWith('RS') || alg.startsWith('PS')
}

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('generate.ts')
  test('"alg" value validation', async (t) => {
    for (const value of [null, 1, 0, Infinity, Boolean, undefined, false, true, '']) {
      await t.rejects(lib.generateKeyPair(<any>value), /"alg" must be a non-empty string/)
    }
  })

  test('unknown algorithm', async (t) => {
    await t.rejects(lib.generateKeyPair(<any>'foo'), /UnsupportedOperationError/)
  })

  for (const alg of fails) {
    test(`[not supported] ${alg} fails to generate`, async (t) => {
      await t.rejects(lib.generateKeyPair(alg))
    })
  }

  for (const [alg, kp] of Object.entries(keys)) {
    test(`${alg} defaults`, async (t) => {
      const { publicKey, privateKey } = await kp
      t.deepEqual(publicKey.usages, ['verify'])
      t.deepEqual(privateKey.usages, ['sign'])
      t.equal(publicKey.extractable, true)
      t.equal(privateKey.extractable, false)

      for (const key of [privateKey, publicKey]) {
        switch (alg.slice(0, 2)) {
          case 'Ed':
            t.equal(key.algorithm.name, 'Ed25519')
            break
          case 'PS':
            t.equal(key.algorithm.name, 'RSA-PSS')
            break
          case 'ES':
            t.equal(key.algorithm.name, 'ECDSA')
            break
          case 'RS':
            t.equal(key.algorithm.name, 'RSASSA-PKCS1-v1_5')
            break
        }

        if (isRSA(alg)) {
          const algorithm = <RsaHashedKeyAlgorithm>key.algorithm
          t.equal(algorithm.modulusLength, 2048)
          t.deepEqual(new Uint8Array(algorithm.publicExponent), new Uint8Array([0x01, 0x00, 0x01]))
        }
      }
    })
  }
}
