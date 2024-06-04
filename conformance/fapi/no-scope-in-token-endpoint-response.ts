import { test, flow, modules } from '../runner.js'

for (const module of modules('no-scope-in-token-endpoint-response')) {
  test.serial(flow(), module)
}
