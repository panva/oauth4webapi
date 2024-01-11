import { test, green, modules } from '../runner.js'

for (const module of modules('no-scope-in-token-endpoint-response')) {
  test.serial(green(), module)
}
