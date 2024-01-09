import type QUnit from 'qunit'
import * as jose from 'jose'

import { isDpopNonceError, setup } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end-client-credentials.ts')

  const alg = 'ES256'

  const authMethodOptions: lib.ClientAuthenticationMethod[] = [
    'none',
    'private_key_jwt',
    'client_secret_basic',
    'client_secret_post',
  ]
  const dpopOptions = [false, true]
  const jwtIntrospectionOptions = [false, true]

  const cartesianMatrix = []

  for (const authMethod of authMethodOptions) {
    for (const dpop of dpopOptions) {
      for (const jwtIntrospection of jwtIntrospectionOptions) {
        cartesianMatrix.push({
          authMethod,
          dpop,
          jwtIntrospection,
        })
      }
    }
  }

  function trueCount(a: (boolean | string)[]) {
    return a.reduce((c, x) => (x === true ? ++c : c), 0)
  }

  for (const config of cartesianMatrix) {
    const { authMethod, dpop, jwtIntrospection } = config
    const options = [authMethod, dpop, jwtIntrospection]

    // Test
    // - every auth method with all options off
    // - individual options
    switch (trueCount(options)) {
      case 0:
        break
      case 1:
        if (authMethod === 'client_secret_basic') {
          break
        }
      default:
        continue
    }

    function label(config: Record<string, string | boolean>) {
      const keys = Object.keys(
        Object.fromEntries(Object.entries(config).filter(([, v]) => v === true)),
      )
      return keys.length ? `${config.authMethod} w/ ${keys.join(', ')}` : config.authMethod
    }

    test(`end-to-end client auth, client credentials, introspection, revocation ${label(
      config,
    )}`, async (t) => {
      const kp = await keys[alg]
      const { client, issuerIdentifier, clientPrivateKey } = await setup(
        alg,
        kp,
        authMethod,
        false,
        false,
        jwtIntrospection,
      )
      const DPoP = dpop ? await lib.generateKeyPair(<lib.JWSAlgorithm>alg) : undefined

      const authenticated: lib.AuthenticatedRequestOptions = {
        clientPrivateKey: authMethod === 'private_key_jwt' ? clientPrivateKey : undefined,
      }

      const as = await lib
        .discoveryRequest(issuerIdentifier)
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const params = new URLSearchParams()
      params.set('resource', 'urn:example:resource')
      params.set('scope', 'api:write')

      {
        let response = await lib.clientCredentialsGrantRequest(as, client, params, {
          DPoP,
          ...authenticated,
        })

        if (lib.parseWwwAuthenticateChallenges(response)) {
          t.ok(0)
          throw new Error()
        }

        let result = await lib.processClientCredentialsResponse(as, client, response)
        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await lib.clientCredentialsGrantRequest(as, client, params, {
              DPoP,
              ...authenticated,
            })
            result = await lib.processClientCredentialsResponse(as, client, response)
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
        t.equal(token_type, dpop ? 'dpop' : 'bearer')

        {
          let response = await lib.introspectionRequest(as, client, access_token, authenticated)

          const clone = await response.clone().text()
          if (jwtIntrospection) {
            t.ok(jose.decodeJwt(clone))
          } else {
            t.ok(JSON.parse(clone))
          }

          if (lib.parseWwwAuthenticateChallenges(response)) {
            t.ok(0)
            throw new Error()
          }

          const result = await lib.processIntrospectionResponse(as, client, response)

          if (lib.isOAuth2Error(result)) {
            t.ok(0)
            throw new Error()
          }

          t.propContains(result, {
            active: true,
            scope: 'api:write',
            aud: 'urn:example:resource',
            token_type: dpop ? 'DPoP' : 'Bearer',
          })
        }

        {
          let response = await lib.revocationRequest(as, client, access_token, authenticated)

          if (lib.parseWwwAuthenticateChallenges(response)) {
            t.ok(0)
            throw new Error()
          }

          const result = await lib.processRevocationResponse(response)
          if (lib.isOAuth2Error(result)) {
            t.ok(0)
            throw new Error()
          }
        }
      }

      t.ok(1)
    })
  }
}
