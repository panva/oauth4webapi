import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-missing-iss')) {
  test.serial(red, module, 'JWT "iss" (issuer) claim missing')
}
