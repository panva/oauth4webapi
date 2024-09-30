import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('missing-chash')) {
  test.serial(rejects(flow()), module, 'JWT "c_hash" (code hash) claim missing')
}
