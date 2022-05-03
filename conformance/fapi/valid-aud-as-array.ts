import { test, green, modules } from '../runner'

for (const module of modules('valid-aud-as-array')) {
  test.serial(green, module)
}
