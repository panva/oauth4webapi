import { run, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(rejects(flow()), module, 'JWT "iat" (issued at) claim missing')
}
