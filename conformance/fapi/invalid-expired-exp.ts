import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-expired-exp')) {
  test.serial(
    red(),
    module,
    'unexpected JWT "exp" (expiration time) claim value, timestamp is <= now()',
    'OperationProcessingError',
  )
}
