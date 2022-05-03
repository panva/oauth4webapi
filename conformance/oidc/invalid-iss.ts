import { test, red, modules } from '../runner'

for (const module of modules('invalid-iss')) {
  test.serial(red, module, 'unexpected JWT "iss" (issuer)')
}
