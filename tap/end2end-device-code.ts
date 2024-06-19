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

  const dpopOptions = [false, true]

  const cartesianMatrix = []

  for (const dpop of dpopOptions) {
    cartesianMatrix.push({
      dpop,
    })
  }

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
      )
      const DPoP = dpop ? await lib.generateKeyPair(<lib.JWSAlgorithm>alg) : undefined

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

        await lib.protectedResourceRequest(
          access_token,
          'GET',
          new URL('http://localhost:3001/resource'),
          undefined,
          undefined,
          {
            DPoP,
            async [lib.customFetch](...params: Parameters<typeof fetch>) {
              const url = new URL(<string>params[0])
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
