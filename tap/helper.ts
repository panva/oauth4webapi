import * as lib from '../src/index.js'
import * as jose from 'jose'

function url(pathname: string, search?: Record<string, string>) {
  const target = new URL(pathname, 'https://obscure-mesa-34474.deno.dev')
  target.search = new URLSearchParams(search).toString()
  return target.href
}

export default async function setup(): Promise<{
  client: lib.Client
  accountsEndpoint: URL
  issuerIdentifier: URL
  clientPrivateKey: lib.PrivateKey
  exposed: () => Promise<Record<string, string>>
  cleanup: () => Promise<void>
}> {
  const uuid = jose.base64url.encode(crypto.getRandomValues(new Uint8Array(16)))

  const serverKey = {
    ...(await crypto.subtle.exportKey(
      'jwk',
      (
        await lib.generateKeyPair('ES256', { extractable: true })
      ).privateKey,
    )),
    alg: 'ES256',
    use: 'sig',
    kid: jose.base64url.encode(crypto.getRandomValues(new Uint8Array(16))),
    key_ops: undefined,
    ext: undefined,
  }

  const clientKeyPair = await lib.generateKeyPair('ES256')
  const clientJwk = {
    ...(await crypto.subtle.exportKey('jwk', clientKeyPair.publicKey)),
    alg: 'ES256',
    use: 'sig',
    kid: jose.base64url.encode(crypto.getRandomValues(new Uint8Array(16))),
    key_ops: undefined,
    ext: undefined,
  }

  const scope = 'openid email'
  const redirect_uri = `https://rp.example.com/${uuid}/cb`

  let response = await fetch(
    url('/api/plan', {
      planName: 'fapi2-advanced-id1-client-test-plan',
      variant: JSON.stringify({
        client_auth_type: 'private_key_jwt',
        sender_constrain: 'dpop',
        fapi_client_type: 'oidc',
        fapi_profile: 'plain_fapi',
        fapi_request_method: 'signed_non_repudiation',
        fapi_response_mode: 'jarm',
      }),
    }),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json;charset=utf-8' },
      body: JSON.stringify({
        alias: uuid,
        client: {
          client_id: uuid,
          token_endpoint_auth_method: 'private_key_jwt',
          scope,
          redirect_uri,
          id_token_signed_response_alg: 'ES256',
          jwks: {
            keys: [clientJwk],
          },
        },
        waitTimeoutSeconds: 2,
        server: {
          jwks: {
            keys: [serverKey],
          },
        },
      }),
    },
  )

  if (response.status !== 201) {
    throw new Error(await response.text())
  }

  const plan = await response.json()

  response = await fetch(
    url('/api/runner', { test: 'fapi2-baseline-id2-client-test-happy-path', plan: plan.id }),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json;charset=utf-8' },
    },
  )

  if (response.status !== 201) {
    throw new Error(await response.text())
  }

  const test = await response.json()

  response = await fetch(url(`/api/runner/${test.id}`))

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const {
    exposed: { issuer, accounts_endpoint },
  } = await response.json()

  return {
    async exposed() {
      const response = await fetch(url(`/api/runner/${test.id}`))
      if (response.status !== 200) {
        throw new Error(await response.text())
      }

      const { exposed } = await response.json()
      return exposed
    },
    async cleanup() {
      await fetch(url(`/api/plan/${plan.id}`), {
        method: 'DELETE',
      })
    },
    client: {
      client_id: uuid,
      token_endpoint_auth_method: 'private_key_jwt',
      id_token_signed_response_alg: 'ES256',
      scope,
      redirect_uri,
    },
    clientPrivateKey: {
      kid: clientJwk.kid,
      key: clientKeyPair.privateKey,
    },
    issuerIdentifier: new URL(issuer),
    accountsEndpoint: new URL(accounts_endpoint),
  }
}
