import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-secondary-aud')) {
  test.serial(
    rejects(flow()),
    module,
    'unexpected ID Token "azp" (authorized party) claim value',
    'OperationProcessingError',
  )
}
