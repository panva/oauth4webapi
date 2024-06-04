import { test, flow, modules } from '../runner.js'

for (const module of modules('scope-userinfo-claims')) {
  test.serial(flow(), module)
}
