import type QUnit from 'qunit'

import { isDpopNonceError, setup, random } from './helper.js'
import * as lib from '../src/index.js'
import { keys } from './keys.js'

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('end2end.ts')

  const alg = 'ES256'

  const options = (
    ...flags: Array<'jarm' | 'par' | 'jar' | 'dpop' | 'jwtUserinfo' | 'hybrid' | 'encryption'>
  ) => {
    const conf = {
      jarm: false,
      par: false,
      jar: false,
      dpop: false,
      jwtUserinfo: false,
      hybrid: false,
      encryption: false,
    }
    for (const flag of flags) {
      conf[flag] = true
    }
    return conf
  }

  const testCases = [
    options(),
    options('par'),
    options('jar'),
    options('dpop'),
    options('par', 'jar'),
    options('par', 'dpop'),
    options('encryption'),
    options('jarm'),
    options('jarm', 'encryption'),
    options('jwtUserinfo'),
    options('jwtUserinfo', 'encryption'),
    options('hybrid'),
    options('hybrid', 'encryption'),
  ]

  for (const config of testCases) {
    const { jarm, par, jar, dpop, jwtUserinfo, hybrid, encryption } = config

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
        hybrid
          ? ['implicit', 'authorization_code', 'refresh_token']
          : ['authorization_code', 'refresh_token'],
        encryption,
      )
      const DPoP = dpop ? await lib.generateKeyPair(alg as lib.JWSAlgorithm) : undefined

      const as = await lib
        .discoveryRequest(issuerIdentifier)
        .then((response) => lib.processDiscoveryResponse(issuerIdentifier, response))

      const code_verifier = lib.generateRandomCodeVerifier()
      const code_challenge = await lib.calculatePKCECodeChallenge(code_verifier)
      const code_challenge_method = 'S256'

      let params = new URLSearchParams()
      const maxAge = random() ? 30 : undefined

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

      if (maxAge !== undefined) {
        params.set('max_age', maxAge.toString())
      }

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

        const processPushedAuthorizationResponse = () =>
          lib.processPushedAuthorizationResponse(as, client, response)
        let result = await processPushedAuthorizationResponse().catch(async (err) => {
          if (isDpopNonceError(t, err)) {
            // the AS-signalled nonce is now cached, retrying
            response = await pushedAuthorizationRequest()
            return processPushedAuthorizationResponse()
          }
          throw err
        })

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

      let callbackParams: URLSearchParams
      if (hybrid) {
        callbackParams = await lib.validateDetachedSignatureResponse(
          as,
          client,
          currentUrl,
          nonce!,
          lib.expectNoState,
          maxAge,
          { [lib.allowInsecureRequests]: true },
        )
      } else if (jarm) {
        callbackParams = await lib.validateJwtAuthResponse(
          as,
          client,
          currentUrl,
          lib.expectNoState,
          { [lib.allowInsecureRequests]: true },
        )
      } else {
        callbackParams = lib.validateAuthResponse(as, client, currentUrl, lib.expectNoState)
      }

      {
        const authorizationCodeGrantRequest = () =>
          lib.authorizationCodeGrantRequest(
            as,
            client,
            callbackParams,
            'http://localhost:3000/cb',
            code_verifier,
            { DPoP, [lib.allowInsecureRequests]: true },
          )
        let response = await authorizationCodeGrantRequest()

        const processAuthorizationCodeOpenIDResponse = () =>
          lib.processAuthorizationCodeOpenIDResponse(as, client, response, nonce, maxAge)
        let result = await processAuthorizationCodeOpenIDResponse().catch(async (err) => {
          if (isDpopNonceError(t, err)) {
            response = await authorizationCodeGrantRequest()
            return processAuthorizationCodeOpenIDResponse()
          }

          throw err
        })

        const { access_token, refresh_token, token_type } = result
        t.equal(token_type, dpop ? 'dpop' : 'bearer')
        if (!refresh_token) {
          t.ok(0, 'expected a refresh token to be returned')
          throw new Error()
        }
        const { sub } = lib.getValidatedIdTokenClaims(result)
        await lib.validateIdTokenSignature(as, result, { [lib.allowInsecureRequests]: true })

        {
          const userInfoRequest = () =>
            lib.userInfoRequest(as, client, access_token, {
              DPoP,
              [lib.allowInsecureRequests]: true,
            })
          let response = await userInfoRequest().catch(async (err) => {
            if (isDpopNonceError(t, err)) {
              return userInfoRequest()
            }

            throw err
          })

          await lib.processUserInfoResponse(as, client, sub, response)

          if (jwtUserinfo) {
            await lib.validateJwtUserInfoSignature(as, response, {
              [lib.allowInsecureRequests]: true,
            })
          }
        }

        {
          const refreshTokenGrantRequest = () =>
            lib.refreshTokenGrantRequest(as, client, refresh_token, {
              DPoP,
              [lib.allowInsecureRequests]: true,
            })
          let response = await refreshTokenGrantRequest().catch((err) => {
            if (isDpopNonceError(t, err)) {
              // the AS-signalled nonce is now cached, retrying
              return refreshTokenGrantRequest()
            }
            throw err
          })

          await lib.processRefreshTokenResponse(as, client, response)
        }
      }

      t.ok(1)
    })
  }
}
