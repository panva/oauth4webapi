import test from 'ava'

import { downloadArtifact } from './api.js'
import {
  clearReportRequest,
  formatReportSummary,
  reportIssues,
  reportRequested,
  setActionEnvironment,
  writeStepSummary,
} from './report.js'
import { plan, reportStatusPath, variant } from './runner.js'

test('emitting conformance diagnostics when needed', async (t) => {
  const shouldReport = reportRequested(reportStatusPath)
  const submission = process.env.CONFORMANCE_SUBMISSION === 'true'
  if (!shouldReport && !submission) {
    t.pass()
    return
  }

  const issues = shouldReport ? reportIssues(reportStatusPath) : []
  if (shouldReport) {
    t.log('Conformance diagnostics requested for', issues)
  }

  try {
    await downloadArtifact(plan)
  } finally {
    if (shouldReport) {
      clearReportRequest(reportStatusPath)
    }
  }

  if (shouldReport) {
    writeStepSummary(formatReportSummary(plan, variant, issues))
    setActionEnvironment('CONFORMANCE_REPORT', 'true')
  }

  t.pass()
})
