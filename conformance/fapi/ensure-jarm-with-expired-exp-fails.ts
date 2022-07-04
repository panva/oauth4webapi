import { test, red, modules } from '../runner.js'

for (const module of modules('ensure-jarm-with-expired-exp-fails')) {
  test.serial(red, module, 'JWT "exp" (expiration time) timestamp is <= now()')
}