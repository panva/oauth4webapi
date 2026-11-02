import { run, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(flow(), module)
}
