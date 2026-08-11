import { test, skippable, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  test.serial(skippable(flow()), module)
}
