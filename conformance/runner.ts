import anyTest from 'ava'
import type { Macro, TestFn } from 'ava'
import { importJWK, type JWK, calculateJwkThumbprint, exportJWK, compactDecrypt } from 'jose'
import * as undici from 'undici'

export const test = anyTest as TestFn<{ instance: Test }>

import { getScope } from './ava.config.js'
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
  case 'fapi1-advanced-final-client-test-plan':
  case 'fapi2-security-profile-id2-client-test-plan':
    prefix = plan.name.slice(0, -4)
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

function usesJarm(variant: Record<string, string>) {
  return variant.fapi_response_mode === 'jarm'
}

function usesDpop(variant: Record<string, string>) {
  return variant.sender_constrain === 'dpop'
}

function usesPar(plan: Plan) {
  return plan.name.startsWith('fapi2') || variant.fapi_auth_request_method === 'pushed'
}

export function nonRepudiation(plan: Plan, variant: Record<string, string>) {
  return (
    variant.fapi_client_type === 'oidc' &&
    (plan.name.startsWith('fapi2-message-signing') || plan.name.startsWith('fapi1'))
  )
}

function usesRequestObject(planName: string, variant: Record<string, string>) {
  if (planName.startsWith('fapi1')) {
    return true
  }

  if (planName.startsWith('fapi2-message-signing')) {
    return true
  }

  if (variant.request_type === 'request_object') {
    return true
  }

  return false
}

function requiresNonce(planName: string, variant: Record<string, string>) {
  return planName.startsWith('fapi1') && getScope(variant).includes('openid')
}

function requiresState(planName: string, variant: Record<string, string>) {
  return planName.startsWith('fapi1') && !getScope(variant).includes('openid')
}

function responseType(planName: string, variant: Record<string, string>) {
  if (!planName.startsWith('fapi1')) {
    return 'code'
  }

  return variant.fapi_response_mode === 'jarm' ? 'code' : 'code id_token'
}

interface MacroOptions {
  useNonce?: boolean
  useState?: boolean
}

