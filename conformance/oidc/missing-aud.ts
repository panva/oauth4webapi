import { test, red, modules } from '../runner.js'

for (const module of modules('missing-aud')) {
  test.serial(red, module, 'missing JWT "aud" (audience)')
}
