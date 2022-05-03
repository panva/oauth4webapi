import { test, red, modules } from '../runner'

for (const module of modules('invalid-sig-es256')) {
  test.serial(red, module, 'JWT signature verification failed')
}
