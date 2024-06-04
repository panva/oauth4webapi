import { test, flow, modules } from '../runner.js'

for (const module of modules('encrypted-idtoken')) {
  test.serial(flow(), module)
}
