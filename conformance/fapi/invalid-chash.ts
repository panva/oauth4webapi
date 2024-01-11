import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-chash')) {
  test.serial(red, module, 'invalid ID Token "c_hash" (code hash) claim value')
}
