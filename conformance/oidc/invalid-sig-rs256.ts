import { test, red, modules } from '../runner.js'

for (const module of modules('invalid-sig-rs256')) {
  test.serial(red, module, 'JWT signature verification failed')
}
