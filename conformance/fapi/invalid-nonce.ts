import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-nonce')) {
  test.serial(red, module, 'unexpected ID Token "nonce" claim value')
}
