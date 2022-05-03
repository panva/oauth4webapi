import test from 'ava'

import { downloadArtifact } from './api'
import { plan } from './runner'

test('downloading artifact', async (t) => {
  await downloadArtifact(plan)
  t.pass()
})
