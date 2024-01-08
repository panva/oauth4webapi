import anyTest, { type TestFn } from 'ava'
import { importJWK, type JWK, calculateJwkThumbprint, exportJWK } from 'jose'
import * as undici from 'undici'

export const test = anyTest as TestFn<{ instance: Test }>

import { getScope, usesClientCert } from './ava.config.js'
import * as oauth from '../src/index.js'
import {
  createTestFromPlan,
  waitForState,
  getTestExposed,
  type ModulePrescription,
  type Plan,
  type Test,
} from './api.js'

import { JWS_ALGORITHM } from './env.js'
const conformance = JSON.parse(process.env.CONFORMANCE!)

const configuration: {
  alias: string
  client: {
    client_id: string
    client_secret?: string
    redirect_uri: string
    jwks: {
      keys: Array<JWK & { kid: string }>
    }
  }
} = conformance.configuration

export const plan: Plan = conformance.plan
export const variant: Record<string, string> = conformance.variant
export const mtls: { key: string; cert: string } = conformance.mtls || {}

let prefix = ''

switch (plan.name) {
  case 'fapi2-security-profile-id2-client-test-plan':
    prefix = 'fapi2-security-profile-id2-client-test-'
    break
  case 'fapi2-message-signing-id1-client-test-plan':
    prefix = 'fapi2-security-profile-id2-client-test-'
    break
  case 'oidcc-client-test-plan':
  case 'oidcc-client-basic-certification-test-plan':
    prefix = 'oidcc-client-test-'
    break
  default:
    throw new Error()
}

async function importPrivateKey(alg: string, jwk: JWK) {
  const key = await importJWK<CryptoKey>(jwk, alg)
  if (!('type' in key)) {
    throw new Error()
  }
  return key
}

export function modules(name: string): ModulePrescription[] {
  if (name === prefix.slice(0, -1)) {
    return conformance.plan.modules.filter((x: ModulePrescription) => x.testModule === name)
  }

  return conformance.plan.modules.filter(
    (x: ModulePrescription) => x.testModule === `${prefix}${name}`,
  )
}

function usesJarm(plan: Plan) {
  return plan.name.startsWith('fapi2-message-signing')
}

function usesDpop(variant: Record<string, string>) {
  return variant.sender_constrain === 'dpop'
}

function usesPar(plan: Plan) {
  return plan.name.startsWith('fapi2')
}

function usesRequestObject(planName: string, variant: Record<string, string>) {
  if (planName.startsWith('fapi2-message-signing')) {
    return true
  }

  if (variant.request_type === 'request_object') {
    return true
  }

  return false
}

