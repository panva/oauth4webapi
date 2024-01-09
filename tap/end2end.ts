import type QUnit from 'qunit'
import * as jose from 'jose'

import { isDpopNonceError, setup } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end.ts')

  const alg = 'ES256'

  const jarmOptions = [false, true]
  const parOptions = [false, true]
  const jarOptions = [false, true]
  const dpopOptions = [false, true]
  const jwtUserinfoOptions = [false, true]

  const cartesianMatrix = []

  for (const jarm of jarmOptions) {
    for (const par of parOptions) {
      for (const jar of jarOptions) {
        for (const dpop of dpopOptions) {
          for (const jwtUserinfo of jwtUserinfoOptions) {
            cartesianMatrix.push({
              jarm,
              par,
              jar,
              dpop,
              jwtUserinfo,
            })
          }
        }
      }
    }
  }

  function trueCount(a: boolean[]) {
    return a.reduce((c, x) => (x ? ++c : c), 0)
  }

  for (const config of cartesianMatrix) {
    const { jarm, par, jar, dpop, jwtUserinfo } = config

    const options = [jarm, par, jar, dpop, jwtUserinfo]

    // Test
    // - individual options
    // - no options
    // - all options
    // - par + jar
    // - par + jar + dpop
    // - par + dpop

    switch (trueCount(options)) {
      case 0:
      case 1:
      case options.length:
        break
      case 2:
        if ((par && jar) || (par && dpop)) {
          break
        }
      case 3:
        if (par && jar && dpop) {
          break
        }
      default:
        continue
    }

    function label(config: Record<string, boolean>) {
      const keys = Object.keys(
        Object.fromEntries(Object.entries(config).filter(([, v]) => v === true)),
      )
      return keys.length ? `w/ ${keys.join(', ')}` : ''
    }

    test(`end-to-end code flow ${label(config)}`, async (t) => {
      const kp = await keys[alg]
      const { client, issuerIdentifier, clientPrivateKey } = await setup(
        alg,
        kp,
        'client_secret_basic',
        jar,
        jwtUserinfo,
        false,
      )
      const DPoP = dpop ? await lib.generateKeyPair(<lib.JWSAlgorithm>alg) : undefined

      const as = await lib
        .discoveryRequest(issuerIdentifier)
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const code_verifier = lib.generateRandomCodeVerifier()
      const code_challenge = await lib.calculatePKCECodeChallenge(code_verifier)
      const code_challenge_method = 'S256'

      let params = new URLSearchParams()

      params.set('client_id', client.client_id)
      params.set('code_challenge', code_challenge)
      params.set('code_challenge_method', code_challenge_method)
      params.set('redirect_uri', 'http://localhost:3000/cb')
      params.set('response_type', 'code')
      params.set('scope', 'openid offline_access')
      params.set('prompt', 'consent')

      if (jarm) {
        params.set('response_mode', 'jwt')
      }

      if (jar) {
        const request = await lib.issueRequestObject(as, client, params, clientPrivateKey)
        for (const param of [...params.keys()]) {
          if (param !== 'client_id') {
            params.delete(param)
          }
        }
        params.set('request', request)
      }

      let request_uri!: string
      if (par) {
        let response = await lib.pushedAuthorizationRequest(as, client, params, { DPoP })
        if (lib.parseWwwAuthenticateChallenges(response)) {
          t.ok(0)
          throw new Error()
        }

        let result = await lib.processPushedAuthorizationResponse(as, client, response)
        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await lib.pushedAuthorizationRequest(as, client, params, { DPoP })
            if (lib.parseWwwAuthenticateChallenges(response)) {
              t.ok(0)
              throw new Error()
            }
            result = await lib.processPushedAuthorizationResponse(as, client, response)
            if (lib.isOAuth2Error(result)) {
              t.ok(0)
              throw new Error()
            }
          } else {
            t.ok(0)
            throw new Error()
          }
        }
        for (const param of [...params.keys()]) {
          if (param !== 'client_id') {
            params.delete(param)
          }
        }
        ;({ request_uri } = result)
        params.set('request_uri', request_uri)
      }

      let currentUrl: URL
      {
        const authorizationUrl = new URL(as.authorization_endpoint!)
        for (const param of [...params.entries()]) {
          authorizationUrl.searchParams.set(...param)
        }
        currentUrl = new URL(
          await fetch('http://localhost:3000/drive', {
            method: 'POST',
            body: new URLSearchParams({
              goto: authorizationUrl.href,
            }),
          }).then((r) => r.text()),
        )
      }

      const callbackParams = await (jarm ? lib.validateJwtAuthResponse : lib.validateAuthResponse)(
        as,
        client,
        currentUrl,
        lib.expectNoState,
      )
      if (lib.isOAuth2Error(callbackParams)) {
        t.ok(0)
        throw new Error()
      }

      {
        let response = await lib.authorizationCodeGrantRequest(
          as,
          client,
          callbackParams,
          'http://localhost:3000/cb',
          code_verifier,
          { DPoP },
        )

        if (lib.parseWwwAuthenticateChallenges(response)) {
          t.ok(0)
          throw new Error()
        }

        let result = await lib.processAuthorizationCodeOpenIDResponse(as, client, response)
        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await lib.authorizationCodeGrantRequest(
              as,
              client,
              callbackParams,
              'http://localhost:3000/cb',
              code_verifier,
              { DPoP },
            )
            result = await lib.processAuthorizationCodeOpenIDResponse(as, client, response)
            if (lib.isOAuth2Error(result)) {
              t.ok(0)
              throw new Error()
            }
          } else {
            t.ok(0)
            throw new Error()
          }
        }

        const { access_token, refresh_token, token_type } = result
        t.equal(token_type, dpop ? 'dpop' : 'bearer')
        if (!refresh_token) {
          t.ok(0)
          throw new Error()
        }
        const { sub } = lib.getValidatedIdTokenClaims(result)

        {
          let response = await lib.userInfoRequest(as, client, access_token, { DPoP })

          const clone = await response.clone().text()
          if (jwtUserinfo) {
            t.ok(jose.decodeJwt(clone))
          } else {
            t.ok(JSON.parse(clone))
          }

          let challenges: lib.WWWAuthenticateChallenge[] | undefined
          if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
            if (isDpopNonceError(challenges)) {
              response = await lib.userInfoRequest(as, client, access_token, { DPoP })
            } else {
              t.ok(0)
              throw new Error()
            }
          }

          await lib.processUserInfoResponse(as, client, sub, response)
        }

        {
          let response = await lib.refreshTokenGrantRequest(as, client, refresh_token, { DPoP })

          let challenges: lib.WWWAuthenticateChallenge[] | undefined
          if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
            if (isDpopNonceError(challenges)) {
              response = await lib.refreshTokenGrantRequest(as, client, refresh_token, { DPoP })
            } else {
              t.ok(0)
              throw new Error()
            }
          }

          const result = await lib.processRefreshTokenResponse(as, client, response)
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
