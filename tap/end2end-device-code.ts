import type QUnit from 'qunit'

import { isDpopNonceError, setup } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

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

      const params = new URLSearchParams()
      params.set('resource', 'urn:example:resource')
      params.set('scope', 'api:write')

      let response = await lib.deviceAuthorizationRequest(as, client, params)
      if (lib.parseWwwAuthenticateChallenges(response)) {
        t.ok(0)
        throw new Error()
      }

      let result = await lib.processDeviceAuthorizationResponse(as, client, response)
      if (lib.isOAuth2Error(result)) {
        t.ok(0)
        throw new Error()
      }
      const { verification_uri_complete, device_code } = result

      await fetch('http://localhost:3000/drive', {
        method: 'POST',
        body: new URLSearchParams({
          goto: verification_uri_complete!,
        }),
      })

      {
        let response = await lib.deviceCodeGrantRequest(as, client, device_code, { DPoP })

        if (lib.parseWwwAuthenticateChallenges(response)) {
          t.ok(0)
          throw new Error()
        }

        let result = await lib.processDeviceCodeResponse(as, client, response)
        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await lib.deviceCodeGrantRequest(as, client, device_code, { DPoP })
            result = await lib.processDeviceCodeResponse(as, client, response)
            if (lib.isOAuth2Error(result)) {
              t.ok(0)
              throw new Error()
            }
          } else {
            t.ok(0)
            throw new Error()
          }
        }

        const { access_token, token_type } = result
        t.ok(access_token)
        t.equal(token_type, dpop ? 'dpop' : 'bearer')
      }

      t.ok(1)
    })
  }
}
