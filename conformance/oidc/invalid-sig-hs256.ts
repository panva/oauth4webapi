import { test, skipped, modules } from '../runner.js'

for (const module of modules('invalid-sig-hs256')) {
  test.serial(skipped, module)
}
