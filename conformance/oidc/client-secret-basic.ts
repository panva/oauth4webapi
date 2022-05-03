import { plan, test, green, modules } from '../runner'

if (plan.name === 'oidcc-client-test-plan') {
  test.todo('client-secret-basic')
} else {
  for (const module of modules('client-secret-basic')) {
    test.serial(green, module)
  }
}
