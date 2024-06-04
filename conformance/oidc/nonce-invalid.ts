import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('nonce-invalid')) {
  test.serial(rejects(flow()), module, 'unexpected ID Token "nonce" claim value')
}
