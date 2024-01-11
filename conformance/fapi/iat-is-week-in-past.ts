import { test, red, modules, variant } from '../runner.js'

for (const module of modules('iat-is-week-in-past')) {
  if (variant.fapi_response_mode === 'jarm') {
    // TODO: https://gitlab.com/openid/conformance-suite/-/merge_requests/1368
    test.todo('iat-is-week-in-past')
  } else {
    test.serial(
      red,
      module,
      'unexpected JWT "iat" (issued at) claim value, it is too far in the past',
    )
  }
}
