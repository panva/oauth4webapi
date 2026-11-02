import { run, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(rejects(flow()), module, 'unexpected "state" response parameter encountered')
}
