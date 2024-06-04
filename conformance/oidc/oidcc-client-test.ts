import { test, flow, modules } from '../runner.js'

const name = import.meta.url.split('/').reverse()[0].split('.')[0]

for (const module of modules(name)) {
  test.serial(flow(), module)
}
