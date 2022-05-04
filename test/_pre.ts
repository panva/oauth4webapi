import * as undici from 'undici'
const { fetch, FormData, Headers, Request, Response } = undici
Object.assign(globalThis, { fetch, FormData, Headers, Request, Response })

import * as crypto from 'node:crypto'
Object.assign(globalThis, { crypto: crypto.webcrypto, CryptoKey: crypto.webcrypto.CryptoKey })
