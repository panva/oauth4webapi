import * as crypto from 'node:crypto'
import { promisify } from 'node:util'

import * as puppeteer from 'puppeteer-core'
import { getChromePath } from 'chrome-launcher'
import Provider from 'oidc-provider'
import raw from 'raw-body'

import koaCors from '@koa/cors'

const generateKeyPair = promisify(crypto.generateKeyPair)

const es256 = await generateKeyPair('ec', { namedCurve: 'P-256' })

const jwks = {
  keys: [{ ...es256.privateKey.export({ format: 'jwk' }), alg: 'ES256' }],
}

const provider = new Provider('http://localhost:3000', {
  jwks,
  clientBasedCORS: () => true,
  features: {
    dPoP: {
      enabled: true,
      nonceSecret: crypto.randomBytes(32),
      requireNonce: () => true,
    },
    introspection: { enabled: true },
    revocation: { enabled: true },
    clientCredentials: { enabled: true },
    registration: { enabled: true },
    deviceFlow: { enabled: true },
    jwtIntrospection: { enabled: true },
    jwtResponseModes: { enabled: true },
    jwtUserinfo: { enabled: true },
    pushedAuthorizationRequests: { enabled: true },
    resourceIndicators: {
      enabled: true,
      getResourceServerInfo: (ctx, resource) => ({
        scope: 'api:write',
        ...(resource.includes('jwt')
          ? {
              accessTokenFormat: 'jwt',
              jwt: { sign: { alg: 'ES256' } },
            }
          : { accessTokenFormat: 'opaque' }),
      }),
    },
    requestObjects: {
      mode: 'strict',
      request: true,
    },
    userinfo: { enabled: true },
    mTLS: {
      enabled: true,
      certificateBoundAccessTokens: true,
      selfSignedTlsClientAuth: true,
    },
  },
  pkce: { required: () => true },
  clientAuthMethods: [
    'client_secret_basic',
    'client_secret_post',
    'private_key_jwt',
    'none',
    'self_signed_tls_client_auth',
  ],
})

const cors = koaCors()
provider.use((ctx, next) => {
  if (ctx.URL.pathname === '/drive' || ctx.URL.pathname === '/reg') {
    return cors(ctx, next)
  }

  return next()
})

provider.use(async (ctx, next) => {
  if (ctx.URL.pathname === '/drive' && ctx.method === 'POST') {
    let browser
    try {
      const body = await raw(ctx.req, {
        length: ctx.request.length,
        encoding: ctx.charset,
      })
      const params = new URLSearchParams(body.toString())

      browser = await puppeteer.launch({
        executablePath: getChromePath(),
        headless: 'new',
      })

      const s = '[type="submit"]'

      const page = await browser.newPage()
      await Promise.all([
        page.goto(params.get('goto')),
        page.waitForSelector(s),
        page.waitForNetworkIdle(),
      ])

      if ((await page.title()) === 'Device Login Confirmation') {
        await Promise.all([page.click(s), page.waitForSelector(s), page.waitForNetworkIdle()])
      }

      await page.type('[name="login"]', 'user')
      await page.type('[name="password"]', 'pass')
      await Promise.all([page.click(s), page.waitForSelector(s), page.waitForNetworkIdle()])
      await Promise.all([page.click(s), page.waitForNetworkIdle(s)])

      ctx.body = page.url()
    } finally {
      await browser?.close()
    }
  } else if (ctx.URL.pathname === '/cb') {
    ctx.body = ctx.URL.href
  } else {
    await next()
  }
})

provider.listen(3000)
