import { test, green, modules } from '../runner'

for (const module of modules('token-type-case-insensitivity')) {
  test.serial(green, module)
}
