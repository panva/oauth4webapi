import {
  test,
  skippable,
  rejects,
  flow,
  modules,
  nonRepudiation,
  plan,
  variant,
} from '../runner.js'

for (const module of modules('invalid-signature')) {
  if (nonRepudiation(plan, variant)) {
    test.serial(rejects(flow()), module, 'JWT signature verification failed')
  } else {
    test.serial(skippable(flow()), module)
  }
}
