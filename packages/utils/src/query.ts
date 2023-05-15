import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export type ErrorResponse = { error: FetchBaseQueryError | SerializedError }

export function isErrorResponse(response: { data: unknown } | ErrorResponse): response is ErrorResponse {
  return !!(response as ErrorResponse).error
}

export function makeQueryParams<Params extends Record<string, unknown>>(params: Params): string {
  const pairs: string[] = []
  for (const key in params) {
    if (params[key] !== undefined) pairs.push(`${key}=${params[key]}`)
  }
  return pairs.join('&')
}
