import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-jarm-signature-is-not-none')) {
  test.serial(red(), module, 'unexpected JWT "alg" header parameter')
}
