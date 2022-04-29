import test from 'ava'

import { downloadArtifact } from './api'
import { plan } from './oidc/runner'

test('downloading artifact', async (t) => {
  await downloadArtifact(plan)
  t.pass()
})
