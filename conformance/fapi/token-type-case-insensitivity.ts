import { test, flow, modules } from '../runner.js'

for (const module of modules('token-type-case-insensitivity')) {
  test.serial(flow(), module)
}
