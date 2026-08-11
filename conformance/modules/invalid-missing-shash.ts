import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  test.serial(rejects(flow({ useState: true })), module, 'JWT "s_hash" (state hash) claim missing')
}
