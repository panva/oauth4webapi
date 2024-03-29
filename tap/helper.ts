import * as lib from '../src/index.js'
import * as jose from 'jose'

// @ts-ignore
import packageJson from '../package.json' assert { type: 'json' }

export function isDpopNonceError(input: lib.OAuth2Error | lib.WWWAuthenticateChallenge[]) {
  if ('error' in input) {
    return input.error === 'use_dpop_nonce'
  } else {
    return (
      input.length === 1 &&
      input[0].scheme === 'dpop' &&
      input[0].parameters.error === 'use_dpop_nonce'
    )
  }
}

export async function setup(
  alg: lib.JWSAlgorithm,
  kp: CryptoKeyPair,
  authMethod: lib.ClientAuthenticationMethod,
  jar: boolean,
  jwtUserinfo: boolean,
  jwtIntrospection: boolean,
): Promise<{
  client: lib.Client
  issuerIdentifier: URL
  clientPrivateKey: lib.PrivateKey
}> {
  const clientKeyPair = kp
  const jwk = await jose.exportJWK(clientKeyPair.publicKey)
  const clientJwk = {
    ...jwk,
    alg,
    use: 'sig',
    kid: await jose.calculateJwkThumbprint(jwk),
    key_ops: undefined,
    ext: undefined,
  }

  let response = await fetch(new URL('http://localhost:3000/reg'), {
    method: 'POST',
    headers: { 'content-type': 'application/json;charset=utf-8' },
    body: JSON.stringify({
      token_endpoint_auth_method: authMethod,
      redirect_uris: ['http://localhost:3000/cb'],
      id_token_signed_response_alg: alg,
      request_object_signing_alg: jar ? alg : undefined,
      userinfo_signed_response_alg: jwtUserinfo ? alg : undefined,
      introspection_signed_response_alg: alg,
      authorization_signed_response_alg: alg,
      grant_types: [
        'client_credentials',
        'authorization_code',
        'refresh_token',
        'urn:ietf:params:oauth:grant-type:device_code',
      ],
      jwks:
        authMethod === 'private_key_jwt' || jar
          ? {
              keys: [clientJwk],
            }
          : undefined,
    }),
  })

  if (response.status !== 201) {
    throw new Error(await response.text())
  }

  return {
    client: {
      ...(await response.json()),
      introspection_signed_response_alg: jwtIntrospection ? alg : undefined,
    },
    clientPrivateKey: {
      kid: clientJwk.kid,
      key: clientKeyPair.privateKey,
    },
    issuerIdentifier: new URL('http://localhost:3000'),
  }
}
