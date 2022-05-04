import * as crypto from 'node:crypto'
import { promisify } from 'node:util'
import { existsSync as exists, writeFileSync, readFileSync } from 'node:fs'

const generateKeyPair = promisify(crypto.generateKeyPair)

const { homepage, name, version } = JSON.parse(readFileSync('package.json').toString())

import '../test/_pre.js'

import * as api from './api.js'

const UUID = crypto.randomUUID()

import { JWS_ALGORITHM, PLAN_NAME, VARIANT } from './env.js'

switch (PLAN_NAME) {
  case 'oidcc-client-basic-certification-test-plan':
  case 'oidcc-client-test-plan':
  case 'fapi2-baseline-id2-client-test-plan':
    break
  default:
    throw new Error()
}

function exportPrivate(keyPair: crypto.KeyPairKeyObjectResult) {
  return keyPair.privateKey.export({ format: 'jwk' })
}

async function RS256() {
  return {
    ...exportPrivate(await generateKeyPair('rsa', { modulusLength: 2048 })),
    use: 'sig',
    alg: 'RS256',
    kid: crypto.randomUUID(),
  }
}

async function PS256() {
  return {
    ...(await RS256()),
    alg: 'PS256',
  }
}

async function ES256() {
  return {
    ...exportPrivate(await generateKeyPair('ec', { namedCurve: 'P-256' })),
    use: 'sig',
    alg: 'ES256',
    kid: crypto.randomUUID(),
  }
}

async function EdDSA() {
  return {
    ...exportPrivate(await generateKeyPair('ed25519')),
    use: 'sig',
    alg: 'EdDSA',
    kid: crypto.randomUUID(),
  }
}

async function generate() {
  switch (JWS_ALGORITHM) {
    case 'PS256':
      return Promise.all([PS256()])
    case 'RS256':
      return Promise.all([RS256()])
    case 'ES256':
      return Promise.all([ES256()])
    case 'EdDSA':
      return Promise.all([EdDSA()])
    default:
      throw new Error()
  }
}

function needsSecret(variant: Record<string, string>) {
  switch (variant.client_auth_type) {
    case undefined:
    case 'client_secret_basic':
    case 'client_secret_post':
    case 'client_secret_jwt':
      return true
    default:
      return false
  }
}

export function usesRequestObject(planName: string, variant: Record<string, string>) {
  if (planName.startsWith('fapi2-advanced')) {
    return true
  }

  if (variant.request_type === 'request_object') {
    return true
  }

  return false
}

const DEFAULTS: Record<typeof PLAN_NAME, Record<string, string>> = {
  'oidcc-client-test-plan': {
    response_mode: 'default',
    client_registration: 'static_client',
    request_type: 'plain_http_request', // plain_http_request, request_object
    response_type: 'code',
    client_auth_type: 'client_secret_basic', // none, client_secret_basic, client_secret_post, client_secret_jwt, private_key_jwt
  },
  'oidcc-client-basic-certification-test-plan': {
    request_type: 'plain_http_request',
    client_registration: 'static_client',
  },
  'fapi2-baseline-id2-client-test-plan': {
    client_auth_type: 'private_key_jwt',
    sender_constrain: 'dpop',
    // TODO: why is this called fapi_jarm_type?
    fapi_jarm_type: 'oidc', // oidc, plain_oauth
    fapi_profile: 'plain_fapi',
  },
}

export function getScope(variant: Record<string, string>) {
  return variant.fapi_jarm_type === 'plain_oauth' ? 'email' : 'openid email'
}

function makePublicJwks(def: any) {
  const client = structuredClone(def)
  client.jwks.keys.forEach((jwk: any) => {
    delete jwk.d
    delete jwk.dp
    delete jwk.dq
    delete jwk.p
    delete jwk.q
    delete jwk.qi
  })
  return client
}

function ensureTestFile(path: string, name: string) {
  if (!exists(path)) {
    writeFileSync(
      path,
      `import test from 'ava'

test.todo('${name}')
`,
    )
  }
}

const { plan: ignored, algorithm: ignored2, ...parsedVariant } = JSON.parse(VARIANT)

const variant = {
  ...DEFAULTS[PLAN_NAME],
  ...parsedVariant,
}

export default async () => {
  const clientConfig = {
    client_id: `client-${UUID}`,
    client_secret: needsSecret(variant) ? `client-${UUID}` : undefined,
    scope: getScope(variant),
    redirect_uri: `https://client-${UUID}.local/cb`,
    jwks: {
      keys: await generate(),
    },
    // TODO: remove when https://gitlab.com/openid/conformance-suite/-/issues/1032 is resolved
    request_object_signing_alg: usesRequestObject(PLAN_NAME, variant) ? JWS_ALGORITHM : undefined,
    id_token_signed_response_alg: JWS_ALGORITHM,
  }

  const configuration = {
    description: `${name.split('/').reverse()[0]}/${version} (${homepage})`,
    alias: UUID,
    client: clientConfig,
    waitTimeoutSeconds: 2,
    ...(PLAN_NAME.startsWith('fapi')
      ? {
          server: {
            jwks: {
              keys: await generate(),
            },
          },
        }
      : undefined),
  }

  const plan = await api.createTestPlan(
    PLAN_NAME,
    {
      ...configuration,
      client: makePublicJwks(clientConfig),
    },
    variant,
  )

  const { certificationProfileName } = await api.getTestPlanInfo(plan)

  if (certificationProfileName) {
    console.log('CERTIFICATION PROFILE NAME:', certificationProfileName)
  }

  const files: Set<string> = new Set()
  for (const module of plan.modules) {
    switch (PLAN_NAME) {
      case 'fapi2-baseline-id2-client-test-plan': {
        const name = module.testModule.replace('fapi2-baseline-id2-client-test-', '')
        const path = `./build/conformance/fapi/${name}.js`
        ensureTestFile(path, name)
        files.add(path)
        break
      }
      case 'oidcc-client-test-plan':
      case 'oidcc-client-basic-certification-test-plan':
        const name = module.testModule.replace('oidcc-client-test-', '')
        const path = `./build/conformance/oidc/${name}.js`
        ensureTestFile(path, name)
        files.add(path)
        break
      default:
        throw new Error()
    }
  }

  return {
    environmentVariables: {
      CONFORMANCE: JSON.stringify({
        configuration,
        variant,
        plan,
      }),
    },
    concurrency: 1,
    require: ['./build/test/_pre.js'],
    files: [...files, './build/conformance/download_archive.js'],
    nodeArguments: ['--enable-source-maps', '--conditions=browser'],
  }
}
