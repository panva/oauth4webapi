import type QUnit from 'qunit'
import * as lib from '../src/index.js'

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

  const algs = <lib.JWSAlgorithm[]>['RS256', 'PS256', 'ES256']

  // @ts-ignore
  if (typeof Deno !== 'undefined' || typeof process !== 'undefined') {
    algs.push('EdDSA')
  }

  for (const alg of algs) {
    test(`${alg} defaults`, async (t) => {
      const { publicKey, privateKey } = await lib.generateKeyPair(alg)
      t.deepEqual(publicKey.usages, ['verify'])
      t.deepEqual(privateKey.usages, ['sign'])
      t.equal(publicKey.extractable, true)
      t.equal(privateKey.extractable, false)

      if (isRSA(alg)) {
        // @ts-expect-error
        t.equal(publicKey.algorithm.modulusLength, 2048)
        // @ts-expect-error
        t.deepEqual(publicKey.algorithm.publicExponent, new Uint8Array([0x01, 0x00, 0x01]))
        // @ts-expect-error
        t.equal(privateKey.algorithm.modulusLength, 2048)
        // @ts-expect-error
        t.deepEqual(privateKey.algorithm.publicExponent, new Uint8Array([0x01, 0x00, 0x01]))
      }
    })

    test(`${alg} extractable`, async (t) => {
      {
        const { publicKey, privateKey } = await lib.generateKeyPair(alg, { extractable: false })
        t.equal(publicKey.extractable, true)
        t.equal(privateKey.extractable, false)
      }

      {
        const { publicKey, privateKey } = await lib.generateKeyPair(alg, { extractable: true })
        t.equal(publicKey.extractable, true)
        t.equal(privateKey.extractable, true)
      }
    })

    if (isRSA(alg)) {
      test(`${alg} modulusLength`, async (t) => {
        const { publicKey, privateKey } = await lib.generateKeyPair(alg, { modulusLength: 3072 })
        // @ts-expect-error
        t.equal(publicKey.algorithm.modulusLength, 3072)
        // @ts-expect-error
        t.equal(privateKey.algorithm.modulusLength, 3072)
      })
    }
  }
}
