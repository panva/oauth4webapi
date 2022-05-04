import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-sig-hs256')) {
  test.serial(red, module, 'unsupported JWS "alg" identifier', 'UnsupportedOperationError')
}
