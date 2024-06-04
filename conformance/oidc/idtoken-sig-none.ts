import { test, flow, modules } from '../runner.js'

for (const module of modules('idtoken-sig-none')) {
  test.serial(flow(), module)
}