export const green = test.macro({
  async exec(t, module: ModulePrescription) {
    t.timeout(15000)

    const instance = await createTestFromPlan(plan, module)
    t.context.instance = instance

    t.log('Test ID', instance.id)
    t.log('Test Name', instance.name)

    const variant = {
      ...conformance.variant,
      ...module.variant,
    }
    t.log('variant', variant)

    const { issuer: issuerIdentifier, accounts_endpoint } = await getTestExposed(instance)

    if (!issuerIdentifier) {
      throw new Error()
    }

    const httpOptions: oauth.ExperimentalUseMTLSAliasOptions = {}

    if (usesClientCert(plan.name, variant)) {
      httpOptions[oauth.experimentalUseMtlsAlias] = true
      // @ts-expect-error
      httpOptions[oauth.experimentalCustomFetch] = (...args) => {
        return undici.fetch(args[0], {
          ...args[1],
          dispatcher: new undici.Agent({
            connect: {
              key: mtls.key,
              cert: mtls.cert,
            },
          }),
        })
      }
    }

    const issuer = new URL(issuerIdentifier)

    const as = await oauth
      .discoveryRequest(issuer)
      .then((response) => oauth.processDiscoveryResponse(issuer, response))

    t.log('AS Metadata', as)

    const client: oauth.Client = {
      client_id: configuration.client.client_id,
      client_secret: configuration.client.client_secret,
    }

    switch (variant.client_auth_type) {
      case 'mtls':
        client.token_endpoint_auth_method = 'none'
        break
      case 'none':
      case 'private_key_jwt':
      case 'client_secret_basic':
      case 'client_secret_post':
        client.token_endpoint_auth_method = variant.client_auth_type
        break
      default:
        client.token_endpoint_auth_method = 'client_secret_basic'
        break
    }

    if (instance.name.includes('client-secret-basic')) {
      client.token_endpoint_auth_method = 'client_secret_basic'
    }

    let clientPrivateKey!: oauth.PrivateKey

    switch (client.token_endpoint_auth_method) {
      case 'none':
        delete client.client_secret
        break
      case 'private_key_jwt':
        delete client.client_secret
        const jwk = configuration.client.jwks.keys.find((key) => key.alg === JWS_ALGORITHM)!
        clientPrivateKey = {
          kid: jwk.kid,
          key: await importPrivateKey(JWS_ALGORITHM, jwk),
        }
    }

    const scope = getScope(variant)
    const code_verifier = oauth.generateRandomCodeVerifier()
    const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
    const code_challenge_method = 'S256'

    let authorizationUrl = new URL(as.authorization_endpoint!)
    if (usesRequestObject(plan.name, variant) === false) {
      authorizationUrl.searchParams.set('client_id', client.client_id)
      authorizationUrl.searchParams.set('code_challenge', code_challenge)
      authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)
      authorizationUrl.searchParams.set('redirect_uri', configuration.client.redirect_uri)
      authorizationUrl.searchParams.set('response_type', 'code')
      authorizationUrl.searchParams.set('scope', scope)
    } else {
      authorizationUrl.searchParams.set('client_id', client.client_id)
      const params = new URLSearchParams()
      params.set('code_challenge', code_challenge)
      params.set('code_challenge_method', code_challenge_method)
      params.set('redirect_uri', configuration.client.redirect_uri)
      params.set('response_type', 'code')
      params.set('scope', scope)

      const jwk = configuration.client.jwks.keys.find((key) => key.alg === JWS_ALGORITHM)!
      const privateKey = await importPrivateKey(JWS_ALGORITHM, jwk)

      authorizationUrl.searchParams.set(
        'request',
        await oauth.issueRequestObject(as, client, params, { kid: jwk.kid, key: privateKey }),
      )
      authorizationUrl.searchParams.set('scope', scope)
      authorizationUrl.searchParams.set('response_type', 'code')
    }

    let DPoP!: CryptoKeyPair
    if (usesDpop(variant)) {
      DPoP = await oauth.generateKeyPair(<oauth.JWSAlgorithm>JWS_ALGORITHM)
      authorizationUrl.searchParams.set(
        'dpop_jkt',
        await calculateJwkThumbprint(await exportJWK(DPoP.publicKey)),
      )
    }

    if (usesPar(plan)) {
      t.log('PAR request with', Object.fromEntries(authorizationUrl.searchParams.entries()))
      const request = () =>
        oauth.pushedAuthorizationRequest(as, client, authorizationUrl.searchParams, {
          ...httpOptions,
          DPoP,
          clientPrivateKey,
        })
      let par = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(par))) {
        for (const challenge of challenges) {
          t.log('challenge', challenge)
        }
        throw new Error()
      }

      let result = await oauth.processPushedAuthorizationResponse(as, client, par)
      if (oauth.isOAuth2Error(result)) {
        t.log('error', result)
        if (result.error === 'use_dpop_nonce') {
          t.log('retrying with a newly obtained dpop nonce')
          par = await request()
          result = await oauth.processPushedAuthorizationResponse(as, client, par)
          if (oauth.isOAuth2Error(result)) {
            t.log('error', result)
            throw new Error() // Handle OAuth 2.0 response body error
          }
        } else {
          throw new Error() // Handle OAuth 2.0 response body error
        }
      }
      t.log('PAR response', { ...result })
      authorizationUrl = new URL(as.authorization_endpoint!)
      authorizationUrl.searchParams.set('client_id', client.client_id)
      authorizationUrl.searchParams.set('request_uri', result.request_uri)
    }

    await Promise.allSettled([fetch(authorizationUrl.href, { redirect: 'manual' })])

    t.log('redirect with', Object.fromEntries(authorizationUrl.searchParams.entries()))

    const { authorization_endpoint_response_redirect } = await getTestExposed(instance)
    if (!authorization_endpoint_response_redirect) {
      throw new Error()
    }

    const currentUrl = new URL(authorization_endpoint_response_redirect)

    let sub: string
    let access_token: string
    {
      let params: ReturnType<typeof oauth.validateAuthResponse>

      if (usesJarm(plan)) {
        params = await oauth.validateJwtAuthResponse(as, client, currentUrl)
      } else {
        params = oauth.validateAuthResponse(as, client, currentUrl)
      }

      if (oauth.isOAuth2Error(params)) {
        t.log('error', params)
        throw new Error() // Handle OAuth 2.0 redirect error
      }

      t.log('parsed callback parameters', Object.fromEntries(params.entries()))

      const request = () =>
        oauth.authorizationCodeGrantRequest(
          as,
          client,
          <Exclude<typeof params, oauth.OAuth2Error>>params,
          configuration.client.redirect_uri,
          code_verifier,
          {
            ...httpOptions,
            clientPrivateKey,
            DPoP,
          },
        )
      let response = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
        for (const challenge of challenges) {
          t.log('challenge', challenge)
        }
        throw new Error()
      }

      let result:
        | oauth.OAuth2TokenEndpointResponse
        | oauth.OpenIDTokenEndpointResponse
        | oauth.OAuth2Error
      if (scope.includes('openid')) {
        result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response)
      } else {
        result = await oauth.processAuthorizationCodeOAuth2Response(as, client, response)
      }

      if (oauth.isOAuth2Error(result)) {
        t.log('error', result)
        if (result.error === 'use_dpop_nonce') {
          t.log('retrying with a newly obtained dpop nonce')
          response = await request()
          if (scope.includes('openid')) {
            result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response)
          } else {
            result = await oauth.processAuthorizationCodeOAuth2Response(as, client, response)
          }
          if (oauth.isOAuth2Error(result)) {
            t.log('error', result)
            throw new Error() // Handle OAuth 2.0 response body error
          }
        } else {
          throw new Error() // Handle OAuth 2.0 response body error
        }
      }

      t.log('token endpoint response body', { ...result })
      ;({ access_token } = result)
      if (result.id_token) {
        const claims = oauth.getValidatedIdTokenClaims(result)
        t.log('ID Token Claims', claims)
        ;({ sub } = claims)
      }
    }

    if (scope.includes('openid') && as.userinfo_endpoint) {
      // fetch userinfo response
      const request = () => {
        t.log('fetching', as.userinfo_endpoint)
        return oauth.userInfoRequest(as, client, access_token, {
          ...httpOptions,
          DPoP,
        })
      }
      let response = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
        let retried = false
        for (const challenge of challenges) {
          t.log('challenge', challenge)
          if (challenge.scheme === 'dpop' && challenge.parameters.error === 'use_dpop_nonce') {
            t.log('retrying with a newly obtained dpop nonce')
            response = await request()
            retried = true
          }
        }
        if (!retried) {
          throw new Error()
        }
      }

      const result = await oauth.processUserInfoResponse(as, client, sub!, response)
      t.log('userinfo endpoint response', { ...result })
    }

    if (accounts_endpoint) {
      const request = () => {
        t.log('fetching', accounts_endpoint)
        return oauth.protectedResourceRequest(
          access_token,
          'GET',
          new URL(accounts_endpoint),
          new Headers(),
          null,
          {
            ...httpOptions,
            DPoP,
          },
        )
      }
      let accounts = await request()

      let challenges: oauth.WWWAuthenticateChallenge[] | undefined
      if ((challenges = oauth.parseWwwAuthenticateChallenges(accounts))) {
        let retried = false
        for (const challenge of challenges) {
          t.log('challenge', challenge)
          if (challenge.scheme === 'dpop' && challenge.parameters.error === 'use_dpop_nonce') {
            t.log('retrying with a newly obtained dpop nonce')
            accounts = await request()
            retried = true
          }
        }
        if (!retried) {
          throw new Error()
        }
      }

      const result = await accounts.text()
      try {
        t.log('accounts endpoint response', JSON.parse(result))
      } catch {
        t.log('accounts endpoint response body', result)
      }
    }

    await waitForState(instance)

    t.log('Test Finished')
    t.pass()
  },
  title(providedTitle = '', module: ModulePrescription) {
    if (module.variant) {
      return `${providedTitle}${plan.name} (${plan.id}) - ${module.testModule} - ${JSON.stringify(
        module.variant,
      )}`
    }
    return `${providedTitle}${plan.name} (${plan.id}) - ${module.testModule}`
  },
})

export const red = test.macro({
  async exec(
    t,
    module: ModulePrescription,
    expectedMessage?: string | RegExp,
    expectedErrorName: string = 'OperationProcessingError',
  ) {
    await t
      .throwsAsync(() => <any>green.exec(t, module), {
        message: expectedMessage,
        name: expectedErrorName,
      })
      .then((err) => {
        if (err) {
          t.log('rejected with', {
            message: err.message,
            name: err.name,
          })
        }
      })

    await waitForState(t.context.instance)
    t.log('Test Finished')
    t.pass()
  },
  title: <any>green.title,
})

export const skipped = test.macro({
  async exec(t, module: ModulePrescription) {
    await Promise.allSettled([green.exec(t, module)])

    await waitForState(t.context.instance, { results: new Set(['SKIPPED']) })
    t.log('Test result is SKIPPED')
    t.pass()
  },
  title: <any>green.title,
})
