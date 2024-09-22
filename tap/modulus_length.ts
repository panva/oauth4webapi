import type QUnit from 'qunit'
import * as lib from '../src/index.js'

const client = {
  client_id: 'urn:example:client_id',
} as lib.Client
const identifier = 'https://op.example.com'
const issuer = {
  issuer: identifier,
} as lib.AuthorizationServer

export default async (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('modulus_length.ts')

  for (const [alg, { privateKey, publicKey }] of Object.entries({
    RS256: await lib.generateKeyPair('RS256', { modulusLength: 1024 }),
    PS256: await lib.generateKeyPair('PS256', { modulusLength: 1024 }),
  })) {
    test(`(DPoP) ${alg} private key modulus length must be at least 2048 bits long`, async (t) => {
      await t.rejects(
        lib.protectedResourceRequest(
          'accessToken',
          'GET',
          new URL('https://rs.example.com/api'),
          undefined,
          undefined,
          { DPoP: { privateKey, publicKey } },
        ),
        (err: Error) => {
          t.propContains(err, {
            message: `${privateKey.algorithm.name} modulusLength must be at least 2048 bits`,
          })
          return true
        },
      )
    })

    test(`(private_key_jwt) ${alg} private key modulus length must be at least 2048 bits long`, async (t) => {
      await t.rejects(
        lib.pushedAuthorizationRequest(
          {
            ...issuer,
            pushed_authorization_request_endpoint: `${issuer.issuer}/par`,
          },
          {
            ...client,
            token_endpoint_auth_method: 'private_key_jwt',
          },
          new URLSearchParams(),
          { clientPrivateKey: privateKey },
        ),
        (err: Error) => {
          t.propContains(err, {
            message: `${privateKey.algorithm.name} modulusLength must be at least 2048 bits`,
          })
          return true
        },
      )
    })
  }
}
