import { test, flow, modules } from '../runner.js'

for (const module of modules('valid-aud-as-array')) {
  test.serial(flow(), module)
}
