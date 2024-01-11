import { test, red, modules, plan, variant } from '../runner.js'

for (const module of modules('invalid-missing-nonce')) {
  test.serial(
    red({ useNonce: true }),
    module,
    plan.name.startsWith('fapi1') && variant.fapi_response_mode !== 'jarm'
      ? 'JWT "nonce" (nonce) claim missing'
      : 'ID Token "nonce" claim missing',
  )
}
