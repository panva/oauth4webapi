import { run, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(rejects(flow()), module, 'JWT "c_hash" (code hash) claim missing')
}
