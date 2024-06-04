import { test, flow, modules } from '../runner.js'

for (const module of modules('fapi1-advanced-final-client-test')) {
  test.serial(flow(), module)
}
