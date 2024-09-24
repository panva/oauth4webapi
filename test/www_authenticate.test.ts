import test from 'ava'
import type { ExecutionContext } from 'ava'
import { getResponse, issuer, client, endpoint } from './_setup.js'
import * as lib from '../src/index.js'

function response(headers: Headers) {
  return getResponse('', { status: 401, headers })
}

const name = 'www-authenticate'

async function getWWWAuthenticateChallengeError(t: ExecutionContext, response: Response) {
  return lib
    .processUserInfoResponse(
      {
        userinfo_endpoint: endpoint('userinfo'),
        ...issuer,
      },
      client,
      lib.skipSubjectCheck,
      response,
    )
    .then(
      () => {
        t.fail('rejection expected')
      },
      (err) => {
        if (!(err instanceof lib.WWWAuthenticateChallengeError)) {
          t.fail(err)
        }

        return err.cause
      },
    )
}

test('parseWwwAuthenticateChallenges()', async (t) => {
  {
    const headers = new Headers()
    headers.append(name, 'Basic realm="Access to the staging site", charset="UTF-8"')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'basic', parameters: { charset: 'UTF-8', realm: 'Access to the staging site' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Basic')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'basic', parameters: {} },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Basic realm=realm')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'basic', parameters: { realm: 'realm' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'BASIC REALM=realM')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'basic', parameters: { realm: 'realM' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Basic realm="realm"')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'basic', parameters: { realm: 'realm' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Basic auth-param1="value"')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'basic', parameters: { 'auth-param1': 'value' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(
      name,
      'Digest realm="http-auth@example.org", qop="auth, auth-int", algorithm=SHA-256, nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v", opaque="FQhe/qaU925kfnzjCev0ciny7QMkPqMAFRtzCUYo5tdS"',
    )
    headers.append(
      name,
      'Digest realm="http-auth@example.org", qop="auth, auth-int", algorithm=MD5, nonce="7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v", opaque="FQhe/qaU925kfnzjCev0ciny7QMkPqMAFRtzCUYo5tdS"',
    )

    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      {
        scheme: 'digest',
        parameters: {
          realm: 'http-auth@example.org',
          qop: 'auth, auth-int',
          algorithm: 'SHA-256',
          nonce: '7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v',
          opaque: 'FQhe/qaU925kfnzjCev0ciny7QMkPqMAFRtzCUYo5tdS',
        },
      },
      {
        scheme: 'digest',
        parameters: {
          realm: 'http-auth@example.org',
          qop: 'auth, auth-int',
          algorithm: 'MD5',
          nonce: '7ypf/xlj9XXwfDPEoM4URrv/xwf94BcCAzFZH4GiTo0v',
          opaque: 'FQhe/qaU925kfnzjCev0ciny7QMkPqMAFRtzCUYo5tdS',
        },
      },
    ])
  }

  {
    const headers = new Headers()
    headers.append(
      name,
      'Newauth realm="apps", type=1, title="Login to "apps"", Basic realm="simple"',
    )
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      {
        scheme: 'newauth',
        parameters: {
          realm: 'apps',
          type: '1',
          title: 'Login to "apps"',
        },
      },
      {
        scheme: 'basic',
        parameters: {
          realm: 'simple',
        },
      },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Basic')
    headers.append(name, 'DPoP')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'basic', parameters: {} },
      { scheme: 'dpop', parameters: {} },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Newauth realm="apps", type=1, title="Login to "apps","')
    headers.append(name, 'Newauth realm="apps", type=1, title="Login to "apps"')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to "apps",' } },
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to "apps' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Newauth realm="apps", type=1, title="Login to "apps",",')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to "apps",' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Newauth realm="apps", type=1, title="Login to "apps",')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to "apps' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Newauth realm="apps", type=1, title="Login to "apps","')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to "apps",' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Newauth realm="apps", type=1, title="Login to apps=asd"')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to apps=asd' } },
    ])
  }

  {
    const headers = new Headers()
    headers.append(name, 'Newauth realm="apps", title="Login to, apps=asd", type=1')
    t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), [
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to, apps=asd' } },
    ])
  }
})
