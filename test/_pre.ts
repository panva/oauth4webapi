import * as undici from 'undici'
const { fetch, FormData, Headers, Request, Response } = undici
Object.assign(globalThis, { fetch, FormData, Headers, Request, Response })
