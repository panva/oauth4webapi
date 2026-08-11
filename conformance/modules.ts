import type { ModulePrescription } from './api.js'

const SAFE_HANDLER_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const DIAGNOSTICS_FILE = '/conformance/download_archive.ts'

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

export function getModuleHandler(planName: string, testModule: string) {
  switch (planName) {
    case 'fapi1-advanced-final-client-test-plan':
    case 'fapi2-security-profile-final-client-test-plan':
    case 'fapi2-message-signing-final-client-test-plan': {
      const name = assertSafeHandlerName(
        testModule.replace(
          /(?:fapi2-(?:security-profile-final|message-signing-final)|fapi1-advanced-final)-client-test-/,
          '',
        ),
      )
      return { name, path: `./conformance/fapi/${name}.ts` }
    }
    case 'oidcc-client-test-plan':
    case 'oidcc-client-basic-certification-test-plan':
    case 'oidcc-client-hybrid-certification-test-plan': {
      const name = assertSafeHandlerName(testModule.replace('oidcc-client-test-', ''))
      return { name, path: `./conformance/oidc/${name}.ts` }
    }
    default:
      throw new Error(`unsupported conformance plan: ${planName}`)
  }
}
