import { test, red, modules } from '../runner'

for (const module of modules('invalid-aud')) {
  test.serial(red, module, 'unexpected JWT "aud" (audience)')
}
