import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-expired-exp')) {
  test.serial(
    rejects(flow()),
    module,
    'unexpected JWT "exp" (expiration time) claim value, timestamp is <= now()',
    'OperationProcessingError',
  )
}
