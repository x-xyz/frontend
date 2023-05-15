import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'

export * from './cache'
export * from './image'
export * from './ipfs'
export * from './query'
export * from './web3'

export function getFirst<T>(value?: T | T[]) {
  if (!value) return
  if (Array.isArray(value)) return value[0]
  return value
}

export function toArray<T>(value?: T | T[]) {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

export function compareArray<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false
  return a.every(i => b.includes(i))
}

export function ensureNumber(value: unknown, fallback = 0) {
  if (value instanceof BigNumber) return value.toNumber()
  const parsed = typeof value === 'number' ? value : parseFloat(`${value}`)
  if (isNaN(parsed) || !isFinite(parsed)) return fallback
  return parsed
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export async function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms))
}

export interface CallOptions {
  retry?: (error: unknown) => boolean
  maxAttempt?: number
  timeout?: number | ((attempt: number) => number)
}

export async function call<T>(
  fn: () => Promise<T>,
  { retry = () => true, maxAttempt = 0, timeout = 0 }: CallOptions = {},
) {
  const count = 1 + maxAttempt

  let lastError: unknown

  for (let i = 0; i < count; i++) {
    try {
      const result = await fn()

      return result
    } catch (error) {
      if (!retry(error)) throw error

      await sleep(typeof timeout === 'number' ? timeout : timeout(i))

      lastError = error
    }
  }

  throw lastError
}

export function fibonacci(n: number): number {
  if (n === 0) return 0
  if (n === 1) return 1
  return fibonacci(n - 1) + fibonacci(n - 2)
}

export function multiply(times: number) {
  return (n: number) => n * times
}

export function compose<T>(...fns: ((arg: T) => T)[]) {
  return (arg: T) => fns.reduce((res, fn) => fn(res), arg)
}

export function abbreviateNumber(num: number, locales?: string | string[], options?: Intl.NumberFormatOptions) {
  if (isNaN(num)) return '-'
  if (num < 1e3) return num.toLocaleString(locales, options)
  if (num < 1e6) return +(num / 1e3).toLocaleString(locales, options) + 'K'
  if (num < 1e9) return +(num / 1e6).toLocaleString(locales, options) + 'M'
  if (num < 1e12) return +(num / 1e9).toLocaleString(locales, options) + 'B'
  return (num / 1e12).toLocaleString(locales, options) + 'T'
}

export function resolveUpdater<T>(updater: Updater<T>, original: T) {
  if (updater instanceof Function) return updater(original)
  return updater
}

export function isBase64(value: string) {
  return /^\s*data:(?:[a-z]+\/[a-z0-9-+.]+(?:;[a-z-]+=[a-z0-9-]+)?)?(?:;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)\s*$/i.test(
    value,
  )
}

type RecordValue<T> = T extends Record<string, infer V> ? V : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trimObject<T extends Record<string, any>>(obj: T): Record<string, NonNullable<RecordValue<T>>> {
  return Object.keys(obj)
    .map(key => [key, obj[key]] as const)
    .filter(([, v]) => v !== void 0)
    .reduce((res, [k, v]) => {
      res[k] = v
      return res
    }, {} as Record<string, NonNullable<RecordValue<T>>>)
}
