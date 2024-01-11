import { test, red, modules } from '../runner.js'

for (const module of modules('missing-iat')) {
  test.serial(red(), module, 'JWT "iat" (issued at) claim missing')
}
