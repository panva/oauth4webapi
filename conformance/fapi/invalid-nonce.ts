import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-nonce')) {
  test.serial(rejects(flow()), module, 'unexpected ID Token "nonce" claim value')
}
