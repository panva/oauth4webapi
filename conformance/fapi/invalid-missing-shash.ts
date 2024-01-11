import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-missing-shash')) {
  test.serial(red({ useState: true }), module, 'JWT "s_hash" (state hash) claim missing')
}
