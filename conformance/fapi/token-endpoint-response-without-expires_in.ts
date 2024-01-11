import { test, green, modules } from '../runner.js'

for (const module of modules('token-endpoint-response-without-expires_in')) {
  test.serial(green(), module)
}
