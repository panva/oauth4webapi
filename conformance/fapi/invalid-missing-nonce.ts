import { test, red, modules, variant } from '../runner.js'

// TODO: https://gitlab.com/openid/conformance-suite/-/merge_requests/1173#note_1013820212
if (variant.fapi_jarm_type === 'plain_oauth') {
  test.todo('invalid-missing-nonce')
} else {
  for (const module of modules('invalid-missing-nonce')) {
    test.serial(red, module, 'ID Token "nonce" claim missing', undefined, { useNonce: true })
  }
}
