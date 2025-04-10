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
  {
    description: 'Single Bearer challenge with error and description',
    header: `Bearer error="invalid_token", error_description="The access token expired"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          error: 'invalid_token',
          error_description: 'The access token expired',
        },
      },
    ],
  },
  {
    description: 'Bearer challenge with escaped quote in description',
    header: `Bearer error="invalid_token", error_description="The token was \\"tampered\\""`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          error: 'invalid_token',
          error_description: `The token was "tampered"`,
        },
      },
    ],
  },
  {
    description: 'Multiple challenges: Bearer and Basic',
    header: `Bearer error="invalid_token", error_description="bad stuff", Basic realm="simple"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          error: 'invalid_token',
          error_description: 'bad stuff',
        },
      },
      {
        scheme: 'basic',
        parameters: {
          realm: 'simple',
        },
      },
    ],
  },
  {
    description: 'Digest challenge with quoted and unquoted params',
    header: `Digest realm="test", qop=auth, nonce="abc123"`,
    expected: [
      {
        scheme: 'digest',
        parameters: {
          realm: 'test',
          qop: 'auth',
          nonce: 'abc123',
        },
      },
    ],
  },
  {
    description: 'Challenge with token68 only',
    header: `Negotiate YIIB/wYJKoZIhvcSAQICAQBuggHkMIIB4AIBADGCAZowggGWAgEBMIGQMH4xCzAJBgNVBAYTAkJFMRUwEwYDVQQIEwxTb21lLVN0YXRlMRAwDgYDVQQHEwdCcnVzc2VsczEXMBUGA1UEChMOVGVzdCBDb21wYW55LCBJbmMxHDAaBgNVBAMTE1Rlc3QgUm9vdCBDZXJ0aWZpY2F0ZQ==`,
    expected: [
      {
        scheme: 'negotiate',
        parameters: {},
        token68:
          'YIIB/wYJKoZIhvcSAQICAQBuggHkMIIB4AIBADGCAZowggGWAgEBMIGQMH4xCzAJBgNVBAYTAkJFMRUwEwYDVQQIEwxTb21lLVN0YXRlMRAwDgYDVQQHEwdCcnVzc2VsczEXMBUGA1UEChMOVGVzdCBDb21wYW55LCBJbmMxHDAaBgNVBAMTE1Rlc3QgUm9vdCBDZXJ0aWZpY2F0ZQ==',
      },
    ],
  },
  {
    description: 'Weird spacing and commas between parameters',
    header: `Bearer   realm =   "something"   ,error="bad_token" ,  error_description = " spaced "`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          realm: 'something',
          error: 'bad_token',
          error_description: ' spaced ',
        },
      },
    ],
  },
  {
    description: 'Empty header',
    header: ``,
  },
  {
    description: 'Missing scheme',
    header: `error="invalid_token"`,
  },
  {
    description: 'Token68 followed by valid scheme (should parse only token68 as one challenge)',
    header: `Negotiate abc123==, Basic realm="test"`,
    expected: [
      {
        scheme: 'negotiate',
        parameters: {},
        token68: 'abc123==',
      },
      {
        scheme: 'basic',
        parameters: {
          realm: 'test',
        },
      },
    ],
  },
  {
    description: 'Unknown parameter included',
    header: `Bearer foobar="baz", scope="read"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          foobar: 'baz',
          scope: 'read',
        },
      },
    ],
  },
  {
    description: 'Missing parameter value (treated as token68)',
    header: `Bearer error=`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {},
        token68: 'error=',
      },
    ],
  },
  {
    description: 'Unmatched quote in quoted string',
    header: `Bearer realm="unclosed`,
  },
  {
    description: 'Missing equals sign between key and value',
    header: `Bearer error"invalid_token"`,
  },
  {
    description: 'Empty scheme with valid parameters',
    header: `  error="invalid_token", error_description="no scheme"`,
  },
  {
    description: 'Garbage input',
    header: `%%%%%%%`,
  },
  {
    description: 'Valid scheme followed by unparseable junk',
    header: `Bearer error="ok", ???`,
  },
  {
    description: 'Parameter value with stray escape',
    header: `Bearer error="bad\\escape\\"`,
  },
  {
    description: 'Token68 with trailing garbage',
    header: `Negotiate abc== ???`,
  },
  {
    description: 'Comma at the start (bad but possible)',
    header: `,Bearer realm="foo"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          realm: 'foo',
        },
      },
    ],
  },
  {
    description: 'Token68 and auth-param combined is not supported',
    header: `Negotiate abc123==, realm="ignored"`,
  },
  {
    description: 'Quoted value with escaped backslash',
    header: `Bearer error_description="bad \\\\ token"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          error_description: 'bad \\ token',
        },
      },
    ],
  },
  {
    description: 'Challenge with duplicated keys',
    header: `Bearer error="a", error="b"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          error: 'b', // last one wins
        },
      },
    ],
  },
  {
    description: 'Upper-case parameter keys (should be lowercased)',
    header: `Bearer ERROR="token", Scope="read"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          error: 'token',
          scope: 'read',
        },
      },
    ],
  },
  {
    description: 'Scheme with trailing space before param',
    header: `Basic   realm="spaces"`,
    expected: [
      {
        scheme: 'basic',
        parameters: {
          realm: 'spaces',
        },
      },
    ],
  },
  {
    description: 'Trailing comma with nothing after',
    header: `Bearer realm="foo",`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          realm: 'foo',
        },
      },
    ],
  },
  {
    description: 'Multiple valid challenges with one malformed (should still parse others)',
    header: `Bearer realm="foo", Digest blah==, Basic realm="bar"`,
    expected: [
      {
        scheme: 'bearer',
        parameters: {
          realm: 'foo',
        },
      },
      {
        scheme: 'digest',
        parameters: {},
        token68: 'blah==',
      },
      {
        scheme: 'basic',
        parameters: {
          realm: 'bar',
        },
      },
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
