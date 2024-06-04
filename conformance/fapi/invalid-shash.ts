import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-shash')) {
  test.serial(
    rejects(flow({ useState: true })),
    module,
    'invalid ID Token "s_hash" (state hash) claim value',
  )
}