export const flow = (options?: MacroOptions) => {
  return test.macro({
    async exec(t, module: ModulePrescription) {
      t.timeout(15000)

      const instance = await createTestFromPlan(plan, module)
      t.context.instance = instance

      t.log('Test ID', instance.id)
      t.log('Test Name', instance.name)

      const variant: Record<string, string> = {
        ...conformance.variant,
        ...module.variant,
      }
      t.log('variant', variant)

      const { issuer: issuerIdentifier, accounts_endpoint } = await getTestExposed(instance)

      if (!issuerIdentifier) {
        throw new Error()
      }

      const issuer = new URL(issuerIdentifier)

      const as = await oauth
        .discoveryRequest(issuer)
        .then((response) => oauth.processDiscoveryResponse(issuer, response))

      t.log('AS Metadata discovered for', as.issuer)

      const decoder = new TextDecoder()
      const client: oauth.Client = {
        client_id: configuration.client.client_id,
        client_secret: configuration.client.client_secret,
        async [oauth.jweDecrypt](jwe) {
          const { plaintext } = await compactDecrypt(
            jwe,
            await importPrivateKey('RSA-OAEP', configuration.client.jwks.keys[0]),
            { keyManagementAlgorithms: ['RSA-OAEP'] },
          ).catch((cause) => {
            throw new oauth.OperationProcessingError('failed to decrypt', { cause })
          })
          return decoder.decode(plaintext)
        },
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
          const [jwk] = configuration.client.jwks.keys
          clientPrivateKey = {
            kid: jwk.kid,
            key: await importPrivateKey(JWS_ALGORITHM, jwk),
          }
      }

      const mtlsFetch = (...args: Parameters<typeof fetch>) => {
        // @ts-expect-error
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

      function clientAuthOptions(endpoint: 'token'): oauth.TokenEndpointRequestOptions
      function clientAuthOptions(endpoint: 'par'): oauth.PushedAuthorizationRequestOptions
      function clientAuthOptions(endpoint: 'userinfo'): oauth.UserInfoRequestOptions
      function clientAuthOptions(endpoint: 'resource'): oauth.ProtectedResourceRequestOptions
      function clientAuthOptions(endpoint: 'token' | 'par' | 'userinfo' | 'resource') {
        const mtlsAuth = variant.client_auth_type === 'mtls'
        const mtlsConstrain = plan.name.startsWith('fapi1') || variant.sender_constrain === 'mtls'

        switch (endpoint) {
          case 'token':
            return {
              [oauth.useMtlsAlias]: mtlsAuth || mtlsConstrain ? true : false,
              [oauth.customFetch]: mtlsAuth || mtlsConstrain ? mtlsFetch : undefined,
            } as oauth.TokenEndpointRequestOptions
          case 'par':
            return {
              [oauth.useMtlsAlias]: mtlsAuth ? true : false,
              [oauth.customFetch]: mtlsAuth ? mtlsFetch : undefined,
            } as oauth.PushedAuthorizationRequestOptions
          case 'userinfo':
            return {
              [oauth.useMtlsAlias]: mtlsConstrain ? true : false,
              [oauth.customFetch]: mtlsConstrain ? mtlsFetch : undefined,
            } as oauth.UserInfoRequestOptions
          case 'resource':
            return {
              [oauth.customFetch]: mtlsConstrain ? mtlsFetch : undefined,
            } as oauth.ProtectedResourceRequestOptions
          default:
            throw new Error()
        }
      }

      const response_type = responseType(plan.name, variant)
      const scope = getScope(variant)
      const code_verifier = oauth.generateRandomCodeVerifier()
      const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
      const code_challenge_method = 'S256'
      let nonce =
        options?.useNonce || requiresNonce(plan.name, variant)
          ? oauth.generateRandomNonce()
          : oauth.expectNoNonce
      let state =
        options?.useState || requiresState(plan.name, variant)
          ? oauth.generateRandomState()
          : oauth.expectNoState

      let authorizationUrl = new URL(as.authorization_endpoint!)
      if (!usesRequestObject(plan.name, variant)) {
        authorizationUrl.searchParams.set('client_id', client.client_id)
        authorizationUrl.searchParams.set('code_challenge', code_challenge)
        authorizationUrl.searchParams.set('code_challenge_method', code_challenge_method)
        authorizationUrl.searchParams.set('redirect_uri', configuration.client.redirect_uri)
        authorizationUrl.searchParams.set('response_type', response_type)
        authorizationUrl.searchParams.set('scope', scope)
        if (typeof nonce === 'string') {
          authorizationUrl.searchParams.set('nonce', nonce)
        }
        if (typeof state === 'string') {
          authorizationUrl.searchParams.set('state', state)
        }
      } else {
        authorizationUrl.searchParams.set('client_id', client.client_id)
        const params = new URLSearchParams()
        params.set('code_challenge', code_challenge)
        params.set('code_challenge_method', code_challenge_method)
        params.set('redirect_uri', configuration.client.redirect_uri)
        params.set('response_type', response_type)
        params.set('scope', scope)
        if (typeof nonce === 'string') {
          params.set('nonce', nonce)
        }
        if (typeof state === 'string') {
          params.set('state', state)
        }

        const [jwk] = configuration.client.jwks.keys
        const privateKey = await importPrivateKey(JWS_ALGORITHM, jwk)

        authorizationUrl.searchParams.set(
          'request',
          await oauth.issueRequestObject(as, client, params, { kid: jwk.kid, key: privateKey }),
        )
        authorizationUrl.searchParams.set('scope', scope)
        authorizationUrl.searchParams.set('response_type', response_type)
      }

      let DPoP!: CryptoKeyPair
      if (usesDpop(variant)) {
        DPoP = await oauth.generateKeyPair(JWS_ALGORITHM as oauth.JWSAlgorithm)
        authorizationUrl.searchParams.set(
          'dpop_jkt',
          await calculateJwkThumbprint(await exportJWK(DPoP.publicKey)),
        )
      }

      if (usesPar(plan)) {
        t.log('PAR request with', Object.fromEntries(authorizationUrl.searchParams.entries()))
        const request = () =>
          oauth.pushedAuthorizationRequest(as, client, authorizationUrl.searchParams, {
            ...clientAuthOptions('par'),
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
          if (DPoP && result.error === 'use_dpop_nonce') {
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

      let currentUrl = new URL(authorization_endpoint_response_redirect)

      let sub: string
      let access_token: string
      {
        let params: ReturnType<typeof oauth.validateAuthResponse>

        if (usesJarm(variant)) {
          params = await oauth.validateJwtAuthResponse(as, client, currentUrl, state)
        } else if (response_type === 'code id_token') {
          params = await oauth.validateDetachedSignatureResponse(
            as,
            client,
            currentUrl,
            nonce as string,
            state,
          )
        } else {
          params = oauth.validateAuthResponse(as, client, currentUrl, state)
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
            params as Exclude<typeof params, oauth.OAuth2Error>,
            configuration.client.redirect_uri,
            code_verifier,
            {
              ...clientAuthOptions('token'),
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
          result = await oauth.processAuthorizationCodeOpenIDResponse(as, client, response, nonce)
        } else {
          result = await oauth.processAuthorizationCodeOAuth2Response(as, client, response)
        }

        if (oauth.isOAuth2Error(result)) {
          t.log('error', result)
          if (DPoP && result.error === 'use_dpop_nonce') {
            t.log('retrying with a newly obtained dpop nonce')
            response = await request()
            if (scope.includes('openid')) {
              result = await oauth.processAuthorizationCodeOpenIDResponse(
                as,
                client,
                response,
                nonce,
              )
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

        if (nonRepudiation(plan, variant)) {
          await oauth.validateIdTokenSignature(as, result)
        }

        t.log('token endpoint response body', { ...result })
        ;({ access_token } = result)
        if (result.id_token) {
          const claims = oauth.getValidatedIdTokenClaims(result)
          t.log('ID Token Claims', claims)
          ;({ sub } = claims)
        }
      }

      if (!plan.name.startsWith('fapi1') && scope.includes('openid') && as.userinfo_endpoint) {
        // fetch userinfo response
        const request = () => {
          t.log('fetching', as.userinfo_endpoint)
          return oauth.userInfoRequest(as, client, access_token, {
            ...clientAuthOptions('userinfo'),
            DPoP,
          })
        }
        let response = await request()

        let challenges: oauth.WWWAuthenticateChallenge[] | undefined
        if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
          let retried = false
          for (const challenge of challenges) {
            t.log('challenge', challenge)
            if (
              DPoP &&
              challenge.scheme === 'dpop' &&
              challenge.parameters.error === 'use_dpop_nonce'
            ) {
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
            undefined,
            undefined,
            {
              ...clientAuthOptions('resource'),
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
            if (
              DPoP &&
              challenge.scheme === 'dpop' &&
              challenge.parameters.error === 'use_dpop_nonce'
            ) {
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
      if (module.skipLogTestFinished !== true) {
        t.log('Test Finished')
      }
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
}

export const rejects = (macro: Macro<[module: ModulePrescription], { instance: Test }>) => {
  return test.macro({
    async exec(
      t,
      module: ModulePrescription,
      expectedMessage?: string | RegExp,
      expectedErrorName: string = 'OperationProcessingError',
    ) {
      await t
        .throwsAsync(() => macro.exec(t, { ...module, skipLogTestFinished: true }) as any, {
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
    title: macro.title as any,
  })
}

export const skippable = (macro: Macro<[module: ModulePrescription], { instance: Test }>) => {
  return test.macro({
    async exec(t, module: ModulePrescription) {
      await Promise.allSettled([macro.exec(t, { ...module, skipLogTestFinished: true })])

      await waitForState(t.context.instance, { results: new Set(['SKIPPED', 'PASSED']) })
      t.log('Test Finished')
      t.pass()
    },
    title: macro.title as any,
  })
}
