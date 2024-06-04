import { test, flow, modules } from '../runner.js'

for (const module of modules('happy-path')) {
  test.serial(flow(), module)
}
