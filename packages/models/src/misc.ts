import { DateTime } from 'luxon'

export enum SortDir {
  Asc = 1,
  Desc = -1,
}

export interface SignaturePayload {
  signature: string
  signatureAddress: string
}

export interface AuthPayload {
  authToken: string
}

/**
 * @todo when status === 'fail', data will contain error message
 */
export type ResponseOf<T> = { data: T; status: 'success' } | { data: undefined; status: 'fail' }

export type PriceCurrency = 'native' | 'usd'

export enum TimePeriod {
  Day = 'day',
  Week = 'week',
  TwoWeeks = '2weeks',
  Month = 'month',
  TwoMonth = '2month',
  Year = 'year',
  All = 'all',
}

export interface PagingPayload {
  offset: number
  limit: number
}

const timePeriodToDays: Record<TimePeriod, number> = {
  [TimePeriod.Day]: 1,
  [TimePeriod.Week]: 7,
  [TimePeriod.TwoWeeks]: 14,
  [TimePeriod.Month]: 30,
  [TimePeriod.TwoMonth]: 60,
  [TimePeriod.Year]: 365,
  [TimePeriod.All]: Number.MAX_SAFE_INTEGER,
}

const daysToTimePeriod: Record<number, TimePeriod | undefined> = (Object.keys(timePeriodToDays) as TimePeriod[]).reduce(
  (obj, tp) => ({ ...obj, [timePeriodToDays[tp]]: tp }),
  {} as Record<number, TimePeriod>,
)

export function getDaysFromTimePeriod(value: TimePeriod) {
  return timePeriodToDays[value]
}

export function getDaysBetweenDates(start: Date, end: Date) {
  const st = DateTime.fromJSDate(start).startOf('day')
  const et = DateTime.fromJSDate(end).startOf('day')
  return et.diff(st, 'days').days
}

export function getTimePeriodFromDays(days: number) {
  return daysToTimePeriod[days]
}
