import { test, red, modules } from '../runner'

for (const module of modules('missing-sub')) {
  test.serial(red, module, 'missing JWT "sub" (subject)')
}
