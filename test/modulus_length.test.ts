import test from 'ava'
import * as lib from '../src/index.js'

import { issuer, endpoint, client } from './_setup.js'

for (const [alg, { privateKey, publicKey }] of Object.entries({
  RS256: await lib.generateKeyPair('RS256', { modulusLength: 1024 }),
  PS256: await lib.generateKeyPair('PS256', { modulusLength: 1024 }),
})) {
  test(`(DPoP) ${alg} private key modulus length must be at least 2048 bits long`, async (t) => {
    await t.throwsAsync(
      () =>
        lib.protectedResourceRequest(
          'accessToken',
          'GET',
          new URL('https://rs.example.com/api'),
          new Headers(),
          null,
          { DPoP: { privateKey, publicKey } },
        ),
      {
        message: `${privateKey.algorithm.name} modulusLength must be at least 2048 bits`,
      },
    )
  })

  test(`(private_key_jwt) ${alg} private key modulus length must be at least 2048 bits long`, async (t) => {
    await t.throwsAsync(
      () =>
        lib.pushedAuthorizationRequest(
          {
            ...issuer,
            pushed_authorization_request_endpoint: endpoint('par'),
          },
          {
            ...client,
            token_endpoint_auth_method: 'private_key_jwt',
          },
          new URLSearchParams(),
          { clientPrivateKey: privateKey },
        ),
      {
        message: `${privateKey.algorithm.name} modulusLength must be at least 2048 bits`,
      },
    )
  })
}
