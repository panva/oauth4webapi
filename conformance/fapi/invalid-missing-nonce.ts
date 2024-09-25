import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('invalid-missing-nonce')) {
  test.serial(rejects(flow({ useNonce: true })), module, 'JWT "nonce" (nonce) claim missing')
}
