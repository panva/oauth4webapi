import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-secondary-aud')) {
  test.serial(
    rejects(flow()),
    module,
    'ID Token "aud" (audience) claim includes additional untrusted audiences',
    'OperationProcessingError',
  )
}
