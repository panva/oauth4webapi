import { test, green, modules } from '../runner'

const name = import.meta.url.split('/').reverse()[0].split('.')[0]

for (const module of modules(name)) {
  test.serial(green, module)
}
