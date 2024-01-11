import { test, red, modules } from '../runner.js'

for (const module of modules('missing-sub')) {
  test.serial(red(), module, 'JWT "sub" (subject) claim missing')
}
