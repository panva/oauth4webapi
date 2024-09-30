import { test, flow, modules } from '../runner.js'

for (const module of modules('nonce-unless-code-flow')) {
  test.serial(flow(), module)
}
