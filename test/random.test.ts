import test from 'ava'
import * as lib from '../src/index.js'

test('generateRandomCodeVerifier()', (t) => {
  const codeVerifier = lib.generateRandomCodeVerifier()
  t.is(Buffer.from(codeVerifier, 'base64url').byteLength, 32)
})

test('calculatePKCECodeChallenge() - https://www.rfc-editor.org/rfc/rfc7636#appendix-B', async (t) => {
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
  t.is(
    await lib.calculatePKCECodeChallenge(verifier),
    'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
  )
})

test('generateRandomState()', (t) => {
  const state = lib.generateRandomState()
  t.is(Buffer.from(state, 'base64url').byteLength, 32)
})

test('generateRandomNonce()', (t) => {
  const nonce = lib.generateRandomNonce()
  t.is(Buffer.from(nonce, 'base64url').byteLength, 32)
})
