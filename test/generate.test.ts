import test from 'ava'
import * as lib from '../src/index.js'

function isRSA(alg: string) {
  return alg.startsWith('RS') || alg.startsWith('PS')
}

test('"alg" value validation', async (t) => {
  for (const value of [null, 1, 0, Infinity, Boolean, undefined, false, true, '']) {
    await t.throwsAsync(() => lib.generateKeyPair(<any>value), {
      name: 'TypeError',
      message: '"alg" must be a non-empty string',
    })
  }
})

test('unknown algorithm', async (t) => {
  await t.throwsAsync(() => lib.generateKeyPair(<any>'foo'), { name: 'UnsupportedOperationError' })
})

for (const alg of <lib.JWSAlgorithm[]>['RS256', 'PS256', 'ES256', 'EdDSA']) {
  test(`${alg} defaults`, async (t) => {
    const { publicKey, privateKey } = await lib.generateKeyPair(alg)
    t.deepEqual(publicKey.usages, ['verify'])
    t.deepEqual(privateKey.usages, ['sign'])
    t.is(publicKey.extractable, true)
    t.is(privateKey.extractable, false)

    if (isRSA(alg)) {
      // @ts-expect-error
      t.is(publicKey.algorithm.modulusLength, 2048)
      // @ts-expect-error
      t.deepEqual(publicKey.algorithm.publicExponent, new Uint8Array([0x01, 0x00, 0x01]))
      // @ts-expect-error
      t.is(privateKey.algorithm.modulusLength, 2048)
      // @ts-expect-error
      t.deepEqual(privateKey.algorithm.publicExponent, new Uint8Array([0x01, 0x00, 0x01]))
    }
  })

  test(`${alg} extractable`, async (t) => {
    {
      const { publicKey, privateKey } = await lib.generateKeyPair(alg, { extractable: false })
      t.is(publicKey.extractable, true)
      t.is(privateKey.extractable, false)
    }

    {
      const { publicKey, privateKey } = await lib.generateKeyPair(alg, { extractable: true })
      t.is(publicKey.extractable, true)
      t.is(privateKey.extractable, true)
    }
  })

  if (isRSA(alg)) {
    test(`${alg} modulusLength`, async (t) => {
      const { publicKey, privateKey } = await lib.generateKeyPair(alg, { modulusLength: 3072 })
      // @ts-expect-error
      t.is(publicKey.algorithm.modulusLength, 3072)
      // @ts-expect-error
      t.is(privateKey.algorithm.modulusLength, 3072)
    })
  }
}
