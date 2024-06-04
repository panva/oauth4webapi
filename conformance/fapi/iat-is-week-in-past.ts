import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('iat-is-week-in-past')) {
  test.serial(
    rejects(flow()),
    module,
    'unexpected JWT "iat" (issued at) claim value, it is too far in the past',
  )
}
