import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import test from 'ava'

import { downloadArtifact } from '../conformance/api.js'
import {
  getModuleHandler,
  isDiscoverableModule,
  isRunnableModule,
  sortConformanceTestFiles,
} from '../conformance/modules.js'
import {
  assertSafeIdentifier,
  clearReportRequest,
  formatReportSummary,
  getReportStatusPath,
  missingHandlerMessage,
  normalizeAvaTestTitle,
  reportIssues,
  reportRequested,
  requestReport,
  setActionEnvironment,
} from '../conformance/report.js'

test('AVA afterEach hook titles identify the affected test', (t) => {
  t.is(
    normalizeAvaTestTitle(
      'afterEach.always hook for missing conformance handler: newly-exposed-test',
    ),
    'missing conformance handler: newly-exposed-test',
  )
  t.is(normalizeAvaTestTitle('ordinary test title'), 'ordinary test title')
})

test('conformance module response type filtering', (t) => {
  t.false(isRunnableModule({ variant: { response_type: 'code token' } }))
  t.false(isRunnableModule({ variant: { response_type: 'code id_token token' } }))
  t.true(isRunnableModule({ variant: { response_type: 'code' } }))
  t.true(isRunnableModule({ variant: null }))

  const excluded = { variant: { response_type: 'code token' } }
  t.false(isDiscoverableModule('oidcc-client-test-plan', excluded))
  t.true(isDiscoverableModule('fapi2-security-profile-final-client-test-plan', excluded))
})

test('conformance diagnostics file is always sorted last', (t) => {
  const files = [
    '/repo/conformance/z-last-handler.ts',
    '/repo/conformance/download_archive.ts',
    '/repo/conformance/a-first-handler.ts',
  ]
  t.deepEqual(files.sort(sortConformanceTestFiles), [
    '/repo/conformance/a-first-handler.ts',
    '/repo/conformance/z-last-handler.ts',
    '/repo/conformance/download_archive.ts',
  ])

  t.true(
    sortConformanceTestFiles(
      'C:\\repo\\conformance\\download_archive.ts',
      'C:\\repo\\conformance\\handler.ts',
    ) > 0,
  )
})

test('conformance module handlers', (t) => {
  t.deepEqual(
    getModuleHandler('oidcc-client-basic-certification-test-plan', 'oidcc-client-test-new-test'),
    { name: 'new-test', path: './conformance/oidc/new-test.ts' },
  )
  t.deepEqual(
    getModuleHandler(
      'fapi2-message-signing-final-client-test-plan',
      'fapi2-message-signing-final-client-test-new-test',
    ),
    { name: 'new-test', path: './conformance/fapi/new-test.ts' },
  )
  t.throws(
    () =>
      getModuleHandler(
        'oidcc-client-basic-certification-test-plan',
        'oidcc-client-test-../../malicious',
      ),
    { message: 'unsafe conformance module handler name: ../../malicious' },
  )
  t.throws(
    () =>
      getModuleHandler('oidcc-client-basic-certification-test-plan', 'oidcc-client-test-.hidden'),
    { message: 'unsafe conformance module handler name: .hidden' },
  )
})

test('conformance identifiers', (t) => {
  t.is(assertSafeIdentifier('abc-123_DEF'), 'abc-123_DEF')
  t.true(getReportStatusPath('abc-123').endsWith('oauth4webapi-conformance-abc-123.report'))
  for (const value of ['', '../plan', 'plan.id', 'plan/child', `plan\nnext`]) {
    t.throws(() => assertSafeIdentifier(value, 'plan.id'), {
      message: 'plan.id is not a safe identifier',
    })
  }
})

test('artifact download rejects unsafe plan identifiers before fetching', async (t) => {
  await t.throwsAsync(downloadArtifact({ id: '../plan', name: 'plan-name', modules: [] }), {
    message: 'plan.id is not a safe identifier',
  })
})

test('missing conformance module handler message', (t) => {
  t.is(
    missingHandlerMessage('new-test', './conformance/oidc/new-test.ts'),
    'The conformance suite exposed a new test module named "new-test", but no handler exists at ./conformance/oidc/new-test.ts',
  )
})

test.serial('artifact download rejects an unsuccessful response before writing', async (t) => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('download failed', { status: 500 })
  t.teardown(() => {
    globalThis.fetch = originalFetch
  })

  await t.throwsAsync(downloadArtifact({ id: 'plan-id', name: 'plan-name', modules: [] }), {
    message: 'download failed',
  })
})

test('conformance issue report', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'oauth4webapi-conformance-test-'))
  const path = join(directory, 'report')
  t.teardown(() => rmSync(directory, { recursive: true, force: true }))

  requestReport(path, { type: 'warning', detail: 'warning-test' })
  requestReport(path, { type: 'failure', detail: 'failure-test' })
  requestReport(path, { type: 'failure', detail: 'failure-test' })

  t.true(reportRequested(path))
  const issues = reportIssues(path)
  t.deepEqual(issues, [
    { type: 'warning', detail: 'warning-test' },
    { type: 'failure', detail: 'failure-test' },
  ])

  const summary = formatReportSummary(
    { id: 'plan-id', name: 'plan-name' },
    { response_type: 'code' },
    issues,
  )
  t.true(summary.startsWith('## ❌ Conformance failure'))
  t.true(summary.includes('- Plan: `plan-name`'))
  t.true(summary.includes('- Plan ID: `plan-id`'))
  t.true(summary.includes('<summary>Variant</summary>'))
  t.true(summary.includes('"response_type": "code"'))
  t.true(summary.endsWith('### Affected tests\n\n- `warning-test`\n- `failure-test`'))

  clearReportRequest(path)
  t.false(reportRequested(path))
})

test('warning-only conformance report', (t) => {
  const summary = formatReportSummary({ id: 'plan`id\r', name: 'plan`name\nnext' }, {}, [
    { type: 'warning', detail: 'warning`test\r\nnext-line' },
  ])
  t.true(summary.startsWith('## ⚠️ Conformance warning'))
  t.true(summary.includes("- Plan: `plan'name next`"))
  t.true(summary.includes("- Plan ID: `plan'id `"))
  t.true(summary.endsWith("### Affected tests\n\n- `warning'test next-line`"))
  t.false(summary.includes('\r'))
})

test.serial('GitHub Actions environment values', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'oauth4webapi-actions-test-'))
  const path = join(directory, 'environment')
  const previous = process.env.GITHUB_ENV
  process.env.GITHUB_ENV = path
  t.teardown(() => {
    if (previous === undefined) {
      delete process.env.GITHUB_ENV
    } else {
      process.env.GITHUB_ENV = previous
    }
    rmSync(directory, { recursive: true, force: true })
  })

  setActionEnvironment('VALID_NAME', 'single-line')
  t.is(readFileSync(path, 'utf8'), 'VALID_NAME=single-line\n')
  t.throws(() => setActionEnvironment('INVALID-NAME', 'value'), {
    message: 'invalid GitHub Actions environment variable name',
  })
  for (const value of ['line\nnext', 'line\rnext']) {
    t.throws(() => setActionEnvironment('VALID_NAME', value), {
      message: 'GitHub Actions environment variable value must be single-line',
    })
  }
})
