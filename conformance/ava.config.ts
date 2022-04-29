import { generateKeyPair } from 'node:crypto'
import { promisify } from 'node:util'
import { existsSync as exists, writeFileSync, readFileSync } from 'node:fs'

const { homepage, name, version } = JSON.parse(readFileSync('package.json').toString())

import '../test/_pre.mjs'

import * as api from './api'

const UUID = crypto.randomUUID()

import { JWS_ALGORITHM, PLAN_NAME, VARIANT } from './env'

switch (PLAN_NAME) {
  case 'oidcc-client-basic-certification-test-plan':
  case 'oidcc-client-test-plan':
    break
  default:
    throw new Error()
}

async function RS256() {
  return {
    ...(await promisify(generateKeyPair)('rsa', { modulusLength: 2048 })).privateKey.export({
      format: 'jwk',
    }),
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
    ...(await promisify(generateKeyPair)('ec', { namedCurve: 'P-256' })).privateKey.export({
      format: 'jwk',
    }),
    use: 'sig',
    alg: 'ES256',
    kid: crypto.randomUUID(),
  }
}

async function EdDSA() {
  return {
    ...(await promisify(generateKeyPair)('ed25519')).privateKey.export({
      format: 'jwk',
    }),
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

const defaultVariants: Record<typeof PLAN_NAME, Record<string, string>> = {
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
}

const { plan: ignored, algorithm: ignored2, ...parsedVariant } = JSON.parse(VARIANT)

const variant = {
  ...defaultVariants[PLAN_NAME],
  ...parsedVariant,
}

const clientConfig = {
  client_id: `client-${UUID}`,
  client_secret: `client-${UUID}`,
  scope: 'All your base are belong to us',
  redirect_uri: `https://client-${UUID}.local/cb`,
  jwks: {
    keys: await generate(),
  },
  // https://gitlab.com/openid/conformance-suite/-/issues/1032
  request_object_signing_alg: variant.request_type === 'request_object' ? JWS_ALGORITHM : undefined,
  id_token_signed_response_alg: JWS_ALGORITHM,
}

function makePublicJwks(def: typeof clientConfig) {
  const client = structuredClone(def)
  client.jwks.keys.forEach((jwk) => {
    delete jwk.d
    delete jwk.dp
    delete jwk.dq
    delete jwk.p
    delete jwk.q
    delete jwk.qi
  })
  return client
}

const configuration = {
  description: `${name.split('/').reverse()[0]}/${version} (${homepage})`,
  alias: UUID,
  client: clientConfig,
  waitTimeoutSeconds: 2,
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
  // if (module.testModule !== 'oidcc-client-test') continue
  switch (PLAN_NAME) {
    case 'oidcc-client-test-plan':
    case 'oidcc-client-basic-certification-test-plan':
      const path = `./conformance/oidc/${module.testModule}.ts`
      if (exists(path)) {
        files.add(path)
      } else {
        writeFileSync(
          path,
          `import test from 'ava'

test.todo('${module.testModule}')
`,
        )
      }
      break
    default:
      throw new Error()
  }
}

export default {
  extensions: {
    ts: 'module',
    mjs: true,
  },
  environmentVariables: {
    CONFORMANCE: JSON.stringify({
      configuration,
      variant,
      plan,
    }),
  },
  concurrency: 1,
  require: ['./test/_pre.mjs'],
  files: [...files, './conformance/download_archive.ts'],
  nodeArguments: [
    '--loader=ts-node/esm',
    '--enable-source-maps',
    '--no-warnings',
    '--conditions=browser',
    '--experimental-specifier-resolution=node',
  ],
}
