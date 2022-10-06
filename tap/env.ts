// @ts-ignore
export const isDeno = typeof Deno !== 'undefined'
export const isNode = typeof process !== 'undefined'
export const isBrowser =
  typeof navigator !== 'undefined' && navigator.userAgent?.startsWith?.('Mozilla/5.0 ')
