import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-aud')) {
  test.serial(red, module, 'unexpected JWT "aud" (audience) claim value')
}
