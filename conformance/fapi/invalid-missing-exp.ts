import { test, red, modules } from '../runner'

for (const module of modules('invalid-missing-exp')) {
  test.serial(red, module, 'missing JWT "exp" (expiration time)')
}
