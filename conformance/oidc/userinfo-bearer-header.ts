import { test, flow, modules } from '../runner.js'

for (const module of modules('userinfo-bearer-header')) {
  test.serial(flow(), module)
}
