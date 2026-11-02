import { run, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(
    rejects(flow({ useState: true })),
    module,
    'invalid ID Token "s_hash" (state hash) claim value',
  )
}
