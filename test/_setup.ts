import type { ExecutionContext } from 'ava'
import * as undici from 'undici'
import * as jose from 'jose'

import type { AuthorizationServer, Client } from '../src/index.js'

interface ContextAlgs {
  [key: string]: CryptoKeyPair
}
export type ContextWithAlgs = Context & ContextAlgs

export interface Context {
  mock: undici.MockAgent
  intercept: InstanceType<typeof undici.MockPool>['intercept']
}

export default (origin: string = identifier) =>
  (t: ExecutionContext<Context>) => {
    const mockAgent = new undici.MockAgent()
    mockAgent.disableNetConnect()
    undici.setGlobalDispatcher(mockAgent)
    const pool = mockAgent.get(origin)

    t.context.mock ||= mockAgent
    t.context.intercept ||= undici.MockPool.prototype.intercept.bind(pool)
  }

export async function setupContextKeys(t: ExecutionContext<ContextWithAlgs>) {
  t.context.ES256 = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ])
  t.context.RS256 = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    },
    true,
    ['sign', 'verify'],
  )
}

const coinflip = () => !Math.floor(Math.random() * 2)

export async function setupJwks(t: ExecutionContext<ContextWithAlgs>) {
  await setupContextKeys(t)

  t.context
    .intercept({
      path: '/jwks',
      method: 'GET',
    })
    .reply(
      200,
      {
        keys: [
          await jose.exportJWK(t.context.ES256.publicKey).then((jwk) => ({ ...jwk, alg: 'ES256' })),
          await jose.exportJWK(t.context.RS256.publicKey).then((jwk) => ({ ...jwk, alg: 'RS256' })),
        ],
      },
      {
        headers: { 'content-type': coinflip() ? 'application/json' : 'application/jwk-set+json' },
      },
    )
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

export function getResponse(
  body: string,
  { status = 200, headers = new Headers({ 'content-type': 'application/json' }) } = {},
) {
  return new Response(Buffer.from(body), { status, headers })
}

export const UA = /^oauth4webapi\/v\d+\.\d+\.\d+$/
