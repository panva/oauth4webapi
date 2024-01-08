import { test, green, modules } from '../runner.js'

for (const module of modules('missing-athash')) {
  test.serial(green, module)
}
