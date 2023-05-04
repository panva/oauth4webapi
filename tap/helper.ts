import * as lib from '../src/index.js'
import * as jose from 'jose'
import * as env from './env.js'

const runtime = [...Object.entries(env)]
  .filter(([, v]) => v !== false)
  .map(([k]) => k)
  .join(',')

function url(pathname: string, search?: Record<string, string>) {
  const target = new URL(pathname, 'https://obscure-mesa-34474.deno.dev')
  target.search = new URLSearchParams(search).toString()
  return target.href
}

const random = () => jose.base64url.encode(crypto.getRandomValues(new Uint8Array(16)))

// @ts-ignore
import packageJson from '../package.json' assert { type: 'json' }

export async function fapi2(alg: lib.JWSAlgorithm, kp: CryptoKeyPair) {
  return setup(
    'fapi2-message-signing-id1-client-test-plan',
    'fapi2-security-profile-id2-client-test-happy-path',
    {
      client_auth_type: 'private_key_jwt',
      sender_constrain: 'dpop',
      fapi_client_type: 'oidc',
      fapi_profile: 'plain_fapi',
      fapi_request_method: 'signed_non_repudiation',
      fapi_response_mode: 'jarm',
    },
    alg,
    kp,
  )
}

export async function oidcc(alg: lib.JWSAlgorithm, kp: CryptoKeyPair) {
  return setup(
    'oidcc-client-test-plan',
    'oidcc-client-test',
    {
      client_auth_type: 'private_key_jwt',
      request_type: 'request_object',
      response_type: 'code',
      response_mode: 'default',
      client_registration: 'static_client',
    },
    alg,
    kp,
  )
}

async function setup(
  planName: string,
  testName: string,
  variant: Record<string, string>,
  alg: lib.JWSAlgorithm,
  kp: CryptoKeyPair,
): Promise<{
  client: lib.Client
  issuerIdentifier: URL
  clientPrivateKey: lib.PrivateKey
  exposed: () => Promise<Record<string, string>>
  cleanup: () => Promise<void>
}> {
  const uid = random()

  const serverKey = {
    ...(await crypto.subtle.exportKey(
      'jwk',
      (
        await lib.generateKeyPair(alg, { extractable: true })
      ).privateKey,
    )),
    alg,
    use: 'sig',
    kid: random(),
    key_ops: undefined,
    ext: undefined,
  }

  const clientKeyPair = kp
  const clientJwk = {
    ...(await crypto.subtle.exportKey('jwk', clientKeyPair.publicKey)),
    alg,
    use: 'sig',
    kid: random(),
    key_ops: undefined,
    ext: undefined,
  }

  const scope = 'openid email'
  const redirect_uri = `https://rp.example.com/${uid}/cb`

  let response = await fetch(
    url('/api/plan', {
      planName,
      variant: JSON.stringify(variant),
    }),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json;charset=utf-8' },
      body: JSON.stringify({
        alias: uid,
        client: {
          client_id: uid,
          token_endpoint_auth_method: 'private_key_jwt',
          scope,
          redirect_uri,
          id_token_signed_response_alg: alg,
          jwks: {
            keys: [clientJwk],
          },
        },
        waitTimeoutSeconds: 2,
        // @ts-ignore
        description: `${packageJson.name}/${packageJson.version} (${runtime})`,
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

  response = await fetch(url('/api/runner', { test: testName, plan: plan.id }), {
    method: 'POST',
    headers: { 'content-type': 'application/json;charset=utf-8' },
  })

  if (response.status !== 201) {
    throw new Error(await response.text())
  }

  const test = await response.json()

  response = await fetch(url(`/api/runner/${test.id}`))

  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  async function exposed() {
    const response = await fetch(url(`/api/runner/${test.id}`))
    if (response.status !== 200) {
      throw new Error(await response.text())
    }

    const { exposed } = await response.json()
    return exposed
  }

  const { issuer } = await exposed()

  let ready = false
  do {
    const response = await fetch(url(`/api/info/${test.id}`))
    if (response.status !== 200) {
      throw new Error(await response.text())
    }

    const { status } = await response.json()

    if (status === 'WAITING') {
      ready = true
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  } while (!ready)

  return {
    exposed,
    async cleanup() {
      await fetch(url(`/api/plan/${plan.id}`), {
        method: 'DELETE',
      })
    },
    client: {
      client_id: uid,
      token_endpoint_auth_method: 'private_key_jwt',
      id_token_signed_response_alg: alg,
      scope,
      redirect_uri,
    },
    clientPrivateKey: {
      kid: clientJwk.kid,
      key: clientKeyPair.privateKey,
    },
    issuerIdentifier: new URL(issuer),
  }
}
