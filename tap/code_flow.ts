import type QUnit from 'qunit'
import setup from './helper.js'
import * as lib from '../src/index.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('code_flow.ts')
  test('Discovery, Code Flow, OpenID Connect, JAR, JARM, PAR', async (t) => {
    const { client, issuerIdentifier, clientPrivateKey, exposed } = await setup()
    const DPoP = await lib.generateKeyPair('ES256')

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
      params.set('response_mode', 'jwt')
      params.set('scope', <string>client.scope)

      request = await lib.issueRequestObject(as, client, params, clientPrivateKey)
    }

    let request_uri: string
    {
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

      let currentUrl: URL
      {
        let options: Record<string, string>
        if (
          typeof navigator === 'undefined' ||
          !navigator.userAgent?.startsWith?.('Mozilla/5.0 ')
        ) {
          options = { redirect: 'manual' }
        } else {
          options = { redirect: 'follow', mode: 'no-cors' }
        }
        const authorizationUrl = new URL(as.authorization_endpoint!)
        authorizationUrl.searchParams.set('client_id', client.client_id)
        authorizationUrl.searchParams.set('request_uri', request_uri)
        await fetch(authorizationUrl, options).catch(() => {})
        currentUrl = new URL((await exposed()).authorization_endpoint_response_redirect)
      }

      {
        const params = await lib.validateJwtAuthResponse(as, client, currentUrl, lib.expectNoState)
        if (lib.isOAuth2Error(params)) {
          t.ok(0)
          throw new Error()
        }

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
      }

      t.ok(1)
    }
  })
}
