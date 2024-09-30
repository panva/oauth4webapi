import { test, flow, rejects, modules, variant } from '../runner.js'

for (const module of modules('kid-absent-multiple-jwks')) {
  if (
    module.variant?.response_type?.includes('id_token') === true ||
    variant.response_type?.includes('id_token') === true
  ) {
    test.serial(
      rejects(flow()),
      module,
      'error when selecting a JWT verification key, multiple applicable keys found, a "kid" JWT Header Parameter is required',
    )
  } else {
    test.serial(flow(), module)
  }
}
