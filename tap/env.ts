// @ts-expect-error
export const isBun = typeof Bun !== 'undefined'
// @ts-expect-error
export const isDeno = typeof Deno !== 'undefined'
// @ts-expect-error
export const isNode = !isBun && typeof process !== 'undefined'
// @ts-expect-error
export const isEdgeRuntime = typeof EdgeRuntime !== 'undefined'
export const isBrowser =
  typeof navigator !== 'undefined' && navigator.userAgent?.startsWith?.('Mozilla/5.0 ')
export const isWorkers =
  typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'
