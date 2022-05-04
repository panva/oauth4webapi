import { test, red, modules } from '../runner.js'

for (const module of modules('kid-absent-multiple-jwks')) {
  test.serial(
    red,
    module,
    'error when selecting a JWT verification key, multiple applicable keys found, a "kid" JWT Header Parameter is required',
  )
}
