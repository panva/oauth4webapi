import { plan, test, flow, modules } from '../runner.js'

if (plan.name === 'oidcc-client-test-plan') {
  test.todo('client-secret-basic')
} else {
  for (const module of modules('client-secret-basic')) {
    test.serial(flow(), module)
  }
}
