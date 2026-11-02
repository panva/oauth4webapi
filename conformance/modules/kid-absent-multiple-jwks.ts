import { run, flow, rejects, modules, variant } from '../runner.js'

for (const module of modules(import.meta.url)) {
  if (
    module.variant?.response_type?.includes('id_token') === true ||
    variant.response_type?.includes('id_token') === true
  ) {
    run(
      rejects(flow()),
      module,
      'error when selecting a JWT verification key, multiple applicable keys found, a "kid" JWT Header Parameter is required',
    )
  } else {
    run(flow(), module)
  }
}
