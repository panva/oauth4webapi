import type QUnit from 'qunit'
import * as lib from '../src/index.js'

const b64length = (raw: number) => Math.ceil((raw * 4) / 3)

export default (QUnit: QUnit) => {
  const { module, test } = QUnit
  module('random.ts')

  test('generateRandomCodeVerifier()', (t) => {
    const codeVerifier = lib.generateRandomCodeVerifier()
    t.equal(codeVerifier.length, b64length(32))
  })

  test('calculatePKCECodeChallenge() - https://www.rfc-editor.org/rfc/rfc7636#appendix-B', async (t) => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    t.equal(
      await lib.calculatePKCECodeChallenge(verifier),
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    )
  })

  test('generateRandomState()', (t) => {
    const state = lib.generateRandomState()
    t.equal(state.length, b64length(32))
  })

  test('generateRandomNonce()', (t) => {
    const nonce = lib.generateRandomNonce()
    t.equal(nonce.length, b64length(32))
  })
}
