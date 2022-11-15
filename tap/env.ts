// @ts-ignore
import * as packageLock from '../package-lock.json' assert { type: 'json' }

// @ts-ignore
export const isBun = typeof Bun !== 'undefined' ? navigator.userAgent : false

// @ts-ignore
export const isDeno = typeof Deno !== 'undefined' ? navigator.userAgent : false

export const isElectron =
  // @ts-ignore
  typeof process !== 'undefined' && process.versions.electron
    ? // @ts-ignore
      `Electron/${process.versions.electron}; Node.js/${process.versions.node}`
    : false

export const isNode =
  // @ts-ignore
  !isBun && !isElectron && typeof process !== 'undefined'
    ? // @ts-ignore
      `Node.js/${process.versions.node}`
    : false

export const isEdgeRuntime =
  // @ts-ignore
  typeof EdgeRuntime !== 'undefined'
    ? `edge-runtime/${packageLock.packages['node_modules/edge-runtime'].version}`
    : false

export const isBrowser =
  typeof navigator !== 'undefined' && navigator.userAgent?.startsWith?.('Mozilla/5.0 ')
    ? await browser()
    : false

export const isWorkers =
  typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'
    ? // @ts-ignore
      `workerd/${WORKERD_VERSION}`
    : false

async function browser() {
  const { default: Bowser } = await import(
    // @ts-ignore
    'https://cdn.jsdelivr.net/npm/bowser@2.11.0/src/bowser.js'
  )
  const parsed = Bowser.parse(window.navigator.userAgent)
  let result = `${parsed.browser.name}/${parsed.browser.version}`
  if (parsed.platform.type !== 'desktop') {
    result += `; ${parsed.platform.type}`
  }
  return result
}
