import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-shash')) {
  test.serial(red, module, 'invalid ID Token "s_hash" (state hash) claim value')
}
