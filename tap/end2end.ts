import type QUnit from 'qunit'
import * as jose from 'jose'

import {
  assertNoWwwAuthenticateChallenges,
  isDpopNonceError,
  assertNotOAuth2Error,
  setup,
  unexpectedAuthorizationServerError,
} from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end.ts')

  const alg = 'ES256'

  const cartesianMatrix = []

  for (const jarm of [false, true]) {
    for (const par of [false, true]) {
      for (const jar of [false, true]) {
        for (const dpop of [false, true]) {
          for (const jwtUserinfo of [false, true]) {
            for (const hybrid of [false, true]) {
              cartesianMatrix.push({
                hybrid,
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
  }

  function trueCount(a: boolean[]) {
    return a.reduce((c, x) => (x ? ++c : c), 0)
  }

  for (const config of cartesianMatrix) {
    const { jarm, par, jar, dpop, jwtUserinfo, hybrid } = config

    const options = [jarm, par, jar, dpop, jwtUserinfo, hybrid]

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
        break
      case options.length - 1:
        if (hybrid) {
          continue
        } else {
          break
        }
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
      let msg = `w/ response_type=${hybrid ? 'code id_token' : 'code'}`
      return keys.length ? `${msg}, ${keys.join(', ')}` : msg
    }

    test(`end-to-end ${label(config)}`, async (t) => {
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

      let nonce: string | undefined
      if (hybrid) {
        nonce = lib.generateRandomNonce()
        params.set('nonce', nonce)
      }

      params.set('client_id', client.client_id)
      params.set('code_challenge', code_challenge)
      params.set('code_challenge_method', code_challenge_method)
      params.set('redirect_uri', 'http://localhost:3000/cb')
      params.set('response_type', hybrid ? 'code id_token' : 'code')
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
        const pushedAuthorizationRequest = () =>
          lib.pushedAuthorizationRequest(as, client, params, { DPoP })
        let response = await pushedAuthorizationRequest()
        assertNoWwwAuthenticateChallenges(response)

        const processPushedAuthorizationResponse = () =>
          lib.processPushedAuthorizationResponse(as, client, response)
        let result = await processPushedAuthorizationResponse()
        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await pushedAuthorizationRequest()
            assertNoWwwAuthenticateChallenges(response)
            result = await processPushedAuthorizationResponse()
            if (!assertNotOAuth2Error(result)) return
          } else {
            throw unexpectedAuthorizationServerError(result)
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

      let callbackParams: URLSearchParams | lib.OAuth2Error
      if (hybrid) {
        callbackParams = await lib.validateDetachedSignatureResponse(
          as,
          client,
          currentUrl,
          nonce!,
          lib.expectNoState,
        )
      } else {
        callbackParams = await (jarm ? lib.validateJwtAuthResponse : lib.validateAuthResponse)(
          as,
          client,
          currentUrl,
          lib.expectNoState,
        )
      }
      if (!assertNotOAuth2Error(callbackParams)) return

      {
        const authorizationCodeGrantRequest = () =>
          lib.authorizationCodeGrantRequest(
            as,
            client,
            callbackParams,
            'http://localhost:3000/cb',
            code_verifier,
            { DPoP },
          )
        let response = await authorizationCodeGrantRequest()

        assertNoWwwAuthenticateChallenges(response)

        const processAuthorizationCodeOpenIDResponse = () =>
          lib.processAuthorizationCodeOpenIDResponse(as, client, response, nonce)
        let result = await processAuthorizationCodeOpenIDResponse()
        if (lib.isOAuth2Error(result)) {
          if (isDpopNonceError(result)) {
            response = await authorizationCodeGrantRequest()
            result = await processAuthorizationCodeOpenIDResponse()
            if (!assertNotOAuth2Error(result)) return
          } else {
            throw unexpectedAuthorizationServerError(result)
          }
        }

        const { access_token, refresh_token, token_type } = result
        t.equal(token_type, dpop ? 'dpop' : 'bearer')
        if (!refresh_token) {
          t.ok(0, 'expected a refresh token to be returned')
          throw new Error()
        }
        const { sub } = lib.getValidatedIdTokenClaims(result)

        {
          const userInfoRequest = () => lib.userInfoRequest(as, client, access_token, { DPoP })
          let response = await userInfoRequest()

          let challenges: lib.WWWAuthenticateChallenge[] | undefined
          if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
            if (isDpopNonceError(challenges)) {
              response = await userInfoRequest()
            } else {
              throw unexpectedAuthorizationServerError(challenges)
            }
          }

          const clone = await response.clone().text()
          if (jwtUserinfo) {
            t.ok(jose.decodeJwt(clone))
          } else {
            t.ok(JSON.parse(clone))
          }

          await lib.processUserInfoResponse(as, client, sub, response)
        }

        {
          const refreshTokenGrantRequest = () =>
            lib.refreshTokenGrantRequest(as, client, refresh_token, { DPoP })
          let response = await refreshTokenGrantRequest()

          let challenges: lib.WWWAuthenticateChallenge[] | undefined
          if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
            if (isDpopNonceError(challenges)) {
              response = await refreshTokenGrantRequest()
            } else {
              throw unexpectedAuthorizationServerError(challenges)
            }
          }

          const result = await lib.processRefreshTokenResponse(as, client, response)
          if (!assertNotOAuth2Error(result)) return
        }
      }

      t.ok(1)
    })
  }
}
