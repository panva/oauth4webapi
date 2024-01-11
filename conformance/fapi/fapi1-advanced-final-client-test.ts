import { test, green, modules } from '../runner.js'

for (const module of modules('fapi1-advanced-final-client-test')) {
  test.serial(green(), module)
}
