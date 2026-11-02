import { run, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(rejects(flow()), module, 'invalid ID Token "c_hash" (code hash) claim value')
}
