import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-missing-aud')) {
  test.serial(red(), module, 'JWT "aud" (audience) claim missing')
}
