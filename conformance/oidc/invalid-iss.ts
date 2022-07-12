import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-iss')) {
  test.serial(red, module, 'unexpected JWT "iss" (issuer) claim value')
}
