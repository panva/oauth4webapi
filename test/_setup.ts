import type { ExecutionContext } from 'ava'
import * as undici from 'undici'
import * as jose from 'jose'

import type { AuthorizationServer, Client, JWSAlgorithm } from '../src/index.js'

export const ALGS: JWSAlgorithm[] = [
  'ES256',
  'RS256',
  'PS256',
  'ES384',
  'RS384',
  'PS384',
  'ES512',
  'RS512',
  'PS512',
  'EdDSA',
]
interface ContextAlgs {
  [key: string]: CryptoKeyPair
}
export type ContextWithAlgs = Context & ContextAlgs

export interface Context {
  mock: undici.MockAgent
  intercept: InstanceType<typeof undici.MockPool>['intercept']
}

export default (t: ExecutionContext<Context>) => {
  const mockAgent = new undici.MockAgent()
  mockAgent.disableNetConnect()
  undici.setGlobalDispatcher(mockAgent)
  const pool = mockAgent.get(identifier)

  t.context.mock ||= mockAgent
  t.context.intercept ||= undici.MockPool.prototype.intercept.bind(pool)
}

export async function setupContextKeys(t: ExecutionContext<ContextWithAlgs>) {
  await Promise.all(
    ALGS.map(async (alg) => (t.context[alg] = await jose.generateKeyPair<CryptoKey>(alg))),
  )
}

export async function setupJwks(t: ExecutionContext<ContextWithAlgs>) {
  await setupContextKeys(t)

  t.context
    .intercept({
      path: '/jwks',
      method: 'GET',
    })
    .reply(200, {
      keys: await Promise.all(
        ALGS.map((alg) =>
          jose.exportJWK(t.context[alg].publicKey).then((jwk) => ({ ...jwk, alg })),
        ),
      ),
    })
    .persist()
}

export async function teardown(t: ExecutionContext<Context>) {
  const pending = t.context.mock.pendingInterceptors()
  if (!(pending.length === 1 && pending[0].persist === true)) {
    t.context.mock.assertNoPendingInterceptors()
  }
  await t.context.mock.close()
}

const identifier = 'https://op.example.com'

export function endpoint(pathname: string, base = identifier) {
  return new URL(pathname, base).href
}

export const issuer = {
  issuer: identifier,
} as AuthorizationServer

export const client = {
  client_id: 'urn:example:client_id',
} as Client

export function getResponse(body: string, { status = 200, headers = new Headers() } = {}) {
  return new Response(Buffer.from(body), { status, headers })
}

export const UA = /^oauth4webapi\/v\d+\.\d+\.\d+$/
