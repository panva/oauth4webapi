import type { ModulePrescription } from './api.js'

const SAFE_HANDLER_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const DIAGNOSTICS_FILE = '/conformance/download_archive.ts'
const SKIPPED_OIDC_MODULES = new Set([
  'aggregated-claims',
  'discovery-jwks-uri-keys',
  'discovery-openid-config',
  'discovery-webfinger-acct',
  'discovery-webfinger-url',
  'distributed-claims',
  'signing-key-rotation',
  'signing-key-rotation-just-before-signing',
  'userinfo-bearer-body',
])

function assertSafeHandlerName(name: string) {
  if (!SAFE_HANDLER_NAME.test(name)) {
    throw new TypeError(`unsafe conformance module handler name: ${name}`)
  }
  return name
}

export function sortConformanceTestFiles(first: string, second: string) {
  const firstIsDiagnostics = first.replaceAll('\\', '/').endsWith(DIAGNOSTICS_FILE)
  const secondIsDiagnostics = second.replaceAll('\\', '/').endsWith(DIAGNOSTICS_FILE)
  if (firstIsDiagnostics !== secondIsDiagnostics) {
    return firstIsDiagnostics ? 1 : -1
  }
  return first.localeCompare(second)
}

export function isSkippedUnhandledModule(planName: string, name: string) {
  return planName.startsWith('oidcc-') && SKIPPED_OIDC_MODULES.has(name)
}

export function isRunnableModule(module: Pick<ModulePrescription, 'variant'>) {
  switch (module.variant?.response_type) {
    case 'code token':
    case 'code id_token token':
      return false
    default:
      return true
  }
}

export function isDiscoverableModule(
  planName: string,
  module: Pick<ModulePrescription, 'variant'>,
) {
  return !planName.startsWith('oidcc-') || isRunnableModule(module)
}

export function getModuleHandler(testModule: string) {
  const name = assertSafeHandlerName(
    testModule.replace(
      /(?:fapi2-(?:security-profile-final|message-signing-final)|fapi1-advanced-final|oidcc)-client-test-/,
      '',
    ),
  )
  return { name, path: `./conformance/modules/${name}.ts` }
}
