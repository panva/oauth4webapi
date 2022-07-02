import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-missing-nonce')) {
  test.serial(red, module, 'ID Token "nonce" claim missing', undefined, { useNonce: true })
}
