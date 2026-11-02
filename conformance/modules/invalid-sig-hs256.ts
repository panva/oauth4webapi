import { run, skippable, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(skippable(flow()), module)
}
