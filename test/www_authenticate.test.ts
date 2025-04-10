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
        if (err instanceof lib.WWWAuthenticateChallengeError) {
          return err.cause
        }

        throw err
      },
    )
}

// Adapted from https://github.com/jylauril/w3ap/blob/3c77a869729feb7cf1ad3c4792ae45cf36260f6e/spec/tests/ReschkeSpec.coffee
// License: MIT (https://github.com/jylauril/w3ap/blob/3c77a869729feb7cf1ad3c4792ae45cf36260f6e/package.json#L47)
const vectors = [
  // fail
  {
    description: 'empty',
    header: '',
  },
  {
    description: 'empty * 2',
    header: ',',
  },
  {
    description:
      'with a comma between schema and auth-param (this is invalid because of the missing space characters after the scheme name)',
    header: 'Scheme, realm="foo"',
  },
  {
    description: 'parameter missing',
    header: 'Scheme',
  },
  {
    description: 'two schemes, parameters missing',
    header: 'Scheme, DPoP',
  },
  {
    description: 'two schemes, parameters missing in one',
    header: 'Scheme, DPoP algs="ES256"',
  },
  {
    description: 'using token format for a parameter including backslashes',
    header: 'Scheme realm=\\f\\o\\o',
  },
  {
    description:
      'a header field containing a Scheme challenge, with a realm missing the second double quote',
    header: 'Scheme realm="basic',
  },

  // pass
  {
    description: 'simple scheme',
    header: 'Scheme realm="foo"',
    expected: [{ scheme: 'scheme', parameters: { realm: 'foo' } }],
  },
  {
    description: 'simple scheme (using uppercase characters)',
    header: 'SCHEME REALM="foo"',
    expected: [{ scheme: 'scheme', parameters: { realm: 'foo' } }],
  },
  {
    description: 'using token format for realm',
    header: 'Scheme realm=foo',
    expected: [{ scheme: 'scheme', parameters: { realm: 'foo' } }],
  },
  {
    description: 'using single quotes (lax behaviour)',
    header: "Scheme realm='foo'",
    expected: [{ scheme: 'scheme', parameters: { realm: "'foo'" } }],
  },
  {
    description: "containing a %-escape (which isn't special here)",
    header: 'Scheme realm="foo%20bar"',
    expected: [{ scheme: 'scheme', parameters: { realm: 'foo%20bar' } }],
  },
  {
    description: 'with a comma between schema and auth-param',
    header: 'Scheme , realm="foo"',
    expected: [{ scheme: 'scheme', parameters: { realm: 'foo' } }],
  },
  {
    description: 'duplicate parameters, second one overwrites the first',
    header: 'Scheme realm="foo", realm="bar"',
    expected: [{ scheme: 'scheme', parameters: { realm: 'bar' } }],
  },
  {
    description: 'whitespace used in auth-param assignment (lax behaviour)',
    header: 'Scheme realm = "foo"',
    expected: [{ scheme: 'scheme', parameters: { realm: 'foo' } }],
  },
  {
    description: 'with realm using quoted string escapes',
    header: 'Scheme realm="\\"foo\\""',
    expected: [{ scheme: 'scheme', parameters: { realm: '"foo"' } }],
  },
  {
    description: 'with additional auth-params',
    header: 'Scheme realm="foo", bar="xyz",, a=b,,,c=d',
    expected: [{ scheme: 'scheme', parameters: { realm: 'foo', bar: 'xyz', a: 'b', c: 'd' } }],
  },
  {
    description: 'with an additional auth-param (but with reversed order)',
    header: 'Scheme bar="xyz", realm="foo"',
    expected: [{ scheme: 'scheme', parameters: { bar: 'xyz', realm: 'foo' } }],
  },
  {
    description: 'a header field containing one challenge, following an empty one',
    header: ',Scheme realm="basic"',
    expected: [{ scheme: 'scheme', parameters: { realm: 'basic' } }],
  },
  {
    description:
      'a header field containing two challenges, the first one for a new scheme and having a parameter using quoted-string syntax',
    header: 'Newauth realm="apps", type=1, title="Login to \\"apps\\"", Scheme realm="simple" ',
    expected: [
      { scheme: 'newauth', parameters: { realm: 'apps', type: '1', title: 'Login to "apps"' } },
      { scheme: 'scheme', parameters: { realm: 'simple' } },
    ],
  },
  {
    description:
      'a header field containing a Scheme challenge, with a quoted-string extension param that happens to contain the string "realm="',
    header: 'Scheme foo="realm=nottherealm", realm="basic"',
    expected: [{ scheme: 'scheme', parameters: { foo: 'realm=nottherealm', realm: 'basic' } }],
  },
  {
    description:
      'a header field containing a Scheme challenge, with a preceding extension param named "nottherealm"',
    header: 'Scheme nottherealm="nottherealm", realm="basic"',
    expected: [{ scheme: 'scheme', parameters: { nottherealm: 'nottherealm', realm: 'basic' } }],
  },
  {
    description: 'a token68 test without following equal sign',
    header: 'NTLS Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGEgd2l0aG91dCBlcXVhbCBzaWdu',
    expected: [
      {
        scheme: 'ntls',
        parameters: {},
        token68: 'Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGEgd2l0aG91dCBlcXVhbCBzaWdu',
      },
    ],
  },
  {
    description: 'a token68 test without following equal sign and another challenge',
    header:
      'NTLS Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGEgd2l0aG91dCBlcXVhbCBzaWdu, Scheme realm="foobar"',
    expected: [
      {
        scheme: 'ntls',
        parameters: {},
        token68: 'Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGEgd2l0aG91dCBlcXVhbCBzaWdu',
      },
      { scheme: 'scheme', parameters: { realm: 'foobar' } },
    ],
  },
  {
    description: 'a token68 test with following equal sign',
    header: 'NTLS Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGE=',
    expected: [{ scheme: 'ntls', parameters: {}, token68: 'Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGE=' }],
  },
  {
    description: 'a token68 test with following equal sign and another challenge',
    header: 'NTLS Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGE=, Scheme realm="foobar"',
    expected: [
      { scheme: 'ntls', parameters: {}, token68: 'Y2hhbGxlbmdlIHdpdGggYmFzZTY0IGRhdGE=' },
      { scheme: 'scheme', parameters: { realm: 'foobar' } },
    ],
  },
  {
    description: 'a token68 test with two following equal sign',
    header: 'NTLS Y2hhbGxlbmdlIHdpdGggbW9yZSBiYXNlNjQgZGF0YQ==',
    expected: [
      { scheme: 'ntls', parameters: {}, token68: 'Y2hhbGxlbmdlIHdpdGggbW9yZSBiYXNlNjQgZGF0YQ==' },
    ],
  },
  {
    description: 'a token68 test with two following equal sign and another challenge',
    header: 'NTLS Y2hhbGxlbmdlIHdpdGggbW9yZSBiYXNlNjQgZGF0YQ==, Scheme realm="foobar"',
    expected: [
      { scheme: 'ntls', parameters: {}, token68: 'Y2hhbGxlbmdlIHdpdGggbW9yZSBiYXNlNjQgZGF0YQ==' },
      { scheme: 'scheme', parameters: { realm: 'foobar' } },
    ],
  },
]

for (const vector of vectors) {
  test(`parseWwwAuthenticateChallenges() ${vector.description}`, async (t) => {
    const headers = new Headers()
    headers.append(name, vector.header)
    if (vector.expected) {
      t.deepEqual(await getWWWAuthenticateChallengeError(t, response(headers)), vector.expected)
    } else {
      await t.throwsAsync(getWWWAuthenticateChallengeError(t, response(headers)), {
        code: 'OAUTH_RESPONSE_IS_NOT_CONFORM',
      })
    }
  })
}
