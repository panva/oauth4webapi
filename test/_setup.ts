import type { ExecutionContext } from 'ava'
import * as undici from 'undici'
import { Readable } from 'node:stream'
import * as jose from 'jose'

import type { AuthorizationServer, Client, JWSAlgorithm } from '../src/index.js'

export const ALGS: JWSAlgorithm[] = ['ES256', 'RS256', 'PS256', 'EdDSA']
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
    ALGS.map((alg) =>
      jose.generateKeyPair(alg).then((kp) => {
        t.context[alg] = <CryptoKeyPair>kp
      }),
    ),
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
}

export async function teardown(t: ExecutionContext<Context>) {
  t.context.mock.assertNoPendingInterceptors()
  await t.context.mock.close()
}

const identifier = 'https://op.example.com'

export function endpoint(pathname: string, base = identifier) {
  return new URL(pathname, base).href
}

export const issuer = <AuthorizationServer>{
  issuer: identifier,
}

export const client = <Client>{
  client_id: 'urn:example:client_id',
}

export function getResponse(
  body: string,
  { status = 200, headers = new Headers() } = {},
): Response {
  let bodyInit: BodyInit
  if (process.version.startsWith('v16')) {
    bodyInit = Buffer.from(body)
  } else {
    bodyInit = Readable.toWeb(Readable.from(Buffer.from(body)))
  }
  return new Response(bodyInit, { status, headers })
}

export const UA = /^oauth4webapi\/v\d+\.\d+\.\d+$/
