import { run, rejects, flow, modules } from '../runner.js'

for (const module of modules(import.meta.url)) {
  run(
    rejects(flow()),
    module,
    'ID Token "aud" (audience) claim includes additional untrusted audiences',
    'OperationProcessingError',
  )
}
