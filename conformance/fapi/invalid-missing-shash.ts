import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-missing-shash')) {
  test.serial(rejects(flow({ useState: true })), module, 'JWT "s_hash" (state hash) claim missing')
}
