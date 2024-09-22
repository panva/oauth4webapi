import * as lib from '../src/index.js'
import * as jose from 'jose'

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

export function random() {
  return Math.random() < 0.5
}

export function unexpectedAuthorizationServerError(
  input: lib.WWWAuthenticateChallenge[] | lib.OAuth2Error,
) {
  let msg: string
  if ('error' in input) {
    msg = `${input.error}: ${input.error_description}`
  } else {
    msg = `${input[0].parameters.error}: ${input[0].parameters.error_description}`
  }
  return new Error(msg, { cause: input })
}

export function assertNotOAuth2Error(
  input: Parameters<typeof lib.isOAuth2Error>[0],
): input is Exclude<Parameters<typeof lib.isOAuth2Error>[0], lib.OAuth2Error> {
  if (lib.isOAuth2Error(input)) {
    throw unexpectedAuthorizationServerError(input)
  }
  return true
}

export function assertNoWwwAuthenticateChallenges(response: Response) {
  let challenges: lib.WWWAuthenticateChallenge[] | undefined
  if ((challenges = lib.parseWwwAuthenticateChallenges(response))) {
    throw unexpectedAuthorizationServerError(challenges)
  }
}

export async function setup(
  alg: lib.JWSAlgorithm,
  kp: CryptoKeyPair,
  authMethod: lib.ClientAuthenticationMethod,
  jar: boolean,
  jwtUserinfo: boolean,
  jwtIntrospection: boolean,
  grantTypes: string[],
  encryption: boolean,
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

  const encKp = await jose.generateKeyPair('ECDH-ES')
  const encJwk = await jose.exportJWK(encKp.publicKey)
  const clientEncJwk = {
    ...encJwk,
    alg: 'ECDH-ES',
    use: 'enc',
    kid: await jose.calculateJwkThumbprint(encJwk),
    key_ops: undefined,
    ext: undefined,
  }

  const authEndpoint = grantTypes.includes('authorization_code')

  function makeJwks() {
    let keys: lib.JWK[] = []
    if (authMethod === 'private_key_jwt' || jar) {
      keys.push(clientJwk)
    }

    if (encryption) {
      keys.push(clientEncJwk)
    }

    if (keys.length) {
      return { keys }
    }

    return undefined
  }

  const metadata = {
    token_endpoint_auth_method: authMethod,
    redirect_uris: [] as string[],
    id_token_signed_response_alg: alg,
    request_object_signing_alg: jar ? alg : undefined,
    userinfo_signed_response_alg: jwtUserinfo ? alg : undefined,
    introspection_signed_response_alg: alg,
    authorization_signed_response_alg: alg,
    ...(encryption
      ? {
          authorization_encrypted_response_alg: 'ECDH-ES',
          id_token_encrypted_response_alg: 'ECDH-ES',
          userinfo_encrypted_response_alg: jwtUserinfo ? 'ECDH-ES' : undefined,
          introspection_encrypted_response_alg: jwtIntrospection ? 'ECDH-ES' : undefined,
        }
      : undefined),
    response_types: [] as string[],
    require_auth_time: authEndpoint && random(),
    default_max_age: authEndpoint ? (random() ? (random() ? 30 : 0) : undefined) : undefined,
    grant_types: grantTypes,
    jwks: makeJwks(),
  }

  if (authEndpoint) {
    metadata.redirect_uris.push('http://localhost:3000/cb')
    if (grantTypes.includes('implicit')) {
      metadata.response_types.push('code id_token')
    } else {
      metadata.response_types.push('code')
    }
  }

  let response = await fetch(new URL('http://localhost:3000/reg'), {
    method: 'POST',
    headers: { 'content-type': 'application/json;charset=utf-8' },
    body: JSON.stringify(metadata),
  })

  if (response.status !== 201) {
    throw new Error(await response.text())
  }

  return {
    client: {
      ...(await response.json()),
      introspection_signed_response_alg: jwtIntrospection ? alg : undefined,
      async [lib.jweDecrypt](jwe) {
        const { plaintext } = await jose
          .compactDecrypt(jwe, encKp.privateKey, {
            keyManagementAlgorithms: ['ECDH-ES'],
            contentEncryptionAlgorithms: ['A128CBC-HS256'],
          })
          .catch((cause) => {
            throw new lib.OperationProcessingError('decryption failed', { cause })
          })
        return new TextDecoder().decode(plaintext)
      },
    },
    clientPrivateKey: {
      kid: clientJwk.kid,
      key: clientKeyPair.privateKey,
    },
    issuerIdentifier: new URL('http://localhost:3000'),
  }
}
