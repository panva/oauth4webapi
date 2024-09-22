import type QUnit from 'qunit'

import {
  assertNotOAuth2Error,
  assertNoWwwAuthenticateChallenges,
  isDpopNonceError,
  setup,
  unexpectedAuthorizationServerError,
} from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'
import * as jose from 'jose'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end-device-code.ts')

  const alg = 'ES256'

  for (const dpop of [true, false]) {
    test(`end-to-end device flow ${dpop ? 'w/ dpop' : ''}`, async (t) => {
      const kp = await keys[alg]
      const { client, issuerIdentifier } = await setup(
        alg,
        kp,
        'client_secret_basic',
        false,
        false,
        false,
        ['refresh_token', 'urn:ietf:params:oauth:grant-type:device_code'],
        false,
      )
      const DPoP = dpop ? await lib.generateKeyPair(alg as lib.JWSAlgorithm) : undefined

      const as = await lib
        .discoveryRequest(issuerIdentifier)
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const resource = 'urn:example:resource:jwt'
      const params = new URLSearchParams()
      params.set('resource', resource)
      params.set('scope', 'api:write')

      let response = await lib.deviceAuthorizationRequest(as, client, params)
      assertNoWwwAuthenticateChallenges(response)

      let result = await lib.processDeviceAuthorizationResponse(as, client, response)
      if (!assertNotOAuth2Error(result)) return
      const { verification_uri_complete, device_code } = result

      await fetch('http://localhost:3000/drive', {
        method: 'POST',
        body: new URLSearchParams({
          goto: verification_uri_complete!,
        }),
      })

      {
        const deviceCodeGrantRequest = () =>
          lib.deviceCodeGrantRequest(as, client, device_code, { DPoP })
        let response = await deviceCodeGrantRequest()

        assertNoWwwAuthenticateChallenges(response)

        const processDeviceCodeResponse = () => lib.processDeviceCodeResponse(as, client, response)
        let result = await processDeviceCodeResponse()
        let i = 0
        while (lib.isOAuth2Error(result) && result.error === 'authorization_pending') {
          await new Promise((resolve) => setTimeout(resolve, 100))
          response = await deviceCodeGrantRequest()
          result = await processDeviceCodeResponse()
          i++
          if (i === 5) break
        }

        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await deviceCodeGrantRequest()
            result = await processDeviceCodeResponse()
            if (!assertNotOAuth2Error(result)) return
          } else {
            throw unexpectedAuthorizationServerError(result)
          }
        }

        const { access_token, token_type } = result
        t.ok(access_token)
        t.equal(token_type, dpop ? 'dpop' : 'bearer')

        const verb = ['GET', 'POST', 'PATCH'][Math.floor(Math.random() * 3)]

        await lib.protectedResourceRequest(
          access_token,
          verb,
          new URL('http://localhost:3001/resource'),
          undefined,
          undefined,
          {
            DPoP: DPoP
              ? {
                  ...DPoP,
                  [lib.modifyAssertion](h, p) {
                    t.equal(h.alg, 'ES256')
                    p.foo = 'bar'
                  },
                }
              : undefined,
            async [lib.customFetch](...params: Parameters<typeof fetch>) {
              const url = new URL(params[0] as string)
              const { headers, method } = params[1]!
              const request = new Request(url, { headers, method })

              const jwtAccessToken = await lib.validateJwtAccessToken(as, request, resource)

              t.propContains(jwtAccessToken, {
                client_id: client.client_id,
                iss: as.issuer,
                aud: resource,
              })

              if (DPoP) {
                t.equal(
                  jwtAccessToken.cnf!.jkt,
                  await jose.calculateJwkThumbprint(await jose.exportJWK(DPoP.publicKey)),
                )

                t.propContains(await jose.decodeJwt(request.headers.get('dpop')!), { foo: 'bar' })
              } else {
                t.equal(jwtAccessToken.cnf, undefined)
              }

              return new Response()
            },
          },
        )
      }

      t.ok(1)
    })
  }
}
