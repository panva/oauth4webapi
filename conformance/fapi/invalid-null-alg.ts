import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-null-alg')) {
  test.serial(red, module, 'unexpected JWT "alg" header parameter')
}
