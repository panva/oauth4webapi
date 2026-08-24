import { createHash } from 'node:crypto'

import test from 'ava'
import fc from 'fast-check'
import * as jose from 'jose'

import * as lib from './_lib.js'

const options = { numRuns: 100 }
const cryptoOptions = { numRuns: 50 }
const pkceCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
const codeVerifiers = fc
  .array(fc.constantFrom(...pkceCharacters), { minLength: 43, maxLength: 128 })
  .map((characters) => characters.join(''))
const accessTokenCharacters = `${pkceCharacters}+/`
const accessTokens = fc
  .array(fc.constantFrom(...accessTokenCharacters), {
    minLength: 1,
    maxLength: 256,
  })
  .map((characters) => characters.join(''))
const nonEmptyUnicode = fc.string({
  unit: 'grapheme',
  minLength: 1,
  maxLength: 256,
})
const responseParameters = fc.constantFrom('state', 'iss', 'response', 'error', 'id_token', 'token')
const methods = fc.constantFrom('GET', 'post', 'Patch', 'DELETE')
const pathSegments = fc.array(fc.string({ unit: 'grapheme', maxLength: 16 }), { maxLength: 5 })

function mutate(value: string, position: number): string {
  const offset = position % value.length
  const current = pkceCharacters.indexOf(value[offset])
  const replacement = pkceCharacters[(current + 1) % pkceCharacters.length]

  return `${value.slice(0, offset)}${replacement}${value.slice(offset + 1)}`
}

test('S256 PKCE challenges match the independent digest', async (t) => {
  await fc.assert(
    fc.asyncProperty(codeVerifiers, fc.nat(), async (verifier, position) => {
      const challenge = await lib.calculatePKCECodeChallenge(verifier)
      const expected = createHash('sha256').update(verifier).digest('base64url')

      t.is(challenge, expected)
      t.not(await lib.calculatePKCECodeChallenge(mutate(verifier, position)), challenge)
    }),
    options,
  )
})

test('authorization response state must match exactly', (t) => {
  const authorizationServer: lib.AuthorizationServer = {
    issuer: 'https://as.example.com',
  }
  const client: lib.Client = { client_id: 'client' }

  fc.assert(
    fc.property(nonEmptyUnicode, (state) => {
      const parameters = new URLSearchParams({ code: 'code', state })
      const result = lib.validateAuthResponse(authorizationServer, client, parameters, state)

      t.deepEqual([...result], [...parameters])
      t.not(result, parameters)

      const error = t.throws(
        () => lib.validateAuthResponse(authorizationServer, client, parameters, `${state}!`),
        { instanceOf: lib.OperationProcessingError },
      )
      t.is(error.code, lib.INVALID_RESPONSE)
    }),
    options,
  )
})

test('duplicate security-sensitive response parameters are rejected', (t) => {
  const authorizationServer: lib.AuthorizationServer = {
    issuer: 'https://as.example.com',
  }
  const client: lib.Client = { client_id: 'client' }

  fc.assert(
    fc.property(responseParameters, nonEmptyUnicode, (name, value) => {
      const parameters = new URLSearchParams({ code: 'code' })
      parameters.append(name, value)
      parameters.append(name, value)

      const error = t.throws(
        () => lib.validateAuthResponse(authorizationServer, client, parameters, lib.skipStateCheck),
        { instanceOf: lib.OperationProcessingError },
      )
      t.is(error.code, lib.INVALID_RESPONSE)
    }),
    options,
  )
})

test('DPoP proofs bind arbitrary requests and access tokens', async (t) => {
  const keyPair = await lib.generateKeyPair('ES256')
  const publicJwk = await jose.exportJWK(keyPair.publicKey)
  const client: lib.Client = { client_id: 'client' }
  const dpop = lib.DPoP(client, keyPair)

  await fc.assert(
    fc.asyncProperty(
      methods,
      pathSegments,
      nonEmptyUnicode,
      accessTokens,
      async (method, segments, query, accessToken) => {
        const pathname = segments.map(encodeURIComponent).join('/')
        const url = new URL(
          `https://rs.example.com/${pathname}?query=${encodeURIComponent(query)}#fragment`,
        )
        let proof: string | null = null

        await lib.protectedResourceRequest(accessToken, method, url, undefined, undefined, {
          DPoP: dpop,
          [lib.customFetch]: async (_url, init) => {
            const headers = new Headers(init.headers)
            proof = headers.get('dpop')
            t.is(headers.get('authorization'), `DPoP ${accessToken}`)

            return new Response()
          },
        })

        t.truthy(proof)
        const verified = await jose.jwtVerify(proof!, keyPair.publicKey)

        t.deepEqual(verified.protectedHeader, {
          alg: 'ES256',
          typ: 'dpop+jwt',
          jwk: publicJwk,
        })
        t.is(verified.payload.htm, method.toUpperCase())
        t.is(verified.payload.htu, `${url.origin}${url.pathname}`)
        t.is(verified.payload.ath, createHash('sha256').update(accessToken).digest('base64url'))
        t.is(typeof verified.payload.iat, 'number')
        t.is(typeof verified.payload.jti, 'string')
        t.false('nonce' in verified.payload)
      },
    ),
    cryptoOptions,
  )
})
