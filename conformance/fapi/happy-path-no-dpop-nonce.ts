import { test, flow, modules } from '../runner.js'

for (const module of modules('happy-path-no-dpop-nonce')) {
  test.serial(flow(), module)
}
