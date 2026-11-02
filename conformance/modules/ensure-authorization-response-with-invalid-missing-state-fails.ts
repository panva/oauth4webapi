import { run, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(rejects(flow({ useState: true })), module, 'response parameter "state" missing')
}
