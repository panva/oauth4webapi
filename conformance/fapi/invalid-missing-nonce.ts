import { test, skippable, modules } from '../runner.js'

for (const module of modules('invalid-missing-nonce')) {
  test.serial(skippable, module)
}
