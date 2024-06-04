import { test, rejects, flow, modules } from '../runner.js'

for (const module of modules('userinfo-invalid-sub')) {
  test.serial(rejects(flow()), module, 'unexpected "response" body "sub" value')
}
