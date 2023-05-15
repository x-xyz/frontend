import { ChainId } from '@x/models'
import { isAddress, ensureNumber } from '@x/utils'

export const validEnvs = ['dev', 'stag', 'prod'] as const

export type Env = typeof validEnvs[number]

export const appEnv = (process.env.APP_ENV || 'dev').toLowerCase() as Env

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!validEnvs.includes(appEnv as any)) throw new Error(`invalid env: ${appEnv}`)

export const storageUrl = process.env.STORAGE_URL || ''

export const apiUrl = process.env.API_URL || ''

export const goapiUrl = process.env.GOAPI_URL || ''

export const isInIFrame = process.browser && window.parent !== window

export const adminWhitelist = (process.env.ADMIN_WHITELIST || '0xAb4F15b0bfaFE758371589c2524eB39d53E87dCa')
  .split(',')
  .filter(isAddress)

export const defaultChainId = process.env.DEFAULT_CHAIN_ID || '1'

export const chainIdWhitelist: ChainId[] = (process.env.CHAIN_ID_WHITELIST || '')
  .split(',')
  .map(v => ensureNumber(v))
  .filter(Boolean)

export const signatureMessage = process.env.SIGNATURE_MESSAGE || ''
