import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-signature')) {
  test.serial(red, module, 'JWT signature verification failed')
}
