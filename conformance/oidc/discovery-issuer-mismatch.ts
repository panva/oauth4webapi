import { test, red, modules } from '../runner.js'

for (const module of modules('discovery-issuer-mismatch')) {
  test.serial(red, module, '"response" body "issuer" does not match "expectedIssuer"')
}
