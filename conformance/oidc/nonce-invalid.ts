import { test, red, modules } from '../runner'

for (const module of modules('nonce-invalid')) {
  test.serial(red, module, 'unexpected ID Token "nonce" claim value received')
}
