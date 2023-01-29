import * as crypto from 'node:crypto'
import { promisify } from 'node:util'
import { existsSync as exists, writeFileSync, readFileSync } from 'node:fs'

const generateKeyPair = promisify(crypto.generateKeyPair)

const { homepage, name, version } = JSON.parse(readFileSync('package.json').toString())

import * as api from './api.js'

const UUID = crypto.randomUUID()

import { JWS_ALGORITHM, PLAN_NAME, VARIANT } from './env.js'

switch (PLAN_NAME) {
  case 'oidcc-client-basic-certification-test-plan':
  case 'oidcc-client-test-plan':
  case 'fapi2-security-profile-id2-client-test-plan':
  case 'fapi2-message-signing-id1-client-test-plan':
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
      return true
    default:
      return false
  }
}

const DEFAULTS: Record<typeof PLAN_NAME, Record<string, string>> = {
  'oidcc-client-test-plan': {
    response_mode: 'default',
    client_registration: 'static_client',
    request_type: 'plain_http_request', // plain_http_request, request_object
    response_type: 'code',
    client_auth_type: 'client_secret_basic', // none, client_secret_basic, client_secret_post, private_key_jwt
  },
  'oidcc-client-basic-certification-test-plan': {
    request_type: 'plain_http_request',
    client_registration: 'static_client',
  },
  'fapi2-security-profile-id2-client-test-plan': {
    client_auth_type: 'private_key_jwt',
    sender_constrain: 'dpop',
    fapi_client_type: 'oidc', // oidc, plain_oauth
    fapi_profile: 'plain_fapi',
  },
  'fapi2-message-signing-id1-client-test-plan': {
    client_auth_type: 'private_key_jwt',
    sender_constrain: 'dpop',
    fapi_client_type: 'oidc', // oidc, plain_oauth
    fapi_profile: 'plain_fapi',
    fapi_request_method: 'signed_non_repudiation',
    fapi_response_mode: 'jarm',
  },
}

export function getScope(variant: Record<string, string>) {
  return variant.fapi_client_type === 'plain_oauth' ? 'email' : 'openid email'
}

export function logToActions(content: string) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSync(process.env.GITHUB_STEP_SUMMARY, `${content}\n`, { flag: 'a' })
  }
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

const variant = {
  ...DEFAULTS[PLAN_NAME],
  ...JSON.parse(VARIANT),
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

  logToActions('Test Plan Details')
  logToActions('')
  logToActions(`- Name: **${PLAN_NAME}**`)
  logToActions(`- ID: **\`${plan.id}\`**`)
  logToActions(`- Variant`)
  for (const [key, value] of Object.entries(variant)) {
    logToActions(`  - ${key}: ${value}`)
  }
  if (certificationProfileName) {
    console.log('CERTIFICATION PROFILE NAME:', certificationProfileName)
    logToActions(`- Certification Profile Name: **${certificationProfileName}**`)
  }

  const files: Set<string> = new Set()
  for (const module of plan.modules) {
    switch (PLAN_NAME) {
      case 'fapi2-security-profile-id2-client-test-plan':
      case 'fapi2-message-signing-id1-client-test-plan': {
        const name = module.testModule.replace(
          /fapi2-(security-profile-id2|message-signing-id1)-client-test-/,
          '',
        )
        const path = `./conformance/fapi/${name}.ts`
        ensureTestFile(path, name)
        files.add(path)
        break
      }
      case 'oidcc-client-test-plan':
      case 'oidcc-client-basic-certification-test-plan':
        const name = module.testModule.replace('oidcc-client-test-', '')
        const path = `./conformance/oidc/${name}.ts`
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
    extensions: {
      ts: 'module',
      mjs: true,
    },
    files: [...files, './conformance/download_archive.ts'],
    workerThreads: false,
    nodeArguments: ['--enable-source-maps'],
  }
}
