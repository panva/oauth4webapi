import test from 'ava'
import * as lib from '../src/index.js'

const vectors = {
  RSA: {
    jwk: {
      kty: 'RSA',
      n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw',
      e: 'AQAB',
    },
    algorithm: { name: 'RSA-PSS', hash: 'SHA-256' },
    thumbprint: 'NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs',
  },
  EC: {
    jwk: {
      crv: 'P-256',
      kty: 'EC',
      x: 'q3zAwR_kUwtdLEwtB2oVfucXiLHmEhu9bJUFYjJxYGs',
      y: '8h0D-ONoU-iZqrq28TyUxEULxuGwJZGMJYTMbeMshvI',
    },
    algorithm: { name: 'ECDSA', namedCurve: 'P-256' },
    thumbprint: 'ZrBaai73Hi8Fg4MElvDGzIne2NsbI75RHubOViHYE5Q',
  },
  OKP: {
    jwk: {
      crv: 'Ed25519',
      kty: 'OKP',
      x: '5fL1GDeyNTIxtuzTeFnvZTo4Oz0EkMfAdhIJA-EFn0w',
    },
    algorithm: 'Ed25519',
    thumbprint: '1OzNmMHhNzbSJyoePAtdoVedRZlFvER3K3RAzCrfX0k',
  },
}

for (const [kty, { jwk, algorithm, thumbprint }] of Object.entries(vectors)) {
  test(kty, async (t) => {
    t.is(
      await lib.calculateJwkThumbprint(
        await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']),
      ),
      thumbprint,
    )
  })
}

test('private key or unrecognized public key', async (t) => {
  const keypair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, [
    'deriveBits',
  ])
  await t.throwsAsync(() => lib.calculateJwkThumbprint(keypair.publicKey), {
    name: 'UnsupportedOperationError',
  })
  await t.throwsAsync(() => lib.calculateJwkThumbprint(keypair.privateKey), {
    name: 'TypeError',
    message: '"key" must be an extractable public CryptoKey',
  })
})

test('public key non-extractable key', async (t) => {
  const key = await crypto.subtle.importKey(
    'jwk',
    {
      crv: 'P-256',
      kty: 'EC',
      x: 'q3zAwR_kUwtdLEwtB2oVfucXiLHmEhu9bJUFYjJxYGs',
      y: '8h0D-ONoU-iZqrq28TyUxEULxuGwJZGMJYTMbeMshvI',
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    [],
  )
  await t.throwsAsync(() => lib.calculateJwkThumbprint(key), {
    name: 'TypeError',
    message: '"key" must be an extractable public CryptoKey',
  })
})
