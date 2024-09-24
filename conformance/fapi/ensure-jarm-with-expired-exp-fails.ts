import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-expired-exp-fails')) {
  test.serial(
    rejects(flow()),
    module,
    'unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp',
  )
}
