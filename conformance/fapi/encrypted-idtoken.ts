import { test, green, modules } from '../runner.js'

for (const module of modules('encrypted-idtoken')) {
  test.serial(green, module)
}
