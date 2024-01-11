import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-invalid-sig-fails')) {
  test.serial(red(), module, 'JWT signature verification failed')
}
