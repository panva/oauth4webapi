import { test, green, modules } from '../runner.js'

for (const module of modules('token-type-case-insensitivity')) {
  test.serial(green(), module)
}
