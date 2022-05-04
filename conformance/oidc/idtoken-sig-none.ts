import { test, red, modules } from '../runner.js'

for (const module of modules('idtoken-sig-none')) {
  test.serial(red, module, 'unsupported JWS "alg" identifier', 'UnsupportedOperationError')
}
