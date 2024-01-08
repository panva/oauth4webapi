import { test, skippable, modules } from '../runner.js'

for (const module of modules('invalid-signature')) {
  test.serial(skippable, module)
}
