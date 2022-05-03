import { test, red, modules } from '../runner'

for (const module of modules('invalid-null-alg')) {
  test.serial(red, module, 'unexpected JWT "alg" header parameter')
}
