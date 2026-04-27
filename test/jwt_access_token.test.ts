import test from 'ava'
import * as jose from 'jose'
import * as lib from '../src/index.js'

const encoder = new TextEncoder()

async function accessTokenHash(accessToken: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(accessToken))
  return Buffer.from(digest).toString('base64url')
}

test('validateJwtAccessToken() rejects DPoP proofs missing jwk', async (t) => {
  const asKey = await lib.generateKeyPair('ES256', { extractable: true })
  const proofKey = await lib.generateKeyPair('ES256')
  const now = Math.floor(Date.now() / 1000)
  const as: lib.AuthorizationServer = {
    issuer: 'https://as.example.com',
    jwks_uri: 'https://as.example.com/jwks',
  }

  const accessToken = await new jose.SignJWT({
    iss: as.issuer,
    exp: now + 300,
    aud: 'https://rs.example.com',
    sub: 'sub',
    iat: now,
    jti: 'jti',
    client_id: 'client_id',
    cnf: { jkt: 'jkt' },
  })
    .setProtectedHeader({ alg: 'ES256', typ: 'at+jwt' })
    .sign(asKey.privateKey)

  const proof = await new jose.SignJWT({
    iat: now,
    jti: 'proof',
    htm: 'GET',
    htu: 'https://rs.example.com/resource',
    ath: await accessTokenHash(accessToken),
  })
    .setProtectedHeader({ alg: 'ES256', typ: 'dpop+jwt' })
    .sign(proofKey.privateKey)

  const publicJwk = await jose.exportJWK(asKey.publicKey)
  const request = new Request('https://rs.example.com/resource?query', {
    headers: {
      authorization: `DPoP ${accessToken}`,
      dpop: proof,
    },
  })

  const err = await t.throwsAsync(
    lib.validateJwtAccessToken(as, request, 'https://rs.example.com', {
      [lib.customFetch]: async () =>
        new Response(JSON.stringify({ keys: [{ ...publicJwk, alg: 'ES256' }] }), {
          headers: { 'content-type': 'application/json' },
        }),
    }),
    {
      instanceOf: lib.OperationProcessingError,
      message: 'DPoP Proof jwk header parameter must be a JSON object',
    },
  )

  t.is(err?.code, lib.INVALID_RESPONSE)
})
