import { test, flow, modules } from '../runner.js'

for (const module of modules('kid-absent-multiple-jwks')) {
  test.serial(flow(), module)
}
