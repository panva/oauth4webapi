import { run, skippable, rejects, flow, modules, nonRepudiation, plan, variant } from '../runner.js'

for (const module of modules(import.meta.url)) {
  if (nonRepudiation(plan, variant)) {
    run(rejects(flow()), module, 'JWT signature verification failed')
  } else {
    run(skippable(flow()), module)
  }
}
