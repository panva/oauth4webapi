import { test, flow, modules } from '../runner.js'

for (const module of modules('missing-athash')) {
  test.serial(flow(), module)
}
