import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  test.serial(
    rejects(flow({ useState: true })),
    module,
    'invalid ID Token "s_hash" (state hash) claim value',
  )
}
