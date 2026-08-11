import { test, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  test.serial(flow(), module)
}
