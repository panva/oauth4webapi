import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-missing-exp')) {
  test.serial(red(), module, 'JWT "exp" (expiration time) claim missing')
}
