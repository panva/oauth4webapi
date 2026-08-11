import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  test.serial(rejects(flow()), module, 'invalid ID Token "c_hash" (code hash) claim value')
}
