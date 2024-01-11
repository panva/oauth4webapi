import { test, green, modules } from '../runner.js'

for (const module of modules('kid-absent-multiple-jwks')) {
  test.serial(green(), module)
}
