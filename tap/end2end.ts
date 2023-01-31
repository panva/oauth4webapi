import type QUnit from 'qunit'
import { oidcc, fapi2 } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'
import * as env from './env.js'

export default (QUnit: QUnit) => {
  const { module, test, skip } = QUnit
  module('end2end.ts')

  for (const [alg, kp] of Object.entries(keys)) {
    const fapi = alg === 'EdDSA' || alg === 'ES256' || alg === 'PS256'
    const setup = fapi ? fapi2 : oidcc
    const method = fapi ? skip : test
    // TODO: remove skip when the fapi2 plan and test names are stable
    method(`${fapi ? 'FAPI 2.0' : 'OIDC Core 1.0'} ${alg}`, async (t) => {
      const { client, issuerIdentifier, clientPrivateKey, exposed, cleanup } = await setup(
        <lib.JWSAlgorithm>alg,
        await kp,
      )
      const DPoP = fapi ? await lib.generateKeyPair(<lib.JWSAlgorithm>alg) : undefined

      const as = await lib
        .discoveryRequest(issuerIdentifier)
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const code_verifier = lib.generateRandomCodeVerifier()
      const code_challenge = await lib.calculatePKCECodeChallenge(code_verifier)
      const code_challenge_method = 'S256'

      let request: string
      {
        const params = new URLSearchParams()
        params.set('client_id', client.client_id)
        params.set('code_challenge', code_challenge)
        params.set('code_challenge_method', code_challenge_method)
        params.set('redirect_uri', <string>client.redirect_uri)
        params.set('response_type', 'code')
        if (fapi) {
          params.set('response_mode', 'jwt')
        }
        params.set('scope', <string>client.scope)

        request = await lib.issueRequestObject(as, client, params, clientPrivateKey)
      }

      let request_uri!: string
      if (as.pushed_authorization_request_endpoint) {
        const params = new URLSearchParams()
        params.set('client_id', client.client_id)
        params.set('request', request)

        const response = await lib.pushedAuthorizationRequest(as, client, params, {
          DPoP,
          clientPrivateKey,
        })
        if (lib.parseWwwAuthenticateChallenges(response)) {
          t.ok(0)
          throw new Error()
        }

        const result = await lib.processPushedAuthorizationResponse(as, client, response)
        if (lib.isOAuth2Error(result)) {
          t.ok(0)
          throw new Error()
        }

        ;({ request_uri } = result)
      }

      let currentUrl: URL
      {
        const authorizationUrl = new URL(as.authorization_endpoint!)
        authorizationUrl.searchParams.set('client_id', client.client_id)
        if (request_uri) {
          authorizationUrl.searchParams.set('request_uri', request_uri)
        } else {
          authorizationUrl.searchParams.set('request', request)
          authorizationUrl.searchParams.set('response_type', 'code')
          authorizationUrl.searchParams.set('scope', 'openid')
        }
        await fetch(authorizationUrl.href, { redirect: 'manual' }).catch(() => {})
        currentUrl = new URL((await exposed()).authorization_endpoint_response_redirect)
      }

      const params = await (fapi ? lib.validateJwtAuthResponse : lib.validateAuthResponse)(
        as,
        client,
        currentUrl,
        lib.expectNoState,
      )
      if (lib.isOAuth2Error(params)) {
        t.ok(0)
        throw new Error()
      }

      {
        const response = await lib.authorizationCodeGrantRequest(
          as,
          client,
          params,
          <string>client.redirect_uri,
          code_verifier,
          {
            DPoP,
            clientPrivateKey,
          },
        )

        if (lib.parseWwwAuthenticateChallenges(response)) {
          t.ok(0)
          throw new Error()
        }

        const result = await lib.processAuthorizationCodeOpenIDResponse(as, client, response)
        if (lib.isOAuth2Error(result)) {
          t.ok(0)
          throw new Error()
        }

        const { access_token } = result
        const { sub } = lib.getValidatedIdTokenClaims(result)

        {
          const response = await lib.userInfoRequest(as, client, access_token, { DPoP })

          if (lib.parseWwwAuthenticateChallenges(response)) {
            t.ok(0)
            throw new Error()
          }

          await lib.processUserInfoResponse(as, client, sub, response)
        }

        const { accounts_endpoint } = await exposed()
        // TODO: https://gitlab.com/openid/conformance-suite/-/issues/1060
        if (accounts_endpoint && !(env.isBun || env.isDeno || env.isWorkers)) {
          const response = await lib.protectedResourceRequest(
            access_token,
            'GET',
            new URL(accounts_endpoint),
            new Headers(),
            null,
            { DPoP },
          )

          if (lib.parseWwwAuthenticateChallenges(response)) {
            t.ok(0)
            throw new Error()
          }
        }
      }

      t.ok(1)
      await cleanup()
    })
  }
}
