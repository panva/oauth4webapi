import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-expired-exp-fails')) {
  test.serial(
    red,
    module,
    'unexpected JWT "exp" (expiration time) claim value, timestamp is <= now()',
  )
}
