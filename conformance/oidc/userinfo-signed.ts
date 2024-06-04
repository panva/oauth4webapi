import { test, flow, modules } from '../runner.js'

for (const module of modules('userinfo-signed')) {
  test.serial(flow(), module)
}
