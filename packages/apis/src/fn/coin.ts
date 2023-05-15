import { QueryFunctionContext } from 'react-query'

import { goapiUrl } from '@x/constants'
import { ResponseOf } from '@x/models'

import { checkResponse } from '../utils'

export type FetchCoinQueryKey = [cacheKey: string, coin: string]

export async function fetchPrice({ queryKey }: QueryFunctionContext<FetchCoinQueryKey>) {
  const [, coin] = queryKey
  const url = `${goapiUrl}/coin/${coin}`
  const resp = await fetch(url)
  await checkResponse(resp)
  const data: ResponseOf<string> = await resp.json()
  if (data.status === 'fail') throw new Error(data.data)
  return data.data
}
